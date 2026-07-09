// GET /quickbooks/connect — starts the QuickBooks Online OAuth2 handshake by
// redirecting the browser to Intuit's consent screen. After the user grants access,
// Intuit redirects back to /quickbooks/callback with an authorization `code` + `realmId`.
//
// This replaces the local `npm run auth` + ngrok flow: the redirect URI is the stable
// public https://com.rollun.org/quickbooks/callback. Used to (re-)mint the refresh token
// roughly every ~90 days, then pasted into Secret Manager (manual rotation, by design).
//
// Requires env: QUICKBOOKS_CLIENT_ID (and QUICKBOOKS_CLIENT_SECRET for the callback).
// Optional env: QUICKBOOKS_CONNECT_SECRET — if set, this endpoint requires ?key=<secret>
// so random visitors cannot initiate a handshake against our Intuit app.
import { NextResponse, type NextRequest } from 'next/server'

// No `export const dynamic` — incompatible with cacheComponents. Reading request
// searchParams below makes this handler dynamic automatically.

const AUTHORIZE_URL = 'https://appcenter.intuit.com/connect/oauth2'
// Read-only posture is enforced by the MCP server flags; OAuth still needs the full
// accounting scope to read any accounting entity.
const SCOPE = 'com.intuit.quickbooks.accounting'

function redirectUri(): string {
  return process.env.QUICKBOOKS_REDIRECT_URI || 'https://com.rollun.org/quickbooks/callback'
}

export function GET(req: NextRequest) {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID
  if (!clientId) {
    return new NextResponse(
      'QuickBooks integration is not configured (QUICKBOOKS_CLIENT_ID is missing).',
      { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    )
  }

  const guard = process.env.QUICKBOOKS_CONNECT_SECRET
  const key = req.nextUrl.searchParams.get('key') ?? ''
  if (guard && key !== guard) {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  // `state` is echoed back on the callback; when a guard is set we reuse it as a simple
  // CSRF/anti-drive-by token, otherwise a constant marker.
  const state = guard || 'rollun'

  const url = new URL(AUTHORIZE_URL)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', SCOPE)
  url.searchParams.set('redirect_uri', redirectUri())
  url.searchParams.set('state', state)

  return NextResponse.redirect(url.toString())
}
