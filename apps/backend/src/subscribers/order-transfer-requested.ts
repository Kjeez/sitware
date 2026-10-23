import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { renderActionEmail, storefrontUrl } from "../lib/email"

type TransferRequestedData = {
  id: string
  order_change_id: string
}

/** Emails the order's original address a link that adds a guest order to the requesting account. */
export default async function orderTransferRequestedHandler({
  event: { data },
  container,
}: SubscriberArgs<TransferRequestedData>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationService = container.resolve(Modules.NOTIFICATION)

  const { data: [order] } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email"],
    filters: { id: data.id },
  })
  const { data: [change] } = await query.graph({
    entity: "order_change",
    fields: ["id", "actions.action", "actions.details"],
    filters: { id: data.order_change_id },
  })
  const token = change?.actions?.find((a) => String(a?.action) === "TRANSFER_CUSTOMER")?.details?.token as
    | string
    | undefined
  if (!order?.email || !token) {
    return
  }

  // The storefront's /order/:id/transfer/:token page lets the email owner accept or decline.
  const url = `${storefrontUrl()}/order/${order.id}/transfer/${encodeURIComponent(token)}`
  await notificationService.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-transfer-requested",
    data: { url, order_id: order.id },
    content: renderActionEmail({
      subject: `Add order #${order.display_id} to your Sitware account`,
      heading: `Add order #${order.display_id} to your account`,
      paragraphs: [
        "Someone asked to add this order to a Sitware account. If that was you, confirm below and the order will appear under your orders.",
      ],
      buttonLabel: "CONFIRM",
      buttonUrl: url,
      footnote: "If you didn't request this, ignore this email and nothing will change.",
    }),
  })
}

export const config: SubscriberConfig = {
  event: "order.transfer_requested",
}
