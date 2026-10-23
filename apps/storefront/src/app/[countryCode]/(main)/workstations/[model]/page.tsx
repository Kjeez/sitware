import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { getWorkstationListings } from "@lib/data/workstations"
import { isWorkstationHandle, WORKSTATIONS } from "@lib/workstations"
import WorkstationPage from "@modules/sitware/workstation-page"

type Props = { params: Promise<{ model: string; countryCode: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { model, countryCode } = await params
  if (!isWorkstationHandle(model)) {
    return { title: "Workstations | SITWARE" }
  }
  const workstation = WORKSTATIONS[model]
  return {
    title: `${workstation.name} | SITWARE`,
    description: workstation.description,
    alternates: { canonical: `/${countryCode}/workstations/${model}` },
    openGraph: { images: [workstation.photo] },
  }
}

/**
 * Shift and Shift Pro. Once a model is published in Medusa this sends visitors to its product
 * page; until then it shows the same page without a price or "Add to bag".
 */
export default async function WorkstationRoute({ params }: Props) {
  const { model, countryCode } = await params
  if (!isWorkstationHandle(model)) {
    notFound()
  }

  const listing = (await getWorkstationListings(countryCode))[model]
  if (listing.product?.handle) {
    redirect(`/${countryCode}/products/${listing.product.handle}`)
  }

  return (
    <WorkstationPage
      workstation={WORKSTATIONS[model]}
      product={null}
      countryCode={countryCode}
    />
  )
}
