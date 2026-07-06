// Story 4.1 — About US Presence (06) (RSC). SCAFFOLD ONLY.
//
// Desktop renders the section shell: the map head + a `.map-wrap` with an EMPTY
// `#map` mount point (Story 4.2 mounts the D3 map island there), a static live-
// count of 30, and the `.map-hint`. NO d3 / topojson / us-atlas imports. Mobile
// renders only the section container + heading — Story 4.3 fills the static
// location list / city chips beneath it. Both compositions in one DOM (AD-3);
// the mobile subtree carries NO map (AD-13).
import type { AboutContent } from '@/content/about'

import { Rich } from './Rich'
import UsPresenceMap from './UsPresenceMap.client'

export default function UsPresence({ usPresence }: { usPresence: AboutContent['usPresence'] }) {
  const { eyebrowMobile, title, intro, liveCount, liveLabel, mapHint, mobile } = usPresence
  return (
    <>
      {/* ── Desktop composition — map shell (island mounts into #map in 4.2) ── */}
      <section className="about-dk map-section reveal">
        <div className="container">
          <div className="map-head">
            <h2 className="section-title">{title}</h2>
            <p>{intro.dk}</p>
          </div>
          <div className="map-wrap" id="map-wrap" data-borders="on">
            {/* Story 4.2 — leaf island: builds the D3 map into #map on scroll. */}
            <UsPresenceMap locations={usPresence.locations} />
            <div className="map-canvas" id="map">
              <div className="loc-popup" id="loc-popup" />
            </div>
            <div className="map-foot">
              <div className="map-overlay">
                <span className="live-num" id="live-count">
                  {liveCount}
                </span>{' '}
                {liveLabel}
              </div>
            </div>
            <p className="map-hint">
              <Rich segments={mapHint} />
            </p>
          </div>
        </div>
      </section>

      {/* ── Mobile composition — static list / chips / live-tag (Story 4.3) ── */}
      <section className="about-mb section paper reveal">
        <div className="section-head wrap">
          <div className="section-eyebrow">{eyebrowMobile}</div>
          <h2 className="section-title">{title}</h2>
          <p>{intro.mb}</p>
        </div>
        <div className="wrap">
          <div className="loc-list">
            {mobile.cards.map((c) => (
              <div key={c.variant} className={c.variant === 'store' ? 'loc-card store' : 'loc-card'}>
                <div className={`loc-marker ${c.variant}`} />
                <div>
                  <div className="meta">{c.meta}</div>
                  <div className="place">{c.place}</div>
                  <div className="addr">{c.addr}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="ship-row">
            {mobile.chips.map((c) => (
              <span key={c} className="ship-chip">
                {c}
              </span>
            ))}
          </div>
          <div className="live-tag">
            <span className="dot" /> {mobile.network.label} · <span className="num">{mobile.network.count}</span>{' '}
            {mobile.network.unit}
          </div>
        </div>
      </section>
    </>
  )
}
