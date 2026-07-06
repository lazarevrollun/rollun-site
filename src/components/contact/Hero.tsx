// Story 6.3 — Contact page hero (01) (RSC, no 'use client').
//
// Renders BOTH compositions into one DOM (AD-3): a desktop subtree
// (`.contact-dk`, Contact.html) and a mobile subtree (`.contact-mb`, Contact
// Mobile.html); the visible one is chosen ONLY by the CSS `@media` at 768px in
// contact.css — no JS width gating. Hero is the FIRST section and is
// intentionally excluded from `.reveal` (above the fold).
import type { ContactContent } from '@/content/contact'

export default function Hero({ hero }: { hero: ContactContent['hero'] }) {
  return (
    <>
      {/* ── Desktop composition (visible ≥768px via contact.css) ── */}
      <section className="contact-dk page-hero">
        <div className="container page-hero-inner">
          <div className="eyebrow">{hero.eyebrow}</div>
          <h1>{hero.title}</h1>
          <p>{hero.intro}</p>
        </div>
      </section>

      {/* ── Mobile composition (visible <768px via contact.css) ── */}
      <section className="contact-mb page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow">{hero.eyebrow}</div>
          <h1>{hero.title}</h1>
          <p>{hero.intro}</p>
        </div>
      </section>
    </>
  )
}
