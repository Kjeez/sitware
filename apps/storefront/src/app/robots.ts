import type { MetadataRoute } from "next"

import { IS_STAGING, SITE_URL } from "@lib/site"

export default function robots(): MetadataRoute.Robots {
  if (IS_STAGING) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }
  const privatePaths = ["account", "auth", "cart", "checkout", "order", "reset-password", "forgot-password"]
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Every storefront URL starts with the country, e.g. /in/cart.
      disallow: privatePaths.map((path) => `/*/${path}`),
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
