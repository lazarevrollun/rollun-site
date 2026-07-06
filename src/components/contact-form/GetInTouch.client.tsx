'use client'

/**
 * GetInTouch — the `GET IN TOUCH` trigger (Story 2.4). A ready-to-mount library
 * component that Epic 3/4 drops onto Home/About; it is intentionally NOT mounted
 * on the current stub pages (those epics own that).
 *
 * Following the `Header.client.tsx` pattern (AD-3), it renders BOTH trigger
 * compositions into the DOM at once and lets CSS `@media` at 768px pick the
 * visible one — no width-based JS gating / UA sniffing (that would cause a
 * hydration mismatch):
 *   - desktop: a `<button>` that opens the `ContactModal`;
 *   - mobile:  a `<Link>` that NAVIGATES to `/contact` (mode 3) — the modal never
 *     opens on mobile; if a `topic` is given it rides along as `?topic=`.
 * `matchMedia` is used ONLY inside the modal to auto-close on resize, never to
 * gate this render.
 */
import Link from 'next/link'
import { useCallback, useState } from 'react'

import { type ContactInfoContent } from '@/content/contact-info'

import ContactModal from './ContactModal.client'

type GetInTouchProps = {
  /** Info-panel content, built from the passport by the RSC that mounts this
   *  trigger (home/about CtaSection) and only forwarded to the modal (AD-12). */
  contactInfo: ContactInfoContent
  /** Trigger label (default matches the prototype CTA). */
  label?: string
  /** Optional deep-link topic — preselected in the modal, appended to the mobile link. */
  topic?: string
  /** Extra classes merged onto both triggers. */
  className?: string
}

export default function GetInTouch({ contactInfo, label = 'GET IN TOUCH', topic, className }: GetInTouchProps) {
  const [open, setOpen] = useState(false)
  // Stable so the modal's effects don't re-subscribe on every render.
  const close = useCallback(() => setOpen(false), [])

  const href = topic ? `/contact?topic=${encodeURIComponent(topic)}` : '/contact'
  const base = ['btn', 'btn-or', className].filter(Boolean).join(' ')

  return (
    <>
      {/* Desktop trigger — opens the dialog (visible ≥768px via components.css). */}
      <button type="button" className={`${base} gitouch-dk`} onClick={() => setOpen(true)}>
        {label}
      </button>
      {/* Mobile trigger — navigates to /contact (visible <768px via components.css). */}
      <Link href={href} className={`${base} gitouch-mb`}>
        {label}
      </Link>
      <ContactModal open={open} onClose={close} content={contactInfo} deepLinkTopic={topic} />
    </>
  )
}
