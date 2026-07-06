import type { GlobalConfig } from 'payload'

import { HOME_CONTENT_TAG } from '../lib/cache-tags'
import { revalidateGlobal } from '../hooks/revalidate-global'

/**
 * HomeContent — the managed-content home for the 🟡 editable live-block TEXT of
 * the Home page (`/`). Story 7.3 moves these slot values out of the static
 * `content/home.ts` builder and into this Payload global so a manager can edit
 * them in `/admin` without a developer or rebuild.
 *
 * Parity (AD-7): every text field carries a `defaultValue` EQUAL to the exact
 * Phase-1 literal from `content/home.ts`. `findGlobal` on a never-saved global
 * returns those defaults, so the first build is pixel-identical to Phase 1.
 *
 * Boundaries (AD-6): ONLY flat editable prose lives here. Left CODE-OWNED in the
 * builder/JSX: all `{dk,mb}` variants (hero.tag, headline segments, product-line
 * headings, benefit cards, cta.hours), button/CTA labels, the stat items, the
 * marketplace cards, and — DEFERRED per AD-3 — the hero mosaic and the
 * desktop|mobile art-directed product-line slides (they stay pure code /`/public`).
 */
export const HomeContent: GlobalConfig = {
  slug: 'home-content',
  label: 'Home Content',
  admin: {
    group: 'Content Pages',
  },
  hooks: {
    afterChange: [revalidateGlobal(HOME_CONTENT_TAG)],
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
          defaultValue:
            'Rollun is a U.S.-based e-commerce distribution company focused on automotive parts & accessories and health products.',
        },
      ],
    },
    {
      name: 'productLines',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'What we do' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Two focused product lines' },
        {
          name: 'intro',
          type: 'text',
          required: true,
          defaultValue:
            'Focused expertise in two categories where automation, sourcing, and marketplace operations create real advantage.',
        },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      fields: [{ name: 'title', type: 'text', required: true, defaultValue: 'Proven at scale' }],
    },
    {
      name: 'benefits',
      type: 'group',
      fields: [{ name: 'title', type: 'text', required: true, defaultValue: 'Key benefits' }],
    },
    {
      name: 'marketplaces',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Where to buy' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Find us on marketplaces' },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', required: true, defaultValue: "Let's talk business" },
        {
          name: 'intro',
          type: 'text',
          required: true,
          defaultValue: 'Wholesale, partnership, and marketplace operations.',
        },
      ],
    },
  ],
}
