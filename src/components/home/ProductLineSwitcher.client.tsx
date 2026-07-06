'use client'

/**
 * Product-line switcher (Story 3.3) — a single leaf island (AD-1) that ENHANCES
 * the static SSR frame Story 3.1 rendered in `ProductLines.tsx`, never rewriting
 * the DOM (same precedent as `RevealOnScroll` / `HeroMosaic`). It renders NOTHING
 * (`return null`): all work happens in `useEffect`, so there is no hydration
 * mismatch and the SSR frame (slide 0 `active`, dot #1 `active`) stands as the
 * pre-hydration / no-JS / reduced-motion fallback.
 *
 * The `setActive` toggling is ported VERBATIM from `Home.html` (the desktop
 * `.line-stack` carousel script, ~lines 1432-1455): clicking a numbered dot
 * cross-fades to that slide by flipping `active`/`prev`/`next` classes — NO
 * auto-rotation, NO timers. Reduced-motion is respected purely in CSS (the
 * `.home-dk .line-slide { transition: none }` block in `home.css`); the manual
 * switch itself keeps working.
 *
 * Beyond the prototype, state is mirrored to the URL hash (UX-DR11) with the
 * namespaced format `#line-<key>-<n>` (n is 1-based) to avoid colliding with the
 * Catalog deep-links (`#automotive`/`#health`) and the `id="lines"` section.
 * Writes go through `history.replaceState` (no scroll jump, no history spam);
 * mount + `hashchange` read it back and restore the referenced line's slide (an
 * invalid / unknown hash is ignored → the default slide 0 stands). Both carousels
 * are independent — the hash reflects the LAST interaction and only that line is
 * restored on load.
 *
 * Mobile is untouched: `.home-mb .line-shelf` stays a pure CSS scroll-snap shelf,
 * this island only ever queries `.home-dk` nodes.
 *
 * The effect is keyed on `usePathname()` (like `RevealOnScroll`) and its cleanup
 * removes every `click` listener and the `hashchange` listener — so SPA
 * navigation leaves nothing running.
 */
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

type LineConfig = { key: string; count: number }

/** Toggle slide-position + dot classes — VERBATIM from `Home.html`'s `setActive`. */
function setActive(slides: HTMLElement[], buttons: HTMLElement[], i: number) {
  const total = slides.length
  slides.forEach((s, idx) => {
    s.classList.remove('active', 'prev', 'next')
    const diff = (idx - i + total) % total
    if (diff === 0) s.classList.add('active')
    else if (diff === total - 1) s.classList.add('prev')
    else if (diff === 1) s.classList.add('next')
  })
  buttons.forEach((b, idx) => {
    const on = idx === i
    b.classList.toggle('active', on)
    b.setAttribute('aria-pressed', on ? 'true' : 'false')
  })
}

export default function ProductLineSwitcher({ lines }: { lines: LineConfig[] }) {
  const pathname = usePathname()

  useEffect(() => {
    // Per line: the ordered slides + numbered dot buttons inside the desktop
    // `.line-block`. Enhance-only — never create/rewrite this markup.
    const carousels = new Map<string, { slides: HTMLElement[]; buttons: HTMLElement[] }>()
    const cleanups: Array<() => void> = []

    lines.forEach(({ key }) => {
      const stack = document.querySelector<HTMLElement>(`.home-dk [data-line="${key}"] .line-stack`)
      if (!stack) return
      const block = stack.closest<HTMLElement>('.line-block')
      const slides = Array.from(stack.querySelectorAll<HTMLElement>('.line-slide'))
      const buttons = Array.from(
        block?.querySelectorAll<HTMLElement>('.line-dots button') ?? [],
      )
      if (slides.length === 0) return
      carousels.set(key, { slides, buttons })

      buttons.forEach((b) => {
        const onClick = () => {
          const i = parseInt(b.dataset.i ?? '', 10)
          if (Number.isNaN(i)) return
          setActive(slides, buttons, i)
          history.replaceState(null, '', `#line-${key}-${i + 1}`)
        }
        b.addEventListener('click', onClick)
        cleanups.push(() => b.removeEventListener('click', onClick))
      })
    })

    // Restore the slide named in the hash (`#line-<key>-<n>`, n 1-based). An
    // invalid value or unknown line is ignored — the default slide 0 stands.
    const applyHash = () => {
      const m = /^#line-([a-z]+)-(\d+)$/.exec(location.hash)
      if (!m) return
      const key = m[1]
      const config = lines.find((l) => l.key === key)
      const carousel = carousels.get(key)
      if (!config || !carousel) return
      const n = parseInt(m[2], 10)
      if (n < 1 || n > config.count) return
      setActive(carousel.slides, carousel.buttons, n - 1)
    }

    applyHash()
    window.addEventListener('hashchange', applyHash)
    cleanups.push(() => window.removeEventListener('hashchange', applyHash))

    return () => cleanups.forEach((fn) => fn())
  }, [pathname, lines])

  return null
}
