import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"
import { getMyReview, getProductReviews } from "@lib/data/reviews"
import { getWishlist } from "@lib/data/wishlist"
import ProductTemplate from "@modules/products/templates"
import { isWorkstationHandle, WORKSTATIONS } from "@lib/workstations"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const workstation = isWorkstationHandle(handle) ? WORKSTATIONS[handle] : null
  const title = `${workstation?.name ?? product.title} | SITWARE`
  const description =
    workstation?.description ?? product.description ?? product.subtitle ?? product.title
  const image = product.thumbnail ?? workstation?.photo

  return {
    title,
    description,
    alternates: { canonical: `/${params.countryCode}/products/${handle}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  const [customer, wishlist, reviews, myReview] = await Promise.all([
    retrieveCustomer(),
    getWishlist(),
    getProductReviews(pricedProduct.id),
    getMyReview(pricedProduct.id),
  ])

  return (
    <ProductTemplate
      product={pricedProduct}
      countryCode={params.countryCode}
      signedIn={!!customer}
      wishlisted={!!wishlist?.some((item) => item.product_id === pricedProduct.id)}
      reviews={reviews}
      myReview={myReview}
    />
  )
}
