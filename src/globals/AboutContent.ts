import type { GlobalConfig } from 'payload'

import { ABOUT_CONTENT_TAG } from '../lib/cache-tags'
import { revalidateGlobal } from '../hooks/revalidate-global'

/**
 * AboutContent — managed 🟡 editable TEXT and the 🔴 flat CEO photo of the About
 * page (`/about`). Story 7.3 moves these slot values out of the static
 * `content/about.ts` builder into this Payload global (parity via `defaultValue`,
 * AD-7 — exact Phase-1 literals; first build is pixel-identical).
 *
 * Boundaries (AD-6): ONLY flat editable prose + the single CEO photo. Left
 * CODE-OWNED: all `{dk,mb}` variants (hero.para, snapshot copy, cta.hours), the
 * styled heading segment-runs, the approach principles, the automation stats, the
 * KeepToShip diagram compare-table, the US-presence map coordinates/rows/suppliers
 * and mobile cards/chips (passport + microcopy), and — DEFERRED per AD-3 — the
 * desktop|mobile art-directed team tiles (they stay pure code /`/public`).
 *
 * The CEO photo is an OPTIONAL `upload`: empty → builder falls back to the
 * code-owned `/public` path (`resolveMediaUrl(slot) ?? '/ceo-photo.png'`).
 */
export const AboutContent: GlobalConfig = {
  slug: 'about-content',
  label: 'About Content',
  admin: {
    group: 'Content Pages',
  },
  hooks: {
    afterChange: [revalidateGlobal(ABOUT_CONTENT_TAG)],
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'subheading',
          type: 'text',
          required: true,
          defaultValue: 'A traditional business mindset powered by modern operations and automation.',
        },
      ],
    },
    {
      name: 'approach',
      type: 'group',
      fields: [{ name: 'title', type: 'text', required: true, defaultValue: 'Our approach' }],
    },
    {
      name: 'automation',
      type: 'group',
      fields: [
        {
          name: 'lede',
          type: 'text',
          required: true,
          defaultValue:
            'We scale through innovation and technology — not by expanding headcount. Internal tools and process automation reduce operational costs and keep execution consistent, year after year.',
        },
      ],
    },
    {
      name: 'keeptoship',
      type: 'group',
      fields: [
        { name: 'tag', type: 'text', required: true, defaultValue: 'Our technological startup' },
        { name: 'ctaHeading', type: 'text', required: true, defaultValue: 'Want to work with us?' },
        {
          name: 'ctaText',
          type: 'text',
          required: true,
          defaultValue: 'Invest, store products in your area, or use KeepToShip in your free time.',
        },
      ],
    },
    {
      name: 'usPresence',
      type: 'group',
      fields: [{ name: 'title', type: 'text', required: true, defaultValue: 'US presence' }],
    },
    {
      name: 'team',
      type: 'group',
      fields: [
        // 🔴 flat CEO photo — OPTIONAL upload; empty → code-owned '/ceo-photo.png'.
        { name: 'ceoPhoto', type: 'upload', relationTo: 'media' },
        {
          name: 'quote',
          type: 'text',
          required: true,
          defaultValue:
            'A small, stable team that has worked together for years — disciplined operators on the business side, sharp engineers on the platform side. We hire slowly, invest in tooling, and let the work speak for itself.',
        },
        { name: 'ceoName', type: 'text', required: true, defaultValue: 'Natalia Gretchukha' },
        { name: 'ceoRole', type: 'text', required: true, defaultValue: 'CEO' },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', required: true, defaultValue: "Let's talk business" },
        {
          name: 'sub',
          type: 'text',
          required: true,
          defaultValue: 'Wholesale, partnership, and marketplace operations.',
        },
      ],
    },
  ],
}
