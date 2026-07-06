// Story 4.1 — About Automation (04) (RSC). STATIC FINAL FRAME only: the three
// counters render their FINAL formatted values (50,000+, 80%, 30%) — Story 4.4
// adds the count-up + coin-tower + workforce-figure islands ON TOP of this
// markup. The empty `#peopleRow` / `#coinTower` scaffold containers are present
// (desktop, exactly where the prototype animation lived) so 4.4 can populate
// them without rewriting the DOM. No animation logic here.
import type { AboutContent } from '@/content/about'

import AutomationAnimations from './AutomationAnimations.client'
import { Rich } from './Rich'

export default function Automation({ automation }: { automation: AboutContent['automation'] }) {
  const { eyebrowMobile, heading, lede, stats } = automation
  return (
    <>
      {/* ── Desktop composition ── */}
      <section className="about-dk automation reveal">
        <div className="container auto-inner">
          <div className="auto-grid">
            <div className="auto-left">
              <h2 className="section-display">
                <Rich segments={heading} />
              </h2>
              <p className="lede">{lede}</p>
            </div>
            <div className="auto-stats">
              <div className="stat big">
                <div className="stat-val">
                  <span data-count={stats[0].value}>{stats[0].display}</span>
                  <span className="unit">{stats[0].unit}</span>
                </div>
                <div className="stat-lbl">{stats[0].label.dk}</div>
              </div>
              <div className="stat team-stat">
                <div className="stat-val">
                  <span data-count={stats[1].value}>{stats[1].display}</span>
                  <span className="unit">{stats[1].unit}</span>
                </div>
                <div className="people-circle" id="peopleRow" aria-hidden="true" />
                <div className="stat-lbl">{stats[1].label.dk}</div>
              </div>
              <div className="stat coin-stat">
                <div className="stat-val">
                  <span data-count={stats[2].value}>{stats[2].display}</span>
                  <span className="unit">{stats[2].unit}</span>
                </div>
                <div className="coin-tower" id="coinTower" aria-hidden="true" />
                <div className="stat-lbl">{stats[2].label.dk}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile composition ── */}
      <section className="about-mb section dark reveal">
        <div className="wrap">
          <div className="section-eyebrow">{eyebrowMobile}</div>
          <h2 className="section-title" style={{ color: '#fff' }}>
            <Rich segments={heading} />
          </h2>
          <p className="auto-lede">{lede}</p>
          <div className="auto-stats">
            <div className="astat big">
              <div className="v">
                <span data-count={stats[0].value}>{stats[0].display}</span>
                <span className="unit">{stats[0].unit}</span>
              </div>
              <div className="l">{stats[0].label.mb}</div>
            </div>
            <div className="astat">
              <div className="v">
                <span data-count={stats[1].value}>{stats[1].display}</span>
                <span className="unit">{stats[1].unit}</span>
              </div>
              <div className="l">{stats[1].label.mb}</div>
            </div>
            <div className="astat">
              <div className="v">
                <span data-count={stats[2].value}>{stats[2].display}</span>
                <span className="unit">{stats[2].unit}</span>
              </div>
              <div className="l">{stats[2].label.mb}</div>
              {stats[2].note && <div className="note">{stats[2].note}</div>}
            </div>
          </div>
        </div>
      </section>

      <AutomationAnimations />
    </>
  )
}
