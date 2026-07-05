/**
 * Content atoms for the ContactForm island (Story 2.1).
 *
 * The SINGLE home (AD-14) of every string the form renders — field labels,
 * the fixed topic list, microcopy (heading / submit label) and the validation
 * error messages. Both the pure validator (`validate.ts`) and the client island
 * (`ContactForm.client.tsx`) read from THIS module, never from a forked copy,
 * so the wording changes in one place (and Story 2.2's Server Action / Story
 * 2.4's three display modes reuse the same field contract).
 *
 * Field order, labels, `name`/`id`/`type`/`autocomplete` and the topic list are
 * ported VERBATIM from the Handoff prototype (Contact.html). Required-ness is a
 * deliberate 2.1 addition — the prototype has no validation — captured per field
 * so it lives in one place (Design Notes: B2B lead-form standard → name / email /
 * topic / message required, phone / company optional).
 */

/** Controlled form values keyed by field `name` — the validator's input shape. */
export type ContactFormValues = {
  name: string
  email: string
  phone: string
  company: string
  topic: string
  message: string
}

/** Which DOM control a field renders as. */
export type ContactFieldControl = 'input' | 'select' | 'textarea'

/** A single form field's render + validation metadata. */
export type ContactField = {
  /** Visible `<label>` text. */
  label: string
  /** Field key — also the HTML `name` and the `ContactFormValues` key. */
  name: keyof ContactFormValues
  /** DOM `id` (prototype `cf-*` ids), also the label's `for`. */
  id: string
  /** Control kind — decides input vs select vs textarea. */
  control: ContactFieldControl
  /** HTML `type` for `input` controls (text / email / tel). */
  type?: string
  /** HTML `autocomplete` token (omitted for topic / message). */
  autoComplete?: string
  /** When true the field is validated as required (trimmed non-empty). */
  required: boolean
  /** When true the field spans the full row width (`.cf-field.full`). */
  full?: boolean
}

/** An `<option>` in the fixed Question Topic select. */
export type TopicOption = {
  /** Visible option text. */
  label: string
  /** Submitted value ("" for the disabled placeholder). */
  value: string
  /** True only for the placeholder (`Select a topic`). */
  disabled?: boolean
}

/** The full content contract consumed by the island. */
export type ContactFormContent = {
  heading: string
  submitLabel: string
  /** Success-state button label (prototype `THANK YOU ✓`, Contact.html:620). */
  successLabel: string
  fields: ContactField[]
  topics: TopicOption[]
  errorMessages: {
    required: string
    email: string
    topic: string
    /** Delivery failure (non-2xx / network / missing env) — form-level alert. */
    submit: string
  }
}

/**
 * The fixed result contract of the CRM Server Action (Story 2.2, AD-8). This is
 * the ONE success/error shape every display mode of Story 2.4 consumes — modes
 * differ only in presentation, never in the send path. It lives HERE (a content
 * module) and not in `submit.ts` because a `'use server'` file may only export
 * async functions, so the type has to be imported by both the action and the
 * client island from this shared home.
 */
export type ContactFormResult = { ok: true } | { ok: false; message: string }

/**
 * The single content instance (default prop of `ContactForm`). Fields are listed
 * in the exact prototype order; pairing into `.cf-row`s (name+email, phone+company,
 * then the two `full` fields on their own rows) is derived by the island.
 */
export const contactFormContent: ContactFormContent = {
  heading: 'Send us a message',
  submitLabel: 'ASK A QUESTION',
  successLabel: 'THANK YOU ✓',
  fields: [
    { label: 'Your Name', name: 'name', id: 'cf-name', control: 'input', type: 'text', autoComplete: 'name', required: true },
    { label: 'Your Email', name: 'email', id: 'cf-email', control: 'input', type: 'email', autoComplete: 'email', required: true },
    { label: 'Phone Number', name: 'phone', id: 'cf-phone', control: 'input', type: 'tel', autoComplete: 'tel', required: false },
    { label: 'Company', name: 'company', id: 'cf-company', control: 'input', type: 'text', autoComplete: 'organization', required: false },
    { label: 'Question Topic', name: 'topic', id: 'cf-topic', control: 'select', required: true, full: true },
    { label: 'Your Message', name: 'message', id: 'cf-message', control: 'textarea', required: true, full: true },
  ],
  topics: [
    { label: 'Select a topic', value: '', disabled: true },
    { label: 'Wholesale & distribution', value: 'Wholesale & distribution' },
    { label: 'Partnership', value: 'Partnership' },
    { label: 'Marketplace operations', value: 'Marketplace operations' },
    { label: 'Returns & support', value: 'Returns & support' },
    { label: 'Other', value: 'Other' },
  ],
  errorMessages: {
    required: 'This field is required',
    email: 'Enter a valid email address',
    topic: 'Please select a topic',
    submit: 'Something went wrong. Please try again.',
  },
}
