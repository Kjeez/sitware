import { Metadata } from "next"

import { POLICIES } from "@lib/policies"
import PolicyPage from "@modules/sitware/policy-page"

const policy = POLICIES.privacy

export const metadata: Metadata = {
  title: `${policy.title} | SITWARE`,
  description: policy.description,
}

export default function PrivacyPolicyPage() {
  return <PolicyPage policy={policy} href="/privacy" />
}
