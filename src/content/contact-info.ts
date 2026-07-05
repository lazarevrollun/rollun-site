/**
 * Content atoms for the ContactForm info panel (`.cf-info`, Story 2.4).
 *
 * The SINGLE home (AD-14) of every string the dark info panel renders — the
 * heading, the two addresses with their labels, the phones with their
 * parenthetical labels, the email, the blurb and the social links. The panel is
 * shared by BOTH display modes that carry it (the desktop modal and the inline
 * `/contact` card), so the wording lives in ONE place and each composition stays
 * pixel-faithful to its prototype (AD-13).
 *
 * These are a DISTINCT home from the footer atoms in `site-contacts.ts`: the
 * panel prototype shows `llc@rollun.com` (not the footer `info@rollun.com`) and
 * the labels `Registered office` / `Shop & return center` (not the footer
 * `Only for legal purposes`). Per the AD-14 precedent (`COMPANY_BLURB` vs
 * `COMPANY_INTRO`) differing prototypes get their own named atoms rather than a
 * forced reuse. Values ported VERBATIM from the modal prototype (Home.html:1233-1276).
 */

/** A physical address block; `accent` renders the lines in the canonical orange. */
export type ContactInfoAddress = {
  /** Small uppercase label above the lines, e.g. "Registered office". */
  label: string
  /** Address lines, each on its own line (<br> in the prototype). */
  lines: string[]
  /** When true the lines render orange (the shop & return center address). */
  accent?: boolean
}

/** A phone number with the muted parenthetical label rendered beneath it. */
export type ContactInfoPhone = {
  /** Display value, e.g. "(307) 920-0149". */
  number: string
  /** Muted sub-label, e.g. "( only for legal purposes)". */
  label: string
}

/** A social link with the icon selected by `platform`. */
export type ContactInfoSocial = {
  /** Which inline icon + brand colour to render. */
  platform: 'github' | 'linkedin'
  /** External profile URL. */
  href: string
  /** Accessible label for the link. */
  label: string
}

/** The full content contract consumed by `ContactInfo`. */
export type ContactInfoContent = {
  heading: string
  addresses: ContactInfoAddress[]
  phones: ContactInfoPhone[]
  email: string
  blurb: string
  social: ContactInfoSocial[]
}

/** The single content instance (default prop of `ContactInfo`). */
export const contactInfoContent: ContactInfoContent = {
  heading: 'Contact Information',
  addresses: [
    {
      label: 'Registered office',
      lines: ['Rollun LC', '30 N Gould St STE 4370', 'Sheridan, WY 82801'],
    },
    {
      label: 'Shop & return center',
      lines: ['5327 Aldine Mail Route Rd', 'Houston, TX 77039'],
      accent: true,
    },
  ],
  phones: [
    { number: '(307) 920-0149', label: '( only for legal purposes)' },
    { number: '(832) 461-2525', label: '(shop and return center)' },
  ],
  email: 'llc@rollun.com',
  blurb: "Send us an email and we'll get in touch shortly.",
  social: [
    { platform: 'github', href: 'https://github.com/rollun-lc', label: 'GitHub' },
    { platform: 'linkedin', href: 'https://www.linkedin.com/company/rollun-lc/', label: 'LinkedIn' },
  ],
}
