/**
 * Resend Email Service for PixelWord
 * 
 * Supports transactional emails:
 * - Order Confirmation & GST Tax Invoices
 * - Ad Activation & Live Broadcast Alerts
 * - Welcome Emails & Password Resets
 * 
 * Uses Resend REST API (zero extra dependencies).
 * Gracefully falls back to console logging when RESEND_API_KEY is not configured.
 */

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  from,
  replyTo,
}: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log(`[Email Mock (No RESEND_API_KEY)] To: ${to} | Subject: ${subject}`)
    return { success: true, id: 'mock-email-id' }
  }

  // Default sender: Custom domain or Resend testing domain
  const sender = from || process.env.RESEND_FROM_EMAIL || 'PixelWord <notifications@pixelword.in>'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: sender,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: replyTo || 'support@pixelword.in',
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[Resend Error]', data)
      // If custom domain is pending verification in Resend dashboard, fall back to onboarding@resend.dev
      const msg = String(data?.message || '')
      if (
        (msg.includes('domain is not verified') || msg.includes('testing domain') || msg.includes('from_email')) &&
        !sender.includes('onboarding@resend.dev')
      ) {
        console.warn('[Resend] Domain verification pending in Resend dashboard. Falling back to onboarding@resend.dev...')
        try {
          const fallbackRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              from: 'PixelWord <onboarding@resend.dev>',
              to: Array.isArray(to) ? to : [to],
              subject,
              html,
              reply_to: replyTo || 'support@pixelword.in',
            }),
          })
          const fallbackData = await fallbackRes.json()
          if (fallbackRes.ok) {
            console.log('[Resend] Sent successfully via onboarding@resend.dev fallback:', fallbackData.id)
            return { success: true, id: fallbackData.id }
          }
        } catch (fallbackErr) {
          console.error('[Resend Fallback Error]', fallbackErr)
        }
      }
      return { success: false, error: data?.message || 'Failed to send email' }
    }

    return { success: true, id: data.id }
  } catch (err: any) {
    console.error('[Resend Exception]', err)
    return { success: false, error: err?.message || 'Network error' }
  }
}

/**
 * Sends official Order Confirmation & GST Tax Invoice Email to Advertiser
 */
export async function sendOrderConfirmationEmail(params: {
  to: string
  customerName: string
  invoiceNumber: string
  campaignName: string
  city: string
  slotName?: string
  days: number
  subtotal: number
  gstAmount: number
  totalAmount: number
  utr?: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pixelword.in'
  const canvasUrl = `${siteUrl}/?screen=canvas`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #1c1c24; margin: 0; padding: 0; }
    .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #6C5FE6, #4434B8); padding: 36px 32px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 0; font-size: 14px; opacity: 0.85; }
    .badge-paid { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 12px; }
    .content { padding: 32px; }
    .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2f7; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 500; }
    .val { font-weight: 700; color: #0f172a; text-align: right; }
    .total-row { display: flex; justify-content: space-between; padding: 14px 0 0 0; margin-top: 10px; border-top: 2px solid #cbd5e1; font-size: 16px; font-weight: 800; color: #6C5FE6; }
    .btn-container { text-align: center; margin: 32px 0 16px 0; }
    .btn { background: #6C5FE6; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none; display: inline-block; }
    .footer { text-align: center; padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Confirmed! 🚀</h1>
      <p>Your advertisement is now LIVE on PixelWord.</p>
      <div class="badge-paid">TAX INVOICE • PAID</div>
    </div>
    
    <div class="content">
      <p style="font-size: 15px; margin-top: 0;">Hi <strong>${params.customerName}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        We have received your payment. Your ad space has been activated and is broadcasting live to thousands of viewers on the <strong>${params.city.toUpperCase()}</strong> canvas.
      </p>

      <div class="details-box">
        <div class="row">
          <span class="label">Invoice Number</span>
          <span class="val">${params.invoiceNumber}</span>
        </div>
        <div class="row">
          <span class="label">Campaign Title</span>
          <span class="val">${params.campaignName}</span>
        </div>
        <div class="row">
          <span class="label">Target City</span>
          <span class="val" style="text-transform: capitalize;">${params.city}</span>
        </div>
        <div class="row">
          <span class="label">Duration</span>
          <span class="val">${params.days} Days</span>
        </div>
        ${params.utr ? `
        <div class="row">
          <span class="label">UPI UTR / Ref</span>
          <span class="val" style="font-family: monospace;">${params.utr}</span>
        </div>` : ''}
        <div class="row">
          <span class="label">Base Amount</span>
          <span class="val">₹${params.subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div class="row">
          <span class="label">GST (18%)</span>
          <span class="val">₹${params.gstAmount.toLocaleString('en-IN')}</span>
        </div>
        <div class="total-row">
          <span>Total Paid (Inc. Taxes)</span>
          <span>₹${params.totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div class="btn-container">
        <a href="${canvasUrl}" class="btn">View Live on Canvas →</a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;">PixelWord Digital Advertising Platform</p>
      <p style="margin: 0;">Recipient: ${params.to} • Support: support@pixelword.in</p>
    </div>
  </div>
</body>
</html>
`

  return sendEmail({
    to: params.to,
    subject: `Payment Confirmed & Invoice ${params.invoiceNumber} — PixelWord`,
    html,
  })
}

/**
 * Sends Password Reset Email
 */
export async function sendPasswordResetEmail(params: {
  to: string
  resetToken: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pixelword.in'
  const resetUrl = `${siteUrl}/reset-password?token=${params.resetToken}`

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #f8fafc; padding: 40px 20px;">
  <div style="max-width: 500px; margin: auto; background: white; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0;">
    <h2 style="color: #6C5FE6; margin-top: 0;">Reset Your Password</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
      We received a request to reset your PixelWord password. Click the button below to choose a new password:
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: #6C5FE6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color: #94a3b8; font-size: 12px;">If you did not request this, you can safely ignore this email.</p>
  </div>
</body>
</html>
`

  return sendEmail({
    to: params.to,
    subject: 'Reset your PixelWord password',
    html,
  })
}

/**
 * Sends 6-Digit Password Reset OTP Verification Code Email
 */
export async function sendPasswordResetOtpEmail(params: {
  to: string
  otp: string
}) {
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 40px 20px; color: #1e293b;">
  <div style="max-width: 480px; margin: auto; background: white; padding: 36px 32px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background: #6C5FE6; color: white; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; font-weight: 800; font-size: 20px; margin-bottom: 12px;">PW</div>
      <h2 style="color: #1e293b; margin: 0; font-size: 22px; font-weight: 800;">Password Reset Code</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Use the 6-digit verification code below to reset your PixelWord account password:</p>
    </div>
    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0; border: 1px dashed #cbd5e1;">
      <span style="font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #6C5FE6; font-family: monospace;">${params.otp}</span>
    </div>
    <p style="color: #64748b; font-size: 13px; line-height: 1.6; text-align: center; margin-bottom: 0;">
      This code is valid for <strong>10 minutes</strong>.<br>If you did not request this, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
`

  return sendEmail({
    to: params.to,
    subject: `Your PixelWord Password Reset Code: ${params.otp}`,
    html,
  })
}
