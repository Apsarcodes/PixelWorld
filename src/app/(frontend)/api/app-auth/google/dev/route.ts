import { upsertGoogleAccount } from '@/lib/google-auth'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const state = url.searchParams.get('state') || ''
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google Quick Sign-In — PixelWorld</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #F4F6FB;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #1A1A2E;
    }
    .card {
      background: #FFFFFF;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.06);
      border: 1px solid rgba(0,0,0,0.06);
      width: 100%;
      max-width: 440px;
      padding: 40px;
      box-sizing: border-box;
      text-align: center;
    }
    .google-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 20px;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 8px;
      letter-spacing: -0.5px;
    }
    p.sub {
      color: #64748B;
      font-size: 14px;
      margin: 0 0 28px;
      line-height: 1.5;
    }
    .quick-btn {
      width: 100%;
      padding: 14px;
      border-radius: 14px;
      border: 1px solid #E2E8F0;
      background: #FFFFFF;
      color: #1E293B;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      transition: all 0.2s ease;
      text-align: left;
    }
    .quick-btn:hover {
      background: #F8FAFC;
      border-color: #6C5FE6;
      box-shadow: 0 4px 12px rgba(108, 95, 230, 0.1);
    }
    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #6C5FE6;
      color: #FFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
    }
    .user-info {
      flex: 1;
    }
    .user-name {
      font-size: 14px;
      font-weight: 700;
      color: #0F172A;
    }
    .user-email {
      font-size: 12px;
      color: #64748B;
    }
    .divider {
      height: 1px;
      background: #E2E8F0;
      margin: 20px 0;
      position: relative;
    }
    .divider span {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: #FFF;
      padding: 0 10px;
      color: #94A3B8;
      font-size: 12px;
    }
    .custom-form {
      text-align: left;
    }
    .input-group {
      margin-bottom: 14px;
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 6px;
    }
    input {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid #CBD5E1;
      font-size: 14px;
      box-sizing: border-box;
      outline: none;
    }
    input:focus {
      border-color: #6C5FE6;
    }
    .submit-btn {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      border: none;
      background: #6C5FE6;
      color: #FFF;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 6px;
      transition: background 0.2s;
    }
    .submit-btn:hover {
      background: #5B4ED5;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      background: #EEF2FF;
      color: #6C5FE6;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .hint {
      margin-top: 24px;
      font-size: 11px;
      color: #94A3B8;
      line-height: 1.5;
    }
    .hint code {
      background: #F1F5F9;
      padding: 2px 5px;
      border-radius: 4px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="card">
    <svg class="google-icon" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
    </svg>
    <div class="badge">Development Sandbox Mode</div>
    <h1>Google Quick Sign-In</h1>
    <p class="sub">Choose a verified Google account for instant account creation and sign-in to PixelWorld.</p>

    <!-- 1-Click Quick Sign In -->
    <form method="POST" action="/api/app-auth/google/dev">
      <input type="hidden" name="email" value="mohamedapsarasif761@gmail.com">
      <input type="hidden" name="firstName" value="Apsar">
      <input type="hidden" name="lastName" value="Asif">
      <input type="hidden" name="state" value="${state}">
      <button type="submit" class="quick-btn">
        <div class="avatar">A</div>
        <div class="user-info">
          <div class="user-name">Apsar Asif</div>
          <div class="user-email">mohamedapsarasif761@gmail.com</div>
        </div>
        <span style="color:#6C5FE6; font-size:13px; font-weight:700;">Continue &rarr;</span>
      </button>
    </form>

    <div class="divider"><span>or use another account</span></div>

    <!-- Custom Account Input -->
    <form method="POST" action="/api/app-auth/google/dev" class="custom-form">
      <input type="hidden" name="state" value="${state}">
      <div class="input-group">
        <label for="name">Full Name</label>
        <input type="text" id="name" name="firstName" placeholder="e.g. John Doe" required>
      </div>
      <div class="input-group">
        <label for="email">Google Email Address</label>
        <input type="email" id="email" name="email" placeholder="e.g. user@gmail.com" required>
      </div>
      <button type="submit" class="submit-btn">Quick Sign In with Google</button>
    </form>

    <div class="hint">
      Live Google OAuth is supported. To connect official Google consent screens, add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> to your <code>.env.local</code>.
    </div>
  </div>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const rawName = String(formData.get('firstName') || '').trim()
    const rawLastName = String(formData.get('lastName') || '').trim()

    if (!email) {
      return Response.json({ error: 'Valid email is required.' }, { status: 400 })
    }

    const parts = rawName.split(' ')
    const firstName = parts[0] || 'User'
    const lastName = rawLastName || parts.slice(1).join(' ') || ''

    await upsertGoogleAccount({
      email,
      firstName,
      lastName,
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    return Response.redirect(`${siteUrl}/`, 302)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Google quick-login failed'
    console.error('Dev Google login error:', err)
    return Response.json({ error: message }, { status: 500 })
  }
}
