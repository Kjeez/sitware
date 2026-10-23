"use client"

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react"

/** "See it move": two positions that alternate until the visitor picks one. */
export default function PoseToggle({
  poses,
  children,
}: {
  poses: { label: string; img: string }[]
  /** The section's heading and text, shown above the switch. */
  children: React.ReactNode
}) {
  const [pose, setPose] = useState(0)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (
      locked ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }
    const timer = setInterval(
      () => setPose((p) => (p + 1) % poses.length),
      3200
    )
    return () => clearInterval(timer)
  }, [locked, poses.length])

  return (
    <>
      <div className="sw-move-copy">
        {children}
        <div className="sw-pose-switch" role="group" aria-label="Position">
          {poses.map((p, i) => (
            <button
              key={p.label}
              type="button"
              aria-pressed={i === pose}
              onClick={() => {
                setLocked(true)
                setPose(i)
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="sw-pose-frame">
        {poses.map((p, i) => (
          <img
            key={p.label}
            src={p.img}
            alt={i === pose ? p.label : ""}
            aria-hidden={i !== pose}
            className={i === pose ? "is-active" : undefined}
            loading="lazy"
          />
        ))}
      </div>
    </>
  )
}
