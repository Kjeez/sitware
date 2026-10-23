"use client"

import { requestPasswordReset, resetPassword } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useRouter } from "next/navigation"
import { useActionState, useEffect } from "react"

const Shell = ({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) => (
  <div className="w-full flex justify-center px-8 py-16">
    <div className="max-w-sm w-full flex flex-col items-center">
      <h1 className="text-large-semi uppercase mb-6 text-center">{title}</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        {subtitle}
      </p>
      {children}
      <LocalizedClientLink
        href="/account"
        className="text-small-regular underline mt-6"
      >
        Back to sign in
      </LocalizedClientLink>
    </div>
  </div>
)

export const ForgotPasswordForm = () => {
  const [state, formAction] = useActionState(requestPasswordReset, null)

  return (
    <Shell
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a link to set a new one."
    >
      {state?.state === "sent" ? (
        <div
          className="w-full text-center text-base-regular bg-ui-bg-subtle border border-ui-border-base rounded-rounded p-4"
          data-testid="reset-sent-message"
        >
          If an account exists for <strong>{state.email}</strong>, a reset
          link is on its way. It expires in 15 minutes, so please check your
          inbox and spam folder soon.
        </div>
      ) : (
        <form className="w-full" action={formAction}>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <ErrorMessage
            error={state?.state === "error" ? state.error : null}
            data-testid="reset-error-message"
          />
          <SubmitButton className="w-full mt-6" data-testid="send-reset-button">
            Send reset link
          </SubmitButton>
        </form>
      )}
    </Shell>
  )
}

export const ResetPasswordForm = ({
  token,
  email,
}: {
  token?: string
  email?: string
}) => {
  const router = useRouter()
  const [state, formAction] = useActionState(resetPassword, null)

  useEffect(() => {
    if (state?.state === "success") {
      router.replace("/account")
    }
  }, [state, router])

  if (!token || !email) {
    return (
      <Shell
        title="Link not valid"
        subtitle="This reset link is incomplete or has expired."
      >
        <LocalizedClientLink
          href="/forgot-password"
          className="text-base-regular underline"
        >
          Request a new link
        </LocalizedClientLink>
      </Shell>
    )
  }

  return (
    <Shell title="Set a new password" subtitle={`For ${email}`}>
      <form className="w-full flex flex-col gap-y-2" action={formAction}>
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />
        <Input
          label="New password (at least 8 characters)"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          data-testid="new-password-input"
        />
        <Input
          label="Confirm new password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          data-testid="confirm-password-input"
        />
        <ErrorMessage
          error={state?.state === "error" ? state.error : null}
          data-testid="reset-password-error-message"
        />
        <SubmitButton className="w-full mt-4" data-testid="save-password-button">
          Save password
        </SubmitButton>
      </form>
    </Shell>
  )
}
