// Story 6.3 — Contact (`/contact`). A pure function of `contactContent`: the
// page holds no strings of its own, it only wires the single content instance
// into the sections in EXACT Handoff order and imports the section stylesheet.
// Header, Footer and RevealOnScroll are rendered by the layout (Epic 1) — NOT
// here.
//
// Composition (identical order on both prototypes):
//   Hero (01) → inline ContactInline (02) → Map (03) → Footer (layout)
//
// Hero and Map render BOTH the desktop (`.contact-dk`) and mobile
// (`.contact-mb`) subtrees into one DOM; the visible one is chosen ONLY by the
// 768px CSS media in contact.css (AD-3). ContactInline is Epic 2's single
// adaptive `.contact-card` — it is mounted EXACTLY ONCE inside the shared
// `.contact-section` (a double mount would duplicate `id="contactForm"`), so it
// is NOT split into dk/mb subtrees.
import Hero from '@/components/contact/Hero'
import MapLocations from '@/components/contact/MapLocations.client'
import ContactInline from '@/components/contact-form/ContactInline.client'
import { buildContactContent } from '@/content/contact'
import { buildContactInfoContent } from '@/content/contact-info'
import { getSiteSettings } from '@/lib/site-settings'

import '@/styles/contact.css'

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const contactContent = buildContactContent(settings)
  const contactInfo = buildContactInfoContent(settings)
  return (
    <main>
      <Hero hero={contactContent.hero} />
      <section className="contact-section reveal">
        <div className="container">
          <ContactInline contactInfo={contactInfo} />
        </div>
      </section>
      <MapLocations map={contactContent.map} />
    </main>
  )
}
