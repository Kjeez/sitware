import { Metadata } from "next"

import { POLICIES } from "@lib/policies"
import PolicyPage from "@modules/sitware/policy-page"

const policy = POLICIES.shipping

export const metadata: Metadata = {
  title: `${policy.title} | SITWARE`,
  description: policy.description,
}

export default function ShippingPolicyPage() {
  return <PolicyPage policy={policy} href="/shipping" />
}
