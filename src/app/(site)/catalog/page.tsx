// Story 5.1 — Catalog (`/catalog`). A pure function of `catalogContent`: the page
// holds no strings of its own, it only wires the single content instance into the
// section RSCs in EXACT Handoff order (Hero → Two entrances → Product lines →
// Brands wall → CTA) and imports the section stylesheet last. Header, Footer and
// RevealOnScroll are rendered by the layout (Epic 1) — NOT here. The brands-wall
// marquee (05) is Story 5.5 (`BrandMarquee` + the desktop `BrandSpotlight` island).
import BrandMarquee from '@/components/catalog/BrandMarquee'
import CtaSection from '@/components/catalog/CtaSection'
import Entrances from '@/components/catalog/Entrances'
import Hero from '@/components/catalog/Hero'
import ProductLines from '@/components/catalog/ProductLines'
import { catalogContent } from '@/content/catalog'
import { PRODUCTS } from '@/content/products'

import '@/styles/catalog.css'

export default function CatalogPage() {
  return (
    <main>
      <Hero hero={catalogContent.hero} />
      <Entrances entrancesHead={catalogContent.entrancesHead} entrances={catalogContent.entrances} />
      <ProductLines lines={catalogContent.lines} filter={catalogContent.filter} products={PRODUCTS} />
      <BrandMarquee brands={catalogContent.brands} />
      <CtaSection cta={catalogContent.cta} />
    </main>
  )
}
