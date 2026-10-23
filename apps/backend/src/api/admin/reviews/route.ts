import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { AdminListReviewsType } from "../../validators"

export async function GET(req: AuthenticatedMedusaRequest<unknown, AdminListReviewsType>, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { status } = req.validatedQuery

  const { data: reviews } = await query.graph({
    entity: "review",
    fields: [
      "id",
      "product_id",
      "customer_id",
      "customer_name",
      "rating",
      "title",
      "content",
      "status",
      "verified_purchase",
      "created_at",
    ],
    filters: status ? { status } : {},
  })
  reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  res.json({ reviews })
}
