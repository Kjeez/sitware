import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createReviewWorkflow } from "../../../../../workflows/review"
import type { StoreCreateReviewType } from "../../../../validators"

/** The signed-in customer's own reviews, including ones still awaiting moderation. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: reviews } = await query.graph({
    entity: "review",
    fields: ["id", "product_id", "rating", "title", "content", "status", "created_at"],
    filters: { customer_id: req.auth_context.actor_id },
  })
  res.json({ reviews })
}

export async function POST(req: AuthenticatedMedusaRequest<StoreCreateReviewType>, res: MedusaResponse) {
  const { result } = await createReviewWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      customer_id: req.auth_context.actor_id,
    },
  })
  res.json({ review: result })
}
