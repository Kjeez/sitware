"use client"

/* eslint-disable @next/next/no-img-element */
import { addToCart } from "@lib/data/cart"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) =>
  (variantOptions ?? []).reduce((acc: Record<string, string>, option) => {
    if (option.option_id) {
      acc[option.option_id] = option.value
    }
    return acc
  }, {})

const isInStock = (variant?: HttpTypes.StoreProductVariant) =>
  !!variant &&
  (!variant.manage_inventory ||
    variant.allow_backorder ||
    (variant.inventory_quantity ?? 0) > 0)

/**
 * Price, variant options, quantity and "Add to bag", plus the floating purchase bar that appears
 * once the main button has scrolled away. Without a published product (a model before launch)
 * it shows "Pricing at launch" and cannot be bought.
 */
export default function PurchaseBox({
  product,
  name,
  thumbnail,
  fallbackPrice,
}: {
  product: HttpTypes.StoreProduct | null
  name: string
  thumbnail: string | null
  /** Cheapest price, shown until a variant is chosen. */
  fallbackPrice: string | null
}) {
  const countryCode = useParams().countryCode as string
  const variants = useMemo(() => product?.variants ?? [], [product])
  const [options, setOptions] = useState<Record<string, string>>(() =>
    variants.length === 1 ? optionsAsKeymap(variants[0].options) : {}
  )
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBar, setShowBar] = useState(false)

  const selected = useMemo(
    () => variants.find((v) => isEqual(optionsAsKeymap(v.options), options)),
    [variants, options]
  )
  const price =
    (product && selected
      ? getProductPrice({ product, variantId: selected.id }).variantPrice
          ?.calculated_price
      : null) || fallbackPrice
  const inStock = isInStock(selected)
  const needsChoice = variants.length > 1 && !selected
  const purchasable = !!product && !!price

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 820)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!added) {
      return
    }
    const timer = setTimeout(() => setAdded(false), 2200)
    return () => clearTimeout(timer)
  }, [added])

  const label = !purchasable
    ? "Not yet available"
    : needsChoice
    ? "Choose an option"
    : !inStock
    ? "Out of stock"
    : adding
    ? "Adding…"
    : added
    ? "Added to bag"
    : "Add to bag"
  const disabled = !purchasable || needsChoice || !inStock || adding

  const addToBag = async () => {
    if (!selected || disabled) {
      return
    }
    setAdding(true)
    setError(null)
    try {
      await addToCart({ variantId: selected.id, quantity, countryCode })
      setAdded(true)
    } catch {
      setError("This could not be added to your bag. Please try again.")
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="sw-purchase">
      {(product?.options ?? [])
        .filter(
          (option) => variants.length > 1 && (option.values?.length ?? 0) > 0
        )
        .map((option) => (
          <fieldset key={option.id} className="sw-option">
            <legend>{option.title}</legend>
            <div>
              {option.values?.map((value) => (
                <button
                  key={value.id}
                  type="button"
                  aria-pressed={options[option.id] === value.value}
                  onClick={() =>
                    setOptions((prev) => ({
                      ...prev,
                      [option.id]: value.value,
                    }))
                  }
                >
                  {value.value}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      <div className="sw-purchase-price">
        <span data-testid="product-price">{price ?? "₹ —"}</span>
        <small>{price ? "Incl. GST" : "Pricing shared at launch"}</small>
      </div>
      <div className="sw-purchase-row">
        <div className="sw-qty" role="group" aria-label="Quantity">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={!purchasable || quantity <= 1}
          >
            −
          </button>
          <span aria-live="polite">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(9, q + 1))}
            disabled={!purchasable || quantity >= 9}
          >
            +
          </button>
        </div>
        <button
          type="button"
          className={`sw-add${added ? " is-added" : ""}`}
          onClick={addToBag}
          disabled={disabled}
          data-testid="add-product-button"
        >
          {label}
        </button>
      </div>
      {error && (
        <p className="sw-purchase-error" role="alert">
          {error}
        </p>
      )}
      <div
        className={`sw-buy-bar${showBar ? " is-visible" : ""}`}
        aria-hidden={!showBar}
      >
        <div>
          <span className="sw-buy-thumb">
            {thumbnail && <img src={thumbnail} alt="" />}
          </span>
          <span className="sw-buy-text">
            <span>{name}</span>
            <small>
              {price ?? "₹ —"} · {price ? "Incl. GST" : "Pricing at launch"}
            </small>
          </span>
          <button
            type="button"
            className={`sw-add${added ? " is-added" : ""}`}
            onClick={addToBag}
            disabled={disabled}
            tabIndex={showBar ? 0 : -1}
          >
            {label}
          </button>
        </div>
      </div>
    </div>
  )
}
