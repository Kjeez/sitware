/* eslint-disable @next/next/no-img-element -- art-directed editorial images */
import { MyReview, Review, ReviewSummary } from "@lib/data/reviews"
import { SITE_URL } from "@lib/site"
import { getProductPrice } from "@lib/util/get-product-price"
import {
  SPEC_LABELS,
  Workstation,
  WORKSTATION_ORDER,
  WORKSTATIONS,
} from "@lib/workstations"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductReviews from "@modules/products/components/product-reviews"
import Stars from "@modules/products/components/product-reviews/stars"
import WishlistButton from "@modules/products/components/wishlist-button"
import DetailPanels, { Panel } from "./detail-panels"
import JsonLd from "./json-ld"
import PoseToggle from "./pose-toggle"
import PurchaseBox from "./purchase-box"
import WorkstationGallery, { GalleryImage } from "./workstation-gallery"

const TBC = "To be confirmed"

type Props = {
  /** Sitware Switch / Switch Pro content, when the page is one of the two workstations. */
  workstation: Workstation | null
  /** The Medusa product; null for a workstation that isn't published yet. */
  product: HttpTypes.StoreProduct | null
  countryCode: string
  signedIn?: boolean
  wishlisted?: boolean
  reviews?: { reviews: Review[]; summary: ReviewSummary } | null
  myReview?: MyReview | null
}

const absolute = (src: string) =>
  src.startsWith("http") ? src : `${SITE_URL}${src}`

/** A Medusa attribute as a specification value, e.g. weight in grams. */
function specValue(product: HttpTypes.StoreProduct | null, label: string) {
  if (!product) {
    return TBC
  }
  const dimensions = [product.length, product.width, product.height].every(
    Boolean
  )
    ? `${product.length} × ${product.width} × ${product.height} mm`
    : null
  const values: Record<string, string | null> = {
    Dimensions: dimensions,
    Weight: product.weight ? `${product.weight} g` : null,
    Finish: product.material ?? null,
  }
  return values[label] ?? TBC
}

export default function WorkstationPage({
  workstation: w,
  product,
  countryCode,
  signedIn = false,
  wishlisted = false,
  reviews,
  myReview = null,
}: Props) {
  const name = w?.name ?? product?.title ?? "Workstation"
  const short = w?.short ?? name
  const productImages: GalleryImage[] = (product?.images ?? []).map(
    (image, i) => ({
      src: image.url,
      alt: `${name}, view ${i + 1}`,
      caption: `${name} — view ${i + 1}`,
    })
  )
  // Real product photography wins over the design's illustrative imagery.
  const gallery = productImages.length ? productImages : w?.gallery ?? []
  const thumbnail = product?.thumbnail ?? w?.cutout ?? gallery[0]?.src ?? null
  const cheapest = product ? getProductPrice({ product }).cheapestPrice : null
  const summary = reviews?.summary

  const panels: Panel[] = [
    {
      title: "Details",
      rows: w?.details ?? [
        ...(product?.subtitle ? [{ k: "About", v: product.subtitle }] : []),
        { k: "Type", v: product?.type?.value ?? TBC },
      ],
    },
    {
      title: "Specifications",
      rows: SPEC_LABELS.map((k) => ({ k, v: specValue(product, k) })),
    },
    {
      title: "Delivery & returns",
      rows: [
        { k: "Delivery", v: "Shipping policy", href: "/shipping" },
        { k: "Returns", v: "Returns & refunds", href: "/returns" },
      ],
    },
  ]

  const structuredData = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description: w?.description ?? product.description ?? undefined,
        image: gallery.map((g) => absolute(g.src)),
        brand: { "@type": "Brand", name: "Sitware" },
        sku: product.variants?.[0]?.sku ?? undefined,
        url: `${SITE_URL}/${countryCode}/products/${product.handle}`,
        ...(cheapest?.calculated_price_number
          ? {
              offers: {
                "@type": "Offer",
                price: cheapest.calculated_price_number,
                priceCurrency: cheapest.currency_code?.toUpperCase(),
                url: `${SITE_URL}/${countryCode}/products/${product.handle}`,
                availability: product.variants?.some(
                  (v) =>
                    !v.manage_inventory ||
                    v.allow_backorder ||
                    (v.inventory_quantity ?? 0) > 0
                )
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              },
            }
          : {}),
        // Only real, approved reviews are described.
        ...(summary && summary.count > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: summary.average,
                reviewCount: summary.count,
              },
              review: reviews!.reviews.slice(0, 5).map((r) => ({
                "@type": "Review",
                author: { "@type": "Person", name: r.customer_name },
                datePublished: r.created_at.slice(0, 10),
                reviewRating: { "@type": "Rating", ratingValue: r.rating },
                ...(r.title ? { name: r.title } : {}),
                reviewBody: r.content,
              })),
            }
          : {}),
      }
    : null

  return (
    <div className="sw-product">
      {structuredData && <JsonLd data={structuredData} />}
      <section className="sw-product-top" aria-labelledby="product-title">
        <div className="sw-product-grid">
          <div className="sw-product-media">
            <nav className="sw-breadcrumb" aria-label="Breadcrumb">
              <LocalizedClientLink href="/">Home</LocalizedClientLink>
              <span aria-hidden="true">/</span>
              <LocalizedClientLink href="/#workstations">
                Workstations
              </LocalizedClientLink>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{short}</span>
            </nav>
            <WorkstationGallery images={gallery} />
          </div>
          <div className="sw-product-info">
            <div className="sw-product-heading">
              {w && (
                <div className="sw-product-kicker">
                  <span className="sw-badge">{w.badge}</span>
                  <span>{w.kicker}</span>
                </div>
              )}
              <h1 id="product-title" data-testid="product-title">
                {name}
              </h1>
              {(w?.message || product?.subtitle) && (
                <p className="sw-message">{w?.message ?? product?.subtitle}</p>
              )}
              {summary && summary.count > 0 && (
                <a
                  className="sw-rating-link"
                  href="#reviews"
                  data-testid="rating-summary"
                >
                  <Stars rating={summary.average} />
                  <span>{summary.average.toFixed(1)}</span>
                  <span>
                    {summary.count} {summary.count === 1 ? "review" : "reviews"}
                  </span>
                </a>
              )}
            </div>
            {(w?.description || product?.description) && (
              <p
                className="sw-product-description"
                data-testid="product-description"
              >
                {w?.description ?? product?.description}
              </p>
            )}
            {w && (
              <div className="sw-model-picker">
                <span className="sw-kicker sw-kicker-muted">
                  Choose your workstation
                </span>
                <div>
                  {WORKSTATION_ORDER.map((handle) => {
                    const model = WORKSTATIONS[handle]
                    const current = handle === w.handle
                    return (
                      <LocalizedClientLink
                        key={handle}
                        href={`/workstations/${handle}`}
                        aria-current={current ? "page" : undefined}
                      >
                        <span className="sw-model-thumb">
                          <img src={model.cutout} alt="" />
                        </span>
                        <span>
                          <span className="sw-model-name">{model.short}</span>
                          <small>{model.subtitle}</small>
                        </span>
                      </LocalizedClientLink>
                    )
                  })}
                </div>
              </div>
            )}
            <PurchaseBox
              product={product}
              name={name}
              thumbnail={thumbnail}
              fallbackPrice={cheapest?.calculated_price ?? null}
            />
            {product && (
              <WishlistButton
                productId={product.id}
                saved={wishlisted}
                signedIn={signedIn}
              />
            )}
            <dl className="sw-facts sw-facts-3">
              <div>
                <dt>Fits</dt>
                <dd>The desk you already have</dd>
              </div>
              <div>
                <dt>Moves</dt>
                <dd>Sit. Stand. Switch.</dd>
              </div>
              <div>
                <dt>Made for</dt>
                <dd>{w?.bestFor ?? "Everyday work"}</dd>
              </div>
            </dl>
            <DetailPanels panels={panels} />
          </div>
        </div>
      </section>

      {w && (
        <section className="sw-section sw-dark" aria-labelledby="move-title">
          <div className="sw-container sw-move">
            <PoseToggle poses={w.poses}>
              <span className="sw-kicker">
                Same desk. A different way to work.
              </span>
              <h2 id="move-title" className="sw-h2">
                {w.moveTitle}
              </h2>
              <p>{w.moveNote}</p>
            </PoseToggle>
          </div>
        </section>
      )}

      {w && (
        <section className="sw-section" aria-labelledby="story-title">
          <div className="sw-container sw-stack-lg">
            <div className="sw-story-head">
              <div className="sw-heading-group">
                <span className="sw-kicker">{w.storyKicker}</span>
                <h2 id="story-title" className="sw-h2">
                  {w.storyTitle}
                </h2>
              </div>
              <p className="sw-quote sw-quote-muted">{w.storyNote}</p>
            </div>
            <ol className="sw-story">
              {w.story.map((s) => (
                <li key={s.k}>
                  <span className="sw-num">{s.k}</span>
                  <span className="sw-story-text">{s.v}</span>
                  <span className="sw-story-img">
                    <img src={s.img} alt="" loading="lazy" />
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {product && (
        <section
          className="sw-section sw-reviews-section"
          id="reviews"
          aria-labelledby="reviews-title"
        >
          <div className="sw-container">
            <ProductReviews
              productId={product.id}
              reviews={reviews?.reviews ?? []}
              summary={summary ?? null}
              signedIn={signedIn}
              myReview={myReview}
            />
          </div>
        </section>
      )}

      <section
        id="compare"
        className="sw-section sw-sand"
        aria-labelledby="compare-title"
      >
        <div className="sw-container sw-container-narrow sw-stack-lg">
          <div className="sw-section-head">
            <span className="sw-kicker">Two products. One system.</span>
            <h2 id="compare-title" className="sw-h2">
              Find the one that fits <em>your setup.</em>
            </h2>
          </div>
          <div className="sw-compare">
            {WORKSTATION_ORDER.map((handle) => {
              const model = WORKSTATIONS[handle]
              const current = handle === w?.handle
              return (
                <div
                  key={handle}
                  className={current ? "is-current" : undefined}
                >
                  <div className="sw-compare-img">
                    <img src={model.cutout} alt={model.name} loading="lazy" />
                  </div>
                  <div className="sw-compare-body">
                    <h3>{model.name}</h3>
                    <span className="sw-message">{model.message}</span>
                    <dl>
                      {model.compare.map((row) => (
                        <div key={row.k}>
                          <dt>{row.k}</dt>
                          <dd>{row.v}</dd>
                        </div>
                      ))}
                    </dl>
                    {current ? (
                      <span className="sw-text-link is-static">
                        You’re viewing this
                      </span>
                    ) : (
                      <LocalizedClientLink
                        href={`/workstations/${handle}`}
                        className="sw-text-link"
                      >
                        View {model.short} →
                      </LocalizedClientLink>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="sw-product-cta" aria-labelledby="product-cta-title">
        <img src="/images/sitware/cta.webp" alt="" loading="lazy" />
        <div className="sw-product-cta-shade" />
        <div className="sw-container">
          <h2 id="product-cta-title" className="sw-h2">
            Your desk doesn’t need to change. <em>The way you work does.</em>
          </h2>
          <LocalizedClientLink href="/#story" className="sw-pill sw-pill-ghost">
            Why Sitware <span aria-hidden="true">→</span>
          </LocalizedClientLink>
        </div>
      </section>
    </div>
  )
}
