import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/** Approved reviews for a product, newest first, with the rating summary. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const { data: reviews } = await query.graph({
    entity: "review",
    fields: ["id", "customer_name", "rating", "title", "content", "verified_purchase", "created_at"],
    filters: { product_id: id, status: "approved" },
  })
  reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const count = reviews.length
  const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }))

  res.json({
    reviews,
    summary: { count, average: Math.round(average * 10) / 10, distribution },
  })
}
