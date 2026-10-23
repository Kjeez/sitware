import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { findClaimableGuestOrders, hasVerifiedEmail } from "../../lib/guest-orders"

type ClaimGuestOrdersInput = {
  customer_id: string
  auth_identity_id: string
}

/**
 * Attaches guest orders placed with the customer's email to their account. Only allowed for
 * Google sign-ins, where Google has verified the email; email/password customers use the
 * emailed order-transfer flow instead.
 */
export const claimGuestOrdersStep = createStep(
  "claim-guest-orders",
  async (input: ClaimGuestOrdersInput, { container }) => {
    if (!(await hasVerifiedEmail(container, input.auth_identity_id))) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Automatic order linking is only available for Google sign-in."
      )
    }

    const claimable = await findClaimableGuestOrders(container, input.customer_id)
    if (!claimable.length) {
      return new StepResponse({ claimed: 0 }, [])
    }

    const orderService = container.resolve(Modules.ORDER)
    await orderService.updateOrders(claimable.map((o) => ({ id: o.id, customer_id: input.customer_id })))
    return new StepResponse(
      { claimed: claimable.length },
      claimable.map((o) => ({ id: o.id, customer_id: o.customer_id ?? undefined }))
    )
  },
  async (previous, { container }) => {
    if (!previous?.length) {
      return
    }
    const orderService = container.resolve(Modules.ORDER)
    await orderService.updateOrders(previous)
  }
)
