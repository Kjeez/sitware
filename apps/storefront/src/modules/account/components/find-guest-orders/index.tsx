"use client"

import { findGuestOrdersAction } from "@lib/data/customer"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { Heading, Text } from "@modules/common/components/ui"
import { useActionState } from "react"

/**
 * Looks for orders placed at guest checkout with this account's email. Google accounts get them
 * linked straight away; email/password accounts get a confirmation email for each order.
 */
const FindGuestOrders = ({ linked }: { linked?: number }) => {
  const [state, formAction] = useActionState(findGuestOrdersAction, null)

  const result =
    state?.state === "done"
      ? state.claimed > 0
        ? `${state.claimed} order${state.claimed === 1 ? " was" : "s were"} added to your account.`
        : state.emailed > 0
        ? `We emailed you a confirmation link for ${state.emailed} order${state.emailed === 1 ? "" : "s"}. Open it to add ${state.emailed === 1 ? "it" : "them"} to your account.`
        : "We didn't find any other orders placed with your email."
      : null

  return (
    <div className="flex flex-col gap-y-4 w-full" data-testid="find-guest-orders">
      {!!linked && (
        <Text className="txt-medium bg-ui-bg-subtle border border-ui-border-base rounded-rounded p-4">
          {linked} order{linked === 1 ? " you placed as a guest was" : "s you placed as a guest were"} added to your account.
        </Text>
      )}
      <div className="flex flex-col xsmall:flex-row xsmall:items-center justify-between gap-4">
        <div className="flex flex-col gap-y-1">
          <Heading level="h3" className="!text-sm font-semibold">
            Ordered before you had an account?
          </Heading>
          <Text className="text-small-regular text-ui-fg-subtle">
            Find orders placed with your email and add them here.
          </Text>
        </div>
        <form action={formAction}>
          <SubmitButton
            variant="secondary"
            size="small"
            className="whitespace-nowrap"
            data-testid="find-guest-orders-button"
          >
            Find my orders
          </SubmitButton>
        </form>
      </div>
      {result && (
        <Text className="txt-medium" data-testid="find-guest-orders-result">
          {result}
        </Text>
      )}
      {state?.state === "error" && (
        <Text className="txt-medium text-rose-600">{state.error}</Text>
      )}
    </div>
  )
}

export default FindGuestOrders
