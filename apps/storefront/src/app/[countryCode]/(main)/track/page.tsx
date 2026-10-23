import { Metadata } from "next"

import TrackOrder from "@modules/sitware/track-order"

export const metadata: Metadata = {
  title: "Track your order | SITWARE",
  description: "Check the status of your Sitware order with your order number and email.",
}

export default function TrackPage() {
  return (
    <div className="sw-support">
      <header>
        <p className="eyebrow">Order help</p>
        <h1>Track your order</h1>
        <p>
          Enter the order number from your confirmation page and the email
          address you used at checkout.
        </p>
      </header>
      <TrackOrder />
    </div>
  )
}
