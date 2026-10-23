"use client"

import { useFormAction } from "@lib/hooks/use-form-action"
import { lookupOrder } from "@lib/data/support"
import { convertToLocale } from "@lib/util/money"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"

const ORDER_STATUS: Record<string, string> = {
  pending: "Order placed",
  completed: "Completed",
  canceled: "Cancelled",
  archived: "Archived",
  requires_action: "Needs attention",
}

const FULFILLMENT_STATUS: Record<string, string> = {
  not_fulfilled: "Being prepared",
  partially_fulfilled: "Partly packed",
  fulfilled: "Packed",
  partially_shipped: "Partly shipped",
  shipped: "Shipped",
  partially_delivered: "Partly delivered",
  delivered: "Delivered",
  canceled: "Cancelled",
}

export default function TrackOrder() {
  const [state, onSubmit, pending] = useFormAction(lookupOrder, null)
  const order = state?.state === "found" ? state.order : null

  return (
    <div className="sw-support-card">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-y-3"
        data-testid="track-form"
      >
        <Input
          label="Order number"
          name="order_number"
          inputMode="numeric"
          required
          data-testid="track-order-number"
        />
        <Input
          label="Email used at checkout"
          name="email"
          type="email"
          autoComplete="email"
          required
          data-testid="track-email"
        />
        <ErrorMessage
          error={state?.state === "error" ? state.error : null}
          data-testid="track-error"
        />
        <SubmitButton
          className="w-full mt-2"
          isLoading={pending}
          data-testid="track-submit"
        >
          Track order
        </SubmitButton>
      </form>
      {order && (
        <section
          className="sw-track-result"
          aria-live="polite"
          data-testid="track-result"
        >
          <h2>Order #{order.display_id}</h2>
          <dl>
            <div>
              <dt>Status</dt>
              <dd>
                {order.status === "canceled"
                  ? "Cancelled"
                  : FULFILLMENT_STATUS[order.fulfillment_status ?? ""] ??
                    ORDER_STATUS[order.status] ??
                    order.status}
              </dd>
            </div>
            <div>
              <dt>Placed on</dt>
              <dd>
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>
                {convertToLocale({
                  amount: order.total,
                  currency_code: order.currency_code,
                })}
              </dd>
            </div>
          </dl>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.quantity} × {item.title}
                {item.variant_title ? ` (${item.variant_title})` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
