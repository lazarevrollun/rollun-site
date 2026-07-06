import type { GlobalConfig } from 'payload'

import { BRANDS_CONTENT_TAG } from '../lib/cache-tags'
import { revalidateGlobal } from '../hooks/revalidate-global'

/**
 * BrandsContent — managed 🟡 editable TEXT and the 🔴 flat product/trademark
 * images of the Our Brands page (`/brands`, the OWN-brand MOTOTOU showcase — NOT
 * the `Brands` collection of Epic 8). Story 7.3 moves these slot values out of
 * the (formerly static) `content/brands.ts` into this Payload global. Parity via
 * `defaultValue` = exact Phase-1 literal (AD-7).
 *
 * Boundaries (AD-6): flat editable prose + the two product photos + the trademark
 * certificate image. Left CODE-OWNED: the `{dk,mb}` variants (product-block alt,
 * cta label case, note.pre), the legal trademark FACTS (registration no./date/
 * class/owner — static legal text), the brand logo text, all action button hrefs,
 * the flat paragraph bodies (kept in code with their block structure), and the
 * enlarge/caption microcopy.
 *
 * Each image is an OPTIONAL `upload`: empty → builder falls back to the
 * code-owned `/public` path (`resolveMediaUrl(slot) ?? codePath`).
 */
export const BrandsContent: GlobalConfig = {
  slug: 'brands-content',
  label: 'Brands Content',
  admin: {
    group: 'Content Pages',
  },
  hooks: {
    afterChange: [revalidateGlobal(BRANDS_CONTENT_TAG)],
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Private Label' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Our Brands' },
        {
          name: 'intro',
          type: 'text',
          required: true,
          defaultValue:
            'We build and grow brands with a long-term focus on quality and customer experience — not only distribution, but products we own and stand behind.',
        },
      ],
    },
    {
      name: 'brand',
      type: 'group',
      fields: [
        { name: 'status', type: 'text', required: true, defaultValue: 'In active development' },
        { name: 'h2', type: 'text', required: true, defaultValue: 'Mototou' },
        { name: 'sub', type: 'text', required: true, defaultValue: 'Motorcycle parts & accessories' },
      ],
    },
    {
      name: 'story',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Mototou' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Our story' },
        {
          name: 'lead',
          type: 'text',
          required: true,
          defaultValue:
            'MOTOTOU began with sourcing and manufacturing, focusing on accessibility and value for customers in the US. As the brand evolving, our priority shifting toward stronger standards and better control over production.',
        },
        {
          name: 'pull',
          type: 'text',
          required: true,
          defaultValue:
            'Our goal is simple: deliver products riders can install with confidence and use without doubt.',
        },
      ],
    },
    {
      name: 'products',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'What we make' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Our products' },
        // 🔴 flat product photos — OPTIONAL uploads; empty → code-owned '/public' paths.
        { name: 'reflectorsImage', type: 'upload', relationTo: 'media' },
        { name: 'filtersImage', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'trademark',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Registered & protected' },
        { name: 'title', type: 'text', required: true, defaultValue: 'A U.S. registered trademark' },
        // 🔴 certificate image — OPTIONAL upload; empty → code-owned '/mototou-trademark.png'.
        { name: 'certImage', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        {
          name: 'sub',
          type: 'text',
          required: true,
          defaultValue:
            "For distribution, retail partnership, or early access to new products — we'd love to hear from you.",
        },
      ],
    },
  ],
}
