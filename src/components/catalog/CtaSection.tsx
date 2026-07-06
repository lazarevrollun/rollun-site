// Story 5.1 — Catalog "Ready to buy?" CTA (RSC, no 'use client').
//
// Both compositions in one DOM (AD-3); the 768px CSS switch picks the visible
// one. Desktop wraps the content in `.container`; mobile does not (VERBATIM).
// The two buttons map the prototype's cross-page links to the real Next routes
// (`/shops#online`, `/contact?topic=…#contactForm`).
import Link from 'next/link'

import type { CatalogContent } from '@/content/catalog'

/** The CTA heading with an inline orange (`.or-txt`) accent run. */
function CtaHeading({ segments }: { segments: CatalogContent['cta']['titleSegments'] }) {
  return (
    <h2>
      {segments.map((s, i) =>
        s.accent ? (
          <span key={i} className="or-txt">
            {s.text}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </h2>
  )
}

function CtaButtons({ buttons, variant }: { buttons: CatalogContent['cta']['buttons']; variant: 'dk' | 'mb' }) {
  return (
    <div className="cta-buttons">
      {buttons.map((b) => (
        <Link key={b.label} className={`btn ${b.variant === 'or' ? 'btn-or' : 'btn-dark'}`} href={b.href[variant]}>
          {b.label}
        </Link>
      ))}
    </div>
  )
}

export default function CtaSection({ cta }: { cta: CatalogContent['cta'] }) {
  const { titleSegments, text, buttons } = cta
  return (
    <>
      {/* ── Desktop composition ── */}
      <section className="catalog-dk cta">
        <div className="container">
          <CtaHeading segments={titleSegments} />
          <p>{text}</p>
          <CtaButtons buttons={buttons} variant="dk" />
        </div>
      </section>

      {/* ── Mobile composition (no container) ── */}
      <section className="catalog-mb cta">
        <CtaHeading segments={titleSegments} />
        <p>{text}</p>
        <CtaButtons buttons={buttons} variant="mb" />
      </section>
    </>
  )
}
