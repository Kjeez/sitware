/**
 * Policy page content. Headings follow what Indian e-commerce rules expect each policy to cover;
 * the text itself must come from Sitware.
 *
 * TODO(owner): supply the text for every section (one string per paragraph) and the date it
 * takes effect. Sections without text show "To be confirmed" on the site.
 */
export type PolicySection = { heading: string; body: string[] }

export type Policy = {
  title: string
  description: string
  lastUpdated: string | null
  sections: PolicySection[]
}

const section = (heading: string, body: string[] = []): PolicySection => ({
  heading,
  body,
})

export const POLICIES: Record<"shipping" | "returns" | "privacy" | "terms", Policy> = {
  shipping: {
    title: "Shipping policy",
    description: "How Sitware orders are packed, shipped and delivered within India.",
    lastUpdated: null,
    sections: [
      section("Where we deliver", [
        "We currently deliver to addresses in India only.",
      ]),
      section("Delivery charges", [
        "Delivery charges for your order are shown at checkout before you place it.",
      ]),
      section("Dispatch and delivery times"),
      section("Cash on Delivery"),
      section("Tracking your order", [
        "You can check the status of your order on the Track your order page using your order number and email address.",
      ]),
      section("Damaged or missing parcels"),
    ],
  },
  returns: {
    title: "Returns & refunds",
    description: "How to return a Sitware order and how refunds work.",
    lastUpdated: null,
    sections: [
      section("Return window"),
      section("Eligible items and condition"),
      section("How to request a return", [
        "Sign in, open the order under Your Account → Orders and choose Request a return. Orders placed as a guest can be added to your account first with Find my orders.",
      ]),
      section("Return pickup"),
      section("Refunds"),
      section("Cancellations"),
      section("Damaged, defective or wrong items"),
      section("Warranty"),
    ],
  },
  privacy: {
    title: "Privacy policy",
    description: "How Sitware collects, uses and protects your personal information.",
    lastUpdated: null,
    sections: [
      section("Information we collect"),
      section("How we use your information"),
      section("Payments"),
      section("Cookies"),
      section("Sharing with service providers"),
      section("Data retention"),
      section("Your rights and choices"),
      section("Grievance officer"),
    ],
  },
  terms: {
    title: "Terms & conditions",
    description: "The terms that apply when you use the Sitware website and buy from Sitware.",
    lastUpdated: null,
    sections: [
      section("About these terms"),
      section("Products and pricing"),
      section("Orders and payment"),
      section("Delivery, returns and refunds"),
      section("Warranty"),
      section("Your account"),
      section("Reviews and content you share"),
      section("Limitation of liability"),
      section("Governing law and disputes"),
      section("Changes to these terms"),
    ],
  },
}
