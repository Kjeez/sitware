import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import SiteChrome from "@modules/sitware/site-chrome"
import "styles/sitware.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function StorefrontLayout(props: { children: React.ReactNode }) {
  return <SiteChrome>{props.children}</SiteChrome>
}
