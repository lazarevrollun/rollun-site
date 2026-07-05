// Story 3.1 — Home hero (RSC, no 'use client').
//
// Renders BOTH compositions into one DOM (AD-3): a desktop subtree (`.home-dk`,
// Home.html) and a mobile subtree (`.home-mb`, Home Mobile.html); the visible
// one is chosen ONLY by the CSS `@media` at 768px in home.css — no JS width
// gating. Hero is the FIRST section and is intentionally excluded from `.reveal`
// (it is above the fold).
//
// STATIC FINAL FRAME only (Story 3.2 owns the bloom cycle): the photo mosaic is
// a statically-lit set — desktop lits a fixed ~25% subset (LIT_DESKTOP), mobile
// stays fully muted. The tiles are background-image divs, NOT <img>, so the
// hidden composition (its wrapper is `display:none` off-viewport) never fetches
// its heavy hero set — exactly one 8-tile OR 6-tile set downloads per viewport
// (a plain <img> would fetch even while display:none). Story 3.2 can toggle the
// `.lit` classes on these same divs without rewriting the markup.
import Link from 'next/link'

import type { HomeContent, HomeHeadlineSegment, HomeMosaicPhoto } from '@/content/home'

import HeroMosaic from './HeroMosaic.client'

/** Fixed lit subset for the desktop static frame (~25% of 8 tiles, per the
 *  prototype's `round(total * 0.25)` = 2). */
const LIT_DESKTOP = [2, 5]

/** The hero headline — orange runs (`accent`) + line breaks, from content. */
function Headline({ segments }: { segments: HomeHeadlineSegment[] }) {
  return (
    <>
      {segments.map((seg, i) => (
        <span key={i}>
          {seg.lineBreak && <br />}
          {seg.accent ? <span className="or-txt">{seg.text}</span> : seg.text}
        </span>
      ))}
    </>
  )
}

/** A mosaic tile — the photo rides in as a media-gated background so the hidden
 *  composition never downloads it. A background image can't carry an `<img>`
 *  alt, so when the photo has descriptive alt text (desktop tiles) we expose it
 *  as `role="img"` + `aria-label`; empty-alt tiles (the mobile set) stay purely
 *  decorative and are left out of the a11y tree. */
function MosaicTile({ photo, lit }: { photo: HomeMosaicPhoto; lit?: boolean }) {
  return (
    <div
      className={`mosaic-tile${lit ? ' lit' : ''}`}
      style={{ backgroundImage: `url('${photo.src}')` }}
      role={photo.alt ? 'img' : undefined}
      aria-label={photo.alt || undefined}
    />
  )
}

export default function Hero({ hero }: { hero: HomeContent['hero'] }) {
  return (
    <>
      {/* Story 3.2 bloom island — enhances the static frame below in place
          (renders null; all DOM work in useEffect). It receives the photo sets
          as props but never rewrites this markup. */}
      <HeroMosaic mosaicDesktop={hero.mosaicDesktop} mosaicMobile={hero.mosaicMobile} />
      {/* ── Desktop composition (visible ≥768px via home.css) ── */}
      <section className="home-dk hero">
        <div className="container hero-inner">
          <div className="mosaic-grid">
            {hero.mosaicDesktop.map((photo, i) => (
              <MosaicTile key={photo.src} photo={photo} lit={LIT_DESKTOP.includes(i)} />
            ))}
          </div>
          <div className="hero-headline-wrap">
            <div className="hero-tag">{hero.tag.dk}</div>
            <h1>
              <Headline segments={hero.headline} />
            </h1>
            <p className="hero-sub">{hero.subheading}</p>
            <div className="hero-buttons">
              <a className="btn btn-or" href="#cta">
                {hero.ctaPrimary}
              </a>
              <Link className="btn btn-ghost" href="/catalog">
                {hero.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile composition (visible <768px via home.css) ── */}
      <section className="home-mb page-hero home-hero">
        <div className="page-hero-inner">
          <div className="mosaic-grid">
            {hero.mosaicMobile.map((photo) => (
              <MosaicTile key={photo.src} photo={photo} />
            ))}
          </div>
          <div className="hero-tag">{hero.tag.mb}</div>
          <h1>
            <Headline segments={hero.headline} />
          </h1>
          <p className="hero-sub">{hero.subheading}</p>
          <div className="hero-buttons">
            <Link className="btn btn-or btn-block" href="/contact">
              {hero.ctaPrimary}
            </Link>
            <Link className="btn btn-ghost btn-block" href="/catalog">
              {hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
