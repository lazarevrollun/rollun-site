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
 */

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

/** The single Our Shops content instance (AD-14) consumed by page + sections. */
export const shopsContent: ShopsContent = {
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
    addressLines: ['5327 Aldine Mail Route Rd', '77039'],
    hours: [
      { day: 'Monday', time: '10 AM – 4 PM' },
      { day: 'Tuesday', time: '10 AM – 4 PM' },
      { day: 'Wednesday', time: '10 AM – 4 PM' },
      { day: 'Thursday', time: '10 AM – 4 PM' },
      { day: 'Friday', time: '10 AM – 4 PM' },
      { day: 'Saturday', time: 'Closed', closed: true },
      { day: 'Sunday', time: 'Closed', closed: true },
    ],
    phone: '(832) 461-2525',
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
}
