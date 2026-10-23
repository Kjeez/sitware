import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPageLayout from "@modules/sitware/product-page-layout"
import ProductGallery from "@modules/sitware/product-gallery"

const models = {
  shift: { title: "Sitware Shift", line: "For flexible everyday work.", image: "shift" },
  "shift-pro": { title: "Sitware Shift Pro", line: "For complete workstations.", image: "shift-pro" },
}
type Props = { params: Promise<{ model: string; countryCode: string }> }

export async function generateMetadata({params}:Props):Promise<Metadata> {
  const {model} = await params
  const selected = models[model as keyof typeof models]
  return {title: selected ? selected.title + " | SITWARE" : "Workstations | SITWARE",description:selected?.line}
}

export default async function WorkstationPage({params}:Props) {
  const {model,countryCode} = await params
  const selected = models[model as keyof typeof models]
  if (!selected) notFound()
  // Use the real purchase page as soon as this model is published in Medusa.
  let productHandle: string | undefined
  try {
    const region = await getRegion(countryCode)
    if (region) {
      const {response} = await listProducts({countryCode,queryParams:{handle:model}})
      productHandle = response.products[0]?.handle || undefined
    }
  } catch {
    // The editorial collection preview remains available during catalog setup.
  }
  if (productHandle) redirect("/" + countryCode + "/products/" + productHandle)
  return <ProductPageLayout title={selected.title} gallery={<ProductGallery title={selected.title} images={[{id:"concept",label:"Illustrative product concept — final photography to follow",conceptClass:selected.image},{id:"workspace",label:"Workspace inspiration",conceptClass:"pd-workspace-image"}]} />} information={<>
    <p className="eyebrow">Sitware / Collection preview</p><h1>{selected.title}</h1><p className="pd-subtitle">{selected.line}</p><p className="pd-description">A more thoughtful workspace starts with the desk you already have. Explore the design direction for {selected.title}.</p><div className="pd-pending"><span>Product details are being finalized</span><p>Pricing, specifications and availability will be shared when confirmed.</p></div><LocalizedClientLink className="button button-copper pd-preview-button" href="/#workstations">Compare workstations <span aria-hidden="true">→</span></LocalizedClientLink><a className="pd-details-link" href="#pd-details-title">Explore the details <span aria-hidden="true">↓</span></a>
  </>} details={<div className="pd-accordions"><details open><summary>About {selected.title}</summary><p>{selected.line} Part of Sitware’s Shift and Shift Pro collection.</p></details><details><summary>Specifications &amp; dimensions</summary><p>Final specifications and dimensions will be shared when confirmed.</p></details><details><summary>What’s included</summary><p>Package contents will be published with the confirmed product details.</p></details><details><summary>Delivery &amp; returns</summary><p>Delivery and returns information will be added when the business policies are finalized.</p></details></div>} />
}
