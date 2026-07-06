// Story 5.5 — Catalog "Brands we work with" marquee (05, RSC — no 'use client').
//
// Both compositions live in one DOM (AD-3); the 768px CSS switch picks the visible
// one. Desktop wraps the content in `.container`; mobile does not (VERBATIM, same as
// `CtaSection`). Section markup ported VERBATIM from the two Handoff prototypes:
//   desktop → Catalog.html         (HTML ~1077-1146, CSS ~759-850)
//   mobile  → Catalog Mobile.html  (HTML ~515-526, CSS ~254-270, `fill` JS ~630-638)
//
// Each track is exactly 2 identical halves so the `translateX(0 → -50%)` keyframe
// loops seamlessly: tiles = `Array.from({length: repeat}).flatMap(() => brands)`
// (auto ×2 = 28, health ×8 = 24). Automotive tiles are non-clickable `.linkless`
// `<div>`s; Health tiles are external `<a>`s. Favicons go through `FaviconImg` (AD-11,
// the ONLY remote asset) at `sz=128`. The desktop fly-to-center spotlight is a leaf
// `'use client'` island (`BrandSpotlight`) mounted once at the end — it ENHANCES only
// `.catalog-dk .logo-tile`; mobile tiles stay inert (the mobile prototype has none).
import type { CatalogBrand, CatalogBrandsWall } from '@/content/catalog'

import BrandSpotlight from './BrandSpotlight.client'
import FaviconImg from './FaviconImg.client'

/** Duplicate `brands` `repeat` times, flattened — each track needs 2 identical
 *  halves for the seamless -50% loop (VERBATIM with both prototypes). */
function expand(brands: CatalogBrand[], repeat: number): CatalogBrand[] {
  return Array.from({ length: repeat }).flatMap(() => brands)
}

/** One marquee tile. Health brands (`href`) render as external `<a>`; Automotive
 *  brands render as a non-clickable `.linkless <div>` (VERBATIM). */
function LogoTile({ brand }: { brand: CatalogBrand }) {
  const inner = (
    <>
      <FaviconImg domain={brand.domain} size={128} className="fav" />
      <span className="wm">{brand.name}</span>
    </>
  )
  if (brand.href) {
    return (
      <a className="logo-tile" href={brand.href} target="_blank" rel="noopener">
        {inner}
      </a>
    )
  }
  return <div className="logo-tile linkless">{inner}</div>
}

/** The brands-wall body (shared by both compositions) — the `.container` wrap and
 *  the `intro` variant are the only desktop/mobile differences. */
function BrandsInner({ brands, variant }: { brands: CatalogBrandsWall; variant: 'dk' | 'mb' }) {
  const autoTiles = expand(brands.auto, brands.autoRepeat)
  const healthTiles = expand(brands.health, brands.healthRepeat)
  return (
    <>
      <div className="bw-head">
        <div className="section-eyebrow">{brands.eyebrow}</div>
        <h2 className="section-title">{brands.title}</h2>
        <p>{brands.intro[variant]}</p>
      </div>

      <div className="bw-cat">{brands.autoCatLabel}</div>
      <div className="logo-marquee">
        <div className="logo-track">
          {autoTiles.map((b, i) => (
            <LogoTile key={`auto-${i}`} brand={b} />
          ))}
        </div>
      </div>

      <div className="bw-cat">{brands.healthCatLabel}</div>
      <div className="logo-marquee">
        <div className="logo-track rev">
          {healthTiles.map((b, i) => (
            <LogoTile key={`health-${i}`} brand={b} />
          ))}
        </div>
      </div>
    </>
  )
}

export default function BrandMarquee({ brands }: { brands: CatalogBrandsWall }) {
  return (
    <>
      {/* ── Desktop composition (wraps in .container) ── */}
      <section className="catalog-dk brands-wall">
        <div className="container">
          <BrandsInner brands={brands} variant="dk" />
        </div>
      </section>

      {/* ── Mobile composition (no container) ── */}
      <section className="catalog-mb brands-wall">
        <BrandsInner brands={brands} variant="mb" />
      </section>

      {/* Desktop-only fly-to-center spotlight island (enhances .catalog-dk tiles). */}
      <BrandSpotlight />
    </>
  )
}
