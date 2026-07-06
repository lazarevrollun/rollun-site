// Story 3.1 — Home (`/`). A pure function of `homeContent`: the page holds no
// strings of its own, it only wires the single content instance into the six
// section RSCs in EXACT Handoff order and imports the section stylesheet. Footer
// is rendered by the layout (Epic 1) — it is NOT added here.
import Benefits from '@/components/home/Benefits'
import CtaSection from '@/components/home/CtaSection'
import Hero from '@/components/home/Hero'
import Marketplaces from '@/components/home/Marketplaces'
import ProductLines from '@/components/home/ProductLines'
import Stats from '@/components/home/Stats'
import { buildContactInfoContent } from '@/content/contact-info'
import { buildHomeContent } from '@/content/home'
import { getSiteSettings } from '@/lib/site-settings'

import '@/styles/home.css'

export default async function HomePage() {
  const settings = await getSiteSettings()
  const homeContent = buildHomeContent(settings)
  const contactInfo = buildContactInfoContent(settings)
  return (
    <main>
      <Hero hero={homeContent.hero} />
      <ProductLines productLines={homeContent.productLines} />
      <Stats stats={homeContent.stats} />
      <Benefits benefits={homeContent.benefits} />
      <Marketplaces marketplaces={homeContent.marketplaces} />
      <CtaSection cta={homeContent.cta} social={settings.social} contactInfo={contactInfo} />
    </main>
  )
}
