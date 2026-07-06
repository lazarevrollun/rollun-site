import type { SiteSetting } from '@/payload-types'

/**
 * PURE, DB-free formatters for the company-passport address atoms (AD-14). This
 * module deliberately imports NOTHING from `@/lib/payload` / `@payload-config`,
 * so it is safe to pull into any bundle — including a client island — without
 * dragging the Payload local API (and its Node-only deps) into the browser. The
 * server-only accessor lives separately in `@/lib/site-settings`.
 *
 * The SAME physical address is rendered in several different formats across
 * surfaces; each consumer composes its own string from these structured fields,
 * so there is ONE home (AD-14) while the deliberate per-surface divergences are
 * reproduced verbatim (AD-13). These helpers hold NO editorial prose/micro-copy —
 * prose (the map "Registered … —" prefix, the "· only for legal purposes" note,
 * the contact hero sentence) lives with the rest of the copy in `content/*` (AD-6).
 * Every helper is a pure function of a `SiteSetting` (deterministic, DB-free).
 */
type AddressAtoms = { street: string; city: string; state: string; zip: string }

/** `"Sheridan, WY 82801"` / `"Houston, TX 77039"`. */
export const cityStateZip = (a: AddressAtoms): string => `${a.city}, ${a.state} ${a.zip}`

/** Registered address as footer/contact lines → `['Rollun LC','30 N Gould St STE 4370','Sheridan, WY 82801']`. */
export const registeredAddressLines = (s: SiteSetting): string[] => [
  s.registeredAddress.company,
  s.registeredAddress.street,
  cityStateZip(s.registeredAddress),
]

/** Shop address as footer/contact lines → `['5327 Aldine Mail Route Rd','Houston, TX 77039']`. */
export const shopAddressLines = (s: SiteSetting): string[] => [
  s.shopAddress.street,
  cityStateZip(s.shopAddress),
]

/** Shop address as the Our Shops two-line block (ZIP only) → `['5327 Aldine Mail Route Rd','77039']`. */
export const shopStoreAddressLines = (s: SiteSetting): string[] => [
  s.shopAddress.street,
  s.shopAddress.zip,
]

/** Map tab[0] shop `addr`/`q` → `"5327 Aldine Mail Route Rd, Houston, TX 77039"`. */
export const shopAddressInline = (s: SiteSetting): string =>
  `${s.shopAddress.street}, ${cityStateZip(s.shopAddress)}`

/** Map tab[1] registered `q` (Google-Maps query, WITH comma) → `"30 N Gould St STE 4370, Sheridan, WY 82801"`. */
export const registeredMapQuery = (s: SiteSetting): string =>
  `${s.registeredAddress.street}, ${cityStateZip(s.registeredAddress)}`

/** About mobile store card `addr` → `"5327 Aldine Mail Route Rd, 77039"`. */
export const aboutStoreCardAddr = (s: SiteSetting): string =>
  `${s.shopAddress.street}, ${s.shopAddress.zip}`
