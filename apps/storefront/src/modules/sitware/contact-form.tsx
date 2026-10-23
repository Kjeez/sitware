"use client"

import { useFormAction } from "@lib/hooks/use-form-action"
import { sendContactMessage } from "@lib/data/support"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"

export default function ContactForm() {
  const [state, onSubmit, pending] = useFormAction(sendContactMessage, null)

  if (state?.state === "sent") {
    return (
      <div className="sw-support-card" data-testid="contact-sent">
        <h2 className="sw-support-title">
          Thank you. Your message has been sent.
        </h2>
        <p className="sw-support-note">
          We will reply to the email address you gave us.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="sw-support-card flex flex-col gap-y-3"
      data-testid="contact-form"
    >
      <Input
        label="Name"
        name="name"
        autoComplete="name"
        required
        maxLength={100}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <Input
        label="Mobile number (optional)"
        name="phone"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        maxLength={20}
      />
      <Input label="Subject (optional)" name="subject" maxLength={150} />
      <textarea
        name="message"
        rows={6}
        minLength={10}
        maxLength={3000}
        required
        aria-label="Message"
        placeholder="How can we help? Include your order number if it is about an order."
        className="w-full px-4 py-3 border border-ui-border-base rounded-md bg-ui-bg-field txt-medium"
      />
      {/* Honeypot for bots: hidden from people and assistive technology. */}
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <ErrorMessage
        error={state?.state === "error" ? state.error : null}
        data-testid="contact-error"
      />
      <SubmitButton
        className="w-full mt-2"
        isLoading={pending}
        data-testid="contact-submit"
      >
        Send message
      </SubmitButton>
    </form>
  )
}
