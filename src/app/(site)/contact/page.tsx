// Contact route. Mounts the inline ContactForm display mode (Story 2.4): the
// two-column `.contact-card` with the form and the dark `.cf-info` panel, plus
// deep-link `?topic=` prefill. `ContactInline` reads `window.location.search` in
// a mount effect (not `useSearchParams`), so this page stays statically
// prerenderable. The desktop-modal / mobile-nav modes ship as `GetInTouch` for
// Home/About (Epic 3/4) to mount.
import ContactInline from '@/components/contact-form/ContactInline.client'

export default function ContactPage() {
  return (
    <main>
      <ContactInline />
    </main>
  )
}
