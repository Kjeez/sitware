"use client"

import { setWishlisted, WishlistEntry } from "@lib/data/wishlist"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useTransition } from "react"

const WishlistItem = ({ item }: { item: WishlistEntry }) => {
  const [pending, startTransition] = useTransition()
  const product = item.product

  return (
    <li className="flex items-center gap-4 py-4 border-b border-ui-border-base">
      <div className="w-16 shrink-0">
        <Thumbnail thumbnail={product?.thumbnail} size="square" />
      </div>
      <div className="flex-1 min-w-0">
        {product ? (
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="txt-medium-plus underline-offset-2 hover:underline"
          >
            {product.title}
          </LocalizedClientLink>
        ) : (
          <span className="txt-medium text-ui-fg-subtle">
            This product is no longer available.
          </span>
        )}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(() => setWishlisted(item.product_id, false))
        }
        className="text-small-regular underline disabled:opacity-50"
        data-testid="remove-wishlist-item"
      >
        Remove
      </button>
    </li>
  )
}

const WishlistList = ({ items }: { items: WishlistEntry[] }) => {
  if (!items.length) {
    return (
      <div className="flex flex-col gap-y-4" data-testid="wishlist-empty">
        <p className="text-base-regular text-ui-fg-subtle">
          Nothing saved yet. Tap the heart on a product page to save it here.
        </p>
        <LocalizedClientLink href="/store" className="underline w-fit">
          Browse products
        </LocalizedClientLink>
      </div>
    )
  }
  return (
    <ul className="flex flex-col" data-testid="wishlist-items">
      {items.map((item) => (
        <WishlistItem key={item.id} item={item} />
      ))}
    </ul>
  )
}

export default WishlistList
