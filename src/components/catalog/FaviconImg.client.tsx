'use client'

import { useEffect, useRef } from 'react'

/**
 * Brand / marketplace favicon (Story 5.2) — a leaf `'use client'` component that
 * renders the Google favicon service `<img>` (AD-11 — the ONLY sanctioned remote
 * asset) and, on load error, hides itself (`visibility:hidden`) so a broken
 * favicon never breaks the card layout (empty-state, per the I/O matrix). Ported
 * VERBATIM from the prototypes' `logoImg()` helper (Catalog.html ~line 1449).
 *
 * Used for the brand logo (`.pc-logo`) and each marketplace chip inside
 * `ProductCard`. `next/image` is deliberately NOT used — this is a tiny fixed-size
 * third-party favicon, so the `@next/next/no-img-element` lint is suppressed
 * per-line (same precedent as 5.1's `SubcatTile`).
 */
export default function FaviconImg({
  domain,
  className,
  size = 64,
}: {
  domain: string
  className?: string
  /** Google favicon `&sz=` (default 64). The brands marquee passes 128 for a
   *  sharper 34px logo; existing callers keep the 64 default unchanged. */
  size?: number
}) {
  const ref = useRef<HTMLImageElement>(null)
  // The SSR'd <img> can 404 BEFORE React hydration attaches `onError`, leaving a
  // broken icon visible (the prototype's native `onerror=` attribute caught this;
  // React's synthetic handler does not). On mount, hide any image that already
  // failed so the empty-state guard holds regardless of load timing.
  useEffect(() => {
    const img = ref.current
    if (img && img.complete && img.naturalWidth === 0) img.style.visibility = 'hidden'
  }, [])
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote favicon (AD-11); next/image adds no value for a 16px third-party icon
    <img
      ref={ref}
      className={className}
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`}
      alt=""
      onError={(e) => {
        e.currentTarget.style.visibility = 'hidden'
      }}
    />
  )
}
