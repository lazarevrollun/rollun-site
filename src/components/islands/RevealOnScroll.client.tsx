'use client'

/**
 * Reveal-on-scroll chassis (Story 1.5) — a single leaf island (AD-1) mounted
 * once in `(site)/layout.tsx` and reused by all 6 routes. It renders NOTHING
 * (`return null`): its only job is to add `.in` to every `.reveal` element as it
 * scrolls into view, driving the CSS fade/rise defined in `shell.css` (UX-DR17).
 *
 * This reconciles the prototype's per-composition scripts into one place: the
 * mobile shell used threshold `0.1` (mobile.js:27), Home.html desktop `0.12`,
 * and About Us.html `0.25` plus a 1.5s desktop fallback (About Us.html:1735,1745).
 *
 * `matchMedia` is read ONLY inside the effect, and ONLY to pick the observer
 * threshold — it never chooses rendered markup, so there is no hydration
 * mismatch (the NFR-2/AD-3 ban is on width-gating the composition, not on
 * reading the viewport to tune a runtime observer).
 *
 * The observer is re-created on every `pathname` change so freshly-mounted
 * sections on the new route get observed; cleanup disconnects it (and clears the
 * desktop fallback timer) to avoid leaks across navigations.
 */
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function RevealOnScroll() {
  const pathname = usePathname()

  useEffect(() => {
    // Silently skip on browsers without IntersectionObserver (the CSS leaves
    // `.reveal` at opacity:0 until forced — but the desktop fallback below and
    // reduced-motion still cover the common cases). Matches About Us.html:2633.
    if (!('IntersectionObserver' in window)) return

    const isMobile = window.matchMedia('(max-width: 767.98px)').matches
    // Threshold per route/viewport. Mobile is a SINGLE shared behavior in the
    // prototype (mobile.js ships threshold 0.1 to every mobile page, About
    // included), so `isMobile` wins first; About's 0.25 is a DESKTOP-only value
    // (About Us.html:1735). `/about/`-boundary match avoids catching siblings.
    const isAbout = pathname === '/about' || pathname.startsWith('/about/')
    const threshold = isMobile ? 0.1 : isAbout ? 0.25 : 0.12

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold },
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))

    // Desktop-only 1.5s fallback (About Us.html:1745-1750): force any still-hidden
    // reveal that is already within the viewport. The mobile script has no fallback.
    let t: number | undefined
    if (!isMobile) {
      t = window.setTimeout(() => {
        document.querySelectorAll('.reveal:not(.in)').forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in')
        })
      }, 1500)
    }

    return () => {
      io.disconnect()
      if (t !== undefined) clearTimeout(t)
    }
  }, [pathname])

  return null
}
