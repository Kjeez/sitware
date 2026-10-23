import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Sign in | SITWARE",
  description: "Sign in to your Sitware account.",
}

export default function Login() {
  return <LoginTemplate />
}
