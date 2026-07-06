/**
 * ContactInfo — the dark two-tone contact panel (`.cf-info`, Story 2.4) shown to
 * the RIGHT of the form in both display modes that carry it: the desktop modal
 * and the inline `/contact` card. Pure RSC (NO `'use client'`) — it renders
 * static markup only and never fetches; the strings arrive by a REQUIRED `content`
 * prop, built from the `SiteSettings` passport by the RSC boundary above it
 * (contact page for the inline card; home/about CtaSection for the modal) and
 * threaded down through the client islands (AD-4/AD-12/AD-14).
 *
 * Markup + the inline SVG icons are ported pixel-faithfully from the modal
 * prototype (Home.html:1233-1276): a `.cf-item` per group (address / phones /
 * email) with its leading icon, an `<hr>`, the blurb, and the `.cf-info-social`
 * icons. The decorative address/phone/email icons carry no `aria-hidden` (mirror
 * of the prototype); the social icons are `aria-hidden` with the accessible name
 * on the `<a aria-label>` (also as the prototype has them).
 */
import { Fragment } from 'react'

import { type ContactInfoContent } from '@/content/contact-info'

type ContactInfoProps = {
  /** Panel content (heading / addresses / phones / email / blurb / social). */
  content: ContactInfoContent
}

/** Render address/phone lines with `<br>` between them, as the prototype does. */
function withBreaks(lines: string[]) {
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 ? <br /> : null}
      {line}
    </Fragment>
  ))
}

export default function ContactInfo({ content }: ContactInfoProps) {
  return (
    <div className="cf-info">
      <h3>{content.heading}</h3>

      {/* Addresses — two columns sharing one location-pin icon. */}
      <div className="cf-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        <div className="info-lines info-twocol">
          {content.addresses.map((address) => (
            <div key={address.label}>
              <span className="lbl">{address.label}</span>
              {address.accent ? (
                <span className="shop-addr">{withBreaks(address.lines)}</span>
              ) : (
                withBreaks(address.lines)
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Phones — each number with its muted parenthetical, a gap between. */}
      <div className="cf-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <path d="M11 18h2" />
        </svg>
        <div className="info-lines">
          {content.phones.map((phone, i) => (
            <Fragment key={phone.number}>
              {i > 0 ? <span className="gap" /> : null}
              {phone.number}
              <br />
              <span className="muted">{phone.label}</span>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Email. */}
      <div className="cf-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <path d="M22 3 2 11l7 2 2 7 11-17z" />
          <path d="M9 13l4-4" />
        </svg>
        <div className="info-lines">
          <a href={`mailto:${content.email}`} style={{ color: '#fff', textDecoration: 'none' }}>
            {content.email}
          </a>
        </div>
      </div>

      <hr />
      <p className="blurb">{content.blurb}</p>

      <div className="cf-info-social">
        {content.social.map((item) => (
          <a
            key={item.platform}
            className={item.platform === 'github' ? 'gh' : 'li'}
            href={item.href}
            target="_blank"
            rel="noopener"
            aria-label={item.label}
          >
            {item.platform === 'github' ? (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
              </svg>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
