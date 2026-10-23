"use client"

import { POLICY_LINKS } from "@lib/site"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import MotionEffects from "./motion-effects"

const NAVIGATION = [
  { href: "/#workstations", label: "Shop" },
  { href: "/#better-work", label: "Better Work" },
  { href: "/#story", label: "Our Story" },
  { href: "/#faq", label: "Support" },
]

const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/#workstations", label: "Workstations" },
      { href: "/store", label: "All Products" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/#story", label: "Our Story" },
      { href: "/#better-work", label: "Better Work" },
      { href: "/#better-work", label: "How It Works" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/#faq", label: "FAQ" },
      { href: "/track", label: "Track Your Order" },
      { href: "/contact", label: "Contact Us" },
      { href: "/account", label: "Your Account" },
    ],
  },
]

/**
 * Sitware's header and footer. On the homepage the header starts transparent over the hero and
 * turns solid once the page scrolls; everywhere it hides while scrolling down and returns on the
 * way up.
 */
export default function SiteChrome({
  children,
  bagCount,
}: {
  children: React.ReactNode
  bagCount: number
}) {
  const pathname = usePathname()
  const { countryCode } = useParams()
  const isHome =
    pathname === `/${countryCode}` || pathname === `/${countryCode}/`
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 60)
      setHidden((wasHidden) =>
        y > 400 && y > lastY.current + 2
          ? true
          : y < lastY.current - 2
          ? false
          : wasHidden
      )
      lastY.current = y
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  const overlay = isHome && !scrolled && !menuOpen
  const headerClass = [
    "sw-nav",
    isHome ? "is-fixed" : "is-sticky",
    overlay ? "is-overlay" : "is-solid",
    hidden && !menuOpen ? "is-hidden" : "",
  ].join(" ")

  return (
    <div className={`sitware-site ${isHome ? "home-chrome" : "inner-chrome"}`}>
      <a className="skip-link" href="#page-content">
        Skip to content
      </a>
      <header className={headerClass}>
        <button
          type="button"
          className="sw-menu-button"
          aria-expanded={menuOpen}
          aria-controls="sw-mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        <nav className="sw-nav-links" aria-label="Main navigation">
          {NAVIGATION.map((item) => (
            <LocalizedClientLink href={item.href} key={item.label}>
              {item.label}
            </LocalizedClientLink>
          ))}
        </nav>
        <LocalizedClientLink
          className="sw-wordmark"
          href="/"
          aria-label="Sitware home"
        >
          SITWARE
        </LocalizedClientLink>
        <div className="sw-nav-actions">
          <LocalizedClientLink href="/account" className="sw-nav-account">
            Account
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/cart"
            className="sw-bag"
            aria-label={`Bag, ${bagCount} ${bagCount === 1 ? "item" : "items"}`}
            data-testid="nav-cart-link"
          >
            Bag <span data-filled={bagCount > 0}>{bagCount}</span>
          </LocalizedClientLink>
        </div>
        <nav
          id="sw-mobile-menu"
          className="sw-mobile-menu"
          aria-label="Mobile navigation"
          hidden={!menuOpen}
        >
          {NAVIGATION.map((item) => (
            <LocalizedClientLink
              href={item.href}
              key={item.label}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </LocalizedClientLink>
          ))}
          <LocalizedClientLink
            href="/account"
            onClick={() => setMenuOpen(false)}
          >
            Account
          </LocalizedClientLink>
        </nav>
      </header>

      <div id="page-content">{children}</div>

      <footer className="sw-footer">
        <div className="sw-footer-inner">
          <div className="sw-footer-top">
            <div className="sw-footer-intro">
              <h2>
                A better <em>everyday.</em>
              </h2>
              <p>Thoughtful products. A workspace that feels like you.</p>
              <LocalizedClientLink
                href="/#workstations"
                className="sw-pill sw-pill-ghost"
              >
                Explore the collection <span aria-hidden="true">→</span>
              </LocalizedClientLink>
            </div>
            <div className="sw-footer-columns">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title}>
                  <h3>{column.title}</h3>
                  {column.links.map((link) => (
                    <LocalizedClientLink href={link.href} key={link.label}>
                      {link.label}
                    </LocalizedClientLink>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="sw-footer-bottom">
            <span
              className="sw-footer-wordmark"
              data-reveal=""
              aria-hidden="true"
            >
              SITWARE
            </span>
            <div className="sw-footer-meta">
              <span>
                © {new Date().getFullYear()} Sitware. All rights reserved.
              </span>
              <nav aria-label="Store policies" className="sw-footer-legal">
                {POLICY_LINKS.map((link) => (
                  <LocalizedClientLink href={link.href} key={link.href}>
                    {link.label}
                  </LocalizedClientLink>
                ))}
              </nav>
              <span>Designed For Better Work.</span>
            </div>
          </div>
        </div>
      </footer>
      <MotionEffects />
    </div>
  )
}
