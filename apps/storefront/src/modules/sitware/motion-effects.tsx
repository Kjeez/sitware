"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

const EASE = "cubic-bezier(.2,.7,.2,1)"

/**
 * Scroll reveals (`data-reveal`, optional `data-delay` in ms) and gentle image parallax
 * (`data-parallax`, a fraction of the frame height). Both are skipped when the visitor prefers
 * reduced motion, and content is fully visible without JavaScript.
 */
export default function MotionEffects() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }
          const el = entry.target as HTMLElement
          el.style.opacity = "1"
          el.style.transform = "none"
          observer.unobserve(el)
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    )
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      // Content already on screen stays put; only what is below the fold animates in.
      if (el.getBoundingClientRect().top < window.innerHeight) {
        return
      }
      const delay = el.dataset.delay || "0"
      el.style.opacity = "0"
      el.style.transform = "translateY(32px)"
      el.style.transition = `opacity 1.1s ${EASE} ${delay}ms, transform 1.1s ${EASE} ${delay}ms`
      observer.observe(el)
    })

    let frame = 0
    const parallax = () => {
      frame = 0
      const vh = window.innerHeight
      document
        .querySelectorAll<HTMLElement>("[data-parallax]")
        .forEach((el) => {
          const rect = el.parentElement?.getBoundingClientRect()
          if (!rect || rect.bottom < -100 || rect.top > vh + 100) {
            return
          }
          const progress = (rect.top + rect.height / 2 - vh / 2) / vh
          const shift = -progress * parseFloat(el.dataset.parallax || "0") * 100
          el.style.transform = `translate3d(0,${shift.toFixed(1)}%,0)`
        })
    }
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(parallax)
      }
    }
    parallax()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [pathname])

  return null
}
