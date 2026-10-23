import { Metadata } from "next"

import { ForgotPasswordForm } from "@modules/account/components/password-reset"

export const metadata: Metadata = {
  title: "Forgot password | SITWARE",
  robots: { index: false },
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
