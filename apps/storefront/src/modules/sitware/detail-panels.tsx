"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useState } from "react"

export type PanelRow = { k: string; v: string; href?: string }
export type Panel = { title: string; rows: PanelRow[] }

/** Details / Specifications / Delivery & returns, one open at a time. */
export default function DetailPanels({ panels }: { panels: Panel[] }) {
  const [open, setOpen] = useState(0)

  return (
    <div className="sw-panels">
      {panels.map((panel, i) => {
        const isOpen = open === i
        return (
          <div key={panel.title}>
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`panel-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{panel.title}</span>
                <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
            </h2>
            <dl id={`panel-${i}`} hidden={!isOpen}>
              {panel.rows.map((row) => (
                <div key={row.k}>
                  <dt>{row.k}</dt>
                  <dd
                    className={
                      row.v === "To be confirmed" ? "is-pending" : undefined
                    }
                  >
                    {row.href ? (
                      <LocalizedClientLink href={row.href}>
                        {row.v}
                      </LocalizedClientLink>
                    ) : (
                      row.v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )
      })}
    </div>
  )
}
