import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { WISHLIST_MODULE } from "../../modules/wishlist"
import type WishlistModuleService from "../../modules/wishlist/service"

type WishlistItemInput = {
  customer_id: string
  product_id: string
}

export const addWishlistItemStep = createStep(
  "add-wishlist-item",
  async (input: WishlistItemInput, { container }) => {
    const wishlist: WishlistModuleService = container.resolve(WISHLIST_MODULE)
    const [existing] = await wishlist.listWishlistItems(input)
    if (existing) {
      return new StepResponse(existing, null)
    }
    const created = await wishlist.createWishlistItems(input)
    return new StepResponse(created, created.id)
  },
  async (createdId, { container }) => {
    if (!createdId) {
      return
    }
    const wishlist: WishlistModuleService = container.resolve(WISHLIST_MODULE)
    await wishlist.deleteWishlistItems(createdId)
  }
)

export const removeWishlistItemStep = createStep(
  "remove-wishlist-item",
  async (input: WishlistItemInput, { container }) => {
    const wishlist: WishlistModuleService = container.resolve(WISHLIST_MODULE)
    const items = await wishlist.listWishlistItems(input)
    const ids = items.map((i) => i.id)
    if (ids.length) {
      await wishlist.softDeleteWishlistItems(ids)
    }
    return new StepResponse({ removed: ids.length }, ids)
  },
  async (ids, { container }) => {
    if (!ids?.length) {
      return
    }
    const wishlist: WishlistModuleService = container.resolve(WISHLIST_MODULE)
    await wishlist.restoreWishlistItems(ids)
  }
)
