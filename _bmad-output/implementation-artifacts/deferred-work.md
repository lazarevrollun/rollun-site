# Deferred Work

Items surfaced incidentally during review, deferred for later focused attention.

- source_spec: `spec-1-2-design-system-tokens-fonts-buttons.md`
  summary: `src/app/(site)/layout.tsx` sets `<html lang="ru">` but the site content is English (all prototypes EN, US B2B, Epic 2 form English) — should be `lang="en"`.
  evidence: Pre-existing from Story 1.1 scaffold; surfaced by review's Cyrillic-subset findings. Latin-only font subsets are correct for English content; the `lang` attribute is a separate a11y/SEO correctness bug, out of scope for the DS-tokens story.
