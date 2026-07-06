/**
 * Story 5.3 — Offers: runtime derivation `buildOffers` (SERVER-ONLY pure module).
 *
 * Per AD-9 marketplace offers are a RUNTIME DERIVATION, not a Payload field: this
 * module is the single source that produces them for the product card (5.2) and
 * the future quick-view (5.4). Logic / prices / URLs / ship-texts / disclaimer are
 * ported VERBATIM from the prototype `MK` / `offer` / `priceFor` / `buildOffers`:
 *   rollun_handoff/rollun-web-site/project/Catalog.html (~lines 1353-1446, ~1555)
 *
 * IMPORTANT (AD-9): this module is SERVER-ONLY — no `'use client'`, no React. It
 * is called from the RSC `ProductLines` (where the line is known) and the result
 * is handed to `ProductCard` as a ready `offers` prop. It MUST NEVER be imported
 * into a `'use client'` island. `Offer` is FLAT SERIALIZABLE and DENORMALIZED
 * (name/domain baked in) so a client consumer (quick-view 5.4) can render it
 * without importing this module.
 */
import type { Product } from '@/content/products'

/** The three marketplaces an offer can point at. */
export type OfferKey = 'amazon' | 'ebay' | 'walmart'

/** A single marketplace offer — flat serializable, denormalized name/domain so a
 *  client consumer renders it without importing this (server-only) module. */
export type Offer = {
  key: OfferKey
  name: string
  domain: string
  price: string
  ship: string
  url: string
}

/** Marketplace config: display name, favicon domain, and a search-URL builder.
 *  VERBATIM from the prototype `MK` (Catalog.html ~1353). */
export const MK: Record<OfferKey, { name: string; domain: string; search: (q: string) => string }> = {
  amazon: { name: 'Amazon', domain: 'amazon.com', search: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}` },
  ebay: { name: 'eBay', domain: 'ebay.com', search: (q) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}` },
  walmart: { name: 'Walmart', domain: 'walmart.com', search: (q) => `https://www.walmart.com/search?q=${encodeURIComponent(q)}` },
}

/** Offer factory: marketplace key, price, shipping note, url (defaults to the
 *  marketplace search of `name`). Denormalizes name/domain from `MK` into the
 *  flat offer. VERBATIM from the prototype `offer` (Catalog.html ~1364). */
export function offer(key: OfferKey, price: string, ship: string, url?: string, name?: string): Offer {
  return {
    key,
    name: MK[key].name,
    domain: MK[key].domain,
    price,
    ship: ship || 'In stock · Free shipping',
    url: url || MK[key].search(name ?? ''),
  }
}

/** Deterministic-ish price from name length so listings look stable.
 *  VERBATIM from the prototype `priceFor` (Catalog.html ~1443). */
export function priceFor(p: Product, idx: number): string {
  const base = 18 + (p.name.length % 9) * 7 + idx // spread
  const cents = ['.95', '.99', '.49', '.95'][(p.name.length + idx) % 4]
  return '$' + (base + idx * 1.5).toFixed(0).replace(/(\d)(?=(\d{3})+$)/g, '$1,') + cents
}

/** Derive the marketplace offers for a product BY LINE.
 *  `line === 'health'` → 2 offers [amazon(direct `p.amazon`), ebay(search `p.name`)];
 *  else (auto) → 3 offers [amazon, ebay, walmart] all searching `brand + ' ' + name`.
 *  VERBATIM from the prototype `buildOffers` (Catalog.html ~1429). */
export function buildOffers(p: Product, line: 'auto' | 'health'): Offer[] {
  if (line === 'health') {
    return [
      offer('amazon', priceFor(p, 0), 'In stock · Prime delivery', p.amazon),
      offer('ebay', priceFor(p, 1), 'In stock · Free shipping', undefined, p.name),
    ]
  }
  return [
    offer('amazon', priceFor(p, 0), 'In stock · Free shipping', undefined, p.brand + ' ' + p.name),
    offer('ebay', priceFor(p, 1), 'In stock · Free shipping', undefined, p.brand + ' ' + p.name),
    offer('walmart', priceFor(p, 2), 'In stock · 2-day shipping', undefined, p.brand + ' ' + p.name),
  ]
}

/** Marketplace disclaimer — VERBATIM from the prototype `.pd-disc` (Catalog.html
 *  ~1555). Contract for the quick-view (Story 5.4); NOT rendered in 5.3. */
export const OFFER_DISCLAIMER =
  'Prices and availability shown are representative and may vary on the marketplace. Rollun distributes these products through the listed marketplace stores.'
