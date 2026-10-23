"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "./cookies"

export type WishlistEntry = {
  id: string
  product_id: string
  product: {
    id: string
    title: string
    handle: string
    thumbnail: string | null
  } | null
}

/** The signed-in customer's wishlist, or null for guests. */
export async function getWishlist(): Promise<WishlistEntry[] | null> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return null
  }
  return sdk.client
    .fetch<{ wishlist: WishlistEntry[] }>("/store/customers/me/wishlist", {
      method: "GET",
      headers,
      next: await getCacheOptions("wishlist"),
      cache: "force-cache",
    })
    .then(({ wishlist }) => wishlist)
    .catch(() => null)
}

export async function setWishlisted(productId: string, saved: boolean) {
  const headers = await getAuthHeaders()
  if (saved) {
    await sdk.client.fetch("/store/customers/me/wishlist", {
      method: "POST",
      headers,
      body: { product_id: productId },
    })
  } else {
    await sdk.client.fetch(`/store/customers/me/wishlist/${productId}`, {
      method: "DELETE",
      headers,
    })
  }
  revalidateTag(await getCacheTag("wishlist"))
}
