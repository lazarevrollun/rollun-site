'use client'

/**
 * Catalog brand "fly to center" spotlight (Story 5.5) — a leaf `'use client'`
 * island that renders NOTHING (`return null`) and only ENHANCES the desktop
 * marquee: on click, a clicked `.logo-tile` flies from its origin geometry to a
 * centered card over a dimmed backdrop (Automotive → "Trusted partner brand",
 * Health → a "Visit website" external link).
 *
 * Ported VERBATIM (imperative DOM, same as the prototype) from Catalog.html JS
 * ~1250-1338: it creates the `.logo-spot` + `.ls-fly` overlay on `document.body`,
 * captures `getBoundingClientRect`, forces a reflow, then transitions to center.
 * Because the overlay lives on `document.body`, its CSS (`.logo-spot`/`.ls-*`) is
 * GLOBAL, not scoped under `.catalog-*` (see catalog.css).
 *
 * SCOPED to `.catalog-dk .logo-tile` (desktop only): both compositions are in the
 * DOM (AD-3), so scoping keeps the hidden desktop subtree from double-binding and
 * leaves the mobile tiles inert (the mobile prototype has no spotlight). The effect
 * cleanup removes EVERY listener it added and the overlay itself, so nothing leaks
 * on unmount / navigation. The `.ls-visit` link must navigate — a click on it does
 * NOT close first (handled by the `!target.closest('.ls-visit')` guard).
 */
import { useEffect } from 'react'

export default function BrandSpotlight() {
  useEffect(() => {
    // Desktop-only: enhance ONLY the visible desktop composition's tiles.
    const tiles = Array.from(document.querySelectorAll<HTMLElement>('.catalog-dk .logo-tile'))
    if (!tiles.length) return

    const spot = document.createElement('div')
    spot.className = 'logo-spot'
    spot.innerHTML = '<div class="ls-backdrop"></div>'
    document.body.appendChild(spot)
    const backdrop = spot.querySelector('.ls-backdrop') as HTMLElement

    let fly: HTMLDivElement | null = null
    let originRect: { top: number; left: number; width: number; height: number } | null = null

    const close = () => {
      if (!fly) return
      const f = fly
      fly = null
      f.classList.remove('zoomed')
      // animate back to origin
      if (originRect) {
        f.style.top = originRect.top + 'px'
        f.style.left = originRect.left + 'px'
        f.style.width = originRect.width + 'px'
        f.style.height = originRect.height + 'px'
      }
      f.style.padding = '0px'
      f.style.borderRadius = '0px'
      spot.classList.remove('open')
      const cleanup = () => {
        f.remove()
      }
      f.addEventListener('transitionend', cleanup, { once: true })
      setTimeout(cleanup, 500)
    }

    const openFrom = (tile: HTMLElement) => {
      if (fly) return
      const img = tile.querySelector('.fav') as HTMLImageElement | null
      const wm = tile.querySelector('.wm')
      const name = wm?.textContent ?? ''
      const href = tile.tagName === 'A' ? tile.getAttribute('href') : null
      const r = tile.getBoundingClientRect()
      originRect = { top: r.top, left: r.left, width: r.width, height: r.height }

      fly = document.createElement('div')
      fly.className = 'ls-fly'
      fly.style.top = r.top + 'px'
      fly.style.left = r.left + 'px'
      fly.style.width = r.width + 'px'
      fly.style.height = r.height + 'px'
      fly.style.padding = '0px'
      fly.style.borderRadius = '0px'

      const visit = href
        ? `<a class="ls-visit" href="${href}" target="_blank" rel="noopener">Visit website <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg></a>`
        : '<div class="ls-hint">Trusted partner brand</div>'
      // `onerror` mirrors the prototype tile favicons' `this.remove()` — `FaviconImg`
      // only hides a failed favicon (visibility:hidden), so its `.src` is still found
      // here; without this guard the 92px spotlight img would render a broken glyph.
      fly.innerHTML = `<div class="ls-content">${img ? `<img src="${img.src}" alt="" onerror="this.remove()">` : ''}<div class="ls-name">${name}</div>${visit}<div class="ls-hint">Click anywhere to close</div></div>`
      document.body.appendChild(fly)

      spot.classList.add('open')

      // target: centered card
      const W = Math.min(360, window.innerWidth - 48)
      const Hh = Math.min(360, window.innerHeight - 48)
      const cx = (window.innerWidth - W) / 2
      const cy = (window.innerHeight - Hh) / 2

      // force reflow so the initial geometry is committed, then transition to center
      void fly.offsetWidth
      setTimeout(() => {
        if (!fly) return
        fly.style.top = cy + 'px'
        fly.style.left = cx + 'px'
        fly.style.width = W + 'px'
        fly.style.height = Hh + 'px'
        fly.style.padding = '32px'
        fly.style.borderRadius = '20px'
        fly.classList.add('zoomed')
      }, 20)
    }

    const tileHandlers = tiles.map((tile) => {
      const handler = (e: Event) => {
        e.preventDefault()
        openFrom(tile)
      }
      tile.addEventListener('click', handler)
      return { tile, handler }
    })

    const onBackdropClick = () => close()
    backdrop.addEventListener('click', onBackdropClick)
    // clicks on the visit link should not close before navigating; clicks elsewhere on fly close
    const onSpotClick = (e: MouseEvent) => {
      if (e.target === spot) close()
    }
    spot.addEventListener('click', onSpotClick)
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeydown)
    const onBodyClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (fly && target.closest('.ls-fly') && !target.closest('.ls-visit')) close()
    }
    document.body.addEventListener('click', onBodyClick)

    return () => {
      tileHandlers.forEach(({ tile, handler }) => tile.removeEventListener('click', handler))
      backdrop.removeEventListener('click', onBackdropClick)
      spot.removeEventListener('click', onSpotClick)
      document.removeEventListener('keydown', onKeydown)
      document.body.removeEventListener('click', onBodyClick)
      fly?.remove()
      spot.remove()
    }
  }, [])

  return null
}
