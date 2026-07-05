'use client'

/**
 * Hero mosaic bloom (Story 3.2) — a single leaf island (AD-1) that ENHANCES the
 * static SSR frame Story 3.1 rendered in `Hero.tsx`, never rewriting the DOM
 * (same precedent as `RevealOnScroll`). It renders NOTHING (`return null`): all
 * work happens in `useEffect`, so there is no hydration mismatch and the SSR
 * frame (desktop `LIT_DESKTOP` + muted mobile tiles) stands as the pre-hydration
 * / no-JS / reduced-motion fallback.
 *
 * Two prototype scripts are ported here (`Home.html` desktop, `Home Mobile.html`
 * mobile). Both compositions SSR into one DOM; only the CSS `@media` at 768px
 * picks the visible one (AD-3 / NFR-2 — no JS width-gating of markup). This
 * island DOES read `matchMedia('(min-width:768px)')` at RUNTIME to decide which
 * composition to *animate* (driving a `display:none` grid would read zero rects
 * from `getBoundingClientRect`), and re-evaluates on the media `change` event —
 * exactly the runtime pattern `Header.client`/`ContactModal.client` use.
 *
 * Art-direction invariant (AD): exactly one hero photo set loads per viewport.
 * The mobile bloom overlay is a `background-image` div — NOT an `<img>` (a
 * deliberate divergence from the prototype, mirroring Story 3.1's tiles) — and
 * is created only on the mobile branch, so the hidden desktop composition never
 * fetches the mobile hero set. It reuses the same `mosaicMobile` sources as the
 * mobile tiles, so no extra downloads.
 *
 * `prefers-reduced-motion: reduce` → NO interval/timeout runs at all: the
 * desktop keeps its SSR `.lit` frame; the mobile shows the feature statically
 * expanded on the first photo. A CSS `@media (prefers-reduced-motion)` block in
 * `home.css` backs this up (drops transitions / pins the feature).
 *
 * The effect is keyed on `usePathname()` (like `RevealOnScroll`) and its cleanup
 * clears every interval/timeout, drops the resize/motion listeners, and removes
 * the injected `.mosaic-feature` — so SPA navigation leaves nothing running.
 */
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import type { HomeMosaicPhoto } from '@/content/home'

/** Mobile bloom timings (ms) — verbatim from `Home Mobile.html`. */
const MOVE = 1000
const HOLD = 3200
const GAP = 800
/** Initial delay before the first mobile bloom (prototype `setTimeout(run, 400)`). */
const MOBILE_START_DELAY = 400
/** Desktop refresh interval (`Home.html` `setInterval(cycle, 3000)`). */
const DESKTOP_INTERVAL = 3000

/** Fisher-Yates in place — the prototype's `shuffle`. */
function shuffle(arr: number[]): number[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

type Teardown = () => void

export default function HeroMosaic({
  mosaicDesktop,
  mosaicMobile,
}: {
  mosaicDesktop: HomeMosaicPhoto[]
  mosaicMobile: HomeMosaicPhoto[]
}) {
  const pathname = usePathname()

  useEffect(() => {
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const wideMq = window.matchMedia('(min-width: 768px)')

    // ── Desktop: toggle `.lit` on ~25% of the existing tiles every 3s. The CSS
    // 1.6s transition on `.home-dk .mosaic-tile` does the actual cross-fade —
    // this only flips the class. `total` is driven by the content set that
    // produced the SSR tiles (both are 8). ──
    function startDesktopBloom(): Teardown {
      const tiles = Array.from(
        document.querySelectorAll<HTMLElement>('.home-dk .mosaic-tile'),
      )
      const total = mosaicDesktop.length
      if (total === 0 || tiles.length === 0) return () => {}
      const litCount = Math.max(1, Math.round(total * 0.25))

      const cycle = () => {
        const lit = new Set(shuffle([...Array(total).keys()]).slice(0, litCount))
        tiles.forEach((t, i) => t.classList.toggle('lit', lit.has(i)))
      }

      cycle() // first cycle immediately, then on interval
      const id = window.setInterval(cycle, DESKTOP_INTERVAL)
      return () => window.clearInterval(id)
    }

    // ── Mobile: a single colour `.mosaic-feature` blooms out of each tile to the
    // full grid, holds, recedes, fades, then the next photo — round-robin. ──
    function startMobileBloom(): Teardown {
      const grid = document.querySelector<HTMLElement>('.home-mb .mosaic-grid')
      if (!grid) return () => {}
      const tiles = Array.from(grid.querySelectorAll<HTMLElement>('.mosaic-tile'))
      const count = Math.min(tiles.length, mosaicMobile.length)
      if (count === 0) return () => {}

      const feature = document.createElement('div')
      feature.className = 'mosaic-feature'
      feature.setAttribute('aria-hidden', 'true')
      grid.appendChild(feature)

      const timers = new Set<number>()
      let raf = 0

      // translate+scale that snaps the full-grid feature onto tile `t`.
      const tileTransform = (t: HTMLElement) => {
        const g = grid.getBoundingClientRect()
        const r = t.getBoundingClientRect()
        return `translate(${r.left - g.left}px,${r.top - g.top}px) scale(${
          r.width / g.width
        },${r.height / g.height})`
      }

      const bloom = (i: number) => {
        const t = tiles[i]
        // Snap onto the tile with no transition, then expand next frame.
        feature.style.backgroundImage = `url('${mosaicMobile[i].src}')`
        feature.style.transformOrigin = 'top left'
        feature.style.transition = 'none'
        feature.style.transform = tileTransform(t)
        feature.style.opacity = '1'
        raf = window.requestAnimationFrame(() => {
          raf = window.requestAnimationFrame(() => {
            feature.style.transition = `transform ${MOVE}ms cubic-bezier(.4,0,.2,1), opacity .5s ease`
            feature.style.transform = 'translate(0px,0px) scale(1,1)'
          })
        })
        // After the hold, recede back onto the tile, then fade out.
        const recede = window.setTimeout(() => {
          feature.style.transform = tileTransform(t)
          const fade = window.setTimeout(() => {
            feature.style.opacity = '0'
          }, MOVE - 250)
          timers.add(fade)
        }, MOVE + HOLD)
        timers.add(recede)
      }

      let idx = 0
      const run = () => {
        bloom(idx)
        idx = (idx + 1) % count
        const next = window.setTimeout(run, MOVE + HOLD + MOVE + GAP)
        timers.add(next)
      }
      const start = window.setTimeout(run, MOBILE_START_DELAY)
      timers.add(start)

      return () => {
        timers.forEach((id) => window.clearTimeout(id))
        timers.clear()
        window.cancelAnimationFrame(raf)
        feature.remove()
      }
    }

    // ── Reduced motion: mobile shows the feature statically expanded on the
    // first photo; desktop keeps its SSR `.lit` frame (no work needed). No
    // timers of any kind run. ──
    function showMobileStatic(): Teardown {
      const grid = document.querySelector<HTMLElement>('.home-mb .mosaic-grid')
      if (!grid || mosaicMobile.length === 0) return () => {}
      const feature = document.createElement('div')
      feature.className = 'mosaic-feature'
      feature.setAttribute('aria-hidden', 'true')
      feature.style.backgroundImage = `url('${mosaicMobile[0].src}')`
      feature.style.opacity = '1' // full grid = identity transform (unset)
      grid.appendChild(feature)
      return () => feature.remove()
    }

    // Drive ONLY the currently-visible composition, gated by the reduced-motion
    // + viewport media queries.
    let teardown: Teardown = () => {}
    const setup = () => {
      const reduced = motionMq.matches
      const desktop = wideMq.matches
      if (desktop) {
        teardown = reduced ? () => {} : startDesktopBloom()
      } else {
        teardown = reduced ? showMobileStatic() : startMobileBloom()
      }
    }

    // On a breakpoint / motion-preference change: tear the current animation
    // down (clears timers, removes the injected feature) and set up the
    // now-active composition afresh.
    const reevaluate = () => {
      teardown()
      teardown = () => {}
      setup()
    }

    setup()
    wideMq.addEventListener('change', reevaluate)
    motionMq.addEventListener('change', reevaluate)

    return () => {
      teardown()
      wideMq.removeEventListener('change', reevaluate)
      motionMq.removeEventListener('change', reevaluate)
    }
  }, [pathname, mosaicDesktop, mosaicMobile])

  return null
}
