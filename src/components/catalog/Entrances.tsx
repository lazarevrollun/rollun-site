// Story 5.1 — Catalog "Two entrances" (02) (RSC, no 'use client').
//
// The two product-line entrance cards → the `#automotive` / `#health` in-page
// anchors. On MOBILE these are native anchor jumps to the stacked `.line`
// sections (which carry the canonical ids). On DESKTOP the CatalogLineSwitcher
// island (mounted in ProductLines) intercepts the clicks and runs `choose()`.
// Both compositions in one DOM (AD-3); the 768px CSS switch picks the visible
// one. Desktop wraps the grid in `.container` + shows the `.entrances-head`;
// mobile shows neither (VERBATIM).
import type { CatalogContent } from '@/content/catalog'

/** The → arrow glyph on each entrance CTA (both prototypes, stroke-width 2.2). */
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

/** One `<a class="entrance">` card. `variant` picks the dk/mb alt string. */
function EntranceCard({ entrance, variant }: { entrance: CatalogContent['entrances'][number]; variant: 'dk' | 'mb' }) {
  return (
    <a className="entrance" href={entrance.href}>
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-ratio entrance hero (AD pixel fidelity); next/image adds no value here */}
      <img src={entrance.img} alt={entrance.alt[variant]} loading="lazy" />
      <div className="entrance-body">
        <div className="entrance-kicker">{entrance.kicker}</div>
        <h2>{entrance.title}</h2>
        <span className="entrance-cta">
          {entrance.ctaLabel}
          <ArrowIcon />
        </span>
      </div>
    </a>
  )
}

export default function Entrances({
  entrancesHead,
  entrances,
}: {
  entrancesHead: CatalogContent['entrancesHead']
  entrances: CatalogContent['entrances']
}) {
  return (
    <>
      {/* ── Desktop composition ── */}
      <section className="catalog-dk entrances">
        <div className="container">
          <div className="entrances-head">
            <div className="section-eyebrow">{entrancesHead.eyebrow}</div>
            <h2 className="section-title">{entrancesHead.title}</h2>
          </div>
          <div className="entrance-grid">
            {entrances.map((e) => (
              <EntranceCard key={e.key} entrance={e} variant="dk" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile composition (no head, no container) ── */}
      <section className="catalog-mb entrances">
        <div className="entrance-grid">
          {entrances.map((e) => (
            <EntranceCard key={e.key} entrance={e} variant="mb" />
          ))}
        </div>
      </section>
    </>
  )
}
