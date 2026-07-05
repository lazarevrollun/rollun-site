import type { ReactNode } from 'react'

import '@/styles/theme.css'

export const metadata = {
  title: 'Rollun',
  description: 'Rollun site',
}

/**
 * Root shell for the public site. Story 1.1 renders only html/body/children;
 * Header (Story 1.3), Footer (Story 1.4) and next/font wiring (Story 1.2)
 * are added by their own stories.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
