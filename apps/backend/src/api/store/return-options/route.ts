import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Return shipping options a customer can pick when requesting a return. Core's
 * /store/shipping-options needs a live cart, which a past order doesn't have.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: options } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "rules.attribute", "rules.value", "prices.amount", "prices.currency_code"],
  })

  const hasRule = (o: (typeof options)[number], attribute: string, value: string) =>
    o.rules?.some((r) => r?.attribute === attribute && String(r?.value) === value)

  res.json({
    return_options: options
      .filter((o) => hasRule(o, "is_return", "true") && hasRule(o, "enabled_in_store", "true"))
      .map((o) => ({
        id: o.id,
        name: o.name,
        // Prices come from the pricing module link, which the generated entity type doesn't include.
        amount:
          (o as { prices?: { amount: number; currency_code: string }[] }).prices?.find(
            (p) => p.currency_code === "inr"
          )?.amount ?? 0,
      })),
  })
}
