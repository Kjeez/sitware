"use client"

import { requestReturn, ReturnReason } from "@lib/data/returns"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import NativeSelect from "@modules/common/components/native-select"
import { Button, Heading, Text } from "@modules/common/components/ui"
import { useActionState, useState } from "react"

// TODO(owner): set NEXT_PUBLIC_RETURN_WINDOW_DAYS once the returns policy is confirmed. Until
// then any shipped or delivered order can request a return and the team reviews each request.
const RETURN_WINDOW_DAYS = Number(process.env.NEXT_PUBLIC_RETURN_WINDOW_DAYS) || 0

const RETURNABLE_FULFILLMENT = [
  "shipped",
  "partially_shipped",
  "delivered",
  "partially_delivered",
]

type ItemDetail = {
  return_requested_quantity?: number
  return_received_quantity?: number
}

export function returnableQuantity(item: HttpTypes.StoreOrderLineItem) {
  const detail = (item as { detail?: ItemDetail }).detail
  return Math.max(
    0,
    item.quantity -
      Number(detail?.return_requested_quantity ?? 0) -
      Number(detail?.return_received_quantity ?? 0)
  )
}

/** Whether this order can have a return requested, and why not when it can't. */
export function returnEligibility(order: HttpTypes.StoreOrder, now: number) {
  if (order.status === "canceled") {
    return { eligible: false, reason: null }
  }
  if (!RETURNABLE_FULFILLMENT.includes(order.fulfillment_status)) {
    return {
      eligible: false,
      reason: "You can request a return once your order has been shipped.",
    }
  }
  if (RETURN_WINDOW_DAYS) {
    const ageDays = (now - new Date(order.created_at ?? 0).getTime()) / 86_400_000
    if (ageDays > RETURN_WINDOW_DAYS) {
      return { eligible: false, reason: "The return window for this order has closed." }
    }
  }
  if (!(order.items ?? []).some((item) => returnableQuantity(item) > 0)) {
    return { eligible: false, reason: null }
  }
  return { eligible: true, reason: null }
}

const ReturnRequest = ({
  order,
  reasons,
  now,
}: {
  order: HttpTypes.StoreOrder
  reasons: ReturnReason[]
  now: number
}) => {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(requestReturn, null)
  const requested = (order.items ?? []).some(
    (item) =>
      Number((item as { detail?: ItemDetail }).detail?.return_requested_quantity ?? 0) > 0
  )
  const { eligible, reason } = returnEligibility(order, now)

  if (state?.state === "done" || requested) {
    return (
      <Text
        className="txt-medium bg-ui-bg-subtle border border-ui-border-base rounded-rounded p-4"
        data-testid="return-requested-message"
      >
        Return requested. We will contact you to arrange the pickup.
      </Text>
    )
  }

  if (!eligible) {
    return reason ? (
      <Text className="txt-medium text-ui-fg-subtle">{reason}</Text>
    ) : null
  }

  if (!open) {
    return (
      <Button
        variant="secondary"
        className="w-fit"
        onClick={() => setOpen(true)}
        data-testid="open-return-button"
      >
        Request a return
      </Button>
    )
  }

  const items = (order.items ?? []).filter((item) => returnableQuantity(item) > 0)

  return (
    <form action={formAction} className="flex flex-col gap-y-4" data-testid="return-form">
      <Heading level="h2" className="text-xl-semi">
        Request a return
      </Heading>
      <input type="hidden" name="order_id" value={order.id} />
      <div className="flex flex-col gap-y-3">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center justify-between gap-4 border border-ui-border-base rounded-rounded p-3"
          >
            <span className="txt-medium">
              <input type="hidden" name="item_id" value={item.id} />
              {item.product_title}
              {item.variant_title ? ` (${item.variant_title})` : ""}
            </span>
            <select
              name={`quantity_${item.id}`}
              defaultValue="0"
              aria-label={`Quantity of ${item.product_title} to return`}
              className="h-10 px-3 border border-ui-border-base rounded-md bg-ui-bg-field"
            >
              {Array.from({ length: returnableQuantity(item) + 1 }, (_, n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <NativeSelect
        name="reason_id"
        placeholder="Reason for return"
        aria-label="Reason for return"
        defaultValue=""
        required
      >
        {reasons.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </NativeSelect>
      <textarea
        name="note"
        rows={3}
        maxLength={500}
        placeholder="Anything we should know? (optional)"
        aria-label="Note"
        className="w-full px-4 py-3 border border-ui-border-base rounded-md bg-ui-bg-field txt-medium"
      />
      <ErrorMessage
        error={state?.state === "error" ? state.error : null}
        data-testid="return-error-message"
      />
      <div className="flex flex-wrap gap-3">
        <SubmitButton data-testid="submit-return-button">Submit return request</SubmitButton>
        <Button variant="transparent" type="button" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default ReturnRequest
