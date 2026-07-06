import { cacheTag } from 'next/cache'

import { SITE_SETTINGS_TAG } from '@/lib/cache-tags'
import { getPayload } from '@/lib/payload'
import type { SiteSetting } from '@/payload-types'

/**
 * Canonical cache tag for the company passport. `getSiteSettings()` tags its
 * cached read with it, and Story 7.4's Payload `afterChange` hook
 * `revalidateTag(SITE_SETTINGS_TAG)` so a passport edit refreshes EVERY surface
 * (footer, contact panel, shops, home/about CTA, contact) at once (AD-10). The
 * constant now lives in the pure `@/lib/cache-tags` (single source of truth,
 * CLI-safe for the Payload config graph); re-exported here to preserve the
 * public export surface.
 */
export { SITE_SETTINGS_TAG }

/**
 * The SINGLE server-side accessor for the passport global (AD-12). Wrapped in
 * `'use cache'` + `cacheTag` so that — under `cacheComponents: true` — the pages
 * that read it stay statically prerenderable (a bare Payload read would opt them
 * into dynamic rendering) and so 7.4 can revalidate by tag.
 *
 * Only RSC / build-time code calls this; client islands receive the resolved
 * values through props and never fetch (AD-4/AD-12). For a never-saved global
 * Payload returns the `defaultValue`s, which are the exact Phase-1 literals.
 */
export async function getSiteSettings(): Promise<SiteSetting> {
  'use cache'
  cacheTag(SITE_SETTINGS_TAG)
  const payload = await getPayload()
  return payload.findGlobal({ slug: 'site-settings' })
}
