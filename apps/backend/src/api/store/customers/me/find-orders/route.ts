import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { requestOrderTransferWorkflow } from "@medusajs/medusa/core-flows"
import { claimGuestOrdersWorkflow } from "../../../../../workflows/claim-guest-orders"
import { findClaimableGuestOrders, hasVerifiedEmail } from "../../../../../lib/guest-orders"

/**
 * Finds guest orders placed with the signed-in customer's email. Google accounts (verified
 * email) get them linked immediately; others get a confirmation email per order.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const customerId = req.auth_context.actor_id

  if (await hasVerifiedEmail(req.scope, req.auth_context.auth_identity_id)) {
    const { result } = await claimGuestOrdersWorkflow(req.scope).run({
      input: { customer_id: customerId, auth_identity_id: req.auth_context.auth_identity_id },
    })
    res.json({ claimed: result.claimed, emailed: 0 })
    return
  }

  const orders = await findClaimableGuestOrders(req.scope, customerId)
  let emailed = 0
  for (const order of orders) {
    if (order.status === "canceled") {
      continue
    }
    // Fails harmlessly if a transfer is already pending for this order.
    const { errors } = await requestOrderTransferWorkflow(req.scope).run({
      input: { order_id: order.id, customer_id: customerId, logged_in_user: customerId },
      throwOnError: false,
    })
    if (!errors?.length) {
      emailed++
    }
  }
  res.json({ claimed: 0, emailed })
}
