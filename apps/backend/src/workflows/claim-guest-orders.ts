import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { claimGuestOrdersStep } from "./steps/claim-guest-orders-step"

export const claimGuestOrdersWorkflow = createWorkflow(
  "claim-guest-orders",
  (input: { customer_id: string; auth_identity_id: string }) => {
    const result = claimGuestOrdersStep(input)
    return new WorkflowResponse(result)
  }
)
