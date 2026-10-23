import { Metadata } from "next"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import BusinessDetails from "@modules/sitware/business-details"
import ContactForm from "@modules/sitware/contact-form"

export const metadata: Metadata = {
  title: "Contact us | SITWARE",
  description: "Send Sitware a message about an order, a product or anything else.",
}

export default function ContactPage() {
  return (
    <div className="sw-support">
      <header>
        <p className="eyebrow">Contact</p>
        <h1>How can we help?</h1>
        <p>
          Send us a message and we will reply by email. For an existing order,
          you can also <LocalizedClientLink href="/track">track it</LocalizedClientLink> or
          request a return from <LocalizedClientLink href="/account/orders">your orders</LocalizedClientLink>.
        </p>
      </header>
      <ContactForm />
      <BusinessDetails />
    </div>
  )
}
