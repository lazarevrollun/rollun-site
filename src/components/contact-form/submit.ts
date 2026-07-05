'use server'

/**
 * submitContactForm — the single server-side handler that carries a valid lead
 * from the ContactForm island to the external Rollun CRM (Story 2.2, Epic 2
 * AD-8). It is a React 19 / Next 16 Server Action: the island `await`s it like a
 * plain async function, but the body runs ONLY on the server, so `CRM_API_URL`
 * (and any future CRM secret) stays in the server bundle and never reaches the
 * browser — no API route, no `NEXT_PUBLIC_` leak.
 *
 * The lead is transit-only (Never boundary): there is NO `Submissions`
 * collection, mailer or storage — the values are POSTed straight to the CRM and
 * forgotten. On every failure path we `console.error` a short diagnostic
 * (missing env / non-2xx status / thrown fetch) WITHOUT dumping the full request
 * body, so logs stay useful but don't spill lead PII.
 *
 * The server re-runs the SAME pure `validateContactForm` the island already ran
 * client-side (Epic constraint: client hint is duplicated server-side), so a
 * client bypass can't push a malformed lead through. This is also the seam where
 * Story 2.3 will drop its honeypot / anti-spam check — before the POST, on this
 * one path.
 *
 * The return shape is the fixed `ContactFormResult` contract — the ONE type all
 * three display modes of Story 2.4 consume. It is imported from the content
 * module (a `'use server'` file may only export async functions, so the type
 * cannot live here).
 */
import { contactFormContent, type ContactFormResult, type ContactFormValues } from '@/content/contact-form'
import { validateContactForm } from './validate'

/** Hard ceiling for the CRM round-trip — a hung endpoint must not wedge submit. */
const CRM_TIMEOUT_MS = 10_000

/** Fresh failure result each call — the fixed delivery-error microcopy (AD-14). */
function failure(): ContactFormResult {
  return { ok: false, message: contactFormContent.errorMessages.submit }
}

export async function submitContactForm(values: ContactFormValues): Promise<ContactFormResult> {
  // (1) Duplicate the client validation server-side — a bypassed client can't
  // push a malformed lead to the CRM. No POST if it doesn't pass.
  const errors = validateContactForm(values)
  if (Object.keys(errors).length > 0) {
    console.error('submitContactForm: server-side validation rejected the lead')
    return failure()
  }

  // (2) CRM endpoint from env only (never hardcoded, never NEXT_PUBLIC_). Missing
  // config degrades safely — no POST, logged, error surfaced to the user.
  const url = process.env.CRM_API_URL
  if (!url) {
    console.error('submitContactForm: CRM_API_URL is not configured')
    return failure()
  }

  // (3) Transit the lead to the CRM under a hard timeout so a stalled endpoint
  // aborts instead of hanging the submit forever. `res.ok` (2xx) is success; any
  // non-2xx, a timeout abort, or a thrown fetch (DNS/network) is a logged
  // delivery failure — the request body is never dumped to the logs.
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      signal: AbortSignal.timeout(CRM_TIMEOUT_MS),
    })

    if (!res.ok) {
      console.error(`submitContactForm: CRM responded with status ${res.status}`)
      return failure()
    }

    return { ok: true }
  } catch (err) {
    console.error('submitContactForm: CRM request failed', err)
    return failure()
  }
}
