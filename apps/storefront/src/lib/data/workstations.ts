import "server-only"

import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { WORKSTATION_ORDER, WorkstationHandle } from "@lib/workstations"
import { HttpTypes } from "@medusajs/types"

export type WorkstationListing = {
  product: HttpTypes.StoreProduct | null
  /** Formatted cheapest price, only when Medusa has one for this region. */
  price: string | null
}

/**
 * The Medusa products behind Switch and Switch Pro, with their price for the region. A model that
 * isn't published yet comes back with `product: null`, and the pages show "Pricing at launch".
 */
export async function getWorkstationListings(
  countryCode: string
): Promise<Record<WorkstationHandle, WorkstationListing>> {
  const products = await listProducts({
    countryCode,
    queryParams: { handle: WORKSTATION_ORDER, limit: WORKSTATION_ORDER.length },
  })
    .then(({ response }) => response.products)
    .catch(() => [])

  return Object.fromEntries(
    WORKSTATION_ORDER.map((handle) => {
      const product = products.find((p) => p.handle === handle) ?? null
      const price = product
        ? getProductPrice({ product }).cheapestPrice?.calculated_price ?? null
        : null
      return [handle, { product, price }]
    })
  ) as Record<WorkstationHandle, WorkstationListing>
}
