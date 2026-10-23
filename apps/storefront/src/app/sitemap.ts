import type { MetadataRoute } from "next"

import { listProducts } from "@lib/data/products"
import { DEFAULT_COUNTRY, IS_STAGING, SITE_URL } from "@lib/site"
import { WORKSTATION_ORDER } from "@lib/workstations"

// Regenerated hourly so newly published products appear without a redeploy.
export const revalidate = 3600

/** Public, indexable pages only: account, cart, checkout and order pages are left out on purpose. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (IS_STAGING) {
    return []
  }
  const base = `${SITE_URL}/${DEFAULT_COUNTRY}`
  const products = await listProducts({
    countryCode: DEFAULT_COUNTRY,
    queryParams: { limit: 100, fields: "handle,updated_at" },
  })
    .then(({ response }) => response.products)
    .catch(() => [])
  const published = new Set(products.map((p) => p.handle))

  const pages: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/store", priority: 0.8, changeFrequency: "weekly" },
    // A workstation that is published redirects to its product page, which is listed below.
    ...WORKSTATION_ORDER.filter((handle) => !published.has(handle)).map((handle) => ({
      path: `/workstations/${handle}`,
      priority: 0.9,
      changeFrequency: "weekly" as const,
    })),
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
    { path: "/track", priority: 0.4, changeFrequency: "yearly" },
    { path: "/shipping", priority: 0.3, changeFrequency: "yearly" },
    { path: "/returns", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  ]

  return [
    ...pages.map(({ path, priority, changeFrequency }) => ({
      url: `${base}${path}`,
      changeFrequency,
      priority,
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.handle}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ]
}
