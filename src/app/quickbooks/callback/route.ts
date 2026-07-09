// GET /quickbooks/callback — Intuit redirects here after consent with `code`, `realmId`
// and `state`. We exchange the authorization code for tokens and render the resulting
// refresh token + realm id so they can be copied into Secret Manager:
//   QUICKBOOKS_MCP_REFRESH_TOKEN  <-  refresh_token
//   QUICKBOOKS_MCP_REALM_ID       <-  realmId
//
// The refresh token rotates and expires (~100 days) and is NOT persisted automatically
// (manual rotation, by design) — re-run /quickbooks/connect before it lapses.
import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// OAuth token endpoint is the same for sandbox and production.
const TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'

function redirectUri(): string {
  return process.env.QUICKBOOKS_REDIRECT_URI || 'https://com.rollun.org/quickbooks/callback'
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function htmlPage(title: string, bodyHtml: string, status = 200): NextResponse {
  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>${esc(title)}</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; max-width: 760px; margin: 48px auto; padding: 0 20px; line-height: 1.6; color: #111; }
  h1 { font-size: 22px; }
  code, .val { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .val { display: block; word-break: break-all; background: #f5f5f7; border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin: 6px 0 18px; }
  .label { font-weight: 600; margin-top: 16px; }
  .muted { color: #666; font-size: 14px; }
  .err { background: #fdecea; border: 1px solid #f5c2c0; border-radius: 8px; padding: 12px; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`
  return new NextResponse(doc, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}

export async function GET(req: NextRequest) {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return htmlPage(
      'QuickBooks not configured',
      '<h1>QuickBooks integration is not configured</h1><p class="err">QUICKBOOKS_CLIENT_ID / QUICKBOOKS_CLIENT_SECRET are missing on the server.</p>',
      503,
    )
  }

  const params = req.nextUrl.searchParams

  const oauthError = params.get('error')
  if (oauthError) {
    const desc = params.get('error_description') ?? ''
    return htmlPage(
      'Authorization failed',
      `<h1>Authorization was not completed</h1><p class="err">${esc(oauthError)} ${esc(desc)}</p>`,
      400,
    )
  }

  const guard = process.env.QUICKBOOKS_CONNECT_SECRET
  const state = params.get('state') ?? ''
  if (guard && state !== guard) {
    return htmlPage('Forbidden', '<h1>Forbidden</h1><p class="err">Invalid state.</p>', 403)
  }

  const code = params.get('code')
  const realmId = params.get('realmId')
  if (!code || !realmId) {
    return htmlPage(
      'Missing parameters',
      '<h1>Missing code or realmId</h1><p class="err">Start the flow from <code>/quickbooks/connect</code>.</p>',
      400,
    )
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(),
  })

  let resp: Response
  try {
    resp = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body,
      cache: 'no-store',
    })
  } catch (e) {
    return htmlPage(
      'Token exchange failed',
      `<h1>Could not reach Intuit token endpoint</h1><p class="err">${esc(String(e))}</p>`,
      502,
    )
  }

  const raw = await resp.text()
  if (!resp.ok) {
    return htmlPage(
      'Token exchange failed',
      `<h1>Intuit rejected the token exchange (HTTP ${resp.status})</h1><p class="err">${esc(raw)}</p>`,
      502,
    )
  }

  let data: {
    refresh_token?: string
    access_token?: string
    x_refresh_token_expires_in?: number
    expires_in?: number
  }
  try {
    data = JSON.parse(raw)
  } catch {
    return htmlPage('Unexpected response', `<h1>Unexpected token response</h1><p class="err">${esc(raw)}</p>`, 502)
  }

  const refreshToken = data.refresh_token ?? ''
  const refreshTtlDays = data.x_refresh_token_expires_in
    ? Math.floor(data.x_refresh_token_expires_in / 86400)
    : null

  const bodyHtml = `
    <h1>QuickBooks connected ✓</h1>
    <p>Copy these two values into Secret Manager, then redeploy / restart the <code>quickbooks-mcp</code> service.</p>

    <div class="label">QUICKBOOKS_MCP_REFRESH_TOKEN</div>
    <div class="val">${esc(refreshToken)}</div>

    <div class="label">QUICKBOOKS_MCP_REALM_ID</div>
    <div class="val">${esc(realmId)}</div>

    <p class="muted">${
      refreshTtlDays !== null
        ? `This refresh token is valid for about ${refreshTtlDays} days and rotates on use. Re-run this flow before it lapses.`
        : 'This refresh token rotates on use and expires (~100 days). Re-run this flow before it lapses.'
    }</p>
    <p class="muted">Do not share these values — the refresh token grants read access to the QuickBooks company.</p>
  `
  return htmlPage('QuickBooks connected', bodyHtml)
}
