import type { ReactNode } from 'react'

import Footer from '@/components/shell/Footer'
import Header from '@/components/shell/Header.client'
import { fontVariables } from '@/lib/fonts'

import '@/styles/theme.css'
import '@/styles/components.css'
import '@/styles/shell.css'

export const metadata = {
  title: 'Rollun',
  description: 'Rollun site',
}

/**
 * Root shell for the public site. Story 1.2 wires self-hosted next/font variables
 * (fonts.ts) onto <html> and imports the global button stylesheet after theme.css.
 * Story 1.3 mounts the shared <Header/> (both desktop + mobile compositions,
 * switched only by CSS media at 768px) above {children} on all 6 routes and
 * imports shell.css after components.css. Footer (1.4) and the mobile chassis
 * (1.5) are added by their own stories.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={fontVariables}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
