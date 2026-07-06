'use client'

/**
 * Catalog product quick-view (Story 5.4) — a single leaf `'use client'` island that
 * ENHANCES the server-rendered `ProductCard`s (same precedent as `CatalogCardSlider`):
 * it wires click / Enter / Space on every `.product-card[data-pd-key]`, looks the
 * product up by key in the serializable `details` prop, and opens the overlay. The
 * cards themselves are RSC-rendered (5.2) and untouched — this island only listens.
 *
 * AD-3 (two compositions in ONE DOM): this island renders BOTH the desktop modal
 * (`.pd-modal > .pd-panel > .pd-grid`, wrapped in `.catalog-dk`) AND the mobile
 * bottom-sheet (`.pd-modal > .pd-sheet`, wrapped in `.catalog-mb`) — both driven by
 * the SAME `activeKey` / `thumb` state. The 768px CSS media (existing `.catalog-dk`/
 * `.catalog-mb` switch) picks the visible one; there is NO JS-gating / UA-sniffing of
 * the composition. `matchMedia('(min-width:768px)')` is used ONLY to pick the visible
 * panel for focus management. The section ORDER differs between the two prototypes
 * (desktop: fits in the left gallery; mobile: fits at the end of info; offers/specs
 * reordered too) — not reducible to CSS reorder, hence both structures in JSX.
 *
 * AD-9: this island NEVER imports the server-only `lib/offers.ts` runtime — it imports
 * only `type { Offer }`. Offers are derived SERVER-side in `ProductLines` via
 * `buildOffers` and handed here as ready, flat, serializable data on the `details` prop.
 *
 * Markup / icons / texts / `stars()` / thumb-switching / open+close behavior are ported
 * VERBATIM from both prototypes:
 *   desktop → Catalog.html         (openDetail ~1524, stars ~1516, icons ~1343)
 *   mobile  → Catalog Mobile.html  (openDetail ~794)
 * Phase 1: the gallery shows placeholders only — thumb clicks update the active border
 * and the "View N of M" counter, but there is NO real image swap (as in the prototype).
 */
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import type { ProductSpec } from '@/content/products'
import type { Offer } from '@/lib/offers'

import FaviconImg from './FaviconImg.client'

/** Flat serializable quick-view payload — one per unique product. `offers` are the
 *  server-derived `Offer[]` (Story 5.3); this island renders them without importing
 *  the server-only `buildOffers` (AD-9). `key` == `${brand} ${name}` == the card's
 *  `data-pd-key` == the `ProductLines` map `key=` (unique across all 12 products). */
export type ProductDetail = {
  key: string
  brand: string
  domain: string
  name: string
  imgs: string[]
  rating: number
  reviews: number
  specs: ProductSpec[]
  fits: string[]
  desc: string
  offers: Offer[]
}

/** Disclaimer under the offers — VERBATIM from the prototype `.pd-disc` (matches
 *  `OFFER_DISCLAIMER` in `lib/offers.ts`, re-declared here to avoid the server import). */
const DISCLAIMER =
  'Prices and availability shown are representative and may vary on the marketplace. Rollun distributes these products through the listed marketplace stores.'

/** Close glyph — VERBATIM `xIco` (Catalog.html ~1348). */
function XIco() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

/** External-link glyph on each offer's "View" — VERBATIM `extIco` (Catalog.html ~1344). */
function ExtIco() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  )
}

/** Checkmark glyph on each "fits" row — VERBATIM `checkIco` (Catalog.html ~1347). */
function CheckIco() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

/** Image-placeholder glyph — VERBATIM `imgIco` (Catalog.html ~1349, identical to `ProductCard`'s). */
function ImgIco() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </svg>
  )
}

/** 5-star rating — VERBATIM `stars()` (Catalog.html ~1516): `k <= Math.round(rating)`
 *  fills, else greys out. */
function Stars({ rating }: { rating: number }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((k) => (
        <svg key={k} className={k <= Math.round(rating) ? 'on' : 'off'} viewBox="0 0 24 24" stroke="none">
          <path d="m12 17.3-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7z" />
        </svg>
      ))}
    </>
  )
}

/** One offer row — external link (new tab), VERBATIM from the prototypes' offer template. */
function OfferRow({ o }: { o: Offer }) {
  return (
    <a className="pd-offer" href={o.url} target="_blank" rel="noopener">
      <FaviconImg domain={o.domain} className="mk-logo" />
      <div className="mk-meta">
        <span className="mk-name">{o.name}</span>
        <span className="mk-sub">{o.ship}</span>
      </div>
      <span className="mk-price">{o.price}</span>
      <span className="mk-go">
        View
        <ExtIco />
      </span>
    </a>
  )
}

export default function ProductQuickView({ details }: { details: ProductDetail[] }) {
  const pathname = usePathname()
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [thumb, setThumb] = useState(0)
  const dkModalRef = useRef<HTMLDivElement>(null)
  const mbModalRef = useRef<HTMLDivElement>(null)
  // The card that opened the overlay — focus is returned here on close (the dialog
  // pattern restores focus to its trigger; we added focus management, so we complete it).
  const triggerRef = useRef<HTMLElement | null>(null)

  // Look the active detail up by key. An unknown key resolves to `null` → the modal
  // stays closed (I/O matrix: "key not found → no-op").
  const activeDetail = activeKey == null ? null : details.find((d) => d.key === activeKey) ?? null
  const open = activeDetail != null

  // Keep the last-opened detail mounted so the panel's exit transition animates WITH
  // its content — the prototype keeps the modal markup permanently in the DOM and only
  // toggles `.open`. Rendering the live `activeDetail` would unmount the body the instant
  // `.open` is removed, animating out an empty box.
  // `lastDetail` is set in the open handler (below), NOT in an effect. `detail` is what
  // we RENDER (persists through the close animation, hidden by CSS while `.pd-modal` lacks
  // `.open`); `open` tracks the live selection and toggles `.open`.
  const [lastDetail, setLastDetail] = useState<ProductDetail | null>(null)
  const detail = activeDetail ?? lastDetail

  const close = () => setActiveKey(null)

  // ── Enhance the server-rendered cards: click / Enter / Space open the quick-view ──
  // Keyed on `usePathname()` (re-wires after client navigation), mirroring `CatalogCardSlider`.
  useEffect(() => {
    const cleanups: Array<() => void> = []
    document.querySelectorAll<HTMLElement>('.product-card[data-pd-key]').forEach((card) => {
      // Guard: a click on the slider arrow (`.pc-arrow`, wired by `CatalogCardSlider`)
      // must NOT open the modal — VERBATIM prototype behavior.
      const activate = (e: Event) => {
        if ((e.target as HTMLElement).closest('.pc-arrow')) return
        const key = card.getAttribute('data-pd-key')
        if (!key) return
        const d = details.find((x) => x.key === key)
        if (!d) return
        triggerRef.current = card // remember the trigger to restore focus on close
        setActiveKey(key)
        setLastDetail(d) // keep this detail mounted through the close animation
        setThumb(0) // open resets the active thumbnail to the first image
      }
      const onClick = (e: MouseEvent) => activate(e)
      const onKey = (e: KeyboardEvent) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        if ((e.target as HTMLElement).closest('.pc-arrow')) return
        e.preventDefault()
        activate(e)
      }
      card.addEventListener('click', onClick)
      card.addEventListener('keydown', onKey)
      cleanups.push(() => {
        card.removeEventListener('click', onClick)
        card.removeEventListener('keydown', onKey)
      })
    })
    return () => cleanups.forEach((fn) => fn())
  }, [pathname, details])

  // ── Open side-effects: scroll-lock + reset scroll + focus the visible `.pd-close` ──
  // The cleanup ALWAYS restores the scroll-lock and returns focus to the trigger — so
  // closing via any path (backdrop / close / Esc / grab) OR unmounting while open (client
  // navigation) never leaves the page scroll-locked or focus stranded.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    // Pick the visible composition ONLY for focus/scroll management (NOT gating).
    const modal = matchMedia('(min-width:768px)').matches ? dkModalRef.current : mbModalRef.current
    modal?.querySelector<HTMLElement>('.pd-scroll')?.scrollTo({ top: 0 })
    modal?.querySelector<HTMLElement>('.pd-close')?.focus()
    const trigger = triggerRef.current
    return () => {
      document.body.style.overflow = ''
      trigger?.focus()
    }
  }, [open])

  // ── While open: Escape closes; Tab is trapped inside the currently-visible panel ──
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key !== 'Tab') return
      const modal = matchMedia('(min-width:768px)').matches ? dkModalRef.current : mbModalRef.current
      const panel = modal?.querySelector<HTMLElement>('.pd-panel, .pd-sheet')
      if (!panel) return
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const activeEl = document.activeElement
      if (e.shiftKey) {
        if (activeEl === first || !panel.contains(activeEl)) {
          e.preventDefault()
          last.focus()
        }
      } else if (activeEl === last || !panel.contains(activeEl)) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const n = detail?.imgs.length ?? 0

  return (
    <>
      {/* ── Desktop modal composition (AD-3) — 2-column grid, VERBATIM Catalog.html ~1537 ── */}
      <div className="catalog-dk">
        <div className={open ? 'pd-modal open' : 'pd-modal'} ref={dkModalRef}>
          <div className="pd-backdrop" onClick={close} />
          <div className="pd-panel" role="dialog" aria-modal="true" aria-label={detail ? detail.name : undefined}>
            <button className="pd-close" type="button" aria-label="Close" onClick={close}>
              <XIco />
            </button>
            <div className="pd-scroll">
              {detail && (
                <div className="pd-grid">
                  {/* LEFT — gallery + thumbs + Compatibility (fits live in the gallery on desktop). */}
                  <div className="pd-gallery">
                    <div className="pd-main">
                      <div className="img-ph pd-ph-main">
                        <ImgIco />
                        <span className="pl">Product photo</span>
                        <span className="sub">
                          View <b>{thumb + 1}</b> of {n}
                        </span>
                      </div>
                    </div>
                    <div className="pd-thumbs">
                      {detail.imgs.map((_, idx) => (
                        <button
                          key={idx}
                          className={idx === thumb ? 'pd-thumb active' : 'pd-thumb'}
                          type="button"
                          onClick={() => setThumb(idx)}
                        >
                          <div className="img-ph pd-ph-mini">
                            <ImgIco />
                            <span className="pl">{idx + 1}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="pd-section-h" style={{ marginTop: 24 }}>
                      Compatibility — fits
                    </div>
                    <div className="pd-fits" style={{ marginBottom: 0 }}>
                      <ul>
                        {detail.fits.map((f) => (
                          <li key={f}>
                            <CheckIco />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* RIGHT — brand/title/rating/desc + specs + offers. */}
                  <div className="pd-info">
                    <div className="pd-brand-row">
                      <FaviconImg domain={detail.domain} />
                      <span className="b">{detail.brand}</span>
                    </div>
                    <h3 className="pd-title">{detail.name}</h3>
                    <div className="pd-rating">
                      <span className="pd-stars">
                        <Stars rating={detail.rating} />
                      </span>
                      <span className="rv">
                        {detail.rating.toFixed(1)} · {detail.reviews.toLocaleString()} ratings
                      </span>
                    </div>
                    <span className="pd-stockline">In stock — ships today</span>
                    <p style={{ color: 'var(--color-ink-soft)', fontSize: '14.5px', lineHeight: 1.6, margin: '0 0 22px' }}>{detail.desc}</p>
                    <div className="pd-section-h">Specifications</div>
                    <ul className="pd-specs">
                      {detail.specs.map(([k, v]) => (
                        <li key={k}>
                          <span className="k">{k}</span>
                          <span className="v">{v}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pd-section-h">Available at</div>
                    <div className="pd-offers">
                      {detail.offers.map((o) => (
                        <OfferRow key={o.name} o={o} />
                      ))}
                    </div>
                    <p className="pd-disc">{DISCLAIMER}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom-sheet composition (AD-3) — order DIFFERS, VERBATIM Catalog Mobile.html ~799 ── */}
      <div className="catalog-mb">
        <div className={open ? 'pd-modal open' : 'pd-modal'} ref={mbModalRef}>
          <div className="pd-backdrop" onClick={close} />
          <div className="pd-sheet" role="dialog" aria-modal="true" aria-label={detail ? detail.name : undefined}>
            <div className="pd-grab" onClick={close}>
              <span />
            </div>
            <button className="pd-close" type="button" aria-label="Close" onClick={close}>
              <XIco />
            </button>
            <div className="pd-scroll">
              {detail && (
                <>
                  {/* Gallery ONLY (no fits here on mobile). */}
                  <div className="pd-gallery">
                    <div className="pd-main">
                      <div className="img-ph pd-ph-main">
                        <ImgIco />
                        <span className="pl">Product photo</span>
                        <span className="sub">
                          View <b>{thumb + 1}</b> of {n}
                        </span>
                      </div>
                    </div>
                    <div className="pd-thumbs">
                      {detail.imgs.map((_, idx) => (
                        <button
                          key={idx}
                          className={idx === thumb ? 'pd-thumb active' : 'pd-thumb'}
                          type="button"
                          onClick={() => setThumb(idx)}
                        >
                          <div className="img-ph pd-ph-mini">
                            <ImgIco />
                            <span className="pl">{idx + 1}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Info — brand/title/rating/desc, then Available at → Specifications → fits. */}
                  <div className="pd-info">
                    <div className="pd-brand-row">
                      <FaviconImg domain={detail.domain} />
                      <span className="b">{detail.brand}</span>
                    </div>
                    <h3 className="pd-title">{detail.name}</h3>
                    <div className="pd-rating">
                      <span className="pd-stars">
                        <Stars rating={detail.rating} />
                      </span>
                      <span className="rv">
                        {detail.rating.toFixed(1)} · {detail.reviews.toLocaleString()} ratings
                      </span>
                    </div>
                    <span className="pd-stockline">In stock — ships today</span>
                    <p className="pd-desc">{detail.desc}</p>
                    <div className="pd-section-h">Available at</div>
                    <div className="pd-offers">
                      {detail.offers.map((o) => (
                        <OfferRow key={o.name} o={o} />
                      ))}
                    </div>
                    <div className="pd-section-h" style={{ marginTop: 24 }}>
                      Specifications
                    </div>
                    <ul className="pd-specs">
                      {detail.specs.map(([k, v]) => (
                        <li key={k}>
                          <span className="k">{k}</span>
                          <span className="v">{v}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pd-section-h">Compatibility — fits</div>
                    <div className="pd-fits">
                      <ul>
                        {detail.fits.map((f) => (
                          <li key={f}>
                            <CheckIco />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="pd-disc">{DISCLAIMER}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
