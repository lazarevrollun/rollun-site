// Story 6.2 — Physical store (02) (RSC, no 'use client').
//
// Both compositions in one DOM (AD-3), switched only by the 768px CSS media.
// Desktop lays a two-column `.store-grid` (media photo + dark `.store-info`
// panel); mobile stacks a `section bg` (section-head + `.store-photo` + info).
// The hours table, the phone (inline icon) and the directions button (desktop
// `GET DIRECTIONS`, mobile `Get directions` + arrow) are shared shapes; the
// directions href is the Conroe defect (AD-13), reproduced NOT fixed. `.reveal`.
import type { ShopsContent } from '@/content/shops'

/** Phone handset icon — inline SVG, both compositions (verbatim from prototype). */
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

/** Up-right arrow icon — mobile directions button only (verbatim from prototype). */
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  )
}

/** Store hours table — shared markup, both compositions. */
function HoursTable({ hours }: { hours: ShopsContent['store']['hours'] }) {
  return (
    <table className="hours-table">
      <tbody>
        {hours.map((row) => (
          <tr key={row.day} className={row.closed ? 'closed' : undefined}>
            <td className="day">{row.day}</td>
            <td className="time">{row.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function Store({ store }: { store: ShopsContent['store'] }) {
  const { eyebrow, title, intro, photo, locationLabel, cityDk, cityMb, addressLines, hours, phone, directions } = store
  return (
    <>
      {/* ── Desktop composition ── */}
      <section className="shops-dk store reveal">
        <div className="container">
          <div className="section-eyebrow">{eyebrow}</div>
          <h2 className="section-title">{title}</h2>
          <p className="section-intro">{intro}</p>

          <div className="store-grid">
            <div className="store-media">
              <div className="store-photo-feature">
                {/* eslint-disable-next-line @next/next/no-img-element -- fixed-ratio object-fit photo (AD-13 pixel fidelity); next/image adds no value here */}
                <img src={photo.img} alt={photo.altDk} loading="lazy" />
              </div>
            </div>

            <div className="store-info">
              <h3>{locationLabel}</h3>
              <div className="city" style={{ fontSize: '30px' }}>
                {cityDk}
              </div>
              <div className="addr">{addressLines.join('\n')}</div>

              <HoursTable hours={hours} />

              <div className="store-phone">
                <PhoneIcon />
                {phone}
              </div>

              <a className="btn btn-or" href={directions.href} target="_blank" rel="noopener">
                {directions.labelDk}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile composition ── */}
      <section className="shops-mb section bg reveal">
        <div className="section-head wrap">
          <div className="section-eyebrow">{eyebrow}</div>
          <h2 className="section-title">{title}</h2>
          <p>{intro}</p>
        </div>
        <div className="wrap">
          <div className="store-photo">
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed-ratio object-fit photo (AD-13 pixel fidelity); next/image adds no value here */}
            <img src={photo.img} alt={photo.altMb} loading="lazy" />
          </div>
          <div className="store-info">
            <h3>{locationLabel}</h3>
            <div className="city">{cityMb}</div>
            <div className="addr">{addressLines.join('\n')}</div>

            <HoursTable hours={hours} />

            <div className="store-phone">
              <PhoneIcon />
              {phone}
            </div>

            <a className="btn btn-or" href={directions.href} target="_blank" rel="noopener">
              {directions.labelMb}
              <ArrowIcon />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
