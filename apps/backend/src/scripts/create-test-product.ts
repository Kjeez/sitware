import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { createInventoryLevelsWorkflow, createProductsWorkflow } from "@medusajs/medusa/core-flows"

export const TEST_PRODUCT_HANDLE = "sitware-test-product"
const TEST_SKU = "SITWARE-TEST-1"
// A made-up amount for exercising checkout locally. It is not a Sitware price.
const TEST_PRICE_INR = 1000
const STOCK_LOCATION_NAME = "Sitware Warehouse"

/**
 * LOCAL DEVELOPMENT ONLY. Creates one clearly labelled, published test product so checkout can
 * be exercised before the real catalog exists. Refuses to run unless ALLOW_TEST_PRODUCT=yes and
 * NODE_ENV is not production. Remove it with the remove-demo-data script.
 *
 *   ALLOW_TEST_PRODUCT=yes pnpm --filter @sitware/backend exec medusa exec ./src/scripts/create-test-product.ts
 */
export default async function createTestProduct({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  if (process.env.NODE_ENV === "production" || process.env.ALLOW_TEST_PRODUCT !== "yes") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "The test product is for local development only. Set ALLOW_TEST_PRODUCT=yes to create it."
    )
  }

  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { handle: TEST_PRODUCT_HANDLE },
  })
  if (existing.length) {
    logger.info(`Test product already exists: ${existing[0].id}`)
    return
  }

  const { data: stores } = await query.graph({ entity: "store", fields: ["default_sales_channel_id"] })
  const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id", "type"] })
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
    filters: { name: STOCK_LOCATION_NAME },
  })
  const salesChannelId = stores[0]?.default_sales_channel_id
  const shippingProfileId = (profiles.find((profile) => profile.type === "default") ?? profiles[0])?.id
  if (!salesChannelId || !shippingProfileId || !locations[0]) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Run the setup-checkout script first.")
  }

  const { result } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "TEST PRODUCT (local checkout testing)",
          subtitle: "Not for sale",
          description: "Created by create-test-product.ts for local checkout testing. Not a Sitware product.",
          handle: TEST_PRODUCT_HANDLE,
          status: "published",
          shipping_profile_id: shippingProfileId,
          sales_channels: [{ id: salesChannelId }],
          options: [{ title: "Edition", values: ["Test"] }],
          variants: [
            {
              title: "Test",
              sku: TEST_SKU,
              options: { Edition: "Test" },
              manage_inventory: true,
              prices: [{ currency_code: "inr", amount: TEST_PRICE_INR }],
            },
          ],
        },
      ],
    },
  })

  const { data: items } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
    filters: { sku: TEST_SKU },
  })
  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: items.map((item) => ({
        location_id: locations[0].id,
        stocked_quantity: 50,
        inventory_item_id: item.id,
      })),
    },
  })
  logger.info(`Created test product ${result[0].id} (${TEST_PRODUCT_HANDLE}) with 50 units in stock.`)
}
