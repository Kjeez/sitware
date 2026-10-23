import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { renderActionEmail, storefrontUrl } from "../lib/email"

type PasswordResetData = {
  entity_id: string
  actor_type: string
  token: string
}

export default async function passwordResetHandler({ event: { data }, container }: SubscriberArgs<PasswordResetData>) {
  // Admin users reset through the Medusa dashboard; only customers get the storefront link.
  if (data.actor_type !== "customer") {
    return
  }
  const notificationService = container.resolve(Modules.NOTIFICATION)
  const url = `${storefrontUrl()}/reset-password?token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(data.entity_id)}`

  await notificationService.createNotifications({
    to: data.entity_id,
    channel: "email",
    template: "customer-password-reset",
    data: { url },
    content: renderActionEmail({
      subject: "Reset your Sitware password",
      heading: "Reset your password",
      paragraphs: [
        "We received a request to reset the password for your Sitware account.",
        "This link expires in 15 minutes.",
      ],
      buttonLabel: "RESET PASSWORD",
      buttonUrl: url,
      footnote: "If you didn't ask for this, you can safely ignore this email.",
    }),
  })
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
