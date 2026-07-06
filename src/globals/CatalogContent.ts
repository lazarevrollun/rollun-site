import type { GlobalConfig } from 'payload'

import { CATALOG_CONTENT_TAG } from '../lib/cache-tags'
import { revalidateGlobal } from '../hooks/revalidate-global'

/**
 * CatalogContent — managed 🟡 editable TEXT and the two 🔴 flat entrance images
 * of the Catalog page (`/catalog`). Story 7.3 moves these slot values out of the
 * (formerly static) `content/catalog.ts` into this Payload global. Parity via
 * `defaultValue` = exact Phase-1 literal (AD-7).
 *
 * Boundaries (AD-6): ONLY flat editable prose + the two entrance content-images.
 * Left CODE-OWNED: all `{dk,mb}` variants (line intros, subcat alt/name, listing
 * heads, line-CTA labels, cta button hrefs), the decorative subcategory tile
 * images, the styled cta title segment-runs, the brands-wall marquee brand list
 * (domains/hrefs/repeat counts), and cross-page anchor hrefs.
 *
 * Each entrance image is an OPTIONAL `upload`: empty → builder falls back to the
 * code-owned `/public` path (`resolveMediaUrl(slot) ?? codePath`).
 */
export const CatalogContent: GlobalConfig = {
  slug: 'catalog-content',
  label: 'Catalog Content',
  admin: {
    group: 'Content Pages',
  },
  hooks: {
    afterChange: [revalidateGlobal(CATALOG_CONTENT_TAG)],
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'What we distribute' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Catalog' },
        {
          name: 'intro',
          type: 'text',
          required: true,
          defaultValue:
            'Explore our two main product lines. For purchases, you’ll be redirected to our marketplace stores.',
        },
        { name: 'redirectNote', type: 'text', required: true, defaultValue: 'Buy on marketplaces' },
      ],
    },
    {
      name: 'entrancesHead',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Where to start' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Choose a product line' },
      ],
    },
    {
      name: 'entrances',
      type: 'group',
      fields: [
        // 🔴 flat entrance images — OPTIONAL uploads; empty → code-owned '/public' paths.
        { name: 'autoImage', type: 'upload', relationTo: 'media' },
        { name: 'healthImage', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'brands',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Trusted partners' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Brands we work with' },
        { name: 'autoCatLabel', type: 'text', required: true, defaultValue: 'Automotive & Motorcycle' },
        { name: 'healthCatLabel', type: 'text', required: true, defaultValue: 'Health & Wellness' },
      ],
    },
  ],
}
