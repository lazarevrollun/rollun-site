import type { CollectionConfig } from 'payload'

/**
 * Media — the SINGLE owner (NFR-4) of canonical image sizes and formats.
 *
 * On upload, sharp (wired via `buildConfig({ sharp })` in payload.config.ts)
 * slices every image into a fixed set of webp variants at the canonical widths
 * below. Those same widths are the ONE source of truth for image dimensions and
 * are mirrored into `next.config` `images.deviceSizes` / `imageSizes` — never a
 * second owner. The main uploaded file is itself re-encoded to webp.
 *
 * `alt` is required (a11y): every media-backed render through `next/image`
 * (the `MediaImage` primitive) carries meaningful alt text.
 *
 * No consumer exists in Story 7.2 by design — this is the foundation. Story 7.3
 * (Page Globals) is the first to reference Media docs and render them via
 * `MediaImage`.
 */

// Single quality knob for every webp variant + the main re-encoded file.
const WEBP_QUALITY = 80

// Canonical widths — the ONE source of truth, aligned with next.config images.
// Heights are intentionally left undefined so sharp preserves aspect ratio.
const webp = { format: 'webp' as const, options: { quality: WEBP_QUALITY } }

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    useAsTitle: 'alt',
  },
  access: {
    // Media files back PUBLIC page images (rendered via MediaImage / next/image),
    // so the served files must be publicly readable. Without this, Payload's
    // default read access (`Boolean(user)`) 403s the file endpoint and
    // `/_next/image` cannot optimize it. Write operations (create/update/delete)
    // keep Payload's auth-gated defaults; the admin/manager roles matrix is TBD
    // (Epic 8) and layers on top of this baseline public read.
    read: () => true,
  },
  upload: {
    staticDir: 'public/media',
    // Raster photo formats only. `image/*` would admit `image/svg+xml` (served
    // raw from the public file endpoint → stored-XSS if the SVG embeds script,
    // and next/image refuses SVG so it bypasses the webp pipeline entirely) and
    // animated GIF (silently collapsed to one frame on webp re-encode). Media
    // owns optimized raster variants — keep the accepted set to raster photos.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    focalPoint: true,
    // Re-encode the primary stored file to webp too, so Media owns the format.
    formatOptions: webp,
    imageSizes: [
      { name: 'thumbnail', width: 256, formatOptions: webp },
      { name: 'card', width: 640, formatOptions: webp },
      { name: 'wide', width: 1024, formatOptions: webp },
      { name: 'hero', width: 1600, formatOptions: webp },
      { name: 'hero2x', width: 2400, formatOptions: webp },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
