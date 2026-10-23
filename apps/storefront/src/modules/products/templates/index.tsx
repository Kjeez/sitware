import React, { Suspense } from "react"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import ProductPageLayout from "@modules/sitware/product-page-layout"
import ProductGallery from "@modules/sitware/product-gallery"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ProductActionsWrapper from "./product-actions-wrapper"
import { MyReview, Review, ReviewSummary } from "@lib/data/reviews"
import ProductReviews from "@modules/products/components/product-reviews"
import Stars from "@modules/products/components/product-reviews/stars"
import WishlistButton from "@modules/products/components/wishlist-button"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
  signedIn: boolean
  wishlisted: boolean
  reviews: { reviews: Review[]; summary: ReviewSummary } | null
  myReview: MyReview | null
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({ product, region, images, signedIn, wishlisted, reviews, myReview }) => {
  if (!product?.id) return notFound()
  const summary = reviews?.summary
  // Rating summary only when real, approved reviews exist.
  const ratingSummary = summary && summary.count > 0 && <a className="sw-rating-link" href="#reviews" data-testid="rating-summary"><Stars rating={summary.average} /><span>{summary.average.toFixed(1)}</span><span>{summary.count} {summary.count === 1 ? "review" : "reviews"}</span></a>
  return <ProductPageLayout title={product.title || "Workstation"} gallery={<ProductGallery title={product.title || "Workstation"} images={images.map((image,index) => ({id:image.id,url:image.url,label:"Product view " + (index + 1)}))} />} information={<>
    <p className="eyebrow">Sitware / Workstations</p><h1 data-testid="product-title">{product.title}</h1>{ratingSummary}{product.subtitle && <p className="pd-subtitle">{product.subtitle}</p>}{product.description && <p className="pd-description" data-testid="product-description">{product.description}</p>}
    <div className="pd-real-actions"><Suspense fallback={<ProductActions disabled product={product} region={region} />}><ProductActionsWrapper id={product.id} region={region} /></Suspense><WishlistButton productId={product.id} saved={wishlisted} signedIn={signedIn} /></div>
    <a className="pd-details-link" href="#pd-details-title">Explore the details <span aria-hidden="true">↓</span></a>
  </>} details={<ProductTabs product={product} />} reviews={<ProductReviews productId={product.id} reviews={reviews?.reviews ?? []} summary={summary ?? null} signedIn={signedIn} myReview={myReview} />} />
}
export default ProductTemplate
