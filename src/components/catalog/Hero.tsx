// Story 5.1 — Catalog page hero (01) (RSC, no 'use client').
//
// Renders BOTH compositions into one DOM (AD-3): a desktop subtree (`.catalog-dk`,
// Catalog.html) and a mobile subtree (`.catalog-mb`, Catalog Mobile.html); the
// visible one is chosen ONLY by the CSS `@media` at 768px in catalog.css — no JS
// width gating. Hero is the FIRST section and is intentionally excluded from
// `.reveal` (it is above the fold, matching the prototype).
import type { CatalogContent } from '@/content/catalog'

/** The ↗ "external link" glyph on the redirect note (both prototypes). */
function RedirectIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  )
}

export default function Hero({ hero }: { hero: CatalogContent['hero'] }) {
  const { eyebrow, title, intro, redirectNote } = hero
  return (
    <>
      {/* ── Desktop composition (visible ≥768px via catalog.css) ── */}
      <section className="catalog-dk page-hero">
        <div className="container page-hero-inner">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{intro}</p>
          <div className="redirect-note">
            <RedirectIcon />
            {redirectNote}
          </div>
        </div>
      </section>

      {/* ── Mobile composition (visible <768px via catalog.css) ── */}
      <section className="catalog-mb page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{intro}</p>
          <div className="redirect-note">
            <RedirectIcon />
            {redirectNote}
          </div>
        </div>
      </section>
    </>
  )
}
