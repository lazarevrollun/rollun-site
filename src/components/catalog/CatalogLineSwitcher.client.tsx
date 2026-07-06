'use client'

/**
 * Catalog line switcher (Story 5.1) — a single leaf island (AD-1) that ENHANCES
 * the static SSR frame `ProductLines.tsx` rendered, never rewriting the DOM (same
 * precedent as Home's `ProductLineSwitcher` / `RevealOnScroll`). It renders NOTHING
 * (`return null`): all work happens in `useEffect`, so there is no hydration
 * mismatch and the SSR frame (`.lines-split` hidden, filter name "—") stands as the
 * pre-hydration / no-JS fallback.
 *
 * The `choose()` logic is ported VERBATIM from `Catalog.html` (~line 1580): it
 * toggles `solo` / `show-health` / `show-auto` on `.split-grid`, adds `.active` on
 * `.lines-split` (revealing the whole section), sets the `.cat-filter-name` text,
 * and (when the `scroll` flag is set) smooth-scrolls to `section.offsetTop − 60`.
 * The filter names come from content (`filter.names`) so wording lives in ONE place.
 *
 * Entrance clicks are intercepted (`preventDefault` + `choose(…, true)`, health if
 * the href contains 'health' else auto). `.cat-back` only smooth-scrolls back to
 * `.entrances` (offsetTop − 70) — it does NOT remove `.active` (VERBATIM: the line
 * stays chosen). On mount + `hashchange`, `#health` → `choose('health', false)` and
 * `#automotive` → `choose('auto', false)`; any other hash is ignored (the section
 * stays hidden).
 *
 * ALL selectors are scoped under `.catalog-dk` — the mobile composition is never
 * touched (its `.line` sections use native `#automotive`/`#health` anchor scroll).
 * The effect is keyed on `usePathname()` and its cleanup removes every listener.
 */
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function CatalogLineSwitcher({ names }: { names: { auto: string; health: string } }) {
  const pathname = usePathname()

  useEffect(() => {
    // Enhance-only — query the static desktop frame; never create/rewrite it.
    const section = document.querySelector<HTMLElement>('.catalog-dk .lines-split')
    if (!section) return
    const grid = section.querySelector<HTMLElement>('.split-grid')
    if (!grid) return
    const nameEl = section.querySelector<HTMLElement>('.cat-filter-name')
    const backBtn = section.querySelector<HTMLElement>('.cat-back')
    const entranceSection = document.querySelector<HTMLElement>('.catalog-dk .entrances')
    const entrances = Array.from(document.querySelectorAll<HTMLElement>('.catalog-dk .entrance'))

    const cleanups: Array<() => void> = []

    // Reduced-motion visitors get an instant jump instead of the animated scroll
    // (epic Accessibility Floor: `prefers-reduced-motion` disables page animations).
    // Read at call time so a mid-session preference change is honoured.
    const scrollBehavior = (): ScrollBehavior =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

    // VERBATIM from Catalog.html's `choose()` (names sourced from content).
    const choose = (cat: 'health' | 'auto', scroll: boolean) => {
      grid.classList.add('solo')
      grid.classList.remove('show-health', 'show-auto')
      grid.classList.add(cat === 'health' ? 'show-health' : 'show-auto')
      section.classList.add('active')
      if (nameEl) nameEl.textContent = cat === 'health' ? names.health : names.auto
      if (scroll) window.scrollTo({ top: section.offsetTop - 60, behavior: scrollBehavior() })
    }

    entrances.forEach((a) => {
      const onClick = (e: Event) => {
        e.preventDefault()
        const href = a.getAttribute('href') || ''
        choose(href.indexOf('health') >= 0 ? 'health' : 'auto', true)
      }
      a.addEventListener('click', onClick)
      cleanups.push(() => a.removeEventListener('click', onClick))
    })

    if (backBtn) {
      const onBack = () => {
        if (entranceSection) window.scrollTo({ top: entranceSection.offsetTop - 70, behavior: scrollBehavior() })
      }
      backBtn.addEventListener('click', onBack)
      cleanups.push(() => backBtn.removeEventListener('click', onBack))
    }

    // On mount + hashchange: reveal the deep-linked line without scrolling. An
    // unknown / empty hash is ignored — `.lines-split` stays hidden.
    const applyHash = () => {
      const h = location.hash
      if (h === '#health') choose('health', false)
      else if (h === '#automotive') choose('auto', false)
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    cleanups.push(() => window.removeEventListener('hashchange', applyHash))

    return () => cleanups.forEach((fn) => fn())
  }, [pathname, names])

  return null
}
