/* eslint-disable @next/next/no-img-element -- art-directed editorial images with parallax */
import { Metadata } from "next"

import { getWorkstationListings } from "@lib/data/workstations"
import { SITE_URL } from "@lib/site"
import { WORKSTATION_ORDER, WORKSTATIONS } from "@lib/workstations"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FaqList from "@modules/sitware/faq-list"
import { BENEFITS, FAQS, SCENES } from "@modules/sitware/home-content"
import JsonLd from "@modules/sitware/json-ld"
import StepsShowcase from "@modules/sitware/steps-showcase"

export const metadata: Metadata = {
  title: "SITWARE | Designed For Better Work.",
  description:
    "Sitware Switch and Switch Pro upgrade the desk you already have for a more flexible, focused and intentional way of working.",
}

type Props = { params: Promise<{ countryCode: string }> }

export default async function Home(props: Props) {
  const { countryCode } = await props.params
  const listings = await getWorkstationListings(countryCode)
  const switchPrice = listings.switch.price

  return (
    <div className="sw-home">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Sitware",
            url: SITE_URL,
            slogan: "Designed For Better Work.",
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          },
        ]}
      />

      <header className="sw-hero" aria-labelledby="hero-title">
        <div className="sw-hero-media">
          <img
            data-parallax="0.18"
            src="/images/editorial/sitware-hero-v2.webp"
            alt="Sitware Switch and Switch Pro on a walnut desk at golden hour"
            fetchPriority="high"
          />
        </div>
        <div className="sw-hero-shade" />
        <div className="sw-hero-copy">
          <span className="sw-kicker sw-hero-fade">Designed For Better Work.</span>
          <h1 id="hero-title">
            <span className="sw-line">
              <span>Your desk doesn’t</span>
            </span>
            <span className="sw-line">
              <span>need to change.</span>
            </span>
            <span className="sw-line">
              <em>The way you work does.</em>
            </span>
          </h1>
          <div className="sw-hero-sub sw-hero-fade">
            <p>
              Upgrade the desk you already have for a more flexible, focused and intentional way
              of working.
            </p>
            <div className="sw-actions-row">
              <a href="#workstations" className="sw-pill sw-pill-light">
                Explore Workstations <span aria-hidden="true">→</span>
              </a>
              <a href="#story" className="sw-pill sw-pill-ghost">
                Why Sitware
              </a>
            </div>
          </div>
        </div>
        <div className="sw-hero-foot sw-hero-fade">
          <span>Sit. Stand. Switch.</span>
          <span className="sw-scroll-cue" aria-hidden="true">
            Scroll
            <span />
          </span>
          <LocalizedClientLink href="/workstations/switch">
            {switchPrice ? `Switch from ${switchPrice}` : "Meet Switch"} <span aria-hidden="true">→</span>
          </LocalizedClientLink>
        </div>
      </header>

      <section id="workstations" className="sw-section" aria-labelledby="workstations-title">
        <div className="sw-container sw-stack-xl">
          <div className="sw-section-head" data-reveal="">
            <span className="sw-kicker">Our Workstations</span>
            <h2 id="workstations-title" className="sw-h2 sw-h2-xl">
              Two ways to <em>work better.</em>
            </h2>
            <p>Different work styles. Same desk. Find the workstation that fits your setup.</p>
          </div>
          <div className="sw-workstation-grid">
            {WORKSTATION_ORDER.map((handle, index) => {
              const w = WORKSTATIONS[handle]
              const { price } = listings[handle]
              const href = `/workstations/${handle}`
              return (
                <article
                  key={handle}
                  className="sw-workstation-card"
                  data-reveal=""
                  data-delay={index * 140}
                >
                  <LocalizedClientLink href={href} className="sw-workstation-media" tabIndex={-1}>
                    <img className="sw-cutout" src={w.cutout} alt={w.name} loading="lazy" />
                    <img className="sw-photo" src={w.photo} alt="" loading="lazy" />
                    <span className="sw-tag">{w.badge}</span>
                  </LocalizedClientLink>
                  <div className="sw-workstation-body">
                    <div className="sw-workstation-title">
                      <div>
                        <h3>{w.name}</h3>
                        <span className="sw-message">{w.message}</span>
                      </div>
                      <div className="sw-price">
                        <span>{price ?? "₹ —"}</span>
                        <small>{price ? "Incl. GST" : "Pricing at launch"}</small>
                      </div>
                    </div>
                    <dl className="sw-facts sw-facts-2">
                      <div>
                        <dt>Setup</dt>
                        <dd>{w.setup}</dd>
                      </div>
                      <div>
                        <dt>Best for</dt>
                        <dd>{w.bestFor}</dd>
                      </div>
                    </dl>
                    <div className="sw-actions-row">
                      <LocalizedClientLink href={href} className="sw-pill sw-pill-dark">
                        Shop {w.short} <span aria-hidden="true">→</span>
                      </LocalizedClientLink>
                      <LocalizedClientLink
                        href={href}
                        className="sw-pill sw-pill-outline"
                        aria-label={`${w.short} details`}
                      >
                        Details
                      </LocalizedClientLink>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          <div className="sw-note-row" data-reveal="">
            <p>
              Workspace imagery illustrates the design direction. Final product details will be
              shared with the collection.
            </p>
            <LocalizedClientLink href="/workstations/switch-pro#compare" className="sw-text-link">
              Compare Switch and Switch Pro →
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      <section id="story" className="sw-section sw-dark" aria-labelledby="story-title">
        <div className="sw-stack-xxl">
          <div className="sw-section-head sw-gutter" data-reveal="">
            <span className="sw-kicker">Our Thinking</span>
            <h2 id="story-title" className="sw-h2 sw-h2-xxl">
              Work has changed. <em>Our desks haven’t.</em>
            </h2>
            <p className="sw-lede">
              We believe a better workspace shouldn’t always mean replacing everything around you.
              Sitware creates thoughtful products that help make the space you already have more
              comfortable, organized, flexible and intentional.
            </p>
          </div>
          <div className="sw-gutter" data-reveal="">
            <div className="sw-wide-frame">
              <img
                data-parallax="0.12"
                src="/images/sitware/changed.webp"
                alt="Switch Pro workstation by a window"
                loading="lazy"
              />
            </div>
          </div>
          <div className="sw-container sw-stack-lg">
            <div className="sw-split-line" data-reveal="">
              <span className="sw-quote">Better work begins with a better workspace.</span>
              <span className="sw-kicker sw-kicker-muted">A better workspace helps you</span>
            </div>
            <div className="sw-benefits">
              {BENEFITS.map((benefit, index) => (
                <div key={benefit.num} data-reveal="" data-delay={index * 120}>
                  <span className="sw-num">{benefit.num}</span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="better-work" className="sw-section" aria-label="How Sitware works">
        <div className="sw-container">
          <StepsShowcase />
        </div>
      </section>

      <section className="sw-section sw-sand" aria-labelledby="scenes-title">
        <div className="sw-container sw-stack-lg">
          <h2 id="scenes-title" className="sw-h2" data-reveal="">
            A better way to work, <em>wherever you are.</em>
          </h2>
          <div className="sw-scenes">
            {SCENES.map((scene, index) => (
              <LocalizedClientLink
                key={scene.title}
                href="/#workstations"
                className="sw-scene"
                data-reveal=""
                data-delay={index * 110}
              >
                <div>
                  <img src={scene.img} alt={scene.title} loading="lazy" />
                </div>
                <h3>{scene.title}</h3>
                <p>{scene.text}</p>
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </section>

      <section className="sw-cta" aria-labelledby="cta-title">
        <img
          data-parallax="0.15"
          src="/images/sitware/cta.webp"
          alt="Two Sitware workstations side by side"
          loading="lazy"
        />
        <div className="sw-cta-shade" />
        <div className="sw-cta-copy" data-reveal="">
          <span className="sw-kicker">Designed For Better Work.</span>
          <h2 id="cta-title" className="sw-h2 sw-h2-xxl">
            Make your workspace work <em>better for you.</em>
          </h2>
          <div className="sw-actions-row">
            <LocalizedClientLink href="/workstations/switch" className="sw-pill sw-pill-light">
              Shop Switch{switchPrice ? ` · ${switchPrice}` : ""}
            </LocalizedClientLink>
            <LocalizedClientLink href="/workstations/switch-pro" className="sw-pill sw-pill-ghost">
              Shop Switch Pro <span aria-hidden="true">→</span>
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      <section id="faq" className="sw-section" aria-labelledby="faq-title">
        <div className="sw-container sw-container-narrow sw-faq">
          <div className="sw-heading-group" data-reveal="">
            <span className="sw-kicker">A little more clarity</span>
            <h2 id="faq-title" className="sw-h2">
              Good questions. <em>Thoughtful answers.</em>
            </h2>
            <LocalizedClientLink href="/contact" className="sw-text-link">
              Contact Support →
            </LocalizedClientLink>
          </div>
          <FaqList />
        </div>
      </section>
    </div>
  )
}
