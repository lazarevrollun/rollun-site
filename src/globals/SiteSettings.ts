import type { GlobalConfig } from 'payload'

/**
 * SiteSettings — the SINGLE home (AD-14) of every company-passport atom: phones,
 * emails, social links, the two physical addresses, and the various opening-hours
 * strings. Story 7.1 moves these raw values out of the hardcoded `content/*`
 * modules / inline component literals and into this Payload global so a
 * non-technical manager can edit them in `/admin` without a developer or rebuild.
 *
 * Parity guarantee (AD-7): every field carries a `defaultValue` EQUAL to the
 * exact Phase-1 literal it replaces. Payload returns those defaults from
 * `findGlobal` for a global that has never been saved, so the first build — before
 * any admin edit — is pixel-identical to Phase 1.
 *
 * Boundaries (AD-6): ONLY raw passport values live here. Presentational wrappers —
 * labels, prose, micro-copy, spacing quirks — stay in `content/*` and components.
 * Deliberate cross-surface divergences are preserved as DISTINCT named fields
 * (AD-13), never reconciled: `emails.footer` (info@) ≠ `emails.contact` (llc@);
 * four different CTA-hours strings; `aboutCtaDesktop` keeps `UTC +2` (with space)
 * while `aboutCtaMobile`/`contact` keep `UTC+2` (no space).
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Company',
  },
  fields: [
    {
      name: 'phones',
      type: 'group',
      fields: [
        { name: 'legal', type: 'text', required: true, defaultValue: '(307) 920-0149' },
        { name: 'shop', type: 'text', required: true, defaultValue: '(832) 461-2525' },
      ],
    },
    {
      name: 'emails',
      type: 'group',
      fields: [
        { name: 'footer', type: 'text', required: true, defaultValue: 'info@rollun.com' },
        { name: 'contact', type: 'text', required: true, defaultValue: 'llc@rollun.com' },
      ],
    },
    {
      name: 'social',
      type: 'group',
      fields: [
        { name: 'github', type: 'text', required: true, defaultValue: 'https://github.com/rollun-lc' },
        {
          name: 'linkedin',
          type: 'text',
          required: true,
          defaultValue: 'https://www.linkedin.com/company/rollun-lc/',
        },
      ],
    },
    {
      name: 'registeredAddress',
      type: 'group',
      fields: [
        { name: 'company', type: 'text', required: true, defaultValue: 'Rollun LC' },
        { name: 'street', type: 'text', required: true, defaultValue: '30 N Gould St STE 4370' },
        { name: 'city', type: 'text', required: true, defaultValue: 'Sheridan' },
        { name: 'state', type: 'text', required: true, defaultValue: 'WY' },
        { name: 'zip', type: 'text', required: true, defaultValue: '82801' },
      ],
    },
    {
      name: 'shopAddress',
      type: 'group',
      fields: [
        { name: 'street', type: 'text', required: true, defaultValue: '5327 Aldine Mail Route Rd' },
        { name: 'city', type: 'text', required: true, defaultValue: 'Houston' },
        { name: 'state', type: 'text', required: true, defaultValue: 'TX' },
        { name: 'zip', type: 'text', required: true, defaultValue: '77039' },
      ],
    },
    {
      name: 'hours',
      type: 'group',
      fields: [
        {
          name: 'store',
          type: 'array',
          fields: [
            { name: 'day', type: 'text', required: true },
            { name: 'time', type: 'text', required: true },
            { name: 'closed', type: 'checkbox', defaultValue: false },
          ],
          defaultValue: [
            { day: 'Monday', time: '10 AM – 4 PM', closed: false },
            { day: 'Tuesday', time: '10 AM – 4 PM', closed: false },
            { day: 'Wednesday', time: '10 AM – 4 PM', closed: false },
            { day: 'Thursday', time: '10 AM – 4 PM', closed: false },
            { day: 'Friday', time: '10 AM – 4 PM', closed: false },
            { day: 'Saturday', time: 'Closed', closed: true },
            { day: 'Sunday', time: 'Closed', closed: true },
          ],
        },
        { name: 'homeCtaDesktop', type: 'text', required: true, defaultValue: '11:00 to 21:00 UTC' },
        { name: 'homeCtaMobile', type: 'text', required: true, defaultValue: '09:00 to 21:00 UTC+2' },
        { name: 'aboutCtaDesktop', type: 'text', required: true, defaultValue: '09:00 to 21:00 UTC +2' },
        { name: 'aboutCtaMobile', type: 'text', required: true, defaultValue: '09:00 to 21:00 UTC+2' },
        { name: 'contact', type: 'text', required: true, defaultValue: '09:00 to 21:00 UTC+2' },
      ],
    },
  ],
}
