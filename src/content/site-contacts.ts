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
 *
 * Story 7.1: the raw passport atoms (phones, email, addresses) no longer live
 * here as literals — they moved to the `SiteSettings` global (their single home,
 * AD-14). `buildFooterContacts(s)` composes the footer's shapes from those atoms
 * plus the footer's own code-owned labels/sublabels. Prose/legal/copyright atoms
 * (`COMPANY_BLURB`/`COMPANY_INTRO`/`LEGAL_LINKS`/`COPYRIGHT`) stay in code (AD-6).
 */
import type { SiteSetting } from '@/payload-types'
import { registeredAddressLines, shopAddressLines } from '@/lib/site-settings-format'

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

/**
 * Compose the footer's contact shapes from the `SiteSettings` passport (AD-14).
 * The phone/email/address VALUES come from the global; the purpose labels and
 * address sublabels (with the orange accent on the shop block) are the footer's
 * own code-owned micro-copy (AD-6). Order matches the prototype.
 */
export const buildFooterContacts = (
  s: SiteSetting,
): { phones: Phone[]; email: string; addresses: Address[] } => ({
  phones: [
    { number: s.phones.legal, label: 'only for legal purposes' },
    { number: s.phones.shop, label: 'shop and return center' },
  ],
  email: s.emails.footer,
  addresses: [
    { sublabel: 'Only for legal purposes', lines: registeredAddressLines(s) },
    { sublabel: 'Shop & return center', lines: shopAddressLines(s), accent: true },
  ],
})

/** Legal links (placeholder hrefs in Phase 1). */
export const LEGAL_LINKS: LegalLink[] = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
]

/** Copyright line shown in `.footer-bottom`. */
export const COPYRIGHT = 'Rollun © 2026'
