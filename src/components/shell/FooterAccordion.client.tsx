'use client'

/**
 * Footer accordion — a leaf `.client.tsx` island (AD-1) used ONLY by the mobile
 * footer composition. It owns nothing but the open/closed toggle: it renders the
 * `.facc` / `.facc-head` / `.facc-body` / `.facc-inner` chrome and the plus-icon,
 * flips `.open` on click and keeps `aria-expanded` in sync.
 *
 * The panel CONTENT is server-rendered and handed in via `children` (React
 * composition) — the island does not fetch (AD-1/AD-4). It starts CLOSED on both
 * server and client so there is no hydration mismatch (the mobile prototype
 * accordions all start collapsed — mobile.js only toggles `.open` on click).
 */
import { useId, useState, type ReactNode } from 'react'

export default function FooterAccordion({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  // Stable SSR-safe id ties the toggle button to its panel (aria-controls).
  const panelId = useId()

  return (
    <div className={`facc${open ? ' open' : ''}`}>
      <button
        className="facc-head"
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        {/* Decorative +/× glyph — hidden from AT; the button text is the label. */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </button>
      {/* Closed panel is `inert`: kept in layout (so max-height still animates) but
          out of tab order and the a11y tree, so its links aren't focusable/announced
          while collapsed — completing the disclosure `aria-expanded` implies. */}
      <div className="facc-body" id={panelId} inert={!open}>
        <div className="facc-inner">{children}</div>
      </div>
    </div>
  )
}
