/**
 * Passport atoms for the site chrome (Story 1.4 — footer).
 *
 * Phase-1 hardcode of the contact/legal/company atoms shown in the footer,
 * ported VERBATIM from the Handoff prototype footer (Home.html / Home Mobile.html).
 * Each atom has a SINGLE home here (AD-14): both footer compositions
 * (desktop columns + mobile accordions) read from THIS module — never from a
 * forked copy — so the later `SiteSettings` integration (Epic 7) is a swap of
 * this module's source with no markup/pixel change.
 *
 * Nav links are intentionally NOT here — Quick Links reuse `NAV_ITEMS`
 * (nav-config.ts), the single source of the primary navigation.
 */

/** A phone number with the muted purpose label rendered beneath it. */
export type Phone = {
  /** Display + dial value, e.g. "(307) 920-0149". */
  number: string
  /** Muted sub-label, e.g. "only for legal purposes". */
  label: string
}

/** A physical address block with a sublabel; `accent` renders the sublabel orange. */
export type Address = {
  /** Heading above the address lines, e.g. "Only for legal purposes". */
  sublabel: string
  /** Address lines, each rendered on its own line (<br> in the prototype). */
  lines: string[]
  /** When true the sublabel is the canonical orange (prototype orange sublabel). */
  accent?: boolean
}

/** A legal link (placeholder href in Phase 1). */
export type LegalLink = {
  label: string
  href: string
}

/**
 * Company blurb shown in the DESKTOP footer's first column (long variant).
 *
 * The desktop and mobile prototypes carry DIFFERENT blurb text (mobile drops the
 * "operating across…" tail), so per AD-14 these are two distinct named atoms —
 * `COMPANY_BLURB` (desktop) and `COMPANY_INTRO` (mobile) — not one field rendered
 * two ways. This keeps each composition pixel-faithful to its own prototype (AD-13).
 */
export const COMPANY_BLURB =
  'Rollun is a U.S.-based e-commerce and distribution company specializing ' +
  'in automotive parts, motorcycle accessories, and health products, ' +
  'operating across leading marketplaces and our own sales channels.'

/** Company intro shown in the MOBILE footer (short variant — see COMPANY_BLURB). */
export const COMPANY_INTRO =
  'Rollun is a U.S.-based e-commerce and distribution company specializing ' +
  'in automotive parts, motorcycle accessories, and health products.'

/** Phone numbers with their purpose labels (prototype order). */
export const PHONES: Phone[] = [
  { number: '(307) 920-0149', label: 'only for legal purposes' },
  { number: '(832) 461-2525', label: 'shop and return center' },
]

/** Contact email (rendered as a mailto: link). */
export const EMAIL = 'info@rollun.com'

/** Physical locations (prototype order); the second sublabel is orange. */
export const ADDRESSES: Address[] = [
  {
    sublabel: 'Only for legal purposes',
    lines: ['Rollun LC', '30 N Gould St STE 4370', 'Sheridan, WY 82801'],
  },
  {
    sublabel: 'Shop & return center',
    lines: ['5327 Aldine Mail Route Rd', 'Houston, TX 77039'],
    accent: true,
  },
]

/** Legal links (placeholder hrefs in Phase 1). */
export const LEGAL_LINKS: LegalLink[] = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
]

/** Copyright line shown in `.footer-bottom`. */
export const COPYRIGHT = 'Rollun © 2026'
