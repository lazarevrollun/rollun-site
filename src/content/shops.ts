/**
 * Our Shops content atoms (Story 6.2).
 *
 * The SINGLE home (AD-14) of every static string the Our Shops page (`/shops`)
 * renders — ported VERBATIM from the two Handoff prototypes:
 *   desktop → rollun_handoff/rollun-web-site/project/Our Shops.html
 *   mobile  → rollun_handoff/rollun-web-site/project/Our Shops Mobile.html
 *
 * The page (`app/(site)/shops/page.tsx`) and every section RSC in
 * `components/shops/*` read from THIS module, never from a forked copy. The
 * shape is FLAT SERIALIZABLE DATA (strings / numbers / arrays / objects — no
 * functions, no JSX) so a future Payload Global `ShopsContent` (Phase 2) can
 * supply the very same shape (AD-7).
 *
 * These are a NEW, DISTINCT home from `site-contacts.ts` / `contact-info.ts`
 * (which carry `Houston, TX 77039`). The shops passport atoms are NOT reconciled
 * to those modules (precedent AD-14: `COMPANY_BLURB` ≠ `COMPANY_INTRO`).
 *
 * Deliberate design defects are reproduced VERBATIM (AD-13), NOT fixed:
 *   - `directions.href` points at Conroe even though the visible city is Houston.
 *   - The desktop city string `Houston,Texas` has no space after the comma.
 *   - The store hours differ from the footer/contact atoms — separate atom.
 *
 * Desktop↔mobile text differences are captured as EXPLICIT fields (never runtime
 * logic): the city string, the directions label, the CTA label, and the store
 * photo alt text.
 *
 * Story 7.1: the store's passport atoms (hours, phone, address) moved to the
 * `SiteSettings` global (their single home, AD-14). `buildShopsContent(s)` sources
 * `store.hours` / `store.phone` / `store.addressLines` from the passport and keeps
 * every other string — including the deliberate defects (`cityDk` without a space,
 * the Conroe `directions.href`) — code-owned (AD-6/AD-13).
 */
import type { SiteSetting } from '@/payload-types'
import { shopStoreAddressLines } from '@/lib/site-settings-format'

/** One hours row: `day` label + `time` value; `closed` styles the time cell. */
export type ShopHours = { day: string; time: string; closed?: boolean }

/** One marketplace card. `brand` drives the presentational logo switch. */
export type ShopCardData = {
  brand: 'amazon' | 'ebay' | 'walmart'
  /** Storefront screenshot: external link + image. */
  shot: { img: string; alt: string; href: string }
  /** Rating block. `pct` feeds the `--pct` CSS custom property on `.stars`. */
  rating: { pct: number; score: string; meta: string }
  blurb: string
  /** Card CTA — `labelDk` (`VISIT STORE`) vs `labelMb` (`Visit store`). */
  cta: { labelDk: string; labelMb: string; href: string }
}

/** The full Our Shops content contract — the page is a pure function of this. */
export type ShopsContent = {
  hero: { eyebrow: string; title: string; intro: string }
  store: {
    eyebrow: string
    title: string
    intro: string
    /** Store photo. `altDk` (with the sign clause) vs `altMb` (short). */
    photo: { img: string; altDk: string; altMb: string }
    locationLabel: string
    /** `Houston,Texas` (no space, desktop) vs `Houston, Texas` (mobile). */
    cityDk: string
    cityMb: string
    addressLines: string[]
    hours: ShopHours[]
    phone: string
    /** `labelDk` (`GET DIRECTIONS`) vs `labelMb` (`Get directions` + arrow).
     *  `href` = the Conroe defect (AD-13), NOT the visible Houston address. */
    directions: { labelDk: string; labelMb: string; href: string }
  }
  shops: { eyebrow: string; title: string; intro: string; cards: ShopCardData[] }
}

/**
 * Build the Our Shops content from the `SiteSettings` passport (AD-14). Static
 * strings are code-owned; `store.hours` / `store.phone` / `store.addressLines`
 * come from the passport. The page (RSC) calls this with the resolved settings.
 */
export const buildShopsContent = (s: SiteSetting): ShopsContent => ({
  hero: {
    eyebrow: 'Where to buy',
    title: 'Our stores',
    intro:
      'Visit us in person at our store in Texas, or shop the full Rollun catalog online across the marketplaces you trust.',
  },
  store: {
    eyebrow: 'In person',
    title: 'Visit our store in Texas',
    intro: 'Drop by our Texas location for parts, accessories, and friendly face-to-face support.',
    photo: {
      img: '/shop/storefront-2.png',
      altDk: 'Rollun storefront entrance in Texas with the rollun sign above the door',
      altMb: 'Rollun storefront entrance in Texas',
    },
    locationLabel: 'Location',
    cityDk: 'Houston,Texas',
    cityMb: 'Houston, Texas',
    addressLines: shopStoreAddressLines(s),
    hours: (s.hours.store ?? []).map((h) => ({
      day: h.day,
      time: h.time,
      ...(h.closed ? { closed: true } : {}),
    })),
    phone: s.phones.shop,
    directions: {
      labelDk: 'GET DIRECTIONS',
      labelMb: 'Get directions',
      href: 'https://maps.google.com/maps?q=Conroe%2C%20Texas',
    },
  },
  shops: {
    eyebrow: 'Buy online',
    title: 'Shop on marketplaces',
    intro: 'Same Rollun catalog, backed by thousands of verified ratings across major platforms.',
    cards: [
      {
        brand: 'amazon',
        shot: {
          img: '/shop/store-amazon.png',
          alt: 'Rollun storefront on Amazon',
          href: 'https://www.amazon.com/s?i=merchant-items&me=A11L6NMVUXNX47',
        },
        rating: { pct: 94, score: '4.7 out of 5', meta: '94% positive · 153 ratings' },
        blurb: 'Fast Prime-eligible shipping and A-to-z buyer protection on our full Amazon storefront.',
        cta: {
          labelDk: 'VISIT STORE',
          labelMb: 'Visit store',
          href: 'https://www.amazon.com/s?i=merchant-items&me=A11L6NMVUXNX47',
        },
      },
      {
        brand: 'ebay',
        shot: {
          img: '/shop/store-ebay.png',
          alt: 'Rollun store on eBay',
          href: 'https://www.ebay.com/str/Rollun',
        },
        rating: { pct: 100, score: '99.8% positive feedback', meta: '59K+ items sold · 843 followers' },
        blurb: 'Our top-rated eBay store with 2,200+ live listings of parts and accessories.',
        cta: {
          labelDk: 'VISIT STORE',
          labelMb: 'Visit store',
          href: 'https://www.ebay.com/str/Rollun',
        },
      },
      {
        brand: 'walmart',
        shot: {
          img: '/shop/store-walmart-reviews.png',
          alt: 'Rollun LC seller page on Walmart Marketplace',
          href: 'https://www.walmart.com/global/seller/101022720',
        },
        rating: { pct: 80, score: '4.0 out of 5', meta: 'Rollun LC seller · 4 ratings' },
        blurb: 'Shop our growing Walmart Marketplace catalog with easy checkout and returns.',
        cta: {
          labelDk: 'VISIT STORE',
          labelMb: 'Visit store',
          href: 'https://www.walmart.com/global/seller/101022720',
        },
      },
    ],
  },
})
