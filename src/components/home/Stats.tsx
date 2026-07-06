// Story 3.1 — Home "Proven at scale" stats (RSC, no 'use client').
//
// Both compositions in one DOM (AD-3); 768px CSS switch picks the visible one.
// STATIC FINAL FRAME (Story 3.4 owns the count-up): each counter renders its
// FINAL formatted value (`display` — `2015`, `12`, `80,000`, `30%`) directly as
// text, with NO animation. The prototype's `data-final` / `data-suffix` hooks are
// preserved on `.stat-value` so Story 3.4 can attach a count-up island and read
// the numeric target without rewriting the markup. Background photo is a
// `.stats-bg` layer (loads only for the visible composition — the other is
// `display:none`). Story 3.4 mounts <StatsCounter/> (a leaf island) which reads
// `data-final`/`data-format`/`data-suffix` and counts each value up on scroll.
import type { HomeContent, HomeStat } from '@/content/home'

import StatsCounter from './StatsCounter.client'

/** A single stat cell — `display` is shown; `value`/`suffix`/`display` feed Story 3.4.
 *  `data-format` mirrors the prototype: `comma` when `display` has a thousands
 *  separator (only `80,000`), else `plain` — so the island is a verbatim port. */
function StatCell({ stat }: { stat: HomeStat }) {
  return (
    <div className="stat">
      <div
        className="stat-value"
        data-final={stat.value}
        data-format={stat.display.includes(',') ? 'comma' : 'plain'}
        data-suffix={stat.suffix}
      >
        {stat.display}
      </div>
      <div className="stat-label">{stat.label}</div>
    </div>
  )
}

export default function Stats({ stats }: { stats: HomeContent['stats'] }) {
  return (
    <>
      {/* ── Desktop composition ── */}
      <section className="home-dk stats reveal">
        <div className="stats-bg" />
        <div className="container stats-inner">
          <div className="stats-title">
            <h2 className="section-display">{stats.title}</h2>
          </div>
          <div className="stats-grid">
            {stats.items.map((stat) => (
              <StatCell key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile composition ── */}
      <section className="home-mb stats reveal">
        <div className="stats-bg" />
        <div className="stats-inner">
          <h2 className="section-title">{stats.title}</h2>
          <div className="stats-grid">
            {stats.items.map((stat) => (
              <StatCell key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Story 3.4 count-up island — enhances both SSR frames, renders null. */}
      <StatsCounter />
    </>
  )
}
