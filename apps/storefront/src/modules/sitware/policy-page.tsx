import { Policy } from "@lib/policies"
import { POLICY_LINKS } from "@lib/site"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import BusinessDetails from "./business-details"

/** A store policy: its sections, links to the other policies and the business details. */
export default function PolicyPage({
  policy,
  href,
}: {
  policy: Policy
  href: string
}) {
  const pending = policy.sections.some((s) => s.body.length === 0)

  return (
    <div className="sw-legal">
      <header>
        <p className="eyebrow">Store policies</p>
        <h1>{policy.title}</h1>
        {policy.lastUpdated && (
          <p className="sw-legal-updated">Last updated {policy.lastUpdated}</p>
        )}
      </header>
      <nav aria-label="Store policies" className="sw-legal-nav">
        {POLICY_LINKS.map((link) => (
          <LocalizedClientLink
            key={link.href}
            href={link.href}
            aria-current={link.href === href ? "page" : undefined}
          >
            {link.label}
          </LocalizedClientLink>
        ))}
      </nav>
      {pending && (
        <p className="sw-legal-notice" role="note">
          This policy is being finalised. Parts marked &ldquo;To be
          confirmed&rdquo; will be published here before they apply to any
          order.
        </p>
      )}
      <div className="sw-legal-body">
        {policy.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.length ? (
              section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))
            ) : (
              <p className="is-pending">To be confirmed.</p>
            )}
          </section>
        ))}
      </div>
      <BusinessDetails />
    </div>
  )
}
