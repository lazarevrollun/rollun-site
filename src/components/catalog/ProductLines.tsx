// Story 5.1 — Catalog product lines (03) (RSC, no 'use client'). SCAFFOLD ONLY.
//
// Both compositions in one DOM (AD-3); the 768px CSS switch picks the visible one.
//
// DESKTOP: a single `.lines-split` section — the `.cat-filter-bar` + a `.split-grid`
// holding two `.line-col` (health LEFT, auto RIGHT, VERBATIM). The whole section is
// `display:none` until the CatalogLineSwitcher island adds `.active` (a line was
// chosen). The desktop `.line-col`s carry NO id — the island drives them by class,
// and the canonical `#automotive`/`#health` anchors live ONLY on the mobile sections
// (Design Note: avoid duplicate ids across the two compositions).
//
// MOBILE: two static, always-visible `<section class="line …">` (auto, then health)
// that carry the canonical `id`s for native anchor-scroll from the entrances.
//
// The `.product-grid` (desktop) / `.product-shelf` (mobile) containers render EMPTY
// with their `data-cat` — Stories 5.2/5.3 fill them (precedent: About 4.1's empty
// `#map`). The product-subcategory group headers with example counts are likewise
// product-derived and owned by 5.2, so 5.1 renders only the mount points.
import Link from 'next/link'

import type { CatalogContent, CatalogLine, CatalogSubcat } from '@/content/catalog'

import CatalogLineSwitcher from './CatalogLineSwitcher.client'

/** The → arrow glyph on the line CTAs (both prototypes, stroke-width 2). */
function LineArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

/** The ‹ chevron glyph on the desktop "Back to product lines" button. */
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

/** One decorative subcategory tile. `variant` picks the dk/mb alt + name. NO
 *  click handler anywhere — these tiles are purely decorative. */
function SubcatTile({ subcat, variant }: { subcat: CatalogSubcat; variant: 'dk' | 'mb' }) {
  return (
    <div className="subcat">
      <div className="subcat-img">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed 4/3-ratio category thumbnail (AD pixel fidelity); next/image adds no value here */}
        <img src={subcat.img} alt={subcat.alt[variant]} loading="lazy" />
      </div>
      <div className="subcat-name">{subcat.name[variant]}</div>
    </div>
  )
}

/** One desktop split column (`.line-col`). `productGridClass` / `dataCat` mark
 *  the EMPTY container 5.2 fills; `subcatFour` adds `.four` to the health grid. */
function DesktopLineCol({
  line,
  side,
  subcatFour,
  productGridClass,
  dataCat,
}: {
  line: CatalogLine
  side: 'health' | 'auto'
  subcatFour: boolean
  productGridClass: string
  dataCat: string
}) {
  return (
    <div className={`line-col ${side}`}>
      <div className="line-head">
        <div className="section-eyebrow">{line.eyebrow}</div>
        <h2 className="section-title">{line.title}</h2>
        <p>{line.intro.dk}</p>
      </div>
      <div className="subcat-label">{line.subcatLabel}</div>
      <div className={subcatFour ? 'subcat-grid four' : 'subcat-grid'}>
        {line.subcats.map((s) => (
          <SubcatTile key={s.img} subcat={s} variant="dk" />
        ))}
      </div>
      <div className="listing-head">
        <h3>{line.listingHead.title.dk}</h3>
        <span className="hint">{line.listingHead.hint.dk}</span>
      </div>
      {/* EMPTY — Story 5.2 fills this from product data. */}
      <div className={`product-grid ${productGridClass}`} data-cat={dataCat} />
      <div className="line-cta">
        <Link className="btn btn-or" href={line.lineCta.href}>
          {line.lineCta.label.dk}
          <LineArrow />
        </Link>
      </div>
    </div>
  )
}

/** One mobile stacked line section. `id` is the canonical anchor; `shelves`
 *  are the EMPTY `.product-shelf[data-cat]` mount points 5.2/5.3 fill. */
function MobileLine({
  line,
  variant,
  id,
  shelves,
}: {
  line: CatalogLine
  variant: 'auto' | 'health'
  id: string
  shelves: string[]
}) {
  return (
    <section className={`catalog-mb line ${variant}`} id={id}>
      <div className="line-head wrap">
        <div className="section-eyebrow">{line.eyebrow}</div>
        <h2 className="section-title">{line.title}</h2>
        <p>{line.intro.mb}</p>
      </div>
      <div className="subcat-label wrap">{line.subcatLabel}</div>
      <div className="hscroll">
        {line.subcats.map((s) => (
          <SubcatTile key={s.img} subcat={s} variant="mb" />
        ))}
      </div>
      <div className="listing-head">
        <h3>{line.listingHead.title.mb}</h3>
        <span className="hint">{line.listingHead.hint.mb}</span>
      </div>
      {/* EMPTY — Story 5.2/5.3 fill these from product data. */}
      {shelves.map((cat) => (
        <div key={cat} className="product-shelf" data-cat={cat} />
      ))}
      <div className="line-cta">
        <Link className="btn btn-or" href={line.lineCta.href}>
          {line.lineCta.label.mb}
          <LineArrow />
        </Link>
      </div>
    </section>
  )
}

export default function ProductLines({
  lines,
  filter,
}: {
  lines: CatalogContent['lines']
  filter: CatalogContent['filter']
}) {
  return (
    <>
      {/* ── Desktop composition — hidden until the island adds `.active` ── */}
      <section className="catalog-dk lines-split">
        <div className="container">
          <div className="cat-filter-bar">
            <span className="cat-filter-now">
              <span className="dot" />
              {filter.showingLabel}&nbsp;<span className="cat-filter-name">—</span>
            </span>
            <button type="button" className="cat-back">
              <BackIcon />
              {filter.backLabel}
            </button>
          </div>
          <div className="split-grid">
            {/* HEALTH (left) */}
            <DesktopLineCol line={lines.health} side="health" subcatFour productGridClass="health-products" dataCat="health" />
            {/* AUTOMOTIVE (right) */}
            <DesktopLineCol line={lines.auto} side="auto" subcatFour={false} productGridClass="cat-grid" dataCat="auto-all" />
          </div>
        </div>
        {/* Leaf 'use client' island — choose() + deep-link. Renders null. */}
        <CatalogLineSwitcher names={filter.names} />
      </section>

      {/* ── Mobile composition — static stacked lines with canonical anchors ── */}
      <MobileLine line={lines.auto} variant="auto" id="automotive" shelves={['tires', 'oils', 'elec']} />
      <MobileLine line={lines.health} variant="health" id="health" shelves={['health']} />
    </>
  )
}
