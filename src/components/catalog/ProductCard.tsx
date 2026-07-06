// Story 5.2 — one Catalog product card (RSC, no 'use client'). Rendered SERVER-
// side into the empty 5.1 containers (NOT injected by client JS); the slider
// interactivity is ENHANCED afterwards by the `CatalogCardSlider` island.
//
// Markup + inline SVGs are ported VERBATIM from the prototypes' `cardEl()`:
//   desktop → Catalog.html        (~line 1453) — ADDS the `.pc-arrow` prev/next
//   mobile  → Catalog Mobile.html (~line 740)  — NO arrows (touch-swipe instead)
// `variant` picks the composition: `'dk'` (arrows + `pc-badge stock`) vs `'mb'`
// (no arrows + bare `pc-badge`, green baked into the mobile CSS).
//
// The card carries `role="button"` / `tabIndex` / `aria-label` + focus-ring for
// pixel/DOM fidelity, but NO activating handler — the quick-view `openDetail`
// (click / Enter / Space) is Story 5.4. Marketplace chips are the first two
// runtime-derived `offers` (Story 5.3 — invariantly Amazon + eBay for both lines;
// Walmart is the 3rd auto offer, sliced off). Offers are computed SERVER-side in
// `ProductLines` via `buildOffers` and handed here as a ready `offers` prop; this
// RSC imports only the `Offer` type (AD-9 — never the server-only `lib/offers.ts`
// runtime into a client island).
import type { Product } from '@/content/products'
import type { Offer } from '@/lib/offers'

import FaviconImg from './FaviconImg.client'

/** The → arrow on the "View details" CTA (prototype `arrowR`). */
function ArrowR() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

/** The ‹ chevron on the desktop prev arrow (prototype `chevL`). */
function ChevL() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

/** The › chevron on the desktop next arrow (prototype `chevR`). */
function ChevR() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

/** The image-placeholder glyph inside each slide (prototype `imgIco`). */
function ImgIco() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </svg>
  )
}

export default function ProductCard({ product, variant, offers }: { product: Product; variant: 'dk' | 'mb'; offers: Offer[] }) {
  const { brand, domain, name, imgs, specs } = product
  return (
    <div className="product-card" role="button" tabIndex={0} aria-label={`${brand} ${name}`}>
      <div className="pc-media">
        <div className="pc-track">
          {imgs.map((_, idx) => (
            <div className="pc-slide" key={idx}>
              <div className="img-ph">
                <ImgIco />
                <span className="pl">Photo {idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
        {variant === 'dk' && (
          <>
            <button className="pc-arrow prev" type="button" aria-label="Previous image">
              <ChevL />
            </button>
            <button className="pc-arrow next" type="button" aria-label="Next image">
              <ChevR />
            </button>
          </>
        )}
        <div className="pc-dots">
          {imgs.map((_, i) => (
            <span key={i} className={i === 0 ? 'pc-dot active' : 'pc-dot'} />
          ))}
        </div>
        <span className={variant === 'dk' ? 'pc-badge stock' : 'pc-badge'}>In stock</span>
      </div>
      <div className="pc-body">
        <div className="pc-brand-row">
          <FaviconImg domain={domain} className="pc-logo" />
          <div className="pc-brand">{brand}</div>
        </div>
        <div className="pc-name">{name}</div>
        <ul className="pc-specs">
          {specs.slice(1, 4).map(([k, v]) => (
            <li key={k}>
              <span className="k">{k}</span>
              <span className="v">{v}</span>
            </li>
          ))}
        </ul>
        <div className="pc-offers">
          <span className="pc-stock">In stock</span>
          <div className="pc-markets">
            {offers.slice(0, 2).map((o) => (
              <span className="mk" key={o.name}>
                <FaviconImg domain={o.domain} />
                {o.name}
              </span>
            ))}
          </div>
        </div>
        <div className="pc-cta">
          View details
          <ArrowR />
        </div>
      </div>
    </div>
  )
}
