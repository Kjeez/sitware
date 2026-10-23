import { Metadata } from "next"

import { ResetPasswordForm } from "@modules/account/components/password-reset"

export const metadata: Metadata = {
  title: "Reset password | SITWARE",
  robots: { index: false },
}

// Opened from the password reset email: /reset-password?token=...&email=...
export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string; email?: string }>
}) {
  const { token, email } = await props.searchParams
  return <ResetPasswordForm token={token} email={email} />
}
