import { cacheTag } from 'next/cache'

import { CATALOG_CONTENT_TAG } from '@/lib/cache-tags'
import { getPayload } from '@/lib/payload'
import type { CatalogContent } from '@/payload-types'

/**
 * Canonical cache tag for the Catalog page content global. `getCatalogContent()`
 * tags its cached read with it; Story 7.4's Payload `afterChange` hook
 * `revalidateTag(CATALOG_CONTENT_TAG)` so an edit refreshes `/catalog` (AD-10).
 * The constant lives in the pure `@/lib/cache-tags` (single source of truth,
 * CLI-safe); re-exported here to preserve the public export surface.
 */
export { CATALOG_CONTENT_TAG }

/**
 * The SINGLE server-side accessor for the Catalog content global (AD-12). Wrapped
 * in `'use cache'` + `cacheTag` so `/catalog` stays statically prerenderable under
 * `cacheComponents: true` and 7.4 can revalidate by tag. Only RSC/build-time code
 * calls this. A never-saved global returns the `defaultValue`s = exact Phase-1
 * literals, so the first build is pixel-identical.
 */
export async function getCatalogContent(): Promise<CatalogContent> {
  'use cache'
  cacheTag(CATALOG_CONTENT_TAG)
  const payload = await getPayload()
  // Explicit depth: the entrance image slots are `upload` relationships; the
  // builder's `resolveMediaUrl` only yields a URL from a POPULATED `Media` doc, so
  // pin depth here rather than rely on Payload's default depth staying at 2.
  return payload.findGlobal({ slug: 'catalog-content', depth: 2 })
}
