import type { ReactNode } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { WorkspaceIcon } from "./workspace-icon"

export default function ProductPageLayout({ title, gallery, information, details, reviews }: { title: string; gallery: ReactNode; information: ReactNode; details: ReactNode; reviews?: ReactNode }) {
  return <div className="sw-product-page">
    <nav className="pd-breadcrumb" aria-label="Breadcrumb"><LocalizedClientLink href="/">Home</LocalizedClientLink><span aria-hidden="true">/</span><LocalizedClientLink href="/#workstations">Workstations</LocalizedClientLink><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>
    <section className="pd-top" aria-label={title}><div>{gallery}</div><div className="pd-purchase">{information}</div></section>
    <section className="pd-highlights" aria-label="The Sitware philosophy"><article><WorkspaceIcon name="home" /><div><h2>Keep your familiar space.</h2><p>A thoughtful addition to the desk you already love.</p></div></article><article><WorkspaceIcon name="flow" /><div><h2>Find your own rhythm.</h2><p>Make space for a more intentional working day.</p></div></article><article><WorkspaceIcon name="box" /><div><h2>Consider every detail.</h2><p>A calmer setting for the tools you use every day.</p></div></article></section>
    <section className="pd-details" aria-labelledby="pd-details-title"><div><p className="eyebrow">A closer look</p><h2 id="pd-details-title">The details<br />make the difference.</h2><p>Get to know your next workspace.</p></div><div>{details}</div></section>
    {reviews && <section className="pd-reviews" id="reviews" aria-labelledby="reviews-title">{reviews}</section>}
    <section className="pd-editorial"><div><p className="eyebrow light">Designed For Better Work.</p><h2>A better way to work.<br />A space that’s still yours.</h2><LocalizedClientLink href="/#story">The thought behind Sitware <span aria-hidden="true">→</span></LocalizedClientLink></div></section>
    <section className="pd-comparison"><p className="eyebrow">Find your fit</p><h2>Two ways to work better.</h2><div className="pd-models"><article><h3>Shift</h3><p>For flexible everyday work.</p><LocalizedClientLink href="/workstations/shift">Explore Shift <span aria-hidden="true">→</span></LocalizedClientLink></article><article><h3>Shift Pro</h3><p>For complete workstations.</p><LocalizedClientLink href="/workstations/shift-pro">Explore Shift Pro <span aria-hidden="true">→</span></LocalizedClientLink></article></div></section>
  </div>
}
