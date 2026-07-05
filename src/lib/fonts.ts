import { Caveat, Karla, Poppins, Roboto, Roboto_Mono } from 'next/font/google'

/**
 * Self-hosted typography via next/font (no runtime Google Fonts / CDN hotlink — NFR-3, AD-11).
 * Weight sets are ported verbatim from the prototype's Google Fonts href plus Roboto Mono
 * (used in the prototype CSS for SKU/spec text). Each family exposes a family-named CSS
 * variable that the role-based `@theme` `--font-*` tokens in theme.css reference (e.g.
 * `--font-display: var(--font-poppins), …`). Using family names here avoids colliding with
 * the role token names Tailwind emits. `display: 'swap'` avoids FOIT.
 */

// Poppins — headings/display → role token --font-display
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-poppins',
})

// Roboto — body text → role token --font-body
export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-roboto',
})

// Karla — fallback in the body stack → role token --font-karla
export const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-karla',
})

// Caveat — handwritten accent, About only → role token --font-hand.
// preload:false — it is used on a single page (About), so it must not add a
// preload hint to every (site) route. The face still loads when actually used.
export const caveat = Caveat({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-caveat',
})

// Roboto Mono — SKU/specs → role token --font-mono. preload:false — narrow
// (SKU/spec) usage; loaded on demand rather than preheated on every route.
export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  variable: '--font-roboto-mono',
})

/** Space-joined `variable` classNames for the root element. */
export const fontVariables = [
  poppins.variable,
  roboto.variable,
  karla.variable,
  caveat.variable,
  robotoMono.variable,
].join(' ')
