import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import type {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"

type Options = {
  api_key: string
  from: string
}

/**
 * Sends transactional email through Resend (https://resend.com). Subscribers render the
 * message and pass it as `content` ({ subject, html, text }).
 */
class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend"

  protected logger_: Logger
  protected options_: Options

  static validateOptions(options: Record<string, unknown>) {
    if (!options.api_key || !options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend provider requires `api_key` and `from` options."
      )
    }
  }

  constructor(container: { logger: Logger }, options: Options) {
    super()
    this.logger_ = container.logger
    this.options_ = options
  }

  async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    const { content } = notification
    if (!content?.subject || !(content.html || content.text)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Notification "${notification.template}" has no subject or body`
      )
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options_.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: notification.from || this.options_.from,
        to: [notification.to],
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      this.logger_.error(`Resend failed for "${notification.template}": ${JSON.stringify(json)}`)
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Failed to send email")
    }
    return { id: json.id }
  }
}

export default ResendNotificationProviderService
