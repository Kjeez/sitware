import { Metadata } from "next"

import { POLICIES } from "@lib/policies"
import PolicyPage from "@modules/sitware/policy-page"

const policy = POLICIES.terms

export const metadata: Metadata = {
  title: `${policy.title} | SITWARE`,
  description: policy.description,
}

export default function TermsPolicyPage() {
  return <PolicyPage policy={policy} href="/terms" />
}
