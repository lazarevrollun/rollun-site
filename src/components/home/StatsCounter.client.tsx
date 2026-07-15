'use client'

/**
 * Stats count-up (Story 3.4) — a single leaf island (AD-1) that ENHANCES the
 * static SSR frame Story 3.1 rendered in `Stats.tsx`, never rewriting the DOM
 * (same precedent as `RevealOnScroll` / `HeroMosaic` / `ProductLineSwitcher`). It
 * renders NOTHING (`return null`): all work happens in `useEffect`, so there is
 * no hydration mismatch and the SSR frame (each `.stat-value` already showing its
 * FINAL value — `2015`, `12`, `80,000`, `30%`) stands as the pre-hydration /
 * no-JS / reduced-motion fallback.
 *
 * The `fmt` / `animate` count-up and the IntersectionObserver (threshold 0.4,
 * once-only via `data-done`) are ported VERBATIM from `Home.html` (~lines
 * 1349-1381): `dur=1800`, cubic ease-out `1 - (1 - p)^3`, `fmt(final*eased) +
 * suffix`, driven by `requestAnimationFrame`. `data-final` / `data-suffix` /
 * `data-format` are read straight off the SSR markup — the island never guesses.
 *
 * When motion is allowed the island resets every `.stats .stat-value` to `0` on
 * mount (like `HeroMosaic` mutes its tiles), then counts each element up to its
 * target when it scrolls into view (AC: "before the trigger the final value is
 * not shown"). The Stats section sits below the fold, so the brief SSR-final → `0`
 * swap is never seen. Both compositions (`.home-dk` / `.home-mb`) share one DOM;
 * the hidden one (`offsetParent === null`) is skipped and simply stays at `0`
 * until a 768px resize lays it out, at which point the resize handler counts it up.
 *
 * The trigger is DELIBERATELY belt-and-braces: an `IntersectionObserver` is the
 * primary path, but it can miss (iOS Safari quirks; the section already in view at
 * mount after an SPA nav), which used to leave the counters frozen at `0`. So a
 * geometry check also runs on mount and on every passive scroll/resize; whichever
 * fires first wins and a `data-done` flag keeps each count-up single-shot. The
 * numbers can therefore never get stuck at `0` while motion is allowed.
 *
 * If `prefers-reduced-motion: reduce`, the island does NOTHING (no reset, no
 * animation) so the SSR final frame is shown immediately — the no-JS fallback too.
 *
 * The effect is keyed on `usePathname()` (like the sibling islands) and its
 * cleanup disconnects the observer — so SPA navigation leaves nothing running.
 */
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Round + format the running value — VERBATIM from `Home.html`'s `fmt`. */
function fmt(n: number, format: string): string {
  const rounded = Math.round(n)
  return format === 'comma' ? rounded.toLocaleString('en-US') : String(rounded)
}

export default function StatsCounter() {
  const pathname = usePathname()

  useEffect(() => {
    // Reduced motion → do nothing so the SSR final frame stays visible (matches
    // `Home.html:1378` guard + the reduced-motion rule). Everything else counts up;
    // a missing IntersectionObserver is fine — the scroll fallback below covers it.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Reset each counter to `0` (below the fold — never seen), then count up when
    // it enters view. Both compositions are queried; the hidden one stays at `0`.
    const values = Array.from(
      document.querySelectorAll<HTMLElement>('.stats .stat-value'),
    )
    if (values.length === 0) return
    values.forEach((el) => {
      el.textContent = '0'
    })

    // Track every in-flight rAF so cleanup can cancel it (sibling islands clear
    // all their timers on teardown); `stopped` also halts a tick that already
    // queued its next frame, so unmount/re-run never writes to a stale node.
    const frames = new Set<number>()
    let stopped = false

    // Count `el` from 0 to its `data-final` over 1800ms — count-up math ported
    // VERBATIM from `Home.html`'s `animate` (dur, cubic ease-out, fmt + suffix).
    const animate = (el: HTMLElement) => {
      const final = parseFloat(el.dataset.final ?? '')
      const format = el.dataset.format || 'plain'
      const suffix = el.dataset.suffix || ''
      const dur = 1800
      const start = performance.now()
      const tick = (t: number) => {
        if (stopped) return
        const p = Math.min(1, (t - start) / dur)
        const eased = 1 - Math.pow(1 - p, 3)
        el.textContent = fmt(final * eased, format) + suffix
        if (p < 1) frames.add(requestAnimationFrame(tick))
      }
      frames.add(requestAnimationFrame(tick))
    }

    // Play exactly once per element (`data-done`), and only for the composition
    // that is actually laid out (`offsetParent` is null for the display:none twin).
    const fire = (el: HTMLElement) => {
      if (stopped || el.dataset.done || el.offsetParent === null) return
      el.dataset.done = '1'
      animate(el)
    }

    // Robust trigger: an IntersectionObserver is the primary path, but it can miss
    // — notably on iOS Safari, and when the section is already in view at mount
    // (SPA nav from another page). So ALSO check geometry directly on mount and on
    // every scroll/resize. Whichever notices first wins; `fire`'s `data-done` guard
    // keeps it single-shot. This guarantees the numbers can never stay stuck at 0.
    const inView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      return r.bottom > 0 && r.top < vh * 0.85
    }
    const scan = () => values.forEach((el) => inView(el) && fire(el))

    let io: IntersectionObserver | null = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) fire(e.target as HTMLElement)
          }),
        { threshold: 0.4 },
      )
      values.forEach((el) => io!.observe(el))
    }

    // Initial geometry check (rAF so layout has settled), then a scroll/resize
    // fallback for everything the observer doesn't catch. Passive = no scroll jank.
    frames.add(requestAnimationFrame(scan))
    window.addEventListener('scroll', scan, { passive: true })
    window.addEventListener('resize', scan, { passive: true })

    return () => {
      stopped = true
      frames.forEach((id) => cancelAnimationFrame(id))
      io?.disconnect()
      window.removeEventListener('scroll', scan)
      window.removeEventListener('resize', scan)
    }
  }, [pathname])

  return null
}
