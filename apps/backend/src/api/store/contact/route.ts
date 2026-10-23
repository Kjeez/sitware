import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { sendContactMessageWorkflow } from "../../../workflows/contact-message"
import type { StoreContactMessageType } from "../../validators"

/** The storefront contact form. Messages go to CONTACT_EMAIL; without it the form is unavailable. */
export async function POST(req: MedusaRequest<StoreContactMessageType>, res: MedusaResponse) {
  const to = process.env.CONTACT_EMAIL
  if (!to) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "The contact form isn't available yet."
    )
  }
  const { website, ...message } = req.validatedBody
  // Bots that fill the hidden honeypot field get the same response, but nothing is sent.
  if (!website) {
    await sendContactMessageWorkflow(req.scope).run({ input: { ...message, to } })
  }
  res.json({ sent: true })
}
