import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { WorkspaceIcon } from "@modules/sitware/workspace-icon"

export const metadata: Metadata = {
  title: "SITWARE | Designed For Better Work.",
  description: "Thoughtful workspace products for a more flexible, focused and intentional way to work.",
}

const workstations = [
  { name: "Shift", image: "shift", description: "For flexible everyday work.", features: [{ icon: "laptop", text: "A place for your laptop" }, { icon: "space", text: "A considered setup" }, { icon: "home", text: "Home / hybrid work" }] },
  { name: "Shift Pro", image: "shift-pro", description: "For complete workstations.", features: [{ icon: "monitor", text: "Monitor + keyboard setups" }, { icon: "layers", text: "Space for your essentials" }, { icon: "briefcase", text: "Professional work" }] },
] as const

const steps = ["Your existing desk", "Add Sitware", "Work sitting", "Work standing"]
const contexts = [
  { name: "Home Office", description: "A calmer place for your everyday work." },
  { name: "Creators", description: "Space to make, edit, and bring ideas to life." },
  { name: "Professionals", description: "A thoughtful setting for focused work." },
  { name: "Hybrid Work", description: "A space that feels like your own, wherever you work." },
]

export default function Home() {
  return (
    <div className="sitware-home">
      <section className="sw-hero" aria-labelledby="hero-title">
        <div className="hero-photo" role="img" aria-label="Golden hour workspace with laptop and monitor desk converters" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow light">A better way to work</p>
          <h1 id="hero-title">Your desk doesn’t<br />need to change.<br /><em>The way you work does.</em></h1>
          <p className="hero-intro">Upgrade the desk you already have for a more flexible, focused and intentional way of working.</p>
          <div className="hero-buttons"><a className="button button-copper" href="#workstations">Explore Workstations <span aria-hidden="true">→</span></a><a className="button button-outline" href="#belief">Why Sitware</a></div>
        </div>
        <p className="hero-note">Designed For Better Work.</p>
      </section>

      <section className="brand-intro section-pad" id="belief" aria-labelledby="brand-title">
        <div className="brand-copy"><p className="eyebrow">Sitware / Our philosophy</p><span className="copper-rule" /><h2 id="brand-title">Designed<br />For Better<br /><em>Work.</em></h2><p className="serif-intro">Better work begins with a better workspace.</p><p>Sitware creates thoughtful workspace products designed to make everyday work more comfortable, organized, flexible and intentional.</p></div>
        <div className="reference-photo brand-photo" role="img" aria-label="Sunlit walnut desk with a laptop, notebook and ceramic cup" />
      </section>

      <section className="products section-pad" id="workstations" aria-labelledby="products-title">
        <p className="eyebrow">Our workstations <span className="inline-rule" /></p><h2 id="products-title">Two ways to work better.</h2><p className="serif-intro">Different work styles. Same desk. Find the workstation that fits your setup.</p>
        <div className="product-grid">{workstations.map((item) => <article className="product-card" key={item.name}>
          <div className={"reference-photo product-photo " + item.image} role="img" aria-label={"Illustrative " + item.name + " workspace concept"} />
          <div className="product-info"><h3>Sitware {item.name}</h3><span className="copper-rule" /><p className="product-line">{item.description}</p><ul>{item.features.map((feature) => <li key={feature.text}><span className="feature-icon"><WorkspaceIcon name={feature.icon} /></span><span>{feature.text}</span></li>)}</ul><LocalizedClientLink className="button button-copper rounded-button" href={item.image === "shift" ? "/workstations/shift" : "/workstations/shift-pro"}>Explore {item.name} <span aria-hidden="true">→</span></LocalizedClientLink></div>
        </article>)}</div>
        <p className="image-caption">Workspace imagery illustrates the design direction. Final product details will be shared with the collection.</p>
      </section>

      <section className="benefits section-pad" id="better-work" aria-label="A better workspace helps you">
        <p className="eyebrow light">A better workspace helps you</p><div className="benefit-grid">
          <article><WorkspaceIcon name="focus" /><h3>Better Focus</h3><p>A workspace that asks for less attention.</p></article>
          <article><WorkspaceIcon name="flow" /><h3>Better Flow</h3><p>Make room to move between sitting and standing through your day.</p></article>
          <article><WorkspaceIcon name="box" /><h3>Better Organization</h3><p>A more thoughtful place for the way you work.</p></article>
        </div>
      </section>

      <section className="how-it-works section-pad" id="how-it-works" aria-labelledby="steps-title">
        <p className="eyebrow">Same desk. A different way to work.</p><h2 id="steps-title">From one height<br />to a more <em>flexible</em> way of working.</h2>
        <ol className="steps-grid">{steps.map((step, index) => <li key={step}><div className={"reference-photo step-photo step-" + (index + 1)} role="img" aria-label={step} /><div className="step-label"><span>0{index + 1}<i /></span><h3>{step}</h3></div>{index < 3 && <span className="step-arrow" aria-hidden="true">→</span>}</li>)}</ol>
      </section>

      <section className="contexts section-pad" aria-labelledby="contexts-title"><p className="eyebrow light">Sitware</p><h2 id="contexts-title">A better way to work,<br />wherever you are.</h2><div className="context-grid">{contexts.map((context, index) => <article className="context" key={context.name}><div className={"reference-photo context-photo context-" + (index + 1)} role="img" aria-label={context.name + " workspace inspiration"} /><div className="context-copy"><h3>{context.name}</h3><p>{context.description}</p><span className="copper-rule" /></div></article>)}</div></section>

      <section className="story" id="story" aria-labelledby="story-title"><div className="reference-photo story-photo" role="img" aria-label="Warm home office with a monitor workstation on a walnut desk" /><div className="story-copy"><p className="eyebrow">Our thinking</p><h2 id="story-title">Work has changed.<br /><em>Our desks</em> haven’t.</h2><span className="copper-rule" /><p>We believe a better workspace shouldn’t always mean replacing everything around you. Sitware creates thoughtful products that help make the space you already have more comfortable, organized, flexible and intentional.</p><a className="button button-copper" href="#belief">Our Philosophy <span aria-hidden="true">→</span></a></div></section>

      <section className="workspace-notes section-pad" id="workspace-notes"><p className="eyebrow">Room for your own rhythm</p><h2>What does better work<br />look like for you?</h2><div className="notes-grid"><article><span>01 / YOUR SPACE</span><h3>Keep what you love.</h3><p>A familiar desk. Your favourite corner. Start with the space that already feels like you.</p></article><article><span>02 / YOUR DAY</span><h3>Make room for change.</h3><p>From a quiet morning to a busy afternoon, think about how your workspace can fit your day.</p></article><article><span>03 / YOUR TOOLS</span><h3>Give everything a place.</h3><p>Consider the tools you reach for most, and make space for the work you want to do.</p></article></div></section>

      <section className="closing-cta"><div className="closing-shade" /><div className="closing-copy"><h2>Make your<br />workspace work<br /><em>better for you.</em></h2><p>Designed For Better Work.</p><div className="hero-buttons"><a className="button button-copper" href="#workstations">Explore Workstations <span aria-hidden="true">→</span></a><a className="button button-outline" href="#story">Our Story</a></div></div></section>
      <section className="support section-pad" id="support"><p className="eyebrow">A little more clarity</p><h2>Good questions. Thoughtful answers.</h2><details><summary>What is Sitware?</summary><p>Sitware is a workspace brand built around the idea of making the desk you already have work better for you.</p></details><details><summary>Which workstations are in the collection?</summary><p>The collection is focused on Shift and Shift Pro. Final specifications, availability and prices will be shared when confirmed.</p></details><details><summary>Where can I find delivery and returns information?</summary><p>Delivery and returns information will be added when the business policies are finalized.</p></details></section>
    </div>
  )
}
