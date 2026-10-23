import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { removeFromWishlistWorkflow } from "../../../../../../workflows/wishlist"

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { product_id } = req.params
  await removeFromWishlistWorkflow(req.scope).run({
    input: {
      customer_id: req.auth_context.actor_id,
      product_id,
    },
  })
  res.json({ product_id, deleted: true })
}
