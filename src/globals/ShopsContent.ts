import type { GlobalConfig } from 'payload'

import { SHOPS_CONTENT_TAG } from '../lib/cache-tags'
import { revalidateGlobal } from '../hooks/revalidate-global'

/**
 * ShopsContent — managed 🟡 editable TEXT and the 🔴 flat storefront photo of the
 * Our Shops page (`/shops`). Story 7.3 moves these slot values out of the
 * `content/shops.ts` builder into this Payload global. Parity via `defaultValue`
 * = exact Phase-1 literal (AD-7).
 *
 * Boundaries (AD-6): flat editable prose + the single storefront photo. Left
 * CODE-OWNED: the passport atoms (store hours/phone/address — owned by
 * `SiteSettings`, AD-14), the deliberate defects (`Houston,Texas` without a space,
 * the Conroe `directions.href` — AD-13), the `dk/mb` label pairs (city, directions,
 * card CTA, store-photo alt), and the marketplace store screenshots + ratings.
 *
 * The storefront photo is an OPTIONAL `upload`: empty → builder falls back to the
 * code-owned `/public` path (`resolveMediaUrl(slot) ?? '/shop/storefront-2.png'`).
 */
export const ShopsContent: GlobalConfig = {
  slug: 'shops-content',
  label: 'Shops Content',
  admin: {
    group: 'Content Pages',
  },
  hooks: {
    afterChange: [revalidateGlobal(SHOPS_CONTENT_TAG)],
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Where to buy' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Our stores' },
        {
          name: 'intro',
          type: 'text',
          required: true,
          defaultValue:
            'Visit us in person at our store in Texas, or shop the full Rollun catalog online across the marketplaces you trust.',
        },
      ],
    },
    {
      name: 'store',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'In person' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Visit our store in Texas' },
        {
          name: 'intro',
          type: 'text',
          required: true,
          defaultValue: 'Drop by our Texas location for parts, accessories, and friendly face-to-face support.',
        },
        { name: 'locationLabel', type: 'text', required: true, defaultValue: 'Location' },
        // 🔴 flat storefront photo — OPTIONAL upload; empty → code-owned '/shop/storefront-2.png'.
        { name: 'photo', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'shops',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Buy online' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Shop on marketplaces' },
        {
          name: 'intro',
          type: 'text',
          required: true,
          defaultValue: 'Same Rollun catalog, backed by thousands of verified ratings across major platforms.',
        },
      ],
    },
  ],
}
