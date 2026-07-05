'use client'

/**
 * ContactForm — the single lead-capture island (Story 2.1, Epic 2 AD-8). One
 * `<form id="contactForm">` with the 6 fixed fields, the fixed topic select and
 * client-side validation. Content arrives by prop (default: `contactFormContent`)
 * — the island never fetches (AD-1/AD-4).
 *
 * Pixel-faithful to the prototype (Contact.html) via the `.cf-*` classes in
 * components.css; the validation is a DELIBERATE addition on top (the prototype
 * has none) demanded by the AC/FR-9. The form carries `noValidate` and validates
 * in JS so the error presentation is single-sourced.
 *
 * On submit we run the pure `validateContactForm` FIRST. If it returns errors we
 * set them (rendering inline `.cf-error` messages + `.cf-field.error` borders +
 * `aria-invalid`/`aria-describedby`), focus the FIRST invalid field in field
 * order, and block — the send `action` is NOT called. If valid we drive the
 * submit state machine `idle → submitting → success | error` (Story 2.2): we
 * `await action(values)` (default: the `submitContactForm` Server Action, which
 * transits the lead to the CRM). On success the button flips to
 * `content.successLabel` and, after 1600ms (prototype Contact.html:621), the
 * form resets to empty and returns to `idle` (and `onSuccess?.()` fires — the
 * seam Story 2.4 uses to auto-close its modal). On failure we surface a
 * form-level `role="alert"` message and PRESERVE every entered value (topic
 * included) so the user can retry without re-typing.
 *
 * Story 2.4 adds ONE additive seam: an optional `deepLink` prop. When a wrapper
 * (`ContactInline` reading `?topic=`, or a modal trigger) passes `{ topic }`, a
 * one-shot effect (ref-guarded) normalizes the text, matches it against
 * `content.topics`, preselects the topic, briefly pulses the select
 * (`.cf-prefilled`), smooth-scrolls the form into view and autofocuses the name
 * field — ported from the prototype (Contact.html:625-644). WITHOUT `deepLink`
 * the behaviour is byte-identical to Story 2.3 (the effect returns early). The
 * two-column info panel and the modal chrome live in sibling wrappers, not here.
 */
import { useEffect, useRef, useState } from 'react'

import {
  contactFormContent,
  type ContactField,
  type ContactFormContent,
  type ContactFormResult,
  type ContactFormValues,
} from '@/content/contact-form'
import { submitContactForm } from './submit'
import { validateContactForm } from './validate'

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

type ContactFormProps = {
  /** Content contract (labels / topics / microcopy / error strings). */
  content?: ContactFormContent
  /** Send path — defaults to the real CRM Server Action; overridable for tests. */
  action?: (values: ContactFormValues) => Promise<ContactFormResult>
  /** Fires after a successful submit resets the form (Story 2.4 modal auto-close). */
  onSuccess?: () => void
  /**
   * Deep-link seam (Story 2.4). When present with a `topic`, the topic is matched
   * against `content.topics` and preselected on mount (see the one-shot effect).
   * Absent → the form behaves exactly as Story 2.3.
   */
  deepLink?: { topic?: string }
}

/** All fields start empty — keeps the controlled inputs in sync with the values. */
function makeInitialValues(fields: ContactField[]): ContactFormValues {
  const values = {} as ContactFormValues
  for (const field of fields) values[field.name] = ''
  // Honeypot is NOT in `content.fields` (never rendered by the grid / validated),
  // so seed it explicitly to keep its controlled input in sync (Story 2.3).
  values.honeypot = ''
  return values
}

/**
 * Group fields into `.cf-row`s the way the prototype does: a `full` field is its
 * own row; other fields pair up two-per-row (name+email, phone+company).
 */
function toRows(fields: ContactField[]): ContactField[][] {
  const rows: ContactField[][] = []
  let pair: ContactField[] = []
  for (const field of fields) {
    if (field.full) {
      if (pair.length) {
        rows.push(pair)
        pair = []
      }
      rows.push([field])
    } else {
      pair.push(field)
      if (pair.length === 2) {
        rows.push(pair)
        pair = []
      }
    }
  }
  if (pair.length) rows.push(pair)
  return rows
}

export default function ContactForm({
  content = contactFormContent,
  action = submitContactForm,
  onSuccess,
  deepLink,
}: ContactFormProps) {
  const [values, setValues] = useState<ContactFormValues>(() => makeInitialValues(content.fields))
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Submit state machine (Story 2.2): idle → submitting → success | error.
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [submitError, setSubmitError] = useState('')
  // DOM handles for focusing the first invalid field (not tied to render).
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({})
  // Form element handle — the deep-link effect scrolls it into view.
  const formRef = useRef<HTMLFormElement | null>(null)
  // "Apply the deep-link exactly once" guard (Story 2.4). `deepLink` arrives
  // undefined on the first render (ContactInline sets it in a mount effect), so
  // this survives the undefined→{topic} transition and still fires only once.
  const deepLinkApplied = useRef(false)
  // Post-success reset timer — held so the useEffect cleanup can clear it and we
  // never call setState after unmount (leak / warning).
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Synchronous re-entrancy lock — closes the double-submit window BEFORE the
  // `submitting` status (and the disabled button) commit on the next render, so
  // two rapid clicks can't both read a stale `idle` status and fire two POSTs.
  const inFlight = useRef(false)

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, [])

  // Deep-link `?topic=` (Story 2.4), ported from Contact.html:625-644. Runs once
  // (ref guard): normalize the wanted text the same way the prototype does, match
  // it against the topic OPTIONS, and if it hits — preselect the topic, then in a
  // rAF: smooth-scroll the form into view (~110px offset), pulse the select
  // (`.cf-prefilled`, removed after ~2400ms) and autofocus the name field (~700ms).
  // The topic is set here (not in initial state) so the select is empty on the
  // server and in the first client render — no hydration mismatch. A miss is a
  // silent no-op; without `deepLink` the effect returns before touching anything.
  useEffect(() => {
    if (deepLinkApplied.current) return
    const wanted = deepLink?.topic
    if (!wanted) return
    deepLinkApplied.current = true

    const norm = (s: string) =>
      s.replace(/[&–—]/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
    const match = content.topics.find(
      (topic) => !topic.disabled && norm(topic.label) === norm(wanted),
    )
    if (!match) return

    // Set the topic AFTER mount (not in initial state) so the select is empty on the
    // server and in the first client render — no hydration mismatch. Runs once (ref guard).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-mount deep-link apply (see above)
    setValues((prev) => ({ ...prev, topic: match.value }))

    const form = formRef.current
    const select = fieldRefs.current.topic
    // Hold the rAF + timeout handles so the cleanup cancels anything still
    // pending if the form unmounts first (e.g. the modal is closed right after a
    // deep-linked open) — no stray smooth-scroll / focus on a detached node.
    const timers: ReturnType<typeof setTimeout>[] = []
    const raf = requestAnimationFrame(() => {
      if (form) {
        const top = form.getBoundingClientRect().top + window.scrollY - 110
        window.scrollTo({ top, behavior: 'smooth' })
      }
      if (select) {
        select.classList.add('cf-prefilled')
        timers.push(setTimeout(() => select.classList.remove('cf-prefilled'), 2400))
      }
      timers.push(setTimeout(() => fieldRefs.current.name?.focus({ preventScroll: true }), 700))
    })
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      // Also drop the pulse class: if cleanup runs after the class was added but
      // before its removal timer fires (e.g. the modal is closed within ~2.4s of a
      // deep-linked open), clearing the timer alone would strand the static orange
      // border/glow permanently on the still-mounted select.
      select?.classList.remove('cf-prefilled')
    }
  }, [deepLink, content.topics])

  function handleChange(name: keyof ContactFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [name]: e.target.value }))
      // Clear this field's error as the user corrects it, so the red border and
      // message don't linger falsely until the next submit.
      setErrors((prev) => {
        if (!prev[name]) return prev
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Guard against a double-click starting a second in-flight submit. The ref is
    // the real lock (synchronous); the status check is a cheap early-out.
    if (inFlight.current || status === 'submitting' || status === 'success') return

    // Client validation FIRST (2.1 behaviour) — focus first invalid, block send.
    const nextErrors = validateContactForm(values, content)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      // A prior failed submit may have left the form-level delivery-error banner
      // up; the current problem is field validation (shown inline), so clear the
      // stale `error` state before we focus + block — never stack a stale
      // delivery alert on top of fresh field errors.
      if (status === 'error') {
        setStatus('idle')
        setSubmitError('')
      }
      // Focus the first invalid field in field order (not object-key order).
      const firstInvalid = content.fields.find((field) => nextErrors[field.name])
      if (firstInvalid) fieldRefs.current[firstInvalid.name]?.focus()
      return
    }

    // Valid → transit to the CRM via the (default: Server Action) send path.
    inFlight.current = true
    setStatus('submitting')
    setSubmitError('')
    try {
      const result = await action(values)

      if (result.ok) {
        // Success mirrors the prototype: button → successLabel, then after 1600ms
        // the form empties and returns to idle (and onSuccess fires — 2.4 seam).
        setStatus('success')
        resetTimer.current = setTimeout(() => {
          setValues(makeInitialValues(content.fields))
          setErrors({})
          setStatus('idle')
          onSuccess?.()
        }, 1600)
      } else {
        // Failure preserves every value (topic included) so the user can retry.
        setStatus('error')
        setSubmitError(result.message)
      }
    } catch {
      // The action itself rejected (RSC transport error / server 500), not a CRM
      // non-2xx we already model as `{ ok: false }`. Degrade to the same error
      // state so the form never gets stuck in `submitting`; values are preserved.
      setStatus('error')
      setSubmitError(content.errorMessages.submit)
    } finally {
      inFlight.current = false
    }
  }

  const rows = toRows(content.fields)

  return (
    <form id="contactForm" className="cf-form" noValidate ref={formRef} onSubmit={handleSubmit}>
      <h3>{content.heading}</h3>

      {rows.map((row, i) => (
        <div className="cf-row" key={i}>
          {row.map((field) => {
            const message = errors[field.name]
            const errorId = `${field.id}-error`
            const fieldClass = ['cf-field', field.full && 'full', message && 'error']
              .filter(Boolean)
              .join(' ')

            const shared = {
              id: field.id,
              name: field.name,
              value: values[field.name],
              onChange: handleChange(field.name),
              'aria-invalid': message ? true : undefined,
              'aria-describedby': message ? errorId : undefined,
            } as const

            return (
              <div className={fieldClass} key={field.name}>
                <label htmlFor={field.id}>{field.label}</label>

                {field.control === 'select' ? (
                  <select
                    {...shared}
                    ref={(el) => {
                      fieldRefs.current[field.name] = el
                    }}
                  >
                    {content.topics.map((topic) => (
                      <option key={topic.label} value={topic.value} disabled={topic.disabled}>
                        {topic.label}
                      </option>
                    ))}
                  </select>
                ) : field.control === 'textarea' ? (
                  <textarea
                    {...shared}
                    ref={(el) => {
                      fieldRefs.current[field.name] = el
                    }}
                  />
                ) : (
                  <input
                    {...shared}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    ref={(el) => {
                      fieldRefs.current[field.name] = el
                    }}
                  />
                )}

                {message ? (
                  <span className="cf-error" id={errorId}>
                    {message}
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
      ))}

      {status === 'error' ? (
        <p className="cf-error" role="alert">
          {submitError}
        </p>
      ) : null}

      {/* Honeypot anti-spam trap on the single submit path (Story 2.3): zero
          friction. The wrapper is `inert` (React 19) — the correct primitive
          here: it removes the subtree from focus, the accessibility tree AND all
          interaction, so a human/AT never reaches it and, crucially, browser
          autofill / password managers can't populate it either (a real user's
          autofilled trap would otherwise be silently dropped as a bot). `inert`
          also resolves the axe `aria-hidden-focus` violation that an
          `aria-hidden` wrapper around a focusable input would trip. `.cf-hp`
          keeps it off-screen for sighted users; the `data-*-ignore` hints tell
          the common password managers to skip it too. A field-harvesting POST
          bot still fills it (server-side check catches that on the one path). */}
      <div className="cf-hp" inert>
        <label htmlFor={content.honeypot.id}>{content.honeypot.label}</label>
        <input
          type="text"
          id={content.honeypot.id}
          name={content.honeypot.name}
          value={values.honeypot}
          onChange={handleChange('honeypot')}
          tabIndex={-1}
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
        />
      </div>

      <button
        type="submit"
        className="btn btn-or"
        disabled={status === 'submitting' || status === 'success'}
      >
        {status === 'success' ? content.successLabel : content.submitLabel}
      </button>
    </form>
  )
}
