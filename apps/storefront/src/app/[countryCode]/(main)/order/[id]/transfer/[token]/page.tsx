import { Metadata } from "next"

import { Heading, Text } from "@modules/common/components/ui"
import TransferActions from "@modules/order/components/transfer-actions"

export const metadata: Metadata = {
  title: "Add order to account | SITWARE",
  robots: { index: false },
}

// Opened from the "add this order to your account" email. The emailed token proves the reader
// controls the order's email address, so no sign-in is needed.
export default async function TransferPage(props: {
  params: Promise<{ id: string; token: string }>
}) {
  const { id, token } = await props.params

  return (
    <div className="content-container flex flex-col gap-y-6 max-w-xl mx-auto mt-10 mb-20">
      <Heading level="h1" className="text-2xl-semi">
        Add this order to a Sitware account?
      </Heading>
      <Text className="text-ui-fg-subtle">
        Someone signed in to a Sitware account asked to add an order placed
        with your email address. If that was you, accept below and the order
        will appear under your orders.
      </Text>
      <Text className="text-ui-fg-subtle">
        If you don&apos;t recognise this request, decline it or simply ignore
        the email. Nothing changes until you accept.
      </Text>
      <div className="w-full h-px bg-ui-border-base" />
      <TransferActions id={id} token={token} />
    </div>
  )
}
