/**
 * Catalog content atoms (Story 5.1 — SCAFFOLD + line switching).
 *
 * The SINGLE home of every static string the Catalog page (`/catalog`) renders —
 * ported VERBATIM from the two Handoff prototypes:
 *   desktop → rollun_handoff/rollun-web-site/project/Catalog.html
 *   mobile  → rollun_handoff/rollun-web-site/project/Catalog Mobile.html
 *
 * The page (`app/(site)/catalog/page.tsx`) and every section RSC in
 * `components/catalog/*` read from THIS module, never from a forked copy. The
 * shape is FLAT SERIALIZABLE DATA (strings / numbers / arrays / objects — no
 * functions, no JSX) so a future Payload Global `CatalogContent` (Phase 2) can
 * supply the very same shape (AD-7). Presentation-only details — the SVG icons,
 * the `.cat-filter-name` "—" placeholder, the EMPTY product containers filled by
 * Stories 5.2/5.3 — live in the components' JSX.
 *
 * Desktop↔mobile text differences are captured as EXPLICIT `{ dk, mb }` fields
 * (never runtime logic): the Automotive intro, every subcat alt/name, both
 * listing heads and both line-CTA labels differ between the two prototypes.
 * Cross-page prototype links (`Our Shops.html#online`, `Contact.html?topic=…`)
 * are mapped to the real Next routes (`/shops#online`, `/contact?topic=…`).
 */

/** A desktop/mobile pair for a string that differs between the two prototypes. */
export type CatalogVariant = { dk: string; mb: string }

/** One run of the CTA heading. `accent` colours it orange (`.or-txt`). */
export type CatalogSegment = { text: string; accent?: boolean }

/** A decorative subcategory tile (NO click handler anywhere — AD). `alt`/`name`
 *  are `{ dk, mb }` because the two prototypes label several tiles differently
 *  (desktop "Electrical Components" vs mobile "Electrical", longer alts, …). */
export type CatalogSubcat = { img: string; alt: CatalogVariant; name: CatalogVariant }

/** One of the two "Two entrances" cards → the `#automotive` / `#health` anchor. */
export type CatalogEntrance = {
  key: 'auto' | 'health'
  href: string
  img: string
  alt: CatalogVariant
  kicker: string
  title: string
  ctaLabel: string
}

/** One product line (Automotive / Health): the split-column on desktop, the
 *  stacked `.line` section on mobile. `subcats` are decorative; the product
 *  containers they precede render EMPTY (Stories 5.2/5.3 fill them). */
export type CatalogLine = {
  eyebrow: string
  title: string
  intro: CatalogVariant
  subcatLabel: string
  subcats: CatalogSubcat[]
  listingHead: { title: CatalogVariant; hint: CatalogVariant }
  lineCta: { label: CatalogVariant; href: string }
}

/** The full Catalog content contract — the page is a pure function of this. */
export type CatalogContent = {
  hero: {
    eyebrow: string
    title: string
    intro: string
    redirectNote: string
  }
  entrancesHead: {
    eyebrow: string
    title: string
  }
  entrances: CatalogEntrance[]
  /** Desktop-only filter bar strings; `names` feed the island's `choose()`. */
  filter: {
    showingLabel: string
    backLabel: string
    names: { auto: string; health: string }
  }
  lines: { auto: CatalogLine; health: CatalogLine }
  cta: {
    titleSegments: CatalogSegment[]
    text: string
    buttons: { label: string; href: CatalogVariant; variant: 'or' | 'dark' }[]
  }
}

/** The single Catalog content instance consumed by the page + sections. */
export const catalogContent: CatalogContent = {
  hero: {
    eyebrow: 'What we distribute',
    title: 'Catalog',
    intro: 'Explore our two main product lines. For purchases, you’ll be redirected to our marketplace stores.',
    redirectNote: 'Buy on marketplaces',
  },
  entrancesHead: {
    eyebrow: 'Where to start',
    title: 'Choose a product line',
  },
  entrances: [
    {
      key: 'auto',
      href: '#automotive',
      img: '/cat-tires.png',
      alt: {
        dk: 'Automotive and motorcycle parts — tires and wheels',
        mb: 'Automotive and motorcycle parts',
      },
      kicker: 'Product line 01',
      title: 'Automotive parts & accessories',
      ctaLabel: 'Explore Automotive',
    },
    {
      key: 'health',
      href: '#health',
      img: '/health-supplements.png',
      alt: {
        dk: 'Health products — dietary and sport supplements',
        mb: 'Health products',
      },
      kicker: 'Product line 02',
      title: 'Health products',
      ctaLabel: 'Explore Health',
    },
  ],
  filter: {
    showingLabel: 'Showing',
    backLabel: 'Back to product lines',
    names: {
      auto: 'Automotive parts & accessories',
      health: 'Health products',
    },
  },
  lines: {
    // Desktop split-grid renders health LEFT, auto RIGHT (VERBATIM). Mobile
    // stacks auto first, then health. Each composition reads the same line here.
    auto: {
      eyebrow: 'Product line 01',
      title: 'Automotive parts & accessories',
      intro: {
        dk: 'We distribute motorcycle and automotive parts and accessories through leading marketplaces — sourced from trusted manufacturers and shipped from various U.S. facilities.',
        mb: 'Motorcycle and automotive parts distributed through leading marketplaces — sourced from trusted manufacturers and shipped from various U.S. facilities.',
      },
      subcatLabel: 'Categories',
      subcats: [
        { img: '/cat-tires.png', alt: { dk: 'Tires', mb: 'Tires' }, name: { dk: 'Tires', mb: 'Tires' } },
        { img: '/cat-parts.png', alt: { dk: 'Parts', mb: 'Parts' }, name: { dk: 'Parts', mb: 'Parts' } },
        {
          img: '/cat-oils.png',
          alt: { dk: 'Oils and fluids', mb: 'Oils and fluids' },
          name: { dk: 'Oils & Fluids', mb: 'Oils & Fluids' },
        },
        {
          img: '/cat-electrical.png',
          alt: { dk: 'Electrical components', mb: 'Electrical components' },
          name: { dk: 'Electrical Components', mb: 'Electrical' },
        },
        { img: '/cat-batteries.png', alt: { dk: 'Batteries', mb: 'Batteries' }, name: { dk: 'Batteries', mb: 'Batteries' } },
      ],
      listingHead: {
        title: { dk: 'Product examples', mb: 'Product examples' },
        hint: {
          dk: 'Representative listings — open any item for full marketplace details',
          mb: 'Tap any item for full marketplace details',
        },
      },
      lineCta: {
        label: { dk: 'Shop Automotive on marketplaces', mb: 'Shop Automotive' },
        href: '/shops#online',
      },
    },
    health: {
      eyebrow: 'Product line 02',
      title: 'Health products',
      intro: {
        dk: 'Medical supplies and wellness products distributed through trusted channels — selected for quality and everyday reliability.',
        mb: 'Medical supplies and wellness products distributed through trusted channels — selected for quality and everyday reliability.',
      },
      subcatLabel: 'Categories',
      subcats: [
        {
          img: '/health-orthopedic.png',
          alt: { dk: 'Orthopedic braces and supports', mb: 'Orthopedic' },
          name: { dk: 'Orthopedic Braces & Supports', mb: 'Orthopedic Braces & Supports' },
        },
        {
          img: '/health-supplements.png',
          alt: { dk: 'Dietary and sport supplements', mb: 'Supplements' },
          name: { dk: 'Dietary & Sport Supplements', mb: 'Dietary & Sport Supplements' },
        },
        {
          img: '/health-energy.png',
          alt: { dk: 'Energy and focus supplements', mb: 'Energy' },
          name: { dk: 'Energy & Focus Supplements', mb: 'Energy & Focus Supplements' },
        },
        {
          img: '/health-painrelief.png',
          alt: { dk: 'Pain relief and recovery rubs', mb: 'Pain relief' },
          name: { dk: 'Pain Relief & Recovery Rubs', mb: 'Pain Relief & Recovery Rubs' },
        },
      ],
      listingHead: {
        title: { dk: 'Product examples', mb: 'Featured products' },
        hint: {
          dk: 'Representative listings — open any item for full marketplace details',
          mb: 'View on Amazon',
        },
      },
      lineCta: {
        label: { dk: 'Shop Health on marketplaces', mb: 'Shop Health' },
        href: '/shops#online',
      },
    },
  },
  cta: {
    titleSegments: [{ text: 'Ready to ' }, { text: 'buy', accent: true }, { text: '?' }],
    text: 'Browse the full selection and complete your purchase on the marketplaces you trust.',
    buttons: [
      { label: 'Visit our marketplace stores', href: { dk: '/shops#online', mb: '/shops#online' }, variant: 'or' },
      // Desktop deep-links Contact with a pre-filled topic + form anchor; the mobile
      // prototype's button is a bare Contact link (VERBATIM dk↔mb difference, AD-13).
      { label: 'Wholesale & partnerships', href: { dk: '/contact?topic=Wholesale%20%26%20distribution#contactForm', mb: '/contact' }, variant: 'dark' },
    ],
  },
}
