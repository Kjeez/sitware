import { getBaseURL } from "@lib/util/env"

/** Public origin of the storefront, used for canonical URLs, the sitemap and structured data. */
export const SITE_URL = getBaseURL().replace(/\/$/, "")

/** The country segment every storefront URL starts with. */
export const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "in"

/**
 * True on a staging deployment. Search engines are then told not to index anything (robots.txt
 * disallows everything and every page carries a noindex robots tag).
 */
export const IS_STAGING = process.env.NEXT_PUBLIC_STAGING === "true"

/** Robots metadata for private pages (account, bag, checkout, orders). */
export const NOINDEX = { index: false, follow: false } as const

/**
 * Business details shown on the policy and contact pages. Indian e-commerce rules require the
 * legal name, address, customer care contact and a grievance officer to be published.
 *
 * TODO(owner): fill in every null value once confirmed. Nothing here may be guessed; pages show
 * "To be confirmed" for anything still null.
 */
export const BUSINESS = {
  brand: "Sitware",
  legalName: null as string | null,
  address: null as string | null,
  gstin: null as string | null,
  supportEmail: null as string | null,
  supportPhone: null as string | null,
  supportHours: null as string | null,
  grievanceOfficer: {
    name: null as string | null,
    designation: null as string | null,
    email: null as string | null,
    phone: null as string | null,
  },
}

export const POLICY_LINKS = [
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns & refunds" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const
