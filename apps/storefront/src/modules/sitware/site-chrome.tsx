import Image from "next/image"
import NewsletterForm from "@modules/sitware/newsletter-form"

export default function SiteChrome(props: { children: React.ReactNode }) {
  return (
    <div className="sitware-site">
      <div className="announcement">Thoughtful workspaces, made for the way we work now</div>
      <header className="sw-header">
        <a className="sw-wordmark" href="/in" aria-label="Sitware home"><Image src="/images/sitware-logo.svg" width={800} height={126} alt="SITWARE — Designed For Better Work." /></a>
        <nav aria-label="Main navigation"><a href="/in/store">Shop</a><a href="/in#belief">Our belief</a><a href="/in#story">Our story</a></nav>
        <div className="sw-actions"><a href="/in/account">Account</a><a className="bag-link" href="/in/cart">Bag <span>↗</span></a><details className="mobile-menu"><summary aria-label="Open menu">☰</summary><div className="mobile-menu-panel"><a href="/in/store">Shop</a><a href="/in#belief">Our belief</a><a href="/in#story">Our story</a><a href="/in/account">Account</a></div></details></div>
      </header>
      {props.children}
      <footer className="sw-footer"><div className="footer-main"><div className="footer-brand"><a className="sw-wordmark" href="/in"><Image src="/images/sitware-logo.svg" width={800} height={126} alt="SITWARE — Designed For Better Work." /></a><p>Thoughtfully designed for<br />the way we work now.</p><div className="socials"><a href="https://www.instagram.com/sitware_/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://www.linkedin.com/company/sitwareofficial/" target="_blank" rel="noreferrer">LinkedIn ↗</a></div></div><div className="footer-col"><h3>Shop</h3><a href="/in/store">Workstations</a><a href="/in/store">Accessories</a><a href="/in/store">All products</a></div><div className="footer-col"><h3>About</h3><a href="/in#story">Our story</a><a href="/in#belief">Better work</a><a href="/in/store">Contact us</a></div><div className="footer-col"><h3>Support</h3><a href="/in/store">FAQ</a><a href="/in/store">Shipping & delivery</a><a href="/in/store">Returns</a></div><div className="footer-news"><h3>Join our journey</h3><p>Get updates on new products and workspace ideas.</p><NewsletterForm /></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Sitware. All rights reserved.</span><div><a href="/in/store">Privacy policy</a><a href="/in/store">Terms & conditions</a><a href="/in/store">Contact</a></div><span>Designed for better work.</span></div></footer>
    </div>
  )
}
