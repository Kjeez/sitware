import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateReviewStatusWorkflow } from "../../../../workflows/review"
import type { AdminUpdateReviewType } from "../../../validators"

export async function POST(req: AuthenticatedMedusaRequest<AdminUpdateReviewType>, res: MedusaResponse) {
  const { result } = await updateReviewStatusWorkflow(req.scope).run({
    input: { id: req.params.id, status: req.validatedBody.status },
  })
  res.json({ review: result })
}
