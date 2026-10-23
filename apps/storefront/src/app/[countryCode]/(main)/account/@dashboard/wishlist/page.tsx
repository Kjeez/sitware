import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getWishlist } from "@lib/data/wishlist"
import WishlistList from "@modules/account/components/wishlist-list"

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products you saved.",
}

export default async function WishlistPage() {
  const wishlist = await getWishlist()

  if (!wishlist) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="wishlist-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Wishlist</h1>
        <p className="text-base-regular">Products you saved for later.</p>
      </div>
      <WishlistList items={wishlist} />
    </div>
  )
}
