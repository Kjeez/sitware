import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createLinksWorkflow,
  createLocationFulfillmentSetWorkflow,
  createRegionsWorkflow,
  createReturnReasonsWorkflow,
  createSalesChannelsWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateRegionsWorkflow,
  updateShippingOptionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

const STOCK_LOCATION_NAME = "Sitware Warehouse"
const FULFILLMENT_SET_NAME = "India Delivery"
const SERVICE_ZONE_NAME = "India"
const SALES_CHANNEL_NAME = "Sitware Storefront"
const PUBLISHABLE_KEY_TITLE = "Sitware storefront"
const MANUAL_FULFILLMENT_PROVIDER = "manual_manual"
const RAZORPAY_PROVIDER = "pp_razorpay_razorpay"

const RETURN_REASONS = [
  { value: "damaged", label: "Arrived damaged or broken" },
  { value: "wrong_item", label: "Received the wrong item" },
  { value: "not_as_described", label: "Not as described" },
  { value: "not_needed", label: "No longer needed" },
  { value: "other", label: "Other" },
]

/** A rupee amount from the environment; `undefined` when unset or blank. */
function readRupees(name: string) {
  const raw = process.env[name]?.trim()
  if (!raw) {
    return undefined
  }
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `${name} must be a non-negative number of rupees.`)
  }
  return value
}

/**
 * Prepares a database for checkout in India. Safe to re-run: every step looks for what it would
 * create first, and the shipping price is updated in place.
 *
 * - India region (INR, prices tax-inclusive) with an India tax region, set as the store default.
 * - Sales channel and a publishable key linked to it.
 * - Stock location with manual fulfillment, an India service zone and a default shipping profile.
 * - One "Standard Delivery" option priced at SHIPPING_FLAT_FEE, free when the cart's item total
 *   reaches FREE_SHIPPING_THRESHOLD (leave the threshold blank for no free shipping).
 * - COD (pp_system_default) and, when its keys are set, Razorpay on the region.
 * - Return reasons and a "Return Pickup" option priced at RETURN_PICKUP_FEE (default 0).
 *
 *   pnpm --filter @sitware/backend exec medusa exec ./src/scripts/setup-checkout.ts
 */
export default async function setupCheckout({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const shippingFee = readRupees("SHIPPING_FLAT_FEE")
  if (shippingFee === undefined) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Set SHIPPING_FLAT_FEE (rupees) before running this script.")
  }
  const freeShippingThreshold = readRupees("FREE_SHIPPING_THRESHOLD")
  const returnPickupFee = readRupees("RETURN_PICKUP_FEE") ?? 0

  // ---- Region and taxes ----
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code", "countries.iso_2"],
  })
  let india = regions.find(
    (region) => region.currency_code === "inr" && region.countries?.some((country) => country?.iso_2 === "in")
  )
  if (!india) {
    const { result } = await createRegionsWorkflow(container).run({
      input: { regions: [{ name: "India", currency_code: "inr", countries: ["in"], is_tax_inclusive: true }] },
    })
    india = { ...result[0], countries: [{ iso_2: "in" }] } as typeof regions[number]
    logger.info("Created the India (INR) region.")
  }

  const { data: taxRegions } = await query.graph({ entity: "tax_region", fields: ["id", "country_code"] })
  if (!taxRegions.some((taxRegion) => taxRegion.country_code === "in")) {
    // No default rate: GST rates are configured in Medusa Admin once confirmed.
    await createTaxRegionsWorkflow(container).run({ input: [{ country_code: "in", provider_id: "tp_system" }] })
    logger.info("Created the India tax region.")
  }

  // ---- Sales channel and publishable key ----
  const { data: stores } = await query.graph({ entity: "store", fields: ["id", "default_sales_channel_id"] })
  const store = stores[0]
  const { data: channels } = await query.graph({ entity: "sales_channel", fields: ["id", "name"] })
  let channelId = channels.find((channel) => channel.id === store.default_sales_channel_id)?.id ?? channels[0]?.id
  if (!channelId) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: SALES_CHANNEL_NAME }] },
    })
    channelId = result[0].id
    logger.info(`Created the "${SALES_CHANNEL_NAME}" sales channel.`)
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "Sitware",
        supported_currencies: [{ currency_code: "inr", is_default: true }],
        default_region_id: india.id,
        default_sales_channel_id: channelId,
      },
    },
  })
  logger.info("Store currency set to INR with India as the default region.")

  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["id", "revoked_at", "sales_channels.id"],
    filters: { type: "publishable" },
  })
  const activeKeys = keys.filter((key) => !key.revoked_at)
  if (!activeKeys.some((key) => key.sales_channels?.some((channel) => channel?.id === channelId))) {
    let keyId = activeKeys[0]?.id
    if (!keyId) {
      const { result } = await createApiKeysWorkflow(container).run({
        input: { api_keys: [{ title: PUBLISHABLE_KEY_TITLE, type: "publishable", created_by: "setup-checkout" }] },
      })
      keyId = result[0].id
      logger.info(`Created the "${PUBLISHABLE_KEY_TITLE}" publishable key.`)
    }
    await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: keyId, add: [channelId] } })
    logger.info("Linked the publishable key to the sales channel.")
  }

  // ---- Stock location and fulfillment ----
  const locationFields = [
    "id",
    "name",
    "sales_channels.id",
    "fulfillment_providers.id",
    "fulfillment_sets.id",
    "fulfillment_sets.type",
    "fulfillment_sets.service_zones.id",
  ]
  const findLocation = async () => {
    const { data } = await query.graph({
      entity: "stock_location",
      fields: locationFields,
      filters: { name: STOCK_LOCATION_NAME },
    })
    return data[0]
  }
  let location = await findLocation()
  if (!location) {
    // The warehouse address is added in Medusa Admin once confirmed.
    await createStockLocationsWorkflow(container).run({ input: { locations: [{ name: STOCK_LOCATION_NAME }] } })
    location = await findLocation()
    logger.info(`Created the "${STOCK_LOCATION_NAME}" stock location.`)
  }

  if (!location.sales_channels?.some((channel) => channel?.id === channelId)) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: location.id, add: [channelId] } })
    logger.info("Linked the stock location to the sales channel.")
  }
  if (!location.fulfillment_providers?.some((provider) => provider?.id === MANUAL_FULFILLMENT_PROVIDER)) {
    await createLinksWorkflow(container).run({
      input: [
        {
          [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
          [Modules.FULFILLMENT]: { fulfillment_provider_id: MANUAL_FULFILLMENT_PROVIDER },
        },
      ],
    })
    logger.info("Enabled manual fulfillment at the stock location.")
  }

  let fulfillmentSet = location.fulfillment_sets?.find((set) => set?.type === "shipping")
  if (!fulfillmentSet) {
    await createLocationFulfillmentSetWorkflow(container).run({
      input: { location_id: location.id, fulfillment_set_data: { name: FULFILLMENT_SET_NAME, type: "shipping" } },
    })
    location = await findLocation()
    fulfillmentSet = location.fulfillment_sets?.find((set) => set?.type === "shipping")
    logger.info(`Created the "${FULFILLMENT_SET_NAME}" fulfillment set.`)
  }
  if (!fulfillmentSet) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "The shipping fulfillment set could not be created.")
  }

  let serviceZoneId = fulfillmentSet.service_zones?.[0]?.id
  if (!serviceZoneId) {
    const { result } = await createServiceZonesWorkflow(container).run({
      input: {
        data: [
          {
            fulfillment_set_id: fulfillmentSet.id,
            name: SERVICE_ZONE_NAME,
            geo_zones: [{ type: "country", country_code: "in" }],
          },
        ],
      },
    })
    serviceZoneId = result[0].id
    logger.info(`Created the "${SERVICE_ZONE_NAME}" service zone.`)
  }

  const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id", "type"] })
  let shippingProfileId = (profiles.find((profile) => profile.type === "default") ?? profiles[0])?.id
  if (!shippingProfileId) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
    })
    shippingProfileId = result[0].id
    logger.info("Created the default shipping profile.")
  }

  // ---- Shipping options ----
  const { data: options } = await query.graph({ entity: "shipping_option", fields: ["id", "type.code"] })
  const standardPrices = [
    { currency_code: "inr", amount: shippingFee },
    ...(freeShippingThreshold
      ? [
          {
            currency_code: "inr",
            amount: 0,
            rules: [{ attribute: "item_total", operator: "gte" as const, value: freeShippingThreshold }],
          },
        ]
      : []),
  ]
  const standard = options.find((option) => option.type?.code === "standard_in")
  if (standard) {
    await updateShippingOptionsWorkflow(container).run({
      input: [{ id: standard.id, name: "Standard Delivery", prices: standardPrices }],
    })
  } else {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Delivery",
          price_type: "flat",
          provider_id: MANUAL_FULFILLMENT_PROVIDER,
          service_zone_id: serviceZoneId,
          shipping_profile_id: shippingProfileId,
          type: { label: "Standard Delivery", description: "Delivery within India.", code: "standard_in" },
          prices: standardPrices,
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    })
  }
  logger.info(
    `Standard Delivery: ₹${shippingFee}` +
      (freeShippingThreshold ? `, free from ₹${freeShippingThreshold}` : ", no free-shipping threshold")
  )

  const returnOption = options.find((option) => option.type?.code === "return_in")
  const returnPrices = [{ currency_code: "inr", amount: returnPickupFee }]
  if (returnOption) {
    await updateShippingOptionsWorkflow(container).run({ input: [{ id: returnOption.id, prices: returnPrices }] })
  } else {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Return Pickup",
          price_type: "flat",
          provider_id: MANUAL_FULFILLMENT_PROVIDER,
          service_zone_id: serviceZoneId,
          shipping_profile_id: shippingProfileId,
          type: {
            label: "Return Pickup",
            description: "A pickup from your delivery address.",
            code: "return_in",
          },
          prices: returnPrices,
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "true", operator: "eq" },
          ],
        },
      ],
    })
  }
  logger.info(`Return Pickup: ₹${returnPickupFee}`)

  const { data: reasons } = await query.graph({ entity: "return_reason", fields: ["id", "value"] })
  const missingReasons = RETURN_REASONS.filter((reason) => !reasons.some((existing) => existing.value === reason.value))
  if (missingReasons.length) {
    await createReturnReasonsWorkflow(container).run({ input: { data: missingReasons } })
    logger.info(`Added ${missingReasons.length} return reason(s).`)
  }

  // ---- Payment providers ----
  const { data: providers } = await query.graph({ entity: "payment_provider", fields: ["id", "is_enabled"] })
  // Provider rows outlive config changes, so Razorpay also requires its keys to be set now.
  const razorpayConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  const providerIds = ["pp_system_default", RAZORPAY_PROVIDER].filter(
    (id) =>
      providers.some((provider) => provider.id === id && provider.is_enabled) &&
      (id !== RAZORPAY_PROVIDER || razorpayConfigured)
  )
  if (!providerIds.includes(RAZORPAY_PROVIDER)) {
    logger.warn("Razorpay is not enabled. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET, restart Medusa and re-run.")
  }
  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: india.id },
      update: { payment_providers: providerIds, is_tax_inclusive: true },
    },
  })
  logger.info(`India region payment providers: ${providerIds.join(", ")}`)
}
