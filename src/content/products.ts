/**
 * Product catalog data (Story 5.2 — product card with image slider).
 *
 * A typed static source for the Catalog product cards, ported VERBATIM from the
 * `PRODUCTS` object in the two Handoff prototypes:
 *   desktop → rollun_handoff/rollun-web-site/project/Catalog.html        (~line 1366)
 *   mobile  → rollun_handoff/rollun-web-site/project/Catalog Mobile.html (~line 661)
 * (both prototypes carry the identical `PRODUCTS`).
 *
 * This is a SEPARATE module from `content/catalog.ts` (Global `CatalogContent`):
 * it mirrors a FUTURE Payload COLLECTION `Products` (AD-7), not the page Global.
 * The shape is FLAT SERIALIZABLE DATA (strings / numbers / arrays / tuples — no
 * functions, no JSX) so the same shape can be supplied by Payload in Phase 2. The
 * reserved optional `sku` / `externalId` are the seam to the Phase 4 product feed.
 *
 * `imgs` holds the prototype file NAMES only — Phase 1 renders `Photo N`
 * placeholders (N = `imgs.length`); real product photos arrive later.
 *
 * Marketplace chips on the card are STATIC Amazon + eBay (`CARD_MARKETS`): in the
 * prototype the chip set is `buildOffers(p,cat).slice(0,2)`, whose first two
 * offers are invariantly `amazon`,`ebay` for BOTH lines (Walmart is only the 3rd
 * auto offer, sliced off). Full offers (prices, external URLs, Walmart) are Story
 * 5.3 — `buildOffers` / `lib/offers.ts` are NOT here.
 */

/** The four product categories that back the Catalog line containers. */
export type ProductCategory = 'tires' | 'oils' | 'elec' | 'health'

/** A single `[label, value]` specification row. */
export type ProductSpec = [label: string, value: string]

/** One product — flat serializable, compatible with a future Payload `Products`
 *  collection (AD-7). `sku` / `externalId` are reserved seams to the Phase 4 feed. */
export type Product = {
  brand: string
  domain: string
  name: string
  imgs: string[]
  rating: number
  reviews: number
  specs: ProductSpec[]
  fits: string[]
  desc: string
  /** Health products link a specific Amazon product page (prototype `amazon`). */
  amazon?: string
  /** Reserved seams to the Phase 4 product feed (not used in Story 5.2). */
  sku?: string
  externalId?: string
}

/** A marketplace shown as a card chip (name + favicon domain). */
export type Market = { name: string; domain: string }

// Shared image-name sets from the prototype (Phase 1 → placeholders).
const TIRE = ['cat-tires.png', 'cat-parts.png', 'mototou-product-reflectors.jpg']
const OIL = ['cat-oils.png', 'cat-parts.png', 'mototou-product-filter.jpg']
const ELEC = ['cat-electrical.png', 'mototou-product-reflectors.jpg', 'cat-parts.png']

/** Static card marketplace chips — invariantly Amazon + eBay for every line
 *  (see module header). Prices / URLs / Walmart / offers are Story 5.3. */
export const CARD_MARKETS: Market[] = [
  { name: 'Amazon', domain: 'amazon.com' },
  { name: 'eBay', domain: 'ebay.com' },
]

/** The Catalog product set — VERBATIM from the prototypes' `PRODUCTS` (3 each). */
export const PRODUCTS: Record<ProductCategory, Product[]> = {
  tires: [
    {
      brand: 'Kenda',
      domain: 'kendatire.com',
      name: 'K270 Dual-Sport Tire',
      imgs: TIRE,
      rating: 4.6,
      reviews: 214,
      specs: [
        ['Part #', '047271878C1'],
        ['Size', '4.60-18'],
        ['Type', 'Dual-sport'],
        ['Position', 'Rear'],
        ['Load/Speed', '63P'],
        ['Condition', 'New'],
      ],
      fits: ['2018–2023 Honda CRF250L', '2017–2022 Kawasaki KLX250', '2019–2023 Yamaha XT250', 'Suzuki DR-Z400 (rear)'],
      desc: 'DOT-approved dual-sport rear tire with an aggressive tread for mixed on/off-road riding.',
    },
    {
      brand: 'Dunlop',
      domain: 'dunlop.com',
      name: 'Geomax MX33 Tire',
      imgs: TIRE,
      rating: 4.8,
      reviews: 389,
      specs: [
        ['Part #', '45234080'],
        ['Size', '110/90-19'],
        ['Type', 'Motocross'],
        ['Compound', 'Soft–Intermediate'],
        ['Position', 'Rear'],
        ['Condition', 'New'],
      ],
      fits: ['Most 250cc–450cc MX bikes', 'Honda CRF250R / CRF450R', 'Yamaha YZ250F / YZ450F', 'KTM SX-F range'],
      desc: 'Race-proven motocross tire engineered for soft-to-intermediate terrain with excellent bite and control.',
    },
    {
      brand: 'Bridgestone',
      domain: 'bridgestone.com',
      name: 'Battlax BT46 Tire',
      imgs: TIRE,
      rating: 4.7,
      reviews: 156,
      specs: [
        ['Part #', '12612'],
        ['Size', '120/70-17'],
        ['Type', 'Sport-touring'],
        ['Position', 'Front'],
        ['Load/Speed', '58W'],
        ['Condition', 'New'],
      ],
      fits: ['Kawasaki Ninja 650', 'Honda CB650R', 'Yamaha MT-07', 'Suzuki SV650'],
      desc: 'Bias sport-touring tire delivering dependable grip in dry and wet, with long, even wear.',
    },
  ],
  oils: [
    {
      brand: 'Motul',
      domain: 'motul.com',
      name: '7100 10W-40 4T Engine Oil',
      imgs: OIL,
      rating: 4.9,
      reviews: 512,
      specs: [
        ['Part #', '104091'],
        ['Type', 'Full synthetic'],
        ['Viscosity', '10W-40'],
        ['Volume', '1 L'],
        ['Spec', 'JASO MA2'],
        ['Condition', 'New'],
      ],
      fits: ['All 4-stroke motorcycles', 'Wet-clutch applications', 'Street & track use'],
      desc: 'Ester-based full-synthetic 4-stroke oil for maximum engine and gearbox protection.',
    },
    {
      brand: 'Maxima',
      domain: 'maximausa.com',
      name: 'Extra4 20W-50 Engine Oil',
      imgs: OIL,
      rating: 4.6,
      reviews: 178,
      specs: [
        ['Part #', '35901'],
        ['Type', 'Synthetic blend'],
        ['Viscosity', '20W-50'],
        ['Volume', '1 L'],
        ['Use', '4-stroke'],
        ['Condition', 'New'],
      ],
      fits: ['V-twin & cruiser engines', 'Air-cooled 4-stroke', 'High-temperature use'],
      desc: 'Premium synthetic-blend oil formulated for hot-running 4-stroke and V-twin engines.',
    },
    {
      brand: 'Bel-Ray',
      domain: 'belray.com',
      name: 'Gear Saver 80W-90',
      imgs: OIL,
      rating: 4.7,
      reviews: 97,
      specs: [
        ['Part #', '99250'],
        ['Type', 'Gear oil'],
        ['Viscosity', '80W-90'],
        ['Volume', '1 L'],
        ['Spec', 'API GL-5'],
        ['Condition', 'New'],
      ],
      fits: ['Manual transmissions', 'Final-drive gearboxes', 'Shaft-drive models'],
      desc: 'High-film-strength gear oil that protects against pitting and wear under shock load.',
    },
  ],
  elec: [
    {
      brand: 'Ciro',
      domain: 'ciro3d.com',
      name: 'Bar-Mount LED Light',
      imgs: ELEC,
      rating: 4.5,
      reviews: 64,
      specs: [
        ['Part #', '40010'],
        ['Fitment', 'Harley-Davidson'],
        ['Type', 'Auxiliary'],
        ['Finish', 'Black'],
        ['Power', 'LED'],
        ['Condition', 'New'],
      ],
      fits: ['Harley Touring 2014+', 'Softail handlebar mounts', '1" & 1-1/4" bars'],
      desc: 'Bright bar-mounted LED accent/auxiliary light with billet aluminum housing.',
    },
    {
      brand: 'Badlands',
      domain: 'badlandsmoto.com',
      name: 'Plug-In Load Equalizer',
      imgs: ELEC,
      rating: 4.4,
      reviews: 88,
      specs: [
        ['Part #', 'ILL-02'],
        ['Function', 'LED signal fix'],
        ['Connector', 'OEM plug'],
        ['Fit', 'Universal'],
        ['Condition', 'New'],
      ],
      fits: ['LED turn-signal conversions', 'Most metric cruisers', 'Harley OEM connectors'],
      desc: 'Plug-and-play equalizer that corrects hyper-flash when switching to LED signals.',
    },
    {
      brand: 'Custom Dynamics',
      domain: 'customdynamics.com',
      name: 'ProBEAM LED Bulb',
      imgs: ELEC,
      rating: 4.8,
      reviews: 131,
      specs: [
        ['Part #', 'PB-1157-AW'],
        ['Type', 'Signal/brake'],
        ['Color', 'Red'],
        ['Fit', 'Plug-and-play'],
        ['Condition', 'New'],
      ],
      fits: ['1157 bulb sockets', 'Harley front/rear signals', 'Touring & Softail'],
      desc: 'High-output LED bulb upgrade with brighter, faster response than incandescent.',
    },
  ],
  health: [
    {
      brand: 'Mueller',
      domain: 'muellersportsmed.com',
      name: 'Adjustable Support Brace',
      imgs: ['health-orthopedic.png', 'health-painrelief.png'],
      rating: 4.5,
      reviews: 1203,
      amazon: 'https://www.amazon.com/gp/product/B0022ZV1MW',
      specs: [
        ['Type', 'Compression'],
        ['Size', 'Adjustable / One-size'],
        ['Material', 'Neoprene blend'],
        ['Use', 'Recovery & support'],
        ['Condition', 'New'],
      ],
      fits: ['Knee, elbow & wrist support', 'Daily wear & training', 'Left or right'],
      desc: 'Breathable compression brace providing adjustable support for joints during recovery and activity.',
    },
    {
      brand: 'Optimum Nutrition',
      domain: 'optimumnutrition.com',
      name: 'Daily Wellness Supplement',
      imgs: ['health-supplements.png', 'health-energy.png'],
      rating: 4.7,
      reviews: 5821,
      amazon: 'https://www.amazon.com/gp/product/B00NKY2BF0',
      specs: [
        ['Form', 'Capsules'],
        ['Count', '60 ct'],
        ['Serving', '2 capsules'],
        ['Use', 'Daily'],
        ['Condition', 'New'],
      ],
      fits: ['Adults', 'Daily supplementation', 'Gluten-free'],
      desc: 'Daily wellness capsules formulated to support everyday nutrition and recovery.',
    },
    {
      brand: '5-hour Energy',
      domain: '5hourenergy.com',
      name: 'Energy & Focus Shot',
      imgs: ['health-energy.png', 'health-supplements.png'],
      rating: 4.6,
      reviews: 9043,
      amazon: 'https://www.amazon.com/gp/product/B01D4W0PX2',
      specs: [
        ['Form', 'Liquid shot'],
        ['Volume', '2 fl oz'],
        ['Caffeine', 'Yes'],
        ['Use', 'Pre-activity'],
        ['Condition', 'New'],
      ],
      fits: ['Adults', 'Pre-workout / focus', 'Sugar-free'],
      desc: 'Fast-acting energy & focus shot with B-vitamins and zero sugar.',
    },
  ],
}
