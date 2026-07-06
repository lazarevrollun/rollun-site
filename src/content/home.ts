/**
 * Home content atoms (Story 3.1).
 *
 * The SINGLE home (AD-14) of every static string the Home page (`/`) renders —
 * ported VERBATIM from the two Handoff prototypes:
 *   desktop → rollun_handoff/rollun-web-site/project/Home.html
 *   mobile  → rollun_handoff/rollun-web-site/project/Home Mobile.html
 *
 * The page (`app/(site)/page.tsx`) and every section RSC in `components/home/*`
 * read from THIS module, never from a forked copy, so wording changes in one
 * place. The shape is FLAT SERIALIZABLE DATA (strings / numbers / arrays /
 * objects — no functions, no JSX) so a future Payload Global `HomeContent`
 * (Epic 7) can supply the very same shape (AD-7). Presentation-only details —
 * SVG benefit icons, marketplace logos, social icons, the mosaic "lit" subset,
 * the carousel slide positioning — live in the components' JSX, not here.
 *
 * Desktop↔mobile text differences are captured as EXPLICIT `{ dk, mb }` fields
 * (never runtime logic), including the intentional AD-13 defects (the CTA hours
 * differ between the two prototypes; the mobile marketplace cards carry no
 * ratings — the ratings live only on `card.rating`, rendered by the desktop
 * composition alone).
 *
 * Story 7.1: the CTA hours are passport atoms and moved to `SiteSettings` (their
 * single home, AD-14). `buildHomeContent(s)` sources `cta.hours.dk/mb` from
 * `s.hours.homeCtaDesktop/homeCtaMobile`; every other string stays code-owned.
 * (The CTA social URLs are passport atoms too, but they live in the CtaSection
 * component's props — see `components/home/CtaSection.tsx` — not in this shape.)
 */
import type { SiteSetting } from '@/payload-types'

/** A desktop/mobile pair for a string that differs between the two prototypes. */
export type HomeVariant = { dk: string; mb: string }

/** One run of the hero headline; `accent` colours it orange (`.or-txt`), and
 *  `lineBreak` inserts a `<br>` before the run. */
export type HomeHeadlineSegment = { text: string; accent?: boolean; lineBreak?: boolean }

/** A hero mosaic photo (decorative). Mobile tiles ship an empty alt. */
export type HomeMosaicPhoto = { src: string; alt: string }

/** One product-line carousel slide. */
export type HomeSlide = { src: string; alt: string; caption: string }

/** A product line (Automotive / Health): heading, its slides per composition,
 *  and the EXPLORE button label. */
export type HomeProductLine = {
  heading: HomeVariant
  /** Desktop carousel slides (first is the statically-active slide). */
  slidesDesktop: HomeSlide[]
  /** Mobile scroll-shelf slides. */
  slidesMobile: HomeSlide[]
  /** EXPLORE button label (CSS uppercases; stored in the desktop form). */
  cta: string
}

/** One "Proven at scale" counter. `value`/`suffix` feed Story 3.4's count-up;
 *  `display` is the final formatted string rendered statically here. */
export type HomeStat = { value: number; suffix?: string; display: string; label: string }

/** A "Key benefit" card — heading + body text, each with a dk/mb variant. Icons
 *  are per-composition inline SVG in the component. */
export type HomeBenefit = { heading: HomeVariant; text: HomeVariant }

/** A marketplace store rating (desktop cards only — AD-13). */
export type HomeMarketplaceRating = { pct: number; score: string; meta: string }

/** A marketplace card. `id` selects the logo JSX in the component; `rating` is
 *  rendered only by the desktop composition (mobile has none — AD-13). */
export type HomeMarketplaceCard = {
  id: 'ebay' | 'amazon' | 'walmart'
  name: string
  rating: HomeMarketplaceRating
  descDesktop: string
  descMobile: string
  cta: string
  href: string
}

/** The full Home content contract — page props are a pure function of this. */
export type HomeContent = {
  hero: {
    tag: HomeVariant
    headline: HomeHeadlineSegment[]
    subheading: string
    ctaPrimary: string
    ctaSecondary: string
    mosaicDesktop: HomeMosaicPhoto[]
    mosaicMobile: HomeMosaicPhoto[]
  }
  productLines: {
    eyebrow: string
    title: string
    intro: string
    automotive: HomeProductLine
    health: HomeProductLine
  }
  stats: {
    title: string
    items: HomeStat[]
  }
  benefits: {
    title: string
    cards: HomeBenefit[]
  }
  marketplaces: {
    eyebrow: string
    title: string
    cards: HomeMarketplaceCard[]
  }
  cta: {
    heading: string
    /** Lead sentence (identical in both prototypes). */
    intro: string
    /** Schedule sentence prefix before the highlighted hours. */
    schedulePrefix: string
    /** Hours differ desktop↔mobile — the AD-13 defect, reproduced as-is. */
    hours: HomeVariant
    /** Trailing full stop after the hours. */
    scheduleSuffix: string
  }
}

/**
 * Build the Home content from the `SiteSettings` passport (AD-14). Every string is
 * code-owned except `cta.hours`, which comes from the passport. The page (RSC)
 * calls this with the resolved settings.
 */
export const buildHomeContent = (s: SiteSetting): HomeContent => ({
  hero: {
    tag: {
      dk: 'U.S.-BASED E-COMMERCE DISTRIBUTION',
      mb: 'U.S.-BASED DISTRIBUTION',
    },
    headline: [
      { text: 'Smarter', accent: true },
      { text: ' distribution.' },
      { text: 'Trusted', accent: true, lineBreak: true },
      { text: ' marketplaces.' },
    ],
    subheading:
      'Rollun is a U.S.-based e-commerce distribution company focused on automotive parts & accessories and health products.',
    ctaPrimary: 'CONTACT US',
    ctaSecondary: 'EXPLORE CATALOG',
    // Desktop mosaic (Home.html mosaic script) — 8 tiles.
    mosaicDesktop: [
      { src: '/hero/booth-rollun.png', alt: 'Rollun team at their trade-show booth' },
      { src: '/hero/rollun-shelf.png', alt: 'Rollun-branded parts on a retail shelf' },
      { src: '/hero/chopper-rollun.jpg', alt: 'Rollun team member with a custom chopper at the AIMExpo show' },
      { src: '/hero/desk-rollun.png', alt: 'Rollun team member at her desk in a branded shirt' },
      { src: '/hero/p6.jpg', alt: 'Rollun team at the Magazi booth' },
      { src: '/hero/p4.jpg', alt: 'Rollun storefront — ATV/UTV and motorcycle parts' },
      { src: '/hero/p3.jpg', alt: 'Rollun at the AIMExpo 2024 trade show' },
      { src: '/hero/p2.jpg', alt: 'Rollun shop interior with parts and accessories' },
    ],
    // Mobile mosaic (Home Mobile.html mosaic script) — 6 tiles, empty alt.
    mosaicMobile: [
      { src: '/hero/p1.jpg', alt: '' },
      { src: '/hero/p5.jpg', alt: '' },
      { src: '/hero/p3.jpg', alt: '' },
      { src: '/hero/p6.jpg', alt: '' },
      { src: '/hero/p4.jpg', alt: '' },
      { src: '/hero/p2.jpg', alt: '' },
    ],
  },
  productLines: {
    eyebrow: 'What we do',
    title: 'Two focused product lines',
    intro:
      'Focused expertise in two categories where automation, sourcing, and marketplace operations create real advantage.',
    automotive: {
      heading: { dk: 'Motorcycle & Automotive Products', mb: 'Motorcycle & Automotive' },
      slidesDesktop: [
        { src: '/cat-oils.png', alt: 'Engine oils and automotive fluids', caption: 'Oils & Fluids' },
        {
          src: '/cat-electrical.png',
          alt: 'Electrical and electronic systems — motors, wiring harnesses, LED lights and diagnostics',
          caption: 'Electrical & Electronic Systems',
        },
        { src: '/cat-tires.png', alt: 'Tires and wheels', caption: 'Tires & Wheels' },
        { src: '/team-tile-1.png', alt: 'Batteries', caption: 'Batteries' },
      ],
      slidesMobile: [
        { src: '/cat-oils.png', alt: 'Oils and fluids', caption: 'Oils & Fluids' },
        { src: '/cat-electrical.png', alt: 'Electrical systems', caption: 'Electrical & Electronic' },
        { src: '/cat-tires.png', alt: 'Tires and wheels', caption: 'Tires & Wheels' },
        { src: '/cat-batteries.png', alt: 'Batteries', caption: 'Batteries' },
      ],
      cta: 'EXPLORE AUTOMOTIVE',
    },
    health: {
      heading: { dk: 'Health & Wellness Products', mb: 'Health & Wellness' },
      slidesDesktop: [
        {
          src: '/health-orthopedic.png',
          alt: 'Orthopedic braces and supports',
          caption: 'Orthopedic Braces & Supports',
        },
        {
          src: '/health-painrelief.png',
          alt: 'Pain relief and recovery rub applied to elbow',
          caption: 'Pain Relief & Recovery Rubs',
        },
        {
          src: '/health-supplements.png',
          alt: 'Dietary and sport supplements — protein and recovery products',
          caption: 'Dietary & Sport Supplements',
        },
        {
          src: '/health-energy.png',
          alt: 'Energy and focus supplement — liquid energy shot',
          caption: 'Energy & Focus Supplements',
        },
      ],
      slidesMobile: [
        { src: '/health-orthopedic.png', alt: 'Orthopedic supports', caption: 'Orthopedic Supports' },
        { src: '/health-painrelief.png', alt: 'Pain relief rubs', caption: 'Pain Relief & Recovery' },
        { src: '/health-supplements.png', alt: 'Supplements', caption: 'Dietary & Sport' },
        { src: '/health-energy.png', alt: 'Energy supplements', caption: 'Energy & Focus' },
      ],
      cta: 'EXPLORE HEALTH',
    },
  },
  stats: {
    title: 'Proven at scale',
    items: [
      { value: 2015, display: '2015', label: 'Founded' },
      { value: 12, display: '12', label: 'Suppliers' },
      { value: 80000, display: '80,000', label: 'Customers' },
      { value: 30, suffix: '%', display: '30%', label: 'Process Automation' },
    ],
  },
  benefits: {
    title: 'Key benefits',
    cards: [
      {
        heading: { dk: 'Our Own Software', mb: 'Our Own Software' },
        text: {
          dk: 'We run our business on software we built ourselves and have improved over many years.',
          mb: 'We run our business on software we built ourselves and have improved over many years.',
        },
      },
      {
        heading: { dk: 'Smart, Science-Proven Processes', mb: 'Science-Proven Processes' },
        text: {
          dk: 'Our workflows implemented by our CEO and team are based on valid data and real experience, making operations stable and efficient.',
          mb: 'Workflows built on valid data and real experience, keeping operations stable and efficient.',
        },
      },
      {
        heading: { dk: 'Millions in Turnover Without Team Growth', mb: 'Turnover Without Team Growth' },
        text: {
          dk: 'Automation allows us to grow revenue without constantly increasing the team size.',
          mb: 'Automation lets us grow revenue without constantly increasing the team size.',
        },
      },
      {
        heading: { dk: 'Ukrainian Startup with AI Focus', mb: 'Ukrainian Startup, AI Focus' },
        text: {
          dk: 'We are proud to be a Ukrainian startup and continue to grow with modern AI technologies.',
          mb: 'A proud Ukrainian startup, growing with modern AI technologies.',
        },
      },
    ],
  },
  marketplaces: {
    eyebrow: 'Where to buy',
    title: 'Find us on marketplaces',
    cards: [
      {
        id: 'ebay',
        name: 'eBay',
        rating: { pct: 100, score: '99.8% positive feedback', meta: '59K+ items sold · 843 followers' },
        descDesktop: 'Our top-rated eBay store with 2,200+ live listings of parts and accessories.',
        descMobile: 'Shop our products conveniently on your favorite marketplaces.',
        cta: 'VIEW STORE',
        href: 'https://www.ebay.com/str/Rollun',
      },
      {
        id: 'amazon',
        name: 'Amazon',
        rating: { pct: 94, score: '4.7 out of 5', meta: '94% positive · 153 ratings' },
        descDesktop: 'Fast Prime-eligible shipping and A-to-z buyer protection on our full Amazon storefront.',
        descMobile: 'Shop our products conveniently on your favorite marketplaces.',
        cta: 'VIEW STORE',
        href: 'https://www.amazon.com/s?i=merchant-items&me=A11L6NMVUXNX47',
      },
      {
        id: 'walmart',
        name: 'Walmart',
        rating: { pct: 80, score: '4.0 out of 5', meta: 'Rollun LC seller · 4 ratings' },
        descDesktop: 'Shop our growing Walmart Marketplace catalog with easy checkout and returns.',
        descMobile: 'Shop our products conveniently on your favorite marketplaces.',
        cta: 'VIEW STORE',
        href: 'https://www.walmart.com/global/seller/101022720',
      },
    ],
  },
  cta: {
    heading: "Let's talk business",
    intro: 'Wholesale, partnership, and marketplace operations.',
    schedulePrefix: 'Monday to Friday from ',
    // AD-13: the two prototypes disagree on the hours — reproduced verbatim from
    // the passport (`homeCtaDesktop` ≠ `homeCtaMobile`).
    hours: { dk: s.hours.homeCtaDesktop, mb: s.hours.homeCtaMobile },
    scheduleSuffix: '.',
  },
})
