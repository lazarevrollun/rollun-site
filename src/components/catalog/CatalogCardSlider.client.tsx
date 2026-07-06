'use client'

/**
 * Catalog card image slider (Story 5.2) — a single leaf island (AD-1) that
 * ENHANCES the server-rendered `ProductCard`s, never creating/rewriting markup
 * (same precedent as `CatalogLineSwitcher`). It renders NOTHING (`return null`):
 * all work happens in `useEffect`, so there is no hydration mismatch and the SSR
 * cards (slide 0 visible, dot 0 `.active`) are the pre-hydration / no-JS state.
 *
 * The `go()` logic is ported VERBATIM from both prototypes' `cardEl()`:
 *   `i=(k+n)%n; track.style.transform='translateX('+(-i*100)+'%)';`
 *   `dots.forEach((d,di)=>d.classList.toggle('active',di===i))`
 * Desktop cards (`.catalog-dk .product-card`) wire the `.pc-arrow.prev/.next`
 * clicks (prev→go(i-1), next→go(i+1)) with `e.stopPropagation()` so an arrow click
 * never bubbles to the (future 5.4) card handler. Mobile cards
 * (`.catalog-mb .product-card`) wire a passive touch-swipe on `.pc-media` with a
 * 36px threshold (dx<0→next, dx>0→prev). No autoplay (the transition is
 * user-initiated only). The effect is keyed on `usePathname()`; cleanup removes
 * every listener.
 */
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function CatalogCardSlider() {
  const pathname = usePathname()

  useEffect(() => {
    const cleanups: Array<() => void> = []

    // Enhance ONE already-rendered card. `mode` picks arrows (dk) vs swipe (mb).
    const wire = (card: HTMLElement, mode: 'dk' | 'mb') => {
      const track = card.querySelector<HTMLElement>('.pc-track')
      const dots = Array.from(card.querySelectorAll<HTMLElement>('.pc-dot'))
      if (!track || dots.length === 0) return
      const n = dots.length
      let i = 0
      // VERBATIM from the prototypes' cardEl().
      const go = (k: number) => {
        i = (k + n) % n
        track.style.transform = `translateX(${-i * 100}%)`
        dots.forEach((d, di) => d.classList.toggle('active', di === i))
      }

      if (mode === 'dk') {
        const prev = card.querySelector<HTMLElement>('.pc-arrow.prev')
        const next = card.querySelector<HTMLElement>('.pc-arrow.next')
        if (prev) {
          const onPrev = (e: Event) => {
            e.stopPropagation()
            go(i - 1)
          }
          prev.addEventListener('click', onPrev)
          cleanups.push(() => prev.removeEventListener('click', onPrev))
        }
        if (next) {
          const onNext = (e: Event) => {
            e.stopPropagation()
            go(i + 1)
          }
          next.addEventListener('click', onNext)
          cleanups.push(() => next.removeEventListener('click', onNext))
        }
      } else {
        const media = card.querySelector<HTMLElement>('.pc-media')
        if (!media) return
        let sx = 0
        let dx = 0
        let sw = false
        const onStart = (e: TouchEvent) => {
          sx = e.touches[0].clientX
          dx = 0
          sw = true
        }
        const onMove = (e: TouchEvent) => {
          if (sw) dx = e.touches[0].clientX - sx
        }
        const onEnd = () => {
          if (sw && Math.abs(dx) > 36) go(dx < 0 ? i + 1 : i - 1)
          sw = false
        }
        media.addEventListener('touchstart', onStart, { passive: true })
        media.addEventListener('touchmove', onMove, { passive: true })
        media.addEventListener('touchend', onEnd)
        cleanups.push(() => {
          media.removeEventListener('touchstart', onStart)
          media.removeEventListener('touchmove', onMove)
          media.removeEventListener('touchend', onEnd)
        })
      }
    }

    document.querySelectorAll<HTMLElement>('.catalog-dk .product-card').forEach((c) => wire(c, 'dk'))
    document.querySelectorAll<HTMLElement>('.catalog-mb .product-card').forEach((c) => wire(c, 'mb'))

    return () => cleanups.forEach((fn) => fn())
  }, [pathname])

  return null
}
