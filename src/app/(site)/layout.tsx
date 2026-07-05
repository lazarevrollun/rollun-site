import type { ReactNode } from 'react'

import { fontVariables } from '@/lib/fonts'

import '@/styles/theme.css'
import '@/styles/components.css'

export const metadata = {
  title: 'Rollun',
  description: 'Rollun site',
}

/**
 * Root shell for the public site. Story 1.2 wires self-hosted next/font variables
 * (fonts.ts) onto <html> and imports the global button stylesheet after theme.css.
 * Header (Story 1.3), Footer (Story 1.4) and the mobile chassis (Story 1.5) are
 * added by their own stories.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}
