import React, { Suspense } from "react"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import ProductPageLayout from "@modules/sitware/product-page-layout"
import ProductGallery from "@modules/sitware/product-gallery"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({ product, region, images }) => {
  if (!product?.id) return notFound()
  return <ProductPageLayout title={product.title || "Workstation"} gallery={<ProductGallery title={product.title || "Workstation"} images={images.map((image,index) => ({id:image.id,url:image.url,label:"Product view " + (index + 1)}))} />} information={<>
    <p className="eyebrow">Sitware / Workstations</p><h1 data-testid="product-title">{product.title}</h1>{product.subtitle && <p className="pd-subtitle">{product.subtitle}</p>}{product.description && <p className="pd-description" data-testid="product-description">{product.description}</p>}
    <div className="pd-real-actions"><Suspense fallback={<ProductActions disabled product={product} region={region} />}><ProductActionsWrapper id={product.id} region={region} /></Suspense></div>
    <a className="pd-details-link" href="#pd-details-title">Explore the details <span aria-hidden="true">↓</span></a>
  </>} details={<ProductTabs product={product} />} />
}
export default ProductTemplate
