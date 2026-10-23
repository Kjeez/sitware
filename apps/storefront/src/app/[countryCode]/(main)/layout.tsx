import { Metadata } from "next"
import { retrieveCart } from "@lib/data/cart"
import { getBaseURL } from "@lib/util/env"
import SiteChrome from "@modules/sitware/site-chrome"
import "styles/sitware.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function StorefrontLayout(props: { children: React.ReactNode }) {
  // Reads the existing cart only; a cart is created on the first add to bag, never here.
  const cart = await retrieveCart().catch(() => null)
  const bagCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return <SiteChrome bagCount={bagCount}>{props.children}</SiteChrome>
}
