import { IS_STAGING, NOINDEX } from "@lib/site"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Geist, Geist_Mono, Newsreader } from "next/font/google"
import "styles/globals.css"

// Self-hosted at build time; the storefront exposes them as CSS variables.
const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" })
const mono = Geist_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-geist-mono",
  display: "swap",
})
const serif = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "SITWARE | Designed For Better Work.",
  description:
    "Sitware makes the desk you already have more flexible, focused and intentional.",
  openGraph: { siteName: "Sitware", locale: "en_IN", type: "website" },
  // NEXT_PUBLIC_STAGING=true keeps a staging deployment out of search results entirely.
  ...(IS_STAGING ? { robots: NOINDEX } : {}),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${sans.variable} ${mono.variable} ${serif.variable}`}
    >
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
