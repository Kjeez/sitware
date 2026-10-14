import Image from "next/image"
import Link from "next/link"
import NewsletterForm from "@modules/sitware/newsletter-form"

export default function SiteChrome(props: { children: React.ReactNode }) {
  return (
    <div className="sitware-site">
      <div className="announcement">Thoughtful workspaces, made for the way we work now</div>
      <header className="sw-header">
        <Link className="sw-wordmark" href="/in" aria-label="Sitware home"><Image src="/images/sitware-logo.svg" width={800} height={126} alt="SITWARE — Designed For Better Work." /></Link>
        <nav aria-label="Main navigation"><Link href="/in/store">Shop</Link><Link href="/in#belief">Our belief</Link><Link href="/in#story">Our story</Link></nav>
        <div className="sw-actions"><Link href="/in/account">Account</Link><Link className="bag-link" href="/in/cart">Bag <span>↗</span></Link><details className="mobile-menu"><summary aria-label="Open menu">☰</summary><div className="mobile-menu-panel"><Link href="/in/store">Shop</Link><Link href="/in#belief">Our belief</Link><Link href="/in#story">Our story</Link><Link href="/in/account">Account</Link></div></details></div>
      </header>
      {props.children}
      <footer className="sw-footer"><div className="footer-main"><div className="footer-brand"><Link className="sw-wordmark" href="/in"><Image src="/images/sitware-logo.svg" width={800} height={126} alt="SITWARE — Designed For Better Work." /></Link><p>Thoughtfully designed for<br />the way we work now.</p><div className="socials"><a href="https://www.instagram.com/sitware_/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://www.linkedin.com/company/sitwareofficial/" target="_blank" rel="noreferrer">LinkedIn ↗</a></div></div><div className="footer-col"><h3>Shop</h3><Link href="/in/store">Workstations</Link><Link href="/in/store">Accessories</Link><Link href="/in/store">All products</Link></div><div className="footer-col"><h3>About</h3><Link href="/in#story">Our story</Link><Link href="/in#belief">Better work</Link><Link href="/in/store">Contact us</Link></div><div className="footer-col"><h3>Support</h3><Link href="/in/store">FAQ</Link><Link href="/in/store">Shipping & delivery</Link><Link href="/in/store">Returns</Link></div><div className="footer-news"><h3>Join our journey</h3><p>Get updates on new products and workspace ideas.</p><NewsletterForm /></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Sitware. All rights reserved.</span><div><Link href="/in/store">Privacy policy</Link><Link href="/in/store">Terms & conditions</Link><Link href="/in/store">Contact</Link></div><span>Designed for better work.</span></div></footer>
    </div>
  )
}
