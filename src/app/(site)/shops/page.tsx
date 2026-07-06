// Story 6.2 — Our Shops (`/shops`). A pure function of `shopsContent`: the page
// holds no strings of its own, it only wires the single content instance into
// the section RSCs in EXACT Handoff order and imports the section stylesheet.
// Header, Footer and RevealOnScroll are rendered by the layout (Epic 1) — NOT
// here.
//
// Both compositions (desktop + mobile) SSR into one DOM inside each section; the
// visible one is chosen ONLY by the 768px CSS media in shops.css. Handoff order
// (identical on both prototypes):
//   Hero (01) → Store (02) → Marketplaces (03)
import Hero from '@/components/shops/Hero'
import Marketplaces from '@/components/shops/Marketplaces'
import Store from '@/components/shops/Store'
import { buildShopsContent } from '@/content/shops'
import { getSiteSettings } from '@/lib/site-settings'

import '@/styles/shops.css'

export default async function ShopsPage() {
  const shopsContent = buildShopsContent(await getSiteSettings())
  return (
    <main>
      <Hero hero={shopsContent.hero} />
      <Store store={shopsContent.store} />
      <Marketplaces shops={shopsContent.shops} />
    </main>
  )
}
