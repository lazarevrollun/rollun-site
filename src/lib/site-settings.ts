import { cacheTag } from 'next/cache'

import { getPayload } from '@/lib/payload'
import type { SiteSetting } from '@/payload-types'

/**
 * Canonical cache tag for the company passport. `getSiteSettings()` tags its
 * cached read with it, and Story 7.4's Payload `afterChange` hook will
 * `revalidateTag(SITE_SETTINGS_TAG)` so a passport edit refreshes EVERY surface
 * (footer, contact panel, shops, home/about CTA, contact) at once (AD-10).
 */
export const SITE_SETTINGS_TAG = 'site-settings'

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
