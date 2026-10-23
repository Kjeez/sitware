"use client"

import { useParams, usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { WorkspaceIcon } from "@modules/sitware/workspace-icon"

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { countryCode } = useParams()
  const isHome = pathname === "/" + countryCode || pathname === "/" + countryCode + "/"
  const navigation = [{ href: "/#workstations", label: "Shop" }, { href: "/#better-work", label: "Better Work" }, { href: "/#story", label: "Our Story" }, { href: "/#support", label: "Support" }]
  return (
    <div className={"sitware-site " + (isHome ? "home-chrome" : "inner-chrome")}>
      <a className="skip-link" href="#page-content">Skip to content</a>
      <header className="sw-header">
        <LocalizedClientLink className="sw-wordmark" href="/" aria-label="Sitware home"><span>SITWARE</span><small>Designed For Better Work.</small></LocalizedClientLink>
        <nav aria-label="Main navigation">{navigation.map((item) => <LocalizedClientLink href={item.href} key={item.label}>{item.label}</LocalizedClientLink>)}</nav>
        <div className="sw-actions"><LocalizedClientLink href="/store" aria-label="Browse products" title="Browse products"><WorkspaceIcon name="search" /></LocalizedClientLink><LocalizedClientLink href="/account" aria-label="Your account" title="Your account"><WorkspaceIcon name="user" /></LocalizedClientLink><LocalizedClientLink href="/cart" aria-label="Shopping bag" title="Shopping bag"><WorkspaceIcon name="cart" /></LocalizedClientLink><details className="mobile-menu"><summary aria-label="Open navigation"><span /><span /></summary><nav className="mobile-menu-panel" aria-label="Mobile navigation">{navigation.map((item) => <LocalizedClientLink href={item.href} key={item.label} onClick={() => document.querySelector(".mobile-menu")?.removeAttribute("open")}>{item.label}</LocalizedClientLink>)}</nav></details></div>
      </header>
      <div id="page-content">{children}</div>
      <footer className="sw-footer"><div className="footer-main"><div className="footer-brand"><LocalizedClientLink href="/" className="footer-wordmark">SITWARE</LocalizedClientLink><p>Designed For Better Work.</p></div><div className="footer-col"><h3>Shop</h3><LocalizedClientLink href="/#workstations">Workstations</LocalizedClientLink><LocalizedClientLink href="/store">All Products</LocalizedClientLink></div><div className="footer-col"><h3>About</h3><LocalizedClientLink href="/#story">Our Story</LocalizedClientLink><LocalizedClientLink href="/#better-work">Better Work</LocalizedClientLink><LocalizedClientLink href="/#how-it-works">How It Works</LocalizedClientLink></div><div className="footer-col"><h3>Support</h3><LocalizedClientLink href="/#support">FAQ</LocalizedClientLink><LocalizedClientLink href="/account">Your Account</LocalizedClientLink><LocalizedClientLink href="/cart">Your Bag</LocalizedClientLink></div><div className="footer-news"><h3>A better everyday</h3><p>Thoughtful products.<br />A workspace that feels like you.</p><LocalizedClientLink className="footer-explore" href="/#workstations">Explore the collection <span aria-hidden="true">→</span></LocalizedClientLink></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Sitware. All rights reserved.</span><span>Designed For Better Work.</span></div></footer>
    </div>
  )
}
