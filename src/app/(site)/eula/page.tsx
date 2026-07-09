// End-User License Agreement (`/eula`). Required as a public page by the Intuit
// Developer app profile (QuickBooks Online production keys). Self-contained: no CMS
// content dependency, so it renders even before the CMS is seeded. Header/Footer and
// <html>/<body> come from the (site) layout.
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'End-User License Agreement — Rollun',
  description: 'End-User License Agreement for Rollun software and integrations.',
}

const LAST_UPDATED = 'July 9, 2026'
const CONTACT_EMAIL = 'support@rollun.net'

export default function EulaPage() {
  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px', lineHeight: 1.65 }}>
      <h1>End-User License Agreement</h1>
      <p>
        <em>Last updated: {LAST_UPDATED}</em>
      </p>

      <p>
        This End-User License Agreement (&ldquo;Agreement&rdquo;) is a legal agreement between you
        (&ldquo;you&rdquo; or &ldquo;User&rdquo;) and Rollun (&ldquo;Rollun&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;) governing your use of Rollun&rsquo;s
        software, applications, and integrations, including our integration with QuickBooks Online
        (collectively, the &ldquo;Software&rdquo;). By accessing or using the Software you agree to
        be bound by this Agreement. If you do not agree, do not use the Software.
      </p>

      <h2>1. License grant</h2>
      <p>
        Subject to your compliance with this Agreement, Rollun grants you a limited, non-exclusive,
        non-transferable, revocable license to use the Software solely for your internal business
        purposes. Rollun operates in the automotive parts and motorcycle tire retail business in the
        United States, and the Software is provided to support those business operations.
      </p>

      <h2>2. Restrictions</h2>
      <p>You agree not to, and not to permit any third party to:</p>
      <ul>
        <li>copy, modify, or create derivative works of the Software except as permitted in writing;</li>
        <li>reverse engineer, decompile, or attempt to derive the source code of the Software;</li>
        <li>rent, lease, sell, sublicense, or otherwise transfer the Software;</li>
        <li>use the Software in violation of any applicable law or the terms of any third-party service, including Intuit&rsquo;s QuickBooks Online terms.</li>
      </ul>

      <h2>3. Third-party services</h2>
      <p>
        The Software integrates with third-party services, including Intuit QuickBooks Online. Your
        use of those services is governed by the respective third party&rsquo;s terms and privacy
        policies. Rollun is not responsible for third-party services and accesses them only with the
        authorizations you grant.
      </p>

      <h2>4. Data</h2>
      <p>
        Our handling of data accessed through the Software, including accounting data obtained from
        QuickBooks Online, is described in our{' '}
        <a href="/privacy">Privacy Policy</a>. The QuickBooks integration is used on a read-only
        basis for internal reporting and analytics.
      </p>

      <h2>5. Disclaimer of warranties</h2>
      <p>
        The Software is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties
        of any kind, whether express, implied, or statutory, including any implied warranties of
        merchantability, fitness for a particular purpose, and non-infringement.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Rollun will not be liable for any indirect,
        incidental, special, consequential, or punitive damages, or any loss of profits or data,
        arising out of or related to your use of the Software.
      </p>

      <h2>7. Termination</h2>
      <p>
        This Agreement remains in effect until terminated. Rollun may suspend or terminate your
        license at any time if you breach this Agreement. Upon termination you must stop using the
        Software.
      </p>

      <h2>8. Changes</h2>
      <p>
        Rollun may update this Agreement from time to time. The updated version will be posted on
        this page with a revised &ldquo;Last updated&rdquo; date, and your continued use of the
        Software constitutes acceptance of the changes.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about this Agreement may be sent to{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </main>
  )
}
