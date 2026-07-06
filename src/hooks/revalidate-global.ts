import { revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

/**
 * Factory for a Payload Global `afterChange` hook that revalidates the Global's
 * canonical Next.js cache tag on every admin save (Story 7.4 / AD-10, AD-12).
 *
 * Runs IN-PROCESS: a single Next.js runtime serves both `/admin` and the public
 * site, so the hook calls `revalidateTag` directly — no HTTP webhook or secret.
 * This is the ONLY point that imports `next/cache` `revalidateTag`; the import is
 * CLI-safe because CLI commands (`generate:types`/`migrate`) never write a
 * document through the hook, so `revalidateTag` is never called by them.
 *
 * Guard: programmatic writes (seeds/tests) set `req.context.disableRevalidate`
 * to skip revalidation and avoid throwing "revalidateTag called outside a
 * request scope". A normal admin edit has no flag → revalidation runs.
 */
export const revalidateGlobal =
  (tag: string): GlobalAfterChangeHook =>
  ({ doc, req: { payload, context } }) => {
    if (!context?.disableRevalidate) {
      payload.logger.info(`revalidate tag "${tag}"`)
      // Next 16.2 (cacheComponents) requires the cache-profile arg; `'max'` is the
      // Next-recommended value: it marks every entry carrying this tag stale across
      // ALL pages that use it (stale-while-revalidate — fresh content regenerates on
      // the next visit, not a blocking purge), which is the on-demand invalidation
      // this story needs. The single-arg form is deprecated AND a type error under
      // the required-arg signature.
      revalidateTag(tag, 'max')
    }
    return doc
  }
