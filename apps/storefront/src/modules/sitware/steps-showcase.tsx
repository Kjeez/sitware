"use client"

import { useEffect, useState } from "react"
import { STEPS } from "./home-content"

const DURATION = 4500

/** "From one height to a more flexible way of working": four steps that advance on their own. */
export default function StepsShowcase() {
  const [step, setStep] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (
      !auto ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }
    const timer = setInterval(
      () => setStep((s) => (s + 1) % STEPS.length),
      DURATION
    )
    return () => clearInterval(timer)
  }, [auto])

  const current = STEPS[step]

  return (
    <div className="sw-steps">
      <div className="sw-steps-copy" data-reveal="">
        <div className="sw-heading-group">
          <span className="sw-kicker">Same desk. A different way to work.</span>
          <h2 className="sw-h2">
            From one height to a more <em>flexible</em> way of working.
          </h2>
        </div>
        <div className="sw-steps-list" role="tablist" aria-label="How it works">
          {STEPS.map((s, i) => (
            <button
              key={s.num}
              type="button"
              role="tab"
              aria-selected={i === step}
              className={i === step ? "is-active" : undefined}
              onClick={() => {
                setAuto(false)
                setStep(i)
              }}
            >
              <span className="sw-steps-label">
                <span className="sw-steps-num">{s.num}</span>
                <span>{s.title}</span>
              </span>
              <span className="sw-steps-track">
                <span
                  style={{
                    width: i === step ? "100%" : "0%",
                    transition:
                      i === step
                        ? auto
                          ? `width ${DURATION}ms linear`
                          : "width .5s ease"
                        : "none",
                  }}
                />
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="sw-steps-frame" data-reveal="" data-delay="120">
        {STEPS.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.num}
            src={s.img}
            alt={i === step ? s.title : ""}
            aria-hidden={i !== step}
            className={i === step ? "is-active" : undefined}
            loading="lazy"
          />
        ))}
        <span className="sw-chip">
          {current.num} / 0{STEPS.length} — {current.title}
        </span>
      </div>
    </div>
  )
}
