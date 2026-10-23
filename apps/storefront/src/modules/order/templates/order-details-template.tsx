"use client"

import { XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { ReturnReason } from "@lib/data/returns"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ReturnRequest from "@modules/order/components/return-request"
import ShippingDetails from "@modules/order/components/shipping-details"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
  // Present on the account's order page, where returns can be requested.
  returnReasons?: ReturnReason[]
  // When the page was rendered; the return window is measured from here.
  now?: number
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
  returnReasons,
  now,
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Order details</h1>
        <LocalizedClientLink
          href="/account/orders"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <XMark /> Back to overview
        </LocalizedClientLink>
      </div>
      <div
        className="flex flex-col gap-4 h-full bg-white w-full"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <Items order={order} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        {returnReasons && now && (
          <ReturnRequest order={order} reasons={returnReasons} now={now} />
        )}
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
