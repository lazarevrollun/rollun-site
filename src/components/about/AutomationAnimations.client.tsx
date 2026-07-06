'use client'

/**
 * Automation (04) animations (Story 4.4) — a single leaf island (AD-1) that
 * ENHANCES the static SSR frame Story 4.1 rendered in `Automation.tsx`, never
 * rewriting it (same precedent as `StatsCounter` / `UsPresenceMap`). It renders
 * NOTHING (`return null`): all work happens in `useEffect`, so there is no
 * hydration mismatch and the SSR frame (each `[data-count]` span already showing
 * its FINAL value, empty `#coinTower` / `#peopleRow` scaffolds) stands as the
 * pre-hydration / no-JS fallback.
 *
 * Three independent effects, each with its own IntersectionObserver, ported
 * VERBATIM from `About Us.html`:
 *   1. count-up (threshold 0.25) — every `[data-count]` number span of BOTH
 *      compositions, `dur=1800`, cubic ease-out `1-(1-p)^3`, `toLocaleString`.
 *      Writes ONLY the number span, leaving the sibling `.unit` span (`+`/`%`)
 *      untouched (matches the prototype `animateCounter`, ~lines 1712-1737).
 *   2. coin-tower (`#coinTower`, threshold 0.2) — 10 coins (`bottom=i*9`,
 *      `zIndex=i+1`), `shown=round(ease(p)*10)`, `.show` for `i<shown`, `.on`
 *      for `i<3 && i<shown` (prototype ~lines 2600-2637).
 *   3. workforce (`#peopleRow`, threshold 0.2) — rows `[2,3,3,2]` of `.fig`
 *      silhouettes (all orange), figures `2..9` fade to `.faded` with a
 *      `600 + k*130ms` stagger (prototype ~lines 2639-2668).
 *
 * Fallback (`prefers-reduced-motion: reduce` OR no `IntersectionObserver`):
 *   - Numbers: leave the SSR final untouched (never flash through `0`).
 *   - Coins/figures: the scaffolds are EMPTY in SSR, so the island still builds
 *     them, but immediately in the FINAL state (all 10 coins `.show`, first 3
 *     `.on`; figures `2..9` `.faded`) with no animation — the epic's "static
 *     result". Coin-tower / workforce are desktop-only (their containers are
 *     `display:none` below 768px, so their observers never fire on mobile).
 *
 * The effect is keyed on `usePathname()`; cleanup sets a `stopped` flag, cancels
 * every tracked rAF, clears every `setTimeout` and disconnects every observer —
 * so SPA navigation leaves nothing running and never writes to a detached node.
 */
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Exact silhouette SVG from `About Us.html`'s workforce `SIL`. */
const SIL =
  '<svg viewBox="0 0 24 24"><path d="M12 13c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5Zm0 1.5c-4.7 0-8 2.4-8 5.5v1.5h16V20c0-3.1-3.3-5.5-8-5.5Z"/></svg>'

export default function AutomationAnimations() {
  const pathname = usePathname()

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hasIO = 'IntersectionObserver' in window
    // Coins/figures still animate only when motion is allowed AND we can gate on
    // scroll; otherwise they are built straight into their final static state.
    const animate = !reduced && hasIO

    const frames = new Set<number>()
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const observers: IntersectionObserver[] = []
    let stopped = false

    // ── 1. COUNT-UP (both compositions, threshold 0.25) ──────────────────────
    // Reduced motion / no IO → leave the SSR final value (never reset to 0).
    if (animate) {
      const nums = Array.from(
        document.querySelectorAll<HTMLElement>(
          '.about-dk.automation [data-count], .about-mb.dark [data-count]',
        ),
      )
      nums.forEach((el) => {
        el.textContent = '0'
      })

      // Count `el` from 0 to its `data-count` over 1800ms — VERBATIM port of the
      // prototype `animateCounter` (dur, cubic ease-out, `toLocaleString`).
      const animateCounter = (el: HTMLElement) => {
        const target = parseInt(el.dataset.count ?? '', 10)
        const dur = 1800
        const start = performance.now()
        const ease = (t: number) => 1 - Math.pow(1 - t, 3)
        const tick = (now: number) => {
          if (stopped) return
          const p = Math.min(1, (now - start) / dur)
          const v = Math.floor(ease(p) * target)
          el.textContent = v.toLocaleString('en-US')
          if (p < 1) frames.add(requestAnimationFrame(tick))
          else el.textContent = target.toLocaleString('en-US')
        }
        frames.add(requestAnimationFrame(tick))
      }

      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              io.unobserve(e.target) // play exactly once
              animateCounter(e.target as HTMLElement)
            }
          }),
        { threshold: 0.25 },
      )
      nums.forEach((el) => io.observe(el))
      observers.push(io)
    }

    // ── 2. COIN-TOWER (#coinTower, threshold 0.2) ────────────────────────────
    const tower = document.getElementById('coinTower')
    if (tower && tower.childElementCount === 0) {
      const N = 10
      const STEP = 9
      const coins: HTMLDivElement[] = []
      for (let i = 0; i < N; i++) {
        const c = document.createElement('div')
        c.className = 'coin'
        c.style.bottom = i * STEP + 'px'
        c.style.zIndex = String(i + 1)
        tower.appendChild(c)
        coins.push(c)
      }
      if (!animate) {
        // Final static state: all coins shown, first 3 highlighted.
        coins.forEach((c, i) => {
          c.classList.add('show')
          if (i < 3) c.classList.add('on')
        })
      } else {
        let played = false
        const play = () => {
          if (played) return
          played = true
          const dur = 1800
          const start = performance.now()
          const ease = (t: number) => 1 - Math.pow(1 - t, 3)
          const tick = (now: number) => {
            if (stopped) return
            const p = Math.min(1, (now - start) / dur)
            const shown = Math.round(ease(p) * N)
            for (let i = 0; i < N; i++) {
              coins[i].classList.toggle('show', i < shown)
              coins[i].classList.toggle('on', i < 3 && i < shown)
            }
            if (p < 1) frames.add(requestAnimationFrame(tick))
          }
          frames.add(requestAnimationFrame(tick))
        }
        const io = new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (e.isIntersecting) {
                play()
                io.disconnect()
              }
            }),
          { threshold: 0.2 },
        )
        io.observe(tower)
        observers.push(io)
      }
    }

    // ── 3. WORKFORCE (#peopleRow, threshold 0.2) ─────────────────────────────
    const row = document.getElementById('peopleRow')
    if (row && row.childElementCount === 0) {
      const TOTAL = 10
      const TEAM = 2
      const ROWS = [2, 3, 3, 2]
      const figs: HTMLDivElement[] = []
      ROWS.forEach((n) => {
        const rdiv = document.createElement('div')
        rdiv.className = 'pcr'
        for (let j = 0; j < n; j++) {
          const d = document.createElement('div')
          d.className = 'fig'
          d.innerHTML = SIL
          rdiv.appendChild(d)
          figs.push(d)
        }
        row.appendChild(rdiv)
      })
      if (!animate) {
        // Final static state: figures 2..9 faded, first 2 stay orange.
        for (let i = TEAM; i < TOTAL; i++) figs[i].classList.add('faded')
      } else {
        let played = false
        const play = () => {
          if (played) return
          played = true
          let k = 0
          for (let i = TEAM; i < TOTAL; i++) {
            const idx = i
            timers.add(
              setTimeout(() => {
                if (stopped) return
                figs[idx].classList.add('faded')
              }, 600 + k * 130),
            )
            k++
          }
        }
        const io = new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (e.isIntersecting) {
                play()
                io.disconnect()
              }
            }),
          { threshold: 0.2 },
        )
        io.observe(row)
        observers.push(io)
      }
    }

    return () => {
      stopped = true
      frames.forEach((id) => cancelAnimationFrame(id))
      timers.forEach((id) => clearTimeout(id))
      observers.forEach((io) => io.disconnect())
      // Remove the injected coins/figures so a re-run (React StrictMode
      // setup→cleanup→setup on the same node, or a re-mount) rebuilds them with
      // a fresh observer — the `childElementCount === 0` guard would otherwise
      // skip the block and leave them frozen with the observer already gone.
      tower?.replaceChildren()
      row?.replaceChildren()
    }
  }, [pathname])

  return null
}
