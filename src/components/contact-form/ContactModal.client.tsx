'use client'

/**
 * ContactModal — the desktop dialog display mode (Story 2.4, mode 1). A thin
 * presentational shell around the unchanged `ContactForm` + `ContactInfo`: it
 * adds the overlay chrome and the open/close behaviour, but the send path stays
 * the ONE `submitContactForm` Server Action (AD-8) — modes differ only in
 * presentation. Ported from the modal prototype (Home.html markup 1184-1278 +
 * JS 1457-1476).
 *
 * `open` is owned by the caller (`GetInTouch`); this component only reacts to it:
 *   - scroll-lock `body.overflow:hidden` while open, restored on close/unmount
 *     (the `Header.client.tsx` idiom);
 *   - Escape closes;
 *   - dropping below the 768px breakpoint closes it (AD-3 seam) so a resize can
 *     never strand an unreachable scroll-lock behind a hidden dialog;
 *   - a backdrop click (target === the overlay itself) closes.
 * Success auto-closes for free: the form calls `onSuccess` after its post-submit
 * reset, and we pass `onClose` straight into that seam — no second timer.
 */
import ContactForm from './ContactForm.client'
import ContactInfo from './ContactInfo'
import { type ContactInfoContent } from '@/content/contact-info'
import { useEffect, useMemo } from 'react'

type ContactModalProps = {
  /** Whether the dialog is shown — owned by the trigger. */
  open: boolean
  /** Close request (×, backdrop, Esc, resize below 768px, submit success). */
  onClose: () => void
  /** Info-panel content, built from the passport by the RSC that mounts the
   *  trigger and only forwarded through here (AD-12). */
  content: ContactInfoContent
  /** Optional deep-link topic to preselect in the form. */
  deepLinkTopic?: string
}

export default function ContactModal({ open, onClose, content, deepLinkTopic }: ContactModalProps) {
  // Scroll-lock while open; cleanup restores it on close/unmount.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Escape closes the dialog.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Shrinking below 768px hides the desktop trigger/dialog; close so we never
  // strand an unreachable scroll-lock (AD-3 seam, mirrors Header).
  useEffect(() => {
    if (!open) return
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (!mq.matches) onClose()
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [open, onClose])

  // Stable deep-link object so a parent re-render while the dialog is open never
  // re-runs (and thereby cancels the pending timers of) the form's one-shot
  // deep-link effect. An inline literal would mint a new object every render.
  const deepLink = useMemo(
    () => (open && deepLinkTopic ? { topic: deepLinkTopic } : undefined),
    [open, deepLinkTopic],
  )

  return (
    <div
      className={`contact-overlay${open ? ' open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Contact form"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="contact-modal">
        <button className="contact-close" type="button" aria-label="Close" onClick={onClose}>
          &times;
        </button>
        <ContactForm onSuccess={onClose} deepLink={deepLink} />
        <ContactInfo content={content} />
      </div>
    </div>
  )
}
