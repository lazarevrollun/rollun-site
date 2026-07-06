import Image from 'next/image'

import type { Media } from '@/payload-types'

/**
 * MediaImage — the ONLY sanctioned output path for media-backed images.
 *
 * Renders a populated Payload `Media` doc through `next/image`, resolving
 * `src`/`width`/`height`/`alt` from the doc so the browser gets an optimized
 * webp at the right width for its slot (`sizes` is required). This is the
 * foundation primitive; the first consumer is Story 7.3 (Page Globals).
 *
 * It never fetches: pass a POPULATED `Media` doc. A bare numeric id (unpopulated
 * relationship), null, undefined, or a doc missing a url/dimensions returns
 * `null` — never a broken `<img>`.
 *
 * This does NOT touch Phase-1 `/public` `<img>` surfaces or the hero mosaic;
 * those remain their intentional `<img>` / `background-image` convention until
 * their content moves onto Media (Story 7.3+).
 */
type MediaImageProps = {
  media: Media | number | null | undefined
  /** Required: describes the slot's rendered width across breakpoints. */
  sizes: string
  className?: string
  priority?: boolean
  /** When true, renders with `fill` (parent must be positioned). */
  fill?: boolean
}

export function MediaImage({ media, sizes, className, priority, fill }: MediaImageProps) {
  // Unpopulated (numeric id), null, or undefined → render nothing.
  if (!media || typeof media === 'number') return null

  const { url, width, height, alt, focalX, focalY } = media
  if (!url) return null

  if (fill) {
    // A `fill` image cover-crops to its box, so honour the editor's focal point
    // (Media's `focalPoint: true` persists focalX/focalY as 0–100 percentages).
    // Only set object-position when a focal point exists — otherwise leave it to
    // CSS (default center). No crop happens in the fixed-size branch below, so
    // focal point is irrelevant there.
    const objectPosition =
      typeof focalX === 'number' && typeof focalY === 'number'
        ? `${focalX}% ${focalY}%`
        : undefined
    return (
      <Image
        src={url}
        alt={alt ?? ''}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
        style={objectPosition ? { objectPosition } : undefined}
      />
    )
  }

  // Fixed layout needs intrinsic dimensions from the doc.
  if (typeof width !== 'number' || typeof height !== 'number') return null

  return (
    <Image
      src={url}
      alt={alt ?? ''}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  )
}
