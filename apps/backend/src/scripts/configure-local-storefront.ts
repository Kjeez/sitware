import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function configureLocalStorefront({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const { data: channels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  let channelId = channels[0]?.id
  if (!channelId) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Sitware local storefront" }] },
    })
    channelId = result[0].id
  }

  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token", "revoked_at", "sales_channels.id"],
    filters: { title: "Sitware local storefront", type: "publishable" },
  })
  const existingKey = keys.find((candidate) => !candidate.revoked_at)
  let key: { id: string; token: string; linked: boolean }
  if (existingKey) {
    key = {
      id: existingKey.id,
      token: existingKey.token,
      linked: !!existingKey.sales_channels?.some((linked) => linked?.id === channelId),
    }
  } else {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [{
          title: "Sitware local storefront",
          type: "publishable",
          created_by: "local-development",
        }],
      },
    })
    key = { id: result[0].id, token: result[0].token, linked: false }
  }
  if (!key.linked) {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: key.id, add: [channelId] },
    })
  }

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "countries.iso_2"],
  })
  if (!regions.some((region) => region.countries?.some((country) => country?.iso_2 === "in"))) {
    await createRegionsWorkflow(container).run({
      input: { regions: [{ name: "India", currency_code: "inr", countries: ["in"] }] },
    })
  }

  const envPath = path.resolve(process.cwd(), "../storefront/.env.local")
  const existing = await readFile(envPath, "utf8")
  const variable = "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"
  const line = variable + "=" + key.token
  const updated = new RegExp("^" + variable + "=.*$", "m").test(existing)
    ? existing.replace(new RegExp("^" + variable + "=.*$", "m"), () => line)
    : existing.trimEnd() + "\n" + line + "\n"
  await writeFile(envPath, updated)
  logger.info("Local storefront key, sales channel and India region configured. Restart the storefront to load its environment.")
}