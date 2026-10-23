import { BUSINESS } from "@lib/site"

const TBC = "To be confirmed"

/** The legally required business details; anything not yet confirmed says so. */
export default function BusinessDetails() {
  const officer = BUSINESS.grievanceOfficer
  const officerLine = [officer.name, officer.designation]
    .filter(Boolean)
    .join(", ")
  const officerContact = [officer.email, officer.phone]
    .filter(Boolean)
    .join(" · ")
  const rows: [string, string | null][] = [
    [
      "Business",
      BUSINESS.legalName && `${BUSINESS.legalName} (${BUSINESS.brand})`,
    ],
    ["Registered address", BUSINESS.address],
    ["GSTIN", BUSINESS.gstin],
    [
      "Customer care",
      [BUSINESS.supportEmail, BUSINESS.supportPhone]
        .filter(Boolean)
        .join(" · ") || null,
    ],
    ["Support hours", BUSINESS.supportHours],
    [
      "Grievance officer",
      officerLine
        ? `${officerLine}${officerContact ? ` — ${officerContact}` : ""}`
        : null,
    ],
  ]

  return (
    <aside className="sw-business" aria-labelledby="business-details-title">
      <h2 id="business-details-title">Business details</h2>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className={value ? undefined : "is-pending"}>{value || TBC}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
