/**
 * About content atoms (Story 4.1).
 *
 * The SINGLE home (AD-14) of every static string the About page (`/about`)
 * renders — ported VERBATIM from the two Handoff prototypes:
 *   desktop → rollun_handoff/rollun-web-site/project/About Us.html
 *   mobile  → rollun_handoff/rollun-web-site/project/About Us Mobile.html
 *
 * The page (`app/(site)/about/page.tsx`) and every section RSC in
 * `components/about/*` read from THIS module, never from a forked copy, so
 * wording changes in one place. The shape is FLAT SERIALIZABLE DATA (strings /
 * numbers / arrays / objects — no functions, no JSX) so a future Payload Global
 * `AboutContent` (Phase 2) can supply the very same shape (AD-7). Presentation-
 * only details — the section SVG icons, the KeepToShip diagram, the map/coin/
 * people scaffold containers, the social icons — live in the components' JSX.
 *
 * Desktop↔mobile text differences are captured as EXPLICIT `{ dk, mb }` fields
 * (never runtime logic), including the intentional AD-13 defects (the CTA hours
 * differ between the two prototypes; the Automation "80%" label differs; the
 * mobile-only stat note "Internal benchmark").
 */

/** A desktop/mobile pair for a string that differs between the two prototypes. */
export type AboutVariant = { dk: string; mb: string }

/** One run of a heading/inline-rich string. `accent` colours it orange
 *  (`.or-txt`); `hand` renders it in the handwritten Caveat accent (`--font-hand`,
 *  `.love-word`); `strong` bolds it (`<strong>`); `lineBreak` inserts a `<br>`
 *  before the run. */
export type AboutSegment = {
  text: string
  accent?: boolean
  hand?: boolean
  strong?: boolean
  lineBreak?: boolean
}

/** A Snapshot (02) focus card. Desktop groups the first two under
 *  "Distribution" and the third under "Technology"; mobile lists all three. */
export type AboutFocusCard = { tag: AboutVariant; title: string; text: AboutVariant }

/** An Approach (03) principle: number + heading + body (identical in both). */
export type AboutPrinciple = { num: string; title: string; text: string }

/** One Automation (04) counter — FINAL static values (Story 4.4 adds count-up).
 *  `display` is the formatted final string; `note` is mobile-only. */
export type AboutStat = { value: number; display: string; unit: string; label: AboutVariant; note?: string }

/** A Team (07) mosaic tile. `.tr` ships no `src` (solid `#ea7b07`, AD-13). */
export type AboutTeamTile = { pos: 'tl' | 'tr' | 'bl' | 'br'; src?: string; alt?: string; objectPosition?: string }

/** One key/value detail row in a primary (hq/store) map popover. */
export type AboutMapRow = { k: string; v: string }

/** One supplier ship-from entry in a warehouse map popover. */
export type AboutMapSupplier = { name: string; address: string }

/** A US-presence map location (Story 4.2, desktop D3 map). FLAT SERIALIZABLE
 *  DATA (no functions/JSX) so a Payload Global can supply the same shape (AD-7);
 *  reused by the Story 4.3 mobile list. Ported VERBATIM from the `About Us.html`
 *  `PRIMARY` + `WAREHOUSES` arrays. `coord` is `[lng, lat]` (GeoJSON order).
 *  `type` `'hq'`/`'store'` carry `kicker`/`desc`/`rows`; `'wh'` carries
 *  `suppliers`. */
export type AboutMapLocation = {
  id: string
  city: string
  state: string
  coord: [number, number]
  type: 'hq' | 'store' | 'wh'
  kicker?: string
  desc?: string
  rows?: AboutMapRow[]
  suppliers?: AboutMapSupplier[]
}

/** A US-presence MOBILE location card (Story 4.3, static RSC list). FLAT
 *  SERIALIZABLE DATA — its own curated shape (meta/place/addr), NOT a projection
 *  of the desktop `locations` popovers. Ported VERBATIM from `About Us Mobile.html`.
 *  `variant` `'hq'`/`'store'` drives the marker + left-border colour. */
export type AboutPresenceCard = { variant: 'hq' | 'store'; meta: string; place: string; addr: string }

/** The full About content contract — the page is a pure function of this. */
export type AboutContent = {
  hero: {
    eyebrowMobile: string
    headline: AboutSegment[]
    subheading: string
    para: AboutVariant
    ctaPrimary: string
    ctaSecondary: string
  }
  snapshot: {
    title: AboutVariant
    intro: AboutVariant
    groupLabels: { distribution: string; technology: string }
    cards: AboutFocusCard[]
  }
  approach: {
    title: string
    principles: AboutPrinciple[]
  }
  automation: {
    eyebrowMobile: string
    heading: AboutSegment[]
    lede: string
    stats: AboutStat[]
  }
  keeptoship: {
    tag: string
    heading: AboutSegment[]
    paragraphs: string[]
    ctaHeading: string
    ctaText: string
    ctaLabel: string
    ctaHref: string
    visual: {
      label: string
      analogy: AboutSegment[]
      compare: { name: string; role: string; verb: string; accent?: boolean }[]
      note: AboutSegment[]
    }
  }
  usPresence: {
    eyebrowMobile: string
    title: string
    intro: AboutVariant
    liveCount: number
    liveLabel: string
    mapHint: AboutSegment[]
    /** The desktop D3-map locations (Story 4.2): 30 warehouses, then hq, store —
     *  mirrors the prototype `LOCATIONS = [...WAREHOUSES, ...PRIMARY]` order. */
    locations: AboutMapLocation[]
    /** The MOBILE static composition (Story 4.3): 2 location cards, 8 ship-from
     *  city chips, and the live-network tag — its own curated content, NOT a
     *  projection of `locations`. Ported VERBATIM from `About Us Mobile.html`. */
    mobile: {
      cards: AboutPresenceCard[]
      chips: string[]
      network: { label: string; count: number; unit: string }
    }
  }
  team: {
    tilesDesktop: AboutTeamTile[]
    tilesMobile: AboutTeamTile[]
    heading: AboutSegment[]
    quote: string
    ceoName: string
    ceoRole: string
    ceoPhoto: string
  }
  cta: {
    heading: string
    sub: string
    hoursPrefix: string
    /** AD-13: the two prototypes disagree on the hours spacing — reproduced. */
    hours: AboutVariant
  }
}

/** The single About content instance (AD-14) consumed by the page + sections. */
export const aboutContent: AboutContent = {
  hero: {
    eyebrowMobile: 'Who we are',
    headline: [
      { text: 'Why ' },
      { text: 'partners', accent: true },
      { text: ' choose ' },
      { text: 'Rollun', accent: true },
    ],
    subheading: 'A traditional business mindset powered by modern operations and automation.',
    para: {
      dk: 'Rollun is a U.S.‑based LLC registered in Sheridan, Wyoming, and founded by a Ukrainian team. Since April 2015, we have been building automated e‑commerce distribution that helps products reach customers through leading marketplaces — and creating our own automated solutions along the way.',
      mb: "Rollun is a U.S.-based LLC registered in Sheridan, Wyoming, founded by a Ukrainian team. Since April 2015 we've built automated e-commerce distribution that helps products reach customers through leading marketplaces.",
    },
    ctaPrimary: 'Contact us',
    ctaSecondary: 'Explore our work',
  },
  snapshot: {
    title: { dk: 'Who we are and what we do', mb: 'Who we are & what we do' },
    intro: {
      dk: 'We are a small, focused team running a U.S.‑based e‑commerce distribution business. Three product lines, one operating playbook, all built on technology we own.',
      mb: 'A small, focused team running a U.S.-based e-commerce distribution business — three product lines, one operating playbook, all built on technology we own.',
    },
    groupLabels: { distribution: 'Distribution', technology: 'Technology' },
    cards: [
      {
        tag: { dk: '01 · Distribution line', mb: '01 · Category' },
        title: 'Automotive parts & accessories',
        text: {
          dk: 'Motorcycle and automotive products — oils & fluids, electrical & electronic systems, tires & wheels, batteries.',
          mb: 'Motorcycle and automotive products — oils & fluids, electrical systems, tires & wheels, batteries.',
        },
      },
      {
        tag: { dk: '02 · Distribution line', mb: '02 · Category' },
        title: 'Health products',
        text: {
          dk: 'Medical supplies and wellness — orthopedic supports, pain relief & recovery rubs, supplements, energy & focus.',
          mb: 'Medical supplies and wellness — orthopedic supports, pain relief & recovery rubs, supplements, energy & focus.',
        },
      },
      {
        tag: { dk: '03 · IT Solutions', mb: '03 · Platform' },
        title: 'AI‑driven automation',
        text: {
          dk: 'Internal tools developed, used, and tested by our own team — then offered to partners.',
          mb: 'Internal tools developed, used, and tested by our own team — then offered to partners.',
        },
      },
    ],
  },
  approach: {
    title: 'Our approach',
    principles: [
      {
        num: '01',
        title: 'Integrity above all',
        text: 'Honest, transparent, ethical. Partners, suppliers, customers — the same standard for everyone, every time.',
      },
      {
        num: '02',
        title: 'Innovation as our growth engine',
        text: 'Automation, analytics, and AI. We grow by sharpening the system — not by adding headcount.',
      },
      {
        num: '03',
        title: 'Efficiency, long‑term focus',
        text: 'Durable value over quick wins. Every decision is weighed against a multi‑year horizon.',
      },
      {
        num: '04',
        title: 'Small, stable team',
        text: 'Led by an experienced CEO — an expert in business development and operations, with the team to match.',
      },
    ],
  },
  automation: {
    eyebrowMobile: 'Automation',
    heading: [{ text: 'Automation that improves ' }, { text: 'reliability', accent: true }],
    lede: 'We scale through innovation and technology — not by expanding headcount. Internal tools and process automation reduce operational costs and keep execution consistent, year after year.',
    stats: [
      {
        value: 50000,
        display: '50,000',
        unit: '+',
        label: {
          dk: 'Items in inventory handled by a small team',
          mb: 'Items in inventory handled by a small team',
        },
      },
      {
        value: 80,
        display: '80',
        unit: '%',
        label: { dk: 'Less manual work than before', mb: 'Operations without human work' },
      },
      {
        value: 30,
        display: '30',
        unit: '%',
        label: { dk: 'Cost savings via automation', mb: 'Cost savings via automation' },
        note: 'Internal benchmark',
      },
    ],
  },
  keeptoship: {
    tag: 'Our technological startup',
    heading: [{ text: 'KeepToShip', accent: true }, { text: 'Logistics, distributed.', lineBreak: true }],
    paragraphs: [
      'KeepToShip is an AI‑powered logistics platform that connects online sellers with a distributed network of independent keep‑and‑ship partners.',
      'Our Uber‑like system replaces complex centralized logistics by storing products closer to customers — enabling faster delivery, lower shipping costs, and scalable fulfillment without expensive warehouses.',
    ],
    ctaHeading: 'Want to work with us?',
    ctaText: 'Invest, store products in your area, or use KeepToShip in your free time.',
    ctaLabel: 'Learn more',
    ctaHref: 'https://keeptoship.com/',
    visual: {
      label: '// KeepToShip · model',
      analogy: [
        { text: 'Think of it as an ' },
        { text: 'Airbnb', strong: true },
        { text: ' or ' },
        { text: 'Uber', strong: true },
        { text: ' — but for fulfillment.' },
      ],
      compare: [
        { name: 'Uber', role: 'Driver', verb: 'to ride' },
        { name: 'Airbnb', role: 'Host', verb: 'to stay' },
        { name: 'KeepToShip', role: 'Independent shipper', verb: 'to keep & ship', accent: true },
      ],
      note: [
        { text: 'Partners keep stock within ' },
        { text: '~10 km', strong: true },
        { text: ' of buyers — a nationwide micro-fulfillment network instead of distant mega-warehouses.' },
      ],
    },
  },
  usPresence: {
    eyebrowMobile: 'Across the country',
    title: 'US presence',
    intro: {
      dk: 'Registered in Wyoming, operating from Texas, shipping across the country through a network of partner nodes. Hover any pin to see the details.',
      mb: 'Registered in Wyoming, operating from Texas, shipping nationwide through a network of partner nodes.',
    },
    liveCount: 30,
    liveLabel: 'ship-from locations',
    mapHint: [
      { text: 'Tap any point to see the ' },
      { text: 'supplier & warehouse address', strong: true },
      { text: ' we ship from.' },
    ],
    // Ported VERBATIM from `About Us.html` — 30 warehouses first, then the two
    // primary pins (hq, store), mirroring `LOCATIONS = [...WAREHOUSES, ...PRIMARY]`.
    locations: [
      // Tucker / Tucker Rocky (Tucker Powersports assets, 2023)
      {
        id: 'wh0',
        city: 'Hatfield',
        state: 'PA',
        coord: [-75.298, 40.279],
        type: 'wh',
        suppliers: [{ name: 'Tucker / Tucker Rocky', address: '3035 Campus Dr, Hatfield, PA 19440' }],
      },
      {
        id: 'wh1',
        city: 'Reno',
        state: 'NV',
        coord: [-119.87, 39.58],
        type: 'wh',
        suppliers: [{ name: 'Tucker / Tucker Rocky', address: '10880 Lear Blvd, Reno, NV 89506' }],
      },
      {
        id: 'wh2',
        city: 'Arlington',
        state: 'TX',
        coord: [-97.105, 32.706],
        type: 'wh',
        suppliers: [
          { name: 'Tucker / Tucker Rocky', address: '931 W. Bardin Rd, Ste 150–200, Arlington, TX 76017' },
        ],
      },
      {
        id: 'wh3',
        city: 'Whiteland',
        state: 'IN',
        coord: [-86.078, 39.549],
        type: 'wh',
        suppliers: [
          { name: 'Tucker / Tucker Rocky', address: '5789 N. Graham Rd, Ste 200, Whiteland, IN 46184' },
        ],
      },
      // AutoDist / Automatic Distributors
      {
        id: 'wh4',
        city: 'Bangor',
        state: 'ME',
        coord: [-68.779, 44.801],
        type: 'wh',
        suppliers: [{ name: 'AutoDist / Automatic Distributors', address: '22 Target Circle, Bangor, ME 04401' }],
      },
      // Sparks, NV — shared (Parts Unlimited + AutoDist west-coast DC)
      {
        id: 'wh5',
        city: 'Sparks',
        state: 'NV',
        coord: [-119.72, 39.555],
        type: 'wh',
        suppliers: [
          { name: 'Parts Unlimited / LeMans', address: '45 Isidor Court, Sparks, NV 89441 · secondary source' },
          { name: 'AutoDist / Automatic Distributors', address: 'West-coast DC — city-level warehouse watch' },
        ],
      },
      // Parts Unlimited / LeMans Corporation
      {
        id: 'wh6',
        city: 'Janesville',
        state: 'WI',
        coord: [-89.018, 42.683],
        type: 'wh',
        suppliers: [{ name: 'Parts Unlimited / LeMans', address: '3501 Kennedy Rd, Janesville, WI 53547-5222' }],
      },
      {
        id: 'wh7',
        city: 'Flat Rock',
        state: 'NC',
        coord: [-82.44, 35.286],
        type: 'wh',
        suppliers: [
          { name: 'Parts Unlimited / LeMans', address: '121 Commercial Blvd, Flat Rock, NC 28731 · secondary source' },
        ],
      },
      {
        id: 'wh8',
        city: 'Ballston Spa',
        state: 'NY',
        coord: [-73.85, 43.001],
        type: 'wh',
        suppliers: [{ name: 'Parts Unlimited / LeMans', address: 'City-level ship-from watch' }],
      },
      {
        id: 'wh9',
        city: 'Saratoga Springs',
        state: 'NY',
        coord: [-73.785, 43.082],
        type: 'wh',
        suppliers: [{ name: 'Parts Unlimited / LeMans', address: 'City-level ship-from watch' }],
      },
      {
        id: 'wh10',
        city: 'Grapevine',
        state: 'TX',
        coord: [-97.078, 32.934],
        type: 'wh',
        suppliers: [{ name: 'Parts Unlimited / LeMans', address: 'City-level ship-from watch · 76051' }],
      },
      {
        id: 'wh11',
        city: 'Fontana',
        state: 'CA',
        coord: [-117.436, 34.092],
        type: 'wh',
        suppliers: [{ name: 'Parts Unlimited / LeMans', address: 'City-level ship-from watch' }],
      },
      {
        id: 'wh12',
        city: 'Hendersonville',
        state: 'NC',
        coord: [-82.46, 35.319],
        type: 'wh',
        suppliers: [{ name: 'Parts Unlimited / LeMans', address: 'City-level ship-from watch' }],
      },
      // Keystone Automotive Operations
      {
        id: 'wh13',
        city: 'Austell',
        state: 'GA',
        coord: [-84.634, 33.813],
        type: 'wh',
        suppliers: [
          { name: 'Keystone Automotive Operations', address: '600 Hartman Industrial Court, Austell, GA 30168' },
        ],
      },
      {
        id: 'wh14',
        city: 'Brownstown',
        state: 'MI',
        coord: [-83.246, 42.114],
        type: 'wh',
        suppliers: [
          { name: 'Keystone Automotive Operations', address: '17950 Dix Toledo Hwy, Brownstown, MI 48193-8497' },
        ],
      },
      {
        id: 'wh15',
        city: 'Exeter',
        state: 'PA',
        coord: [-75.821, 41.321],
        type: 'wh',
        suppliers: [
          { name: 'Keystone Automotive Operations', address: '44 Tunkhannock Avenue, Exeter, PA 18643' },
        ],
      },
      {
        id: 'wh16',
        city: 'Lewisville',
        state: 'TX',
        coord: [-96.994, 33.046],
        type: 'wh',
        suppliers: [
          {
            name: 'Keystone Automotive Operations',
            address: '351 Lakeside Pkwy, Lewisville, TX 75028 · Irving/Lewisville area',
          },
        ],
      },
      {
        id: 'wh17',
        city: 'Kansas City',
        state: 'KS',
        coord: [-94.727, 39.114],
        type: 'wh',
        suppliers: [
          { name: 'Keystone Automotive Operations', address: '90 Shawnee Avenue, Kansas City, KS 66105' },
        ],
      },
      {
        id: 'wh18',
        city: 'Shawnee',
        state: 'KS',
        coord: [-94.84, 39.018],
        type: 'wh',
        suppliers: [
          {
            name: 'Keystone Automotive Operations',
            address: '24550 W 43rd St Ste 100, Shawnee, KS 66226 · KC-area LKQ',
          },
        ],
      },
      {
        id: 'wh19',
        city: 'Eastvale',
        state: 'CA',
        coord: [-117.564, 33.963],
        type: 'wh',
        suppliers: [{ name: 'Keystone Automotive Operations', address: 'City-level DC watch' }],
      },
      {
        id: 'wh20',
        city: 'Ocoee',
        state: 'FL',
        coord: [-81.544, 28.569],
        type: 'wh',
        suppliers: [{ name: 'Keystone Automotive Operations', address: 'City-level DC watch' }],
      },
      {
        id: 'wh21',
        city: 'Spokane',
        state: 'WA',
        coord: [-117.426, 47.659],
        type: 'wh',
        suppliers: [{ name: 'Keystone Automotive Operations', address: 'City-level DC watch' }],
      },
      // Rocky Mountain ATV/MC
      {
        id: 'wh22',
        city: 'Payson',
        state: 'UT',
        coord: [-111.732, 40.044],
        type: 'wh',
        suppliers: [{ name: 'Rocky Mountain ATV/MC', address: '1551 American Way, Payson, UT 84651' }],
      },
      {
        id: 'wh23',
        city: 'Winchester',
        state: 'KY',
        coord: [-84.18, 37.99],
        type: 'wh',
        suppliers: [{ name: 'Rocky Mountain ATV/MC', address: '1459 Rolling Hills Lane, Winchester, KY 40391' }],
      },
      // WPS / Western Power Sports
      {
        id: 'wh24',
        city: 'Boise',
        state: 'ID',
        coord: [-116.203, 43.618],
        type: 'wh',
        suppliers: [{ name: 'WPS / Western Power Sports', address: '601 E. Gowen Road, Boise, ID 83716' }],
      },
      {
        id: 'wh25',
        city: 'Ashley',
        state: 'IN',
        coord: [-85.062, 41.526],
        type: 'wh',
        suppliers: [{ name: 'WPS / Western Power Sports', address: '902 H L Thompson Jr Dr, Ashley, IN 46705' }],
      },
      {
        id: 'wh26',
        city: 'Midway',
        state: 'GA',
        coord: [-81.433, 31.799],
        type: 'wh',
        suppliers: [{ name: 'WPS / Western Power Sports', address: '2137 Sunbury Road, Midway, GA 31320' }],
      },
      {
        id: 'wh27',
        city: 'Midlothian',
        state: 'TX',
        coord: [-96.994, 32.483],
        type: 'wh',
        suppliers: [{ name: 'WPS / Western Power Sports', address: '4081 Railport Parkway, Midlothian, TX 76065' }],
      },
      {
        id: 'wh28',
        city: 'Fresno',
        state: 'CA',
        coord: [-119.787, 36.741],
        type: 'wh',
        suppliers: [
          { name: 'WPS / Western Power Sports', address: '2855 S Elm Ave, Fresno, CA 93706 · secondary/API watch' },
        ],
      },
      {
        id: 'wh29',
        city: 'Elizabethtown',
        state: 'PA',
        coord: [-76.602, 40.152],
        type: 'wh',
        suppliers: [
          {
            name: 'WPS / Western Power Sports',
            address: '1480 Zeager Rd, Elizabethtown, PA 17022 · secondary/API watch',
          },
        ],
      },
      // Primary pins (rendered last so they sit above the warehouse dots).
      {
        id: 'hq',
        city: 'Sheridan',
        state: 'WY',
        coord: [-106.9562, 44.7972],
        type: 'hq',
        kicker: 'Registered headquarters',
        desc: 'Our legal home. Rollun LC is incorporated in Wyoming — the registered entity behind every order.',
        rows: [
          { k: 'Role', v: 'Registered HQ' },
          { k: 'Since', v: '2015' },
          { k: 'Entity', v: 'Rollun LC' },
        ],
      },
      {
        id: 'store',
        city: 'Houston',
        state: 'TX',
        coord: [-95.3698, 29.7604],
        type: 'store',
        kicker: 'Store & returns center',
        desc: 'Our brick-and-mortar operation. Walk-in pickup, local support, and the hub that processes returns.',
        rows: [
          { k: 'Role', v: 'Store & returns' },
          { k: 'Hours', v: 'Mon–Fri 9–6' },
          { k: 'Pickup', v: 'Walk-in' },
        ],
      },
    ],
    // Ported VERBATIM from `About Us Mobile.html` — its own curated mobile set
    // (2 cards, 8 city chips, live network 9), NOT a projection of `locations`.
    mobile: {
      cards: [
        {
          variant: 'hq',
          meta: 'Registered HQ',
          place: 'Sheridan, Wyoming',
          addr: '30 N Gould St STE 4370 · only for legal purposes',
        },
        {
          variant: 'store',
          meta: 'Brick store & return center',
          place: 'Houston, Texas',
          addr: '5327 Aldine Mail Route Rd, 77039',
        },
      ],
      chips: [
        'Seattle, WA',
        'Los Angeles, CA',
        'Denver, CO',
        'Kansas City, MO',
        'Chicago, IL',
        'Atlanta, GA',
        'New York, NY',
        'Miami, FL',
      ],
      network: { label: 'Live network', count: 9, unit: 'shipping points' },
    },
  },
  team: {
    tilesDesktop: [
      { pos: 'tl', src: '/team-shop.jpg', alt: 'Rollun team member in the shop', objectPosition: '48% 26%' },
      { pos: 'tr' },
      { pos: 'bl', src: '/team-support.jpg', alt: 'Rollun customer-support specialist on a headset', objectPosition: '50% 24%' },
      { pos: 'br', src: '/team-storefront.jpg', alt: 'Rollun team in front of the Texas storefront', objectPosition: '50% 38%' },
    ],
    tilesMobile: [
      { pos: 'tl', src: '/team-tile-1.png', alt: '' },
      { pos: 'tr' },
      { pos: 'bl', src: '/team-photo.jpg', alt: '' },
      { pos: 'br', src: '/team-tile-4.jpg', alt: '', objectPosition: '70% 35%' },
    ],
    heading: [{ text: 'We ' }, { text: 'love', hand: true }, { text: 'what we do.', lineBreak: true }],
    quote:
      'A small, stable team that has worked together for years — disciplined operators on the business side, sharp engineers on the platform side. We hire slowly, invest in tooling, and let the work speak for itself.',
    ceoName: 'Natalia Gretchukha',
    ceoRole: 'CEO',
    ceoPhoto: '/ceo-photo.png',
  },
  cta: {
    heading: "Let's talk business",
    sub: 'Wholesale, partnership, and marketplace operations.',
    hoursPrefix: 'Monday to Friday from ',
    // AD-13: desktop renders "UTC +2" (with a space), mobile "UTC+2" — verbatim.
    hours: { dk: '09:00 to 21:00 UTC +2', mb: '09:00 to 21:00 UTC+2' },
  },
}
