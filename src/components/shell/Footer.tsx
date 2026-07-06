/**
 * Site footer (Story 1.4) — a React Server Component (NO 'use client'). Unlike
 * the header (client because of `usePathname`), the footer is fully static, so
 * only the mobile accordion TOGGLE is a client island (FooterAccordion.client).
 *
 * It renders BOTH compositions into one DOM — desktop grid columns
 * (`.site-footer--dk`) and mobile accordions (`.site-footer--mb`) — and the
 * visible one is chosen ONLY by CSS `@media` at 768px in shell.css (AD-3 /
 * NFR-2). NO width-based JS gating / media hooks / UA sniffing.
 *
 * The two compositions reproduce the Handoff footer VERBATIM (AD-13):
 *   desktop → Home.html (5 columns: blurb / Quick Links / Contacts / Locations / Legal)
 *   mobile  → Home Mobile.html (logo / intro / 3 accordions, NO Legal column)
 * The mobile omission of the Legal column and the blurb-column h4 is a faithful
 * difference between the two prototype files — it is reproduced, not reconciled.
 *
 * Content atoms come from the single-home modules: nav links from `NAV_ITEMS`
 * (nav-config), everything else from `site-contacts` (AD-14 seam to SiteSettings).
 */
import Link from 'next/link'

import {
  buildFooterContacts,
  COMPANY_BLURB,
  COMPANY_INTRO,
  COPYRIGHT,
  LEGAL_LINKS,
  type Address,
  type Phone,
} from '@/content/site-contacts'
import { getSiteSettings } from '@/lib/site-settings'

import FooterAccordion from './FooterAccordion.client'
import { NAV_ITEMS } from './nav-config'

/**
 * Quick Links display labels are the prototype's Title Case (Home, About Us, …)
 * while href + order stay sourced from NAV_ITEMS (no forked list). NAV_ITEMS
 * labels are uppercase, so title-case them for display.
 */
const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())

/** Quick Links `<ul>` — shared by both compositions (single nav source). */
function QuickLinks() {
  return (
    <ul>
      {NAV_ITEMS.map((item) => (
        <li key={item.href}>
          <Link href={item.href}>{titleCase(item.label)}</Link>
        </li>
      ))}
    </ul>
  )
}

/** Contacts (phones + email) — shared by both compositions. */
function Contacts({ phones, email }: { phones: Phone[]; email: string }) {
  return (
    <>
      {phones.map((phone, i) => (
        <p key={phone.number} style={i > 0 ? { marginTop: '10px' } : undefined}>
          {phone.number}
          <br />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
            {phone.label}
          </span>
        </p>
      ))}
      <p style={{ marginTop: '10px' }}>
        <a href={`mailto:${email}`}>{email}</a>
      </p>
    </>
  )
}

/** Locations (addresses with sublabels) — shared by both compositions. */
function Locations({ addresses }: { addresses: Address[] }) {
  return (
    <>
      {addresses.map((addr) => (
        <div key={addr.lines[0]}>
          <div
            className="sublabel"
            style={addr.accent ? { color: 'var(--color-or)' } : undefined}
          >
            {addr.sublabel}
          </div>
          <p>
            {addr.lines.map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        </div>
      ))}
    </>
  )
}

export default async function Footer() {
  const { phones, email, addresses } = buildFooterContacts(await getSiteSettings())
  return (
    <>
      {/* ── Desktop composition (visible ≥768px via shell.css) ── */}
      <footer className="site-footer site-footer--dk">
        <div className="container">
          <div className="footer-grid">
            <div className="col">
              <Link className="logo" href="/">
                {/* eslint-disable-next-line @next/next/no-img-element -- fixed-height self-hosted logo (AD-13 pixel fidelity); next/image adds no value at this size */}
                <img src="/rollun-logo.png" alt="rollun" width={1106} height={224} />
              </Link>
              <p style={{ marginTop: '22px' }}>{COMPANY_BLURB}</p>
            </div>
            <div className="col">
              <h4>Quick Links</h4>
              <QuickLinks />
            </div>
            <div className="col">
              <h4>Contacts</h4>
              <Contacts phones={phones} email={email} />
            </div>
            <div className="col">
              <h4>Locations</h4>
              <Locations addresses={addresses} />
            </div>
            <div className="col">
              <h4>Legal</h4>
              <ul>
                {LEGAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="footer-bottom">{COPYRIGHT}</div>
        </div>
      </footer>

      {/* ── Mobile composition (visible <768px via shell.css) ──
          Faithful difference: NO Legal accordion, NO blurb-column h4 (mobile
          prototype has only 3 accordions + intro paragraph). */}
      <footer className="site-footer site-footer--mb">
        <Link className="logo" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed-height self-hosted logo (AD-13 pixel fidelity); next/image adds no value at this size */}
          <img src="/rollun-logo.png" alt="rollun" width={1106} height={224} />
        </Link>
        <p className="intro">{COMPANY_INTRO}</p>
        <FooterAccordion title="Quick Links">
          <QuickLinks />
        </FooterAccordion>
        <FooterAccordion title="Contacts">
          <Contacts phones={phones} email={email} />
        </FooterAccordion>
        <FooterAccordion title="Locations">
          <Locations addresses={addresses} />
        </FooterAccordion>
        <div className="footer-bottom">{COPYRIGHT}</div>
      </footer>
    </>
  )
}
