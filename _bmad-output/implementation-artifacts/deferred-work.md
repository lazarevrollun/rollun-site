# Deferred Work

Items surfaced incidentally during review, deferred for later focused attention.

- source_spec: `spec-1-2-design-system-tokens-fonts-buttons.md`
  summary: `src/app/(site)/layout.tsx` sets `<html lang="ru">` but the site content is English (all prototypes EN, US B2B, Epic 2 form English) — should be `lang="en"`.
  evidence: Pre-existing from Story 1.1 scaffold; surfaced by review's Cyrillic-subset findings. Latin-only font subsets are correct for English content; the `lang` attribute is a separate a11y/SEO correctness bug, out of scope for the DS-tokens story.

- source_spec: `spec-1-3-header-desktop-mobile.md`
  summary: No "skip to content" bypass link before the persistent site nav — keyboard users must tab through all 6 nav links on every one of the 6 routes (WCAG 2.4.1 Bypass Blocks, level A).
  evidence: Real, but cross-cutting: a proper skip link needs a stable `<main id>` landmark target and a shell-level decision on page/main structure (the layout renders `{children}` directly, pages own their own markup). Not local to the header diff — belongs to a focused shell/a11y pass, not a header follow-up patch.

- source_spec: `spec-1-3-header-desktop-mobile.md`
  summary: No `prefers-reduced-motion` handling for the header's scroll-reactive motion (height shrink + `translateY(-100%)` hide slide + box-shadow); WCAG 2.3.3 vestibular concern.
  evidence: Real, but better solved DS-wide than header-only: Story 1.5 adds reveal-on-scroll (more motion needing the same treatment) and theme.css already tokenizes motion. A header-scoped patch would be a fragmented half-measure; warrants one DS-level `@media (prefers-reduced-motion: reduce)` policy pass. Prototype has none, so this is a deliberate a11y enhancement beyond faithful reproduction.

- source_spec: `spec-1-4-footer-desktop-columns-mobile-accordions.md`
  summary: Mobile footer accordion open-state uses a verbatim fixed `max-height:420px` (shell.css `.site-footer--mb .facc.open .facc-body`); content taller than 420px (browser text-zoom, translated/i18n strings, or editable `SiteSettings` data in Epic 7) is silently clipped and its links become unreachable.
  evidence: Faithful to the prototype now (AD-13; `mobile.css:135`) and under the ceiling for current static content (~200px), so not a defect in this story. Becomes real when footer content is no longer fixed — most likely at the Epic 7 `SiteSettings` seam or under i18n. The robust replacement is animating `grid-template-rows:0fr↔1fr` (or measuring `scrollHeight`) instead of a fixed clamp; deferred because changing it now would deviate from the pixel source of truth with no present benefit.

- source_spec: `spec-1-5-mobile-chassis-drawer-scroll-lock-reveal.md`
  summary: The mobile nav drawer has no modal focus management — opening it does not move focus into the drawer, closing does not restore focus to the burger, Tab is not trapped inside the open drawer, and it lacks `role="dialog"`/`aria-modal`. Keyboard/SR users can tab out of the open drawer into the scrim-covered background.
  evidence: Real a11y gap, but beyond the prototype (plain `mobile.js` has zero focus handling) and beyond this story's spec. `inert`/`aria-hidden` on the closed drawer and Escape-to-close are already implemented; a full focus-trap + dialog semantics + focus restore is a deliberate enhancement that deserves focused implementation and testing (initial-focus target, trap edges, restore on all four close paths) rather than an unattended patch. Applies equally to any future modal overlay, so warrants one shared a11y-modal approach.
