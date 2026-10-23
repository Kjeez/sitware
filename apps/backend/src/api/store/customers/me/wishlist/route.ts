import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { addToWishlistWorkflow } from "../../../../../workflows/wishlist"
import type { StoreAddWishlistItemType } from "../../../../validators"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const customerId = req.auth_context.actor_id

  const { data: items } = await query.graph({
    entity: "wishlist_item",
    fields: ["id", "product_id", "created_at"],
    filters: { customer_id: customerId },
  })

  const productIds = items.map((i) => i.product_id)
  const { data: products } = productIds.length
    ? await query.graph({
        entity: "product",
        fields: ["id", "title", "handle", "thumbnail", "variants.id", "variants.title"],
        filters: { id: productIds },
      })
    : { data: [] }

  res.json({
    wishlist: items.map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.product_id) ?? null,
    })),
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<StoreAddWishlistItemType>,
  res: MedusaResponse
) {
  const { result } = await addToWishlistWorkflow(req.scope).run({
    input: {
      customer_id: req.auth_context.actor_id,
      product_id: req.validatedBody.product_id,
    },
  })
  res.json({ wishlist_item: result })
}
