import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { sendNotificationsStep } from "@medusajs/medusa/core-flows"
import { renderMessageEmail } from "../lib/email"

export type ContactMessageInput = {
  to: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}

/** Emails a storefront contact-form message to the store's inbox, with the sender as reply-to. */
export const sendContactMessageWorkflow = createWorkflow(
  "send-contact-message",
  (input: ContactMessageInput) => {
    const notifications = transform({ input }, ({ input }) => {
      const fields: [string, string][] = [
        ["Name", input.name],
        ["Email", input.email],
      ]
      if (input.phone) {
        fields.push(["Phone", input.phone])
      }
      return [
        {
          to: input.to,
          channel: "email",
          template: "contact-message",
          data: { name: input.name, email: input.email },
          provider_data: { reply_to: input.email },
          content: renderMessageEmail({
            subject: `Website message: ${input.subject || "General enquiry"}`,
            heading: input.subject || "New message from the website",
            fields,
            message: input.message,
          }),
        },
      ]
    })
    const sent = sendNotificationsStep(notifications)
    return new WorkflowResponse(sent)
  }
)
