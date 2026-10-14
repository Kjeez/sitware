import { Metadata } from "next"

export const metadata: Metadata = {
  title: "SITWARE | Designed For Better Work",
  description:
    "Thoughtfully designed workstations for a more flexible, focused and intentional way to work.",
}

const ways = [
  {
    number: "01",
    name: "Shift",
    line: "A little more room to think.",
    description:
      "A considered lift for your laptop. Keep the desk you already love and bring your screen to a more comfortable place.",
    kind: "single",
  },
  {
    number: "02",
    name: "Shift Pro",
    line: "Space for the whole setup.",
    description:
      "A two tier workstation that brings monitor, keyboard and everyday essentials together in one composed space.",
    kind: "double",
  },
]

const contexts = ["Home office", "Creative work", "Focused study", "Hybrid days"]

export default function Home() {
  return (
    <div className="sitware-home">

      <section className="sw-hero">
        <div className="hero-photo" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow light">A little more intention in every day</p>
          <h1>Your desk doesn’t need to change.<br /><em>The way you work does.</em></h1>
          <p className="hero-intro">Upgrade the desk you already have for a more flexible, focused and intentional way of working.</p>
          <div className="hero-buttons"><a className="button button-cream" href="#workstations">Explore workstations <span>↗</span></a><a className="text-link light-link" href="#belief">Why Sitware <span>↓</span></a></div>
        </div>
        <div className="hero-note"><span>01 / 04</span><span>Designed for the everyday</span></div>
      </section>

      <section className="belief section-pad" id="belief">
        <p className="eyebrow">A better way to work</p>
        <h2>Better work begins<br />with a <em>better workspace.</em></h2>
        <p className="belief-copy">The desk is where ideas take shape, plans come together and days unfold. We believe the space around your work should help you feel a little more ready for it.</p>
        <span className="belief-mark" aria-hidden="true">S</span>
      </section>

      <section className="products section-pad" id="workstations">
        <div className="section-heading"><div><p className="eyebrow">Find your flow</p><h2>Two ways to work better.</h2></div><a className="text-link dark-link" href="/in/store">Explore the collection <span>↗</span></a></div>
        <div className="product-grid">{ways.map((item) => <article className="product-card" key={item.name}>
          <div className={`product-art ${item.kind}`} aria-label={`${item.name} workstation illustration`}>
            <div className="art-wall" /><div className="art-desk" /><div className="art-screen"><i /></div><div className="art-platform top" />{item.kind === "double" && <div className="art-platform lower" />}<div className="art-leg left" /><div className="art-leg right" /><div className="art-keyboard" />
            <span className="art-index">SITWARE / {item.number}</span>
          </div>
          <div className="product-info"><div><span className="eyebrow">{item.number} / WORKSTATION</span><h3>{item.name}</h3><p className="product-line">{item.line}</p></div><p>{item.description}</p><a className="text-link dark-link" href="/in/store">Discover {item.name} <span>↗</span></a></div>
        </article>)}</div>
      </section>

      <section className="benefits section-pad">
        <div className="section-heading"><div><p className="eyebrow">Small shifts, meaningful days</p><h2>Make space for better work.</h2></div><p className="section-aside">A workspace with a little more thought in it can change how the day feels.</p></div>
        <div className="benefit-grid"><article><span className="benefit-icon">↗</span><p className="eyebrow">01 / CLARITY</p><h3>Better focus.</h3><p>Bring the things you use closer. Give the rest of the desk a little breathing room.</p></article><article><span className="benefit-icon">⌁</span><p className="eyebrow">02 / FLEXIBILITY</p><h3>Better flow.</h3><p>Make it easier to shift between tasks, tools and the way you like to work.</p></article><article><span className="benefit-icon">□</span><p className="eyebrow">03 / ORDER</p><h3>Better organization.</h3><p>A place for your screen and your essentials. A calmer view of the work ahead.</p></article></div>
      </section>

      <section className="transition-section"><div className="transition-photo"><div className="mini-setup"><span className="mini-screen" /><span className="mini-riser" /><span className="mini-base" /></div></div><div className="transition-copy"><p className="eyebrow light">A more considered setup</p><h2>From one height<br />to <em>flexible work.</em></h2><p>Keep your familiar desk. Add a workstation that makes it easier to settle in, shift your posture and find a rhythm that works for you.</p><a className="button button-outline" href="#workstations">See how it works <span>↗</span></a></div></section>

      <section className="contexts section-pad"><p className="eyebrow">Made to fit your day</p><h2>Wherever good work happens.</h2><div className="context-grid">{contexts.map((item, i) => <div className={`context context-${i + 1}`} key={item}><span>0{i + 1}</span><p>{item}</p></div>)}</div></section>

      <section className="story section-pad" id="story"><div className="story-stamp">S<br />/W</div><div><p className="eyebrow">The thought behind Sitware</p><h2>Work has changed.<br /><em>Our desks haven’t.</em></h2><p>We started Sitware with a simple idea: you shouldn’t have to start over to make your workspace work better. Thoughtful design can help the desk you already have feel more like your own.</p><a className="text-link dark-link" href="/in/store">Get to know Sitware <span>↗</span></a></div></section>

      <section className="closing-cta"><p className="eyebrow light">A good day starts somewhere</p><h2>Make your workspace<br /><em>work better for you.</em></h2><a className="button button-cream" href="/in/store">Explore Sitware <span>↗</span></a></section>
    </div>
  )
}
