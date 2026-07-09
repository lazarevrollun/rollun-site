// Privacy Policy (`/privacy`). Required as a public page by the Intuit Developer app
// profile (QuickBooks Online production keys) and genuinely reviewed by Intuit. Covers
// what data the QuickBooks integration accesses, how it is used, sharing, retention, and
// contact. Self-contained (no CMS dependency); shell comes from the (site) layout.
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Rollun',
  description: 'How Rollun collects, uses, and protects data, including QuickBooks Online data.',
}

const LAST_UPDATED = 'July 9, 2026'
const CONTACT_EMAIL = 'support@rollun.net'

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px', lineHeight: 1.65 }}>
      <h1>Privacy Policy</h1>
      <p>
        <em>Last updated: {LAST_UPDATED}</em>
      </p>

      <p>
        This Privacy Policy explains how Rollun (&ldquo;Rollun&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo; or &ldquo;our&rdquo;) collects, uses, discloses, and protects information in
        connection with our software, applications, and integrations (the &ldquo;Software&rdquo;),
        including our integration with Intuit QuickBooks Online. Rollun is a United States retailer
        of automotive parts and motorcycle tires, and uses the Software to run its own business
        operations.
      </p>

      <h2>1. Information we access</h2>
      <p>
        When our QuickBooks Online integration is connected, it accesses accounting data from the
        QuickBooks company you authorize. This may include financial records such as invoices,
        bills, payments, customers, vendors, items, accounts, and financial reports. The integration
        accesses this data on a <strong>read-only</strong> basis for internal reporting and
        analytics; it does not create, modify, or delete data in your QuickBooks company.
      </p>
      <p>
        We also process authentication credentials (OAuth tokens) needed to connect to QuickBooks
        Online. We do not receive or store your Intuit account password.
      </p>

      <h2>2. How we use information</h2>
      <ul>
        <li>to provide internal financial reporting, analytics, and business insights;</li>
        <li>to operate, maintain, and secure the Software;</li>
        <li>to comply with legal obligations.</li>
      </ul>
      <p>We do not use QuickBooks data for advertising, and we do not sell it.</p>

      <h2>3. How we share information</h2>
      <p>
        We do not sell or rent your information. We may share information only: (a) with service
        providers who process data on our behalf under confidentiality obligations; (b) when required
        by law or to protect legal rights; or (c) with your consent. Data accessed from QuickBooks
        Online is used solely for the internal purposes described above and is not disclosed to third
        parties for their own purposes.
      </p>

      <h2>4. Storage and security</h2>
      <p>
        Authentication tokens are stored securely and access is restricted to authorized systems and
        personnel. We use reasonable administrative, technical, and physical safeguards designed to
        protect information against unauthorized access, disclosure, alteration, and destruction. No
        method of transmission or storage is completely secure, so we cannot guarantee absolute
        security.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We retain information only as long as necessary for the purposes described in this Policy or
        as required by law. You may disconnect the QuickBooks Online integration at any time from
        within your Intuit account; upon disconnection we stop accessing your QuickBooks data and
        revoke the associated tokens.
      </p>

      <h2>6. Your choices</h2>
      <p>
        You can revoke Rollun&rsquo;s access to your QuickBooks company at any time via your Intuit
        account settings. You may also contact us to request information about, or deletion of, data
        we hold, subject to legal and operational limits.
      </p>

      <h2>7. Children&rsquo;s privacy</h2>
      <p>
        The Software is intended for business use and is not directed to children under 13, and we do
        not knowingly collect information from children.
      </p>

      <h2>8. Changes to this Policy</h2>
      <p>
        We may update this Policy from time to time. The updated version will be posted on this page
        with a revised &ldquo;Last updated&rdquo; date.
      </p>

      <h2>9. Contact</h2>
      <p>
        If you have questions about this Policy or our data practices, contact us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </main>
  )
}
