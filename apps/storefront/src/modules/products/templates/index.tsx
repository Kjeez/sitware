import React from "react"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { MyReview, Review, ReviewSummary } from "@lib/data/reviews"
import { isWorkstationHandle, WORKSTATIONS } from "@lib/workstations"
import WorkstationPage from "@modules/sitware/workstation-page"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
  signedIn: boolean
  wishlisted: boolean
  reviews: { reviews: Review[]; summary: ReviewSummary } | null
  myReview: MyReview | null
}

/** Switch and Switch Pro get their full editorial page; any other product uses the same layout. */
const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  countryCode,
  signedIn,
  wishlisted,
  reviews,
  myReview,
}) => {
  if (!product?.id) {
    return notFound()
  }
  const workstation =
    product.handle && isWorkstationHandle(product.handle) ? WORKSTATIONS[product.handle] : null

  return (
    <WorkstationPage
      workstation={workstation}
      product={product}
      countryCode={countryCode}
      signedIn={signedIn}
      wishlisted={wishlisted}
      reviews={reviews}
      myReview={myReview}
    />
  )
}

export default ProductTemplate
