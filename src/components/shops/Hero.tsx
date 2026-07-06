// Story 6.2 — Our Shops page hero (01) (RSC, no 'use client').
//
// Renders BOTH compositions into one DOM (AD-3): a desktop subtree (`.shops-dk`,
// Our Shops.html) and a mobile subtree (`.shops-mb`, Our Shops Mobile.html); the
// visible one is chosen ONLY by the CSS `@media` at 768px in shops.css — no JS
// width gating. Hero is the FIRST section and is intentionally excluded from
// `.reveal` (above the fold).
import type { ShopsContent } from '@/content/shops'

export default function Hero({ hero }: { hero: ShopsContent['hero'] }) {
  return (
    <>
      {/* ── Desktop composition (visible ≥768px via shops.css) ── */}
      <section className="shops-dk page-hero">
        <div className="container page-hero-inner">
          <div className="eyebrow">{hero.eyebrow}</div>
          <h1>{hero.title}</h1>
          <p>{hero.intro}</p>
        </div>
      </section>

      {/* ── Mobile composition (visible <768px via shops.css) ── */}
      <section className="shops-mb page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow">{hero.eyebrow}</div>
          <h1>{hero.title}</h1>
          <p>{hero.intro}</p>
        </div>
      </section>
    </>
  )
}
