/**
 * Contact content atoms (Story 6.3).
 *
 * The SINGLE typed home (AD-7/AD-14) of every static string the Contact page
 * (`/contact`) renders in its Hero (01) and Map (03) sections — ported VERBATIM
 * from the two Handoff prototypes:
 *   desktop → rollun_handoff/rollun-web-site/project/Contact.html
 *   mobile  → rollun_handoff/rollun-web-site/project/Contact Mobile.html
 *
 * The page (`app/(site)/contact/page.tsx`) and every section component in
 * `components/contact/*` read from THIS module. The shape is FLAT SERIALIZABLE
 * DATA (strings / arrays / objects — no functions, no JSX) so a future Payload
 * Global `ContactContent` (Phase 2) can supply the very same shape (AD-7). The
 * inline form/info card is Epic 2's `ContactInline` and does NOT read this
 * module — it keeps its own content atoms (`contact-form.ts`/`contact-info.ts`).
 *
 * AD-13 (start-src typo, reproduced VERBATIM, NOT fixed): `map.initialSrc` is a
 * standalone literal whose query reads `q=53%2F27%20Aldine…` — it deliberately
 * does NOT match `map.tabs[0].q` (`5327 Aldine…`). On load, tab 0 is `active`
 * but the iframe shows the typo; clicking tab 0 rebuilds the URL through
 * `encodeURIComponent(tabs[0].q)` and "corrects" it to `5327 Aldine…` — exactly
 * the prototype behaviour. Do NOT collapse `initialSrc` to `tabs[0].q`.
 */

/** One map location tab: `label` (eyebrow) + `addr` (shown line) + `q` (the
 *  Google-Maps query rebuilt through `encodeURIComponent` on click). */
export type ContactMapTab = { label: string; addr: string; q: string }

/** The full Contact content contract — the page is a pure function of this. */
export type ContactContent = {
  hero: { eyebrow: string; title: string; intro: string }
  map: { eyebrow: string; title: string; initialSrc: string; tabs: ContactMapTab[] }
}

/** The single Contact content instance (AD-14) consumed by page + sections. */
export const contactContent: ContactContent = {
  hero: {
    eyebrow: 'Get in touch',
    title: 'Contact us',
    intro:
      'Wholesale, partnership, and marketplace operations. Monday to Friday from 09:00 to 21:00 UTC+2.',
  },
  map: {
    eyebrow: 'Find us',
    title: 'Our locations',
    // AD-13: verbatim typo literal — `53%2F27` ≠ tabs[0].q (`5327`). NOT fixed.
    initialSrc:
      'https://maps.google.com/maps?q=53%2F27%20Aldine%20Mail%20Route%20Rd%2C%20Houston%2C%20TX%2077039&z=13&output=embed',
    tabs: [
      {
        label: 'Shop and return center',
        addr: '5327 Aldine Mail Route Rd, Houston, TX 77039',
        q: '5327 Aldine Mail Route Rd, Houston, TX 77039',
      },
      {
        label: 'Only for legal purposes',
        addr: 'Registered Rollun LC — 30 N Gould St STE 4370, Sheridan WY 82801',
        q: '30 N Gould St STE 4370, Sheridan, WY 82801',
      },
    ],
  },
}
