import configPromise from '@payload-config'
import { getPayload as getPayloadInstance } from 'payload'

/**
 * Memoized Payload local-API accessor. Returns a singleton Payload instance
 * that RSCs / Server Actions can use to read content in-process (AD-12).
 * `getPayload` from `payload` already caches per-config, so this is a thin,
 * typed wrapper that keeps the import surface small for the rest of the app.
 */
export const getPayload = async () => {
  return getPayloadInstance({ config: configPromise })
}
