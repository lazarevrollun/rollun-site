// Story 3.1 — Home "Let's talk business" CTA (RSC shell + client trigger).
//
// Both compositions in one DOM (AD-3); 768px CSS switch picks the visible one.
// The DESKTOP subtree mounts the ready-made <GetInTouch/> island from Epic 2 —
// its button opens the ContactModal. The MOBILE subtree uses a plain <Link> to
// /contact (the exact behaviour GetInTouch itself takes on mobile, and the same
// pattern the Hero mobile CTA uses): mounting a SECOND <GetInTouch/> there would
// put a second ContactModal — and a duplicate `id="contactForm"` + duplicate
// field ids — permanently in the DOM, so only ONE GetInTouch is mounted.
// AD-13 defect reproduced: the schedule HOURS differ desktop (`11:00 to 21:00
// UTC`) vs mobile (`09:00 to 21:00 UTC+2`). The desktop section carries
// `id="cta"` — the Hero's "CONTACT US" anchor target.
import Link from 'next/link'

import GetInTouch from '@/components/contact-form/GetInTouch.client'
import { type ContactInfoContent } from '@/content/contact-info'
import type { HomeContent } from '@/content/home'
import type { SiteSetting } from '@/payload-types'

/** GitHub + LinkedIn round social buttons (identical in both prototypes). The
 *  URLs are passport atoms sourced from `SiteSettings` (AD-14), passed in. */
function SocialLinks({ social }: { social: SiteSetting['social'] }) {
  return (
    <div className="cta-social">
      <a className="gh" href={social.github} target="_blank" rel="noopener" aria-label="GitHub">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
        </svg>
      </a>
      <a className="li" href={social.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
        </svg>
      </a>
    </div>
  )
}

type CtaSectionProps = {
  cta: HomeContent['cta']
  /** Passport social URLs (AD-14) for the round buttons. */
  social: SiteSetting['social']
  /** Info-panel content for the modal, threaded down through `GetInTouch`. */
  contactInfo: ContactInfoContent
}

export default function CtaSection({ cta, social, contactInfo }: CtaSectionProps) {
  const { heading, intro, schedulePrefix, hours, scheduleSuffix } = cta
  return (
    <>
      {/* ── Desktop composition — the `#cta` anchor target ── */}
      <section className="home-dk cta reveal" id="cta">
        <div className="container cta-inner">
          <h2>{heading}</h2>
          <p>
            {intro}
            <br />
            {schedulePrefix}
            <span className="hours">{hours.dk}</span>
            {scheduleSuffix}
          </p>
          <GetInTouch contactInfo={contactInfo} />
          <SocialLinks social={social} />
        </div>
      </section>

      {/* ── Mobile composition ── */}
      <section className="home-mb section dark home-cta reveal">
        <div className="home-cta-inner">
          <h2>{heading}</h2>
          <p>
            {intro} {schedulePrefix}
            <span className="hours">{hours.mb}</span>
            {scheduleSuffix}
          </p>
          <Link className="btn btn-or btn-block" href="/contact">
            GET IN TOUCH
          </Link>
          <SocialLinks social={social} />
        </div>
      </section>
    </>
  )
}
