// Story 3.1 — Home "Two focused product lines" (RSC, no 'use client').
//
// Both compositions in one DOM (AD-3); the 768px CSS switch picks the visible
// one. STATIC FINAL FRAME (Story 3.3 owns the manual switcher): the desktop
// carousel renders the FIRST slide active — slide 0 `active`, 1 `next`, 3 `prev`,
// 2 hidden — exactly what the prototype's `setActive(0)` produces; the numbered
// dots render with #1 active. The markup keeps the prototype's `data-i`/carousel
// structure so Story 3.3 can drop a `'use client'` switcher island on top without
// rewriting it. Mobile is a horizontal scroll-shelf of all four slides.
import Link from 'next/link'

import type { HomeContent, HomeProductLine } from '@/content/home'

import ProductLineSwitcher from './ProductLineSwitcher.client'

/** Static slide-position classes for the first-slide-active frame (order matches
 *  the prototype `setActive(0)`: active / next / (hidden) / prev). */
const SLIDE_POSITIONS = ['active', 'next', '', 'prev']

/** The right-arrow glyph on the mobile EXPLORE buttons (Home Mobile.html). */
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

/** Desktop carousel block — static first-slide-active frame. */
function DesktopLine({ line, href, lineKey }: { line: HomeProductLine; href: string; lineKey: string }) {
  return (
    <div className="line-block" data-line={lineKey}>
      <div className="line-stack">
        {line.slidesDesktop.map((slide, i) => (
          <div key={slide.src} className={`line-slide ${SLIDE_POSITIONS[i]}`.trim()} data-i={i}>
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed-ratio category thumbnail (AD-13 pixel fidelity); next/image adds no value here */}
            <img src={slide.src} alt={slide.alt} loading="lazy" />
            <div className="line-caption">{slide.caption}</div>
          </div>
        ))}
      </div>
      <div className="line-dots">
        {line.slidesDesktop.map((slide, i) => (
          <button key={slide.src} type="button" className={i === 0 ? 'active' : undefined} data-i={i} aria-pressed={i === 0}>
            {i + 1}
          </button>
        ))}
      </div>
      <h3>{line.heading.dk}</h3>
      <Link className="btn btn-or" href={href}>
        {line.cta}
      </Link>
    </div>
  )
}

/** Mobile scroll-shelf block. */
function MobileLine({ line, href }: { line: HomeProductLine; href: string }) {
  return (
    <div className="line-block">
      <h3>{line.heading.mb}</h3>
      <div className="line-shelf">
        {line.slidesMobile.map((slide) => (
          <div key={slide.src} className="line-slide">
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed-ratio category thumbnail (AD-13 pixel fidelity); next/image adds no value here */}
            <img src={slide.src} alt={slide.alt} loading="lazy" />
            <div className="cap">{slide.caption}</div>
          </div>
        ))}
      </div>
      <Link className="btn btn-or" href={href}>
        {line.cta}
        <ArrowIcon />
      </Link>
    </div>
  )
}

export default function ProductLines({ productLines }: { productLines: HomeContent['productLines'] }) {
  const { eyebrow, title, intro, automotive, health } = productLines
  return (
    <>
      {/* ── Desktop composition ── */}
      <section className="home-dk lines reveal" id="lines">
        <div className="container">
          <div className="section-eyebrow">{eyebrow}</div>
          <h2 className="section-title">{title}</h2>
          <p className="lines-intro">{intro}</p>
          <div className="lines-grid">
            <DesktopLine line={automotive} href="/catalog#automotive" lineKey="automotive" />
            <DesktopLine line={health} href="/catalog#health" lineKey="health" />
          </div>
        </div>
        {/* Leaf 'use client' island — enhances the static desktop carousels with
            manual click switching + hash sync. Renders null; placement is inert. */}
        <ProductLineSwitcher
          lines={[
            { key: 'automotive', count: automotive.slidesDesktop.length },
            { key: 'health', count: health.slidesDesktop.length },
          ]}
        />
      </section>

      {/* ── Mobile composition ── */}
      <section className="home-mb section bg reveal">
        <div className="section-head center wrap">
          <div className="section-eyebrow">{eyebrow}</div>
          <h2 className="section-title">{title}</h2>
          <p>{intro}</p>
        </div>
        <MobileLine line={automotive} href="/catalog#automotive" />
        <MobileLine line={health} href="/catalog#health" />
      </section>
    </>
  )
}
