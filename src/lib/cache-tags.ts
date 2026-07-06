/**
 * Canonical Next.js cache-tag constants — the SINGLE source of truth for the
 * strings consumed by BOTH `cacheTag(...)` in the `'use cache'` accessors AND
 * `revalidateTag(...)` in the Payload `afterChange` hooks (Story 7.4 / AD-10).
 *
 * PURE module by design: no imports, no `next/cache`, no `'use cache'`. This is
 * what lets it be imported from the `payload.config` graph (global configs) —
 * which runs under the Payload CLI, outside the Next compiler — without dragging
 * in `'use cache'`/`next/cache` and without a circular import through the
 * accessors (`accessor → @/lib/payload → @payload-config`).
 */
export const SITE_SETTINGS_TAG = 'site-settings'
export const HOME_CONTENT_TAG = 'home-content'
export const ABOUT_CONTENT_TAG = 'about-content'
export const CATALOG_CONTENT_TAG = 'catalog-content'
export const BRANDS_CONTENT_TAG = 'brands-content'
export const SHOPS_CONTENT_TAG = 'shops-content'
export const CONTACT_CONTENT_TAG = 'contact-content'
