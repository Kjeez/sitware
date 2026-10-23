import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { addWishlistItemStep, removeWishlistItemStep } from "./steps/wishlist-steps"

type WishlistWorkflowInput = {
  customer_id: string
  product_id: string
}

export const addToWishlistWorkflow = createWorkflow(
  "add-to-wishlist",
  (input: WishlistWorkflowInput) => {
    const item = addWishlistItemStep(input)
    return new WorkflowResponse(item)
  }
)

export const removeFromWishlistWorkflow = createWorkflow(
  "remove-from-wishlist",
  (input: WishlistWorkflowInput) => {
    const result = removeWishlistItemStep(input)
    return new WorkflowResponse(result)
  }
)
