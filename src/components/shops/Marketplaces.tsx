// Story 6.2 — Online shops / marketplaces (03) (RSC, no 'use client').
//
// Both compositions in one DOM (AD-3), switched only by the 768px CSS media.
// Desktop lays a 3-column `.shop-grid`; mobile stacks a `.shop-list`. Both map
// the SAME `ShopCardData[]` through the nested `ShopCard` helper. Each card is a
// screenshot link (external), a per-brand `ShopLogo` (presentational markup by
// `brand`), a rating whose `.stars` fill is driven by the `--pct` custom
// property, a blurb, and a CTA whose label differs desktop↔mobile. `.reveal`.
import type { ShopCardData, ShopsContent } from '@/content/shops'

/** Per-brand logo markup, switched by the `brand` discriminator. Amazon and
 *  Walmart are assembled from inline SVG + text; eBay is a raster logo. */
function ShopLogo({ brand }: { brand: ShopCardData['brand'] }) {
  if (brand === 'amazon') {
    return (
      <div className="amazon-wrap">
        <span className="amazon">amazon</span>
        <svg className="amazon-smile" viewBox="0 0 140 22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <path d="M6 4 C 30 22, 110 22, 134 4" />
          <path d="M126 4 L 134 4 L 134 12" />
        </svg>
      </div>
    )
  }
  if (brand === 'walmart') {
    return (
      <div className="walmart-wrap">
        <svg className="walmart-spark" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" aria-hidden="true">
          <line x1="24" y1="17" x2="24" y2="4" />
          <line x1="30.1" y1="20.5" x2="41.3" y2="14" />
          <line x1="30.1" y1="27.5" x2="41.3" y2="34" />
          <line x1="24" y1="31" x2="24" y2="44" />
          <line x1="17.9" y1="27.5" x2="6.7" y2="34" />
          <line x1="17.9" y1="20.5" x2="6.7" y2="14" />
        </svg>
        <span className="walmart">Walmart</span>
      </div>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element -- raster brand logo, fixed height (AD-13 pixel fidelity); next/image adds no value here
  return <img src="/shop/ebay-logo.png" alt="eBay" />
}

/** One marketplace card. `cta` selects the desktop or mobile CTA label. */
function ShopCard({ card, cta }: { card: ShopCardData; cta: string }) {
  return (
    <article className="shop-card">
      <a className="shop-shot scroll-shot" href={card.shot.href} target="_blank" rel="noopener">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed-ratio object-fit screenshot (AD-13 pixel fidelity); next/image adds no value here */}
        <img src={card.shot.img} alt={card.shot.alt} loading="lazy" />
      </a>
      <div className="shop-body">
        <div className="shop-logo">
          <ShopLogo brand={card.brand} />
        </div>
        <div className="rating">
          <span className="stars" style={{ ['--pct' as string]: `${card.rating.pct}%` }} />
          <span className="score">{card.rating.score}</span>
          <span className="meta">{card.rating.meta}</span>
        </div>
        <p>{card.blurb}</p>
        <a className="btn btn-or" href={card.cta.href} target="_blank" rel="noopener">
          {cta}
        </a>
      </div>
    </article>
  )
}

export default function Marketplaces({ shops }: { shops: ShopsContent['shops'] }) {
  const { eyebrow, title, intro, cards } = shops
  return (
    <>
      {/* ── Desktop composition ── */}
      <section className="shops-dk shops reveal">
        <div className="container">
          <div className="section-eyebrow">{eyebrow}</div>
          <h2 className="section-title">{title}</h2>
          <p className="section-intro">{intro}</p>

          <div className="shop-grid">
            {cards.map((card) => (
              <ShopCard key={card.brand} card={card} cta={card.cta.labelDk} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile composition ── */}
      <section className="shops-mb section paper reveal">
        <div className="section-head wrap">
          <div className="section-eyebrow">{eyebrow}</div>
          <h2 className="section-title">{title}</h2>
          <p>{intro}</p>
        </div>
        <div className="wrap">
          <div className="shop-list">
            {cards.map((card) => (
              <ShopCard key={card.brand} card={card} cta={card.cta.labelMb} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
