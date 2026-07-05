'use client'

/**
 * ContactInline — the inline `/contact` display mode (Story 2.4, mode 2). The
 * two-column `.contact-card` (form left, `ContactInfo` right) rendered in the
 * page flow, no overlay. Ported from Contact.html:412-509.
 *
 * Deep-link `?topic=` WITHOUT losing static prerender: the prototype reads
 * `location.search` after load, so we do the same in a mount effect (NOT
 * `useSearchParams`, which would opt `/contact` into dynamic rendering / require
 * a Suspense boundary). `deepLink` starts undefined — so the server render and
 * the first client render match — and is set only after mount, handing the topic
 * to `ContactForm`, which applies it once via its own ref-guarded effect.
 */
import { useEffect, useState } from 'react'

import ContactForm from './ContactForm.client'
import ContactInfo from './ContactInfo'

export default function ContactInline() {
  const [deepLink, setDeepLink] = useState<{ topic?: string } | undefined>(undefined)

  useEffect(() => {
    // Read the URL (an external source) AFTER mount — no useSearchParams, so /contact stays
    // statically prerendered; starting undefined makes SSR and first client render agree.
    const topic = new URLSearchParams(window.location.search).get('topic')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-mount URL read (see above)
    if (topic) setDeepLink({ topic })
  }, [])

  return (
    <div className="contact-card">
      <ContactForm deepLink={deepLink} />
      <ContactInfo />
    </div>
  )
}
