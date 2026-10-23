import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

/**
 * Prints the storefront environment variables that depend on this database, ready to paste into
 * Vercel (Project -> Settings -> Environment Variables). The storefront resolves its region from
 * the country in the URL and reads prices and variants from Medusa, so no region or variant IDs
 * are needed: only the publishable key of the store's sales channel and the default country.
 *
 * Set MEDUSA_BACKEND_URL and STOREFRONT_URL to also print the backend and site addresses.
 *
 *   pnpm --filter @sitware/backend exec medusa exec ./src/scripts/print-storefront-env.ts
 */
export default async function printStorefrontEnv({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["default_sales_channel_id", "default_region_id"],
  })
  const store = stores[0]
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "countries.iso_2"],
    filters: { id: store?.default_region_id ?? [] },
  })

  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["title", "token", "revoked_at", "sales_channels.id"],
    filters: { type: "publishable" },
  })
  const usable = keys.filter(
    (key) =>
      !key.revoked_at && key.sales_channels?.some((channel) => channel?.id === store?.default_sales_channel_id)
  )
  // Prefer the key created for Sitware over Medusa's default one when both exist.
  const publishable = usable.find((key) => key.title.startsWith("Sitware")) ?? usable[0]
  const countries = regions[0]?.countries?.map((country) => country?.iso_2) ?? []
  const defaultCountry = countries.includes("in") ? "in" : countries[0]

  const lines: string[] = []
  const missing: string[] = []
  const add = (name: string, value?: string | null) => (value ? lines.push(`${name}=${value}`) : missing.push(name))

  add("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY", publishable?.token)
  add("NEXT_PUBLIC_DEFAULT_REGION", defaultCountry)
  add("NEXT_PUBLIC_MEDUSA_BACKEND_URL", process.env.MEDUSA_BACKEND_URL)
  add("NEXT_PUBLIC_BASE_URL", process.env.STOREFRONT_URL)

  // Printed with console.log so the block can be copied without logger prefixes.
  console.log("\n# ---- Paste into Vercel environment variables ----")
  console.log(lines.join("\n"))
  console.log("# -------------------------------------------------\n")

  if (missing.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Missing: ${missing.join(", ")}. Run the setup-checkout script and set MEDUSA_BACKEND_URL / STOREFRONT_URL.`
    )
  }
}
