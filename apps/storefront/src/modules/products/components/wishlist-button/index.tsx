"use client"

import { setWishlisted } from "@lib/data/wishlist"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useOptimistic, useTransition } from "react"

const Heart = ({ filled }: { filled: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.5 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 4 4.4 7.3C19.5 16.4 12 21 12 21z" />
  </svg>
)

const className =
  "sw-wishlist-button inline-flex items-center gap-x-2 text-small-regular"

/** Save-to-wishlist toggle on the product page; guests are sent to sign in. */
const WishlistButton = ({
  productId,
  saved,
  signedIn,
}: {
  productId: string
  saved: boolean
  signedIn: boolean
}) => {
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved)
  const [pending, startTransition] = useTransition()

  if (!signedIn) {
    return (
      <LocalizedClientLink
        href="/account"
        className={className}
        data-testid="wishlist-sign-in-link"
      >
        <Heart filled={false} /> Sign in to save to your wishlist
      </LocalizedClientLink>
    )
  }

  const toggle = () =>
    startTransition(async () => {
      setOptimisticSaved(!optimisticSaved)
      await setWishlisted(productId, !optimisticSaved)
    })

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={optimisticSaved}
      className={className}
      data-testid="wishlist-button"
    >
      <Heart filled={optimisticSaved} />
      {optimisticSaved ? "Saved to your wishlist" : "Save to wishlist"}
    </button>
  )
}

export default WishlistButton
