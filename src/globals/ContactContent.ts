import type { GlobalConfig } from 'payload'

import { CONTACT_CONTENT_TAG } from '../lib/cache-tags'
import { revalidateGlobal } from '../hooks/revalidate-global'

/**
 * ContactContent — managed 🟡 editable TEXT of the Contact page (`/contact`) Hero
 * (01) and Map (03) section headings. Story 7.3 moves these slot values out of
 * the `content/contact.ts` builder into this Payload global. Parity via
 * `defaultValue` = exact Phase-1 literal (AD-7).
 *
 * Boundaries (AD-6): ONLY the flat section headings/eyebrows. Left CODE-OWNED:
 * the passport-composed hero intro sentence (code prose + `SiteSettings` hours,
 * AD-14), the map tab labels + passport-composed addresses, and the deliberate
 * `initialSrc` typo literal (`53%2F27…` ≠ tab[0].q — AD-13). The inline form/info
 * card (`ContactInline`) keeps its own content atoms and is untouched here.
 */
export const ContactContent: GlobalConfig = {
  slug: 'contact-content',
  label: 'Contact Content',
  admin: {
    group: 'Content Pages',
  },
  hooks: {
    afterChange: [revalidateGlobal(CONTACT_CONTENT_TAG)],
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Get in touch' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Contact us' },
      ],
    },
    {
      name: 'map',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Find us' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Our locations' },
      ],
    },
  ],
}
