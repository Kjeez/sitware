import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  createReviewStep,
  CreateReviewInput,
  updateReviewStatusStep,
  validateReviewStep,
} from "./steps/review-steps"

export const createReviewWorkflow = createWorkflow(
  "create-review",
  (input: CreateReviewInput) => {
    const details = validateReviewStep(input)
    const reviewInput = transform({ input, details }, ({ input, details }) => ({
      ...input,
      customer_name: details.customer_name,
      verified_purchase: details.verified_purchase,
    }))
    const review = createReviewStep(reviewInput)
    return new WorkflowResponse(review)
  }
)

export const updateReviewStatusWorkflow = createWorkflow(
  "update-review-status",
  (input: { id: string; status: "pending" | "approved" | "rejected" }) => {
    const review = updateReviewStatusStep(input)
    return new WorkflowResponse(review)
  }
)
