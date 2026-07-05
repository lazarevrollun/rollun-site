'use client'

/**
 * Site header — the first `.client.tsx` leaf island (AD-1), establishing the
 * convention. It renders BOTH the desktop and the mobile header compositions in
 * a single DOM; the visible one is chosen ONLY by CSS `@media` at 768px in
 * `shell.css` (AD-3 / NFR-2). NO width-based JS gating, no media hooks, no UA
 * sniffing here — that would cause a hydration mismatch.
 *
 * The only interactivity is the scroll listener (`scrolled` / `hide`) and the
 * active-route highlight via `usePathname()`. Nav content comes from the
 * `NAV_ITEMS` import — the island does not fetch (AD-1/AD-4).
 *
 * The 44px burger drives the mobile drawer (Story 1.5): `menuOpen` state opens a
 * right-side `.site-drawer` + `.site-scrim` (siblings of the mobile `<header>`),
 * with `body.menu-open` + `overflow:hidden` scroll-lock and Escape-to-close.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { NAV_ITEMS } from './nav-config'

export default function Header() {
  const pathname = usePathname()
  // Desktop and mobile shrink at DIFFERENT scroll thresholds in the prototype
  // (desktop >30 / >60 on /about; mobile >20), so they get independent state —
  // a single shared flag would shrink the mobile header 10px too late.
  const [dkScrolled, setDkScrolled] = useState(false)
  const [mbScrolled, setMbScrolled] = useState(false)
  const [hide, setHide] = useState(false)
  // Mobile drawer open/close. MUST start `false` on both server and client so
  // SSR and hydration agree — the drawer/scrim are always in the DOM and only
  // CSS (`body.menu-open`) reveals them (Story 1.5).
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the drawer on route change (Header lives in the persistent layout, so
  // a browser back/forward while open would otherwise leave `body.menu-open` +
  // scroll-lock on the next page). Render-time reset per React's "storing info
  // from previous renders" — no setState-in-effect (nav-link clicks also close).
  const [drawerPath, setDrawerPath] = useState(pathname)
  if (pathname !== drawerPath) {
    setDrawerPath(pathname)
    setMenuOpen(false)
  }

  // Scroll behaviour, ported verbatim from the prototype:
  //   desktop: `scrolled` at scrollY>30 (>60 on /about); `hide` on scroll-down
  //            past y>200, removed on scroll-up or y<200.
  //   mobile:  `scrolled` at scrollY>20; NO `hide` (mobile CSS has no `.hide`).
  //   /about:  hide uses the prototype's 4px deadband to avoid jitter near y=200.
  // rAF-throttled; the pending frame is cancelled on cleanup.
  useEffect(() => {
    const dkThreshold = pathname === '/about' ? 60 : 30
    const aboutHide = pathname === '/about'
    let lastY = window.scrollY
    let ticking = false
    let raf = 0

    const update = () => {
      const y = window.scrollY
      setDkScrolled(y > dkThreshold)
      setMbScrolled(y > 20)
      if (aboutHide) {
        if (y > 200 && y > lastY + 4) setHide(true)
        else if (y < lastY - 4 || y < 200) setHide(false)
      } else {
        if (y > lastY && y > 200) setHide(true)
        else setHide(false)
      }
      lastY = y
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        raf = requestAnimationFrame(update)
      }
    }

    // Sync initial state (e.g. reload while already scrolled).
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [pathname])

  // Scroll-lock while the drawer is open — mirrors mobile.js:8-9 (getElementById
  // toggling replaced by state): add `body.menu-open` (drives all drawer/scrim/
  // burger CSS) + freeze background scroll; cleanup restores both on close/unmount.
  useEffect(() => {
    if (!menuOpen) return
    document.body.classList.add('menu-open')
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.classList.remove('menu-open')
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Escape closes the drawer (a11y addition, in the spirit of 1.4).
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  // Reconcile with the 768px breakpoint: growing to the desktop composition
  // while the drawer is open hides the burger/drawer/scrim (display:none), so
  // close to prevent an unreachable `overflow:hidden` scroll-lock (AD-3 seam).
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Root matches exactly; other routes also light up on their sub-paths so the
  // nav item stays active on nested routes (e.g. /catalog/tires → CATALOG).
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* ── Desktop composition (visible ≥768px via shell.css) ── */}
      <header
        className={`site-header site-header--dk${dkScrolled ? ' scrolled' : ''}${
          hide ? ' hide' : ''
        }`}
      >
        <div className="header-inner">
          <Link className="logo" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed-height self-hosted logo (AD-13 pixel fidelity); next/image adds no value at this size */}
            <img src="/rollun-logo.png" alt="rollun" width={1106} height={224} />
          </Link>
          <nav className="nav">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? 'active' : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* ── Mobile composition (visible <768px via shell.css) ── */}
      <header
        className={`site-header site-header--mb${mbScrolled ? ' scrolled' : ''}`}
      >
        <div className="header-inner">
          <Link className="logo" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed-height self-hosted logo (AD-13 pixel fidelity); next/image adds no value at this size */}
            <img src="/rollun-logo.png" alt="rollun" width={1106} height={224} />
          </Link>
          <button
            className="burger"
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer + scrim (Story 1.5, siblings of the mobile header so
          the shared `menuOpen` needs no context; mobile-only via shell.css) ── */}
      <div className="site-scrim" onClick={() => setMenuOpen(false)} />
      <aside className="site-drawer" aria-hidden={!menuOpen} inert={!menuOpen}>
        <div className="drawer-top">
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed-height self-hosted logo (AD-13 pixel fidelity); next/image adds no value at this size */}
          <img src="/rollun-logo.png" alt="rollun" width={1106} height={224} />
          <button
            className="drawer-close"
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={active ? 'active' : undefined}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            )
          })}
        </nav>
        <div className="drawer-foot">
          <Link className="btn btn-or" href="/catalog" onClick={() => setMenuOpen(false)}>
            Explore catalog
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
          <p>U.S.-based e-commerce distribution</p>
        </div>
      </aside>
    </>
  )
}
