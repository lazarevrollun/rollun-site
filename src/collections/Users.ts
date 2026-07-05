import type { CollectionConfig } from 'payload'

/**
 * Minimal auth collection so Payload can boot and `/admin` can render the
 * login / first-user screen. Additional fields and collections are owned by
 * later stories.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    // `email` and `password` are added automatically by `auth: true`.
  ],
}
