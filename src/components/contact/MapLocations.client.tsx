'use client'

// Story 6.3 — Contact "Our locations" map + location tabs (03) (client island).
//
// ONE island renders BOTH compositions (AD-3): a desktop subtree
// (`.contact-dk map-section`, Contact.html lines 514-534) and a mobile subtree
// (`.contact-mb section paper`, Contact Mobile.html lines 166-186); the visible
// one is chosen ONLY by the CSS `@media` at 768px in contact.css.
//
// SHARED React state, ONE island (not two independent): both tab groups and
// both iframes read/write the SAME `activeIndex` + `src`, so the two
// compositions never drift and there is no duplicate `id`. The prototype's
// vanilla JS used `getElementById('mapFrame')` + `frame.src = …`; in React the
// `src` is bound directly to state, so the iframe `id` is DROPPED — a duplicate
// `id="mapFrame"` across the dk+mb subtrees would be a DOM defect.
//
// AD-13: initial `src` = `map.initialSrc`, the verbatim typo literal
// (`q=53%2F27…`), NOT `tabs[0].q`. Tab 0 is `active` on load, but the iframe
// shows the typo until a tab is clicked; clicking rebuilds the URL through
// `encodeURIComponent(tab.q)` (`z=13`, `output=embed`). Not fixed.
import { useState } from 'react'

import type { ContactContent } from '@/content/contact'

const buildSrc = (q: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=13&output=embed`

export default function MapLocations({ map }: { map: ContactContent['map'] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [src, setSrc] = useState(map.initialSrc)

  const select = (i: number) => {
    setActiveIndex(i)
    setSrc(buildSrc(map.tabs[i].q))
  }

  // Shared tab list + iframe — rendered in BOTH compositions so both read the
  // SAME activeIndex/src. `data-q` mirrors the prototype's DOM contract.
  const tabs = map.tabs.map((tab, i) => (
    <button
      key={tab.q}
      type="button"
      className={`map-tab${i === activeIndex ? ' active' : ''}`}
      data-q={tab.q}
      onClick={() => select(i)}
    >
      <div className="tab-label">{tab.label}</div>
      <div className="tab-addr">{tab.addr}</div>
    </button>
  ))

  const iframe = (
    <iframe
      title="Rollun location map"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={src}
    />
  )

  return (
    <>
      {/* ── Desktop composition (visible ≥768px via contact.css) ── */}
      <section className="contact-dk map-section reveal">
        <div className="container">
          <div className="map-head">
            <div className="eyebrow">{map.eyebrow}</div>
            <h2>{map.title}</h2>
          </div>
          <div className="map-tabs">{tabs}</div>
          <div className="map-frame">{iframe}</div>
        </div>
      </section>

      {/* ── Mobile composition (visible <768px via contact.css) ── */}
      <section className="contact-mb section paper reveal">
        <div className="section-head wrap">
          <div className="section-eyebrow">{map.eyebrow}</div>
          <h2 className="section-title">{map.title}</h2>
        </div>
        <div className="wrap">
          <div className="map-tabs">{tabs}</div>
          <div className="map-frame">{iframe}</div>
        </div>
      </section>
    </>
  )
}
