"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useState } from "react"
import { FAQS } from "./home-content"

/** The homepage FAQ: one answer open at a time, the first open by default. */
export default function FaqList() {
  const [open, setOpen] = useState(0)

  return (
    <div className="sw-faq-list" data-reveal="" data-delay="120">
      {FAQS.map((faq, i) => {
        const isOpen = open === i
        return (
          <div key={faq.q} className={`sw-faq-item${isOpen ? " is-open" : ""}`}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
                id={`faq-question-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{faq.q}</span>
                <span className="sw-faq-icon" aria-hidden="true">
                  +
                </span>
              </button>
            </h3>
            <div
              id={`faq-answer-${i}`}
              role="region"
              aria-labelledby={`faq-question-${i}`}
              className="sw-faq-answer"
              inert={!isOpen}
            >
              <div>
                <p>
                  {faq.a}
                  {faq.links && (
                    <>
                      {" "}
                      {faq.links.map((link, index) => (
                        <span key={link.href}>
                          {index > 0 && " · "}
                          <LocalizedClientLink href={link.href}>
                            {link.label}
                          </LocalizedClientLink>
                        </span>
                      ))}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
