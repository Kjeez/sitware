import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  deleteFulfillmentSetsWorkflow,
  deleteProductCategoriesWorkflow,
  deleteProductsWorkflow,
  deleteRegionsWorkflow,
  deleteStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows"

// What the Medusa starter template's seed and the local create-test-product script create. Only
// these are removed, so products and categories created for Sitware are never touched.
const DEMO_PRODUCT_HANDLES = ["t-shirt", "sweatshirt", "sweatpants", "shorts", "sitware-test-product"]
const DEMO_CATEGORY_NAMES = ["Shirts", "Sweatshirts", "Pants", "Merch"]
const DEMO_STOCK_LOCATION_NAMES = ["European Warehouse"]
const DEMO_FULFILLMENT_SET_NAMES = ["European Warehouse delivery"]
const KEEP_CURRENCIES = ["inr"]

/**
 * Removes the Medusa starter template's demo data (sample apparel, its categories, the Europe
 * region and warehouse) if a database was ever seeded with it, and the local-only test product.
 * Keeps Sitware's data and the India (INR) region.
 *
 * Lists what it would delete unless run with CONFIRM=yes:
 *   pnpm --filter @sitware/backend exec medusa exec ./src/scripts/remove-demo-data.ts
 *   CONFIRM=yes pnpm --filter @sitware/backend exec medusa exec ./src/scripts/remove-demo-data.ts
 */
export default async function removeDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const confirmed = process.env.CONFIRM === "yes"

  const { data: products } = await query.graph({ entity: "product", fields: ["id", "handle"] })
  const demoProducts = products.filter((product) => DEMO_PRODUCT_HANDLES.includes(product.handle))

  const { data: categories } = await query.graph({ entity: "product_category", fields: ["id", "name"] })
  const demoCategories = categories.filter((category) => DEMO_CATEGORY_NAMES.includes(category.name))

  const { data: regions } = await query.graph({ entity: "region", fields: ["id", "name", "currency_code"] })
  const demoRegions = regions.filter((region) => !KEEP_CURRENCIES.includes(region.currency_code))

  const { data: locations } = await query.graph({ entity: "stock_location", fields: ["id", "name"] })
  const demoLocations = locations.filter((location) => DEMO_STOCK_LOCATION_NAMES.includes(location.name))

  const { data: fulfillmentSets } = await query.graph({ entity: "fulfillment_set", fields: ["id", "name"] })
  const demoFulfillmentSets = fulfillmentSets.filter((set) => DEMO_FULFILLMENT_SET_NAMES.includes(set.name))

  const describe = (label: string, names: string[]) =>
    logger.info(`${label} to remove (${names.length}): ${names.join(", ") || "none"}`)
  describe("Products", demoProducts.map((product) => product.handle))
  describe("Categories", demoCategories.map((category) => category.name))
  describe("Regions", demoRegions.map((region) => region.name))
  describe("Stock locations", demoLocations.map((location) => location.name))
  describe("Fulfillment sets", demoFulfillmentSets.map((set) => set.name))

  if (!confirmed) {
    logger.info("Dry run only. Re-run with CONFIRM=yes to delete.")
    return
  }

  if (demoProducts.length) {
    await deleteProductsWorkflow(container).run({ input: { ids: demoProducts.map((product) => product.id) } })
  }
  if (demoCategories.length) {
    await deleteProductCategoriesWorkflow(container).run({ input: demoCategories.map((category) => category.id) })
  }
  if (demoRegions.length) {
    await deleteRegionsWorkflow(container).run({ input: { ids: demoRegions.map((region) => region.id) } })
  }
  if (demoFulfillmentSets.length) {
    await deleteFulfillmentSetsWorkflow(container).run({ input: { ids: demoFulfillmentSets.map((set) => set.id) } })
  }
  if (demoLocations.length) {
    await deleteStockLocationsWorkflow(container).run({ input: { ids: demoLocations.map((location) => location.id) } })
  }
  logger.info("Demo data removed.")
}
