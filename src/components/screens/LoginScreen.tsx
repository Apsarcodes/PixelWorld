import React, { useState, useEffect } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Eye, HelpCircle, Inbox, RefreshCw, Shield } from 'lucide-react'
import type { Screen, AppUser } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn } from '@/components/common/UIComponents'
import { GoogleIcon, AuthPanel, AuthInput, OtpInput } from '@/components/common/AuthComponents'
import { savePreviewSession, previewAuthorizationHeaders } from '@/lib/session'

type LoginView = 'login' | 'forgot' | 'otp' | 'reset' | 'reset-success'

export function LoginScreen({
  onNavigate,
  onAuthenticated,
}: {
  onNavigate: (s: Screen) => void
  onAuthenticated: (user: AppUser) => void
}) {
  const [view, setView] = useState<LoginView>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // forgot / OTP / reset state
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [otpError, setOtpError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const [newPw, setNewPw] = useState('')
  const [confirmNewPw, setConfirmNewPw] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)

  // Countdown for resend
  useEffect(() => {
    if (view !== 'otp') return
    setResendTimer(30)
    const t = setInterval(() => setResendTimer((n) => (n > 0 ? n - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [view])

  const handleLogin = async () => {
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/app-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.')
      savePreviewSession(result.previewToken)
      const sessionResponse = await fetch('/api/app-auth/me', {
        credentials: 'include',
        cache: 'no-store',
        headers: previewAuthorizationHeaders(),
      })
      const session = await sessionResponse.json()
      if (!session.user) {
        throw new Error('We could not verify your sign-in session. Please try again.')
      }
      onAuthenticated(session.user)
      onNavigate('dashboard')
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = () => {
    if (!forgotEmail) {
      setError('Please enter your email address.')
      return
    }
    setError(
      'Password reset by email is not available yet. Please contact your account administrator.',
    )
  }

  const handleVerifyOtp = () => {
    const code = otp.join('')
    if (code.length < 6) {
      setOtpError('Please enter the full 6-digit code.')
      return
    }
    setOtpError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setView('reset')
    }, 1000)
  }

  const handleReset = () => {
    if (!newPw || newPw !== confirmNewPw) {
      setError('Passwords do not match.')
      return
    }
    if (newPw.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setView('reset-success')
    }, 1200)
  }

  const leftPanel = (
    <AuthPanel
      gradient="bg-gradient-to-br from-[#6C5FE6] via-[#5548CC] to-[#3D2FAA]"
      title={
        <>
          The world's first
          <br />
          pixel-perfect ad
          <br />
          marketplace.
        </>
      }
      subtitle="Reach millions across cities, neighbourhoods, and digital canvases. Every pixel tells your story."
      stats={[
        ['12K+', 'Advertisers'],
        ['180+', 'Cities'],
        ['₹2.4Cr', 'Ad spend/mo'],
      ]}
    />
  )

  // ── View: Login ──────────────────────────────────────────────────────────────
  if (view === 'login')
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 font-['Outfit'] transition-colors"
            >
              <ArrowLeft size={14} /> Back to Marketplace
            </button>
            <div className="lg:hidden mb-8">
              <PwLogo size="sm" />
            </div>
            <div className="mb-8">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Welcome back
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                Sign in to your PixelWorld account
              </p>
            </div>

            <button
              disabled
              title="Google sign-in is not configured"
              className="w-full flex items-center justify-center gap-3 border border-black/10 bg-white rounded-2xl px-5 py-3 text-sm font-['Outfit'] font-semibold text-muted-foreground opacity-60 cursor-not-allowed mb-5"
            >
              <GoogleIcon /> Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-black/8" />
              <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                or sign in with email
              </span>
              <div className="flex-1 h-px bg-black/8" />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-['Inter'] rounded-xl px-4 py-3 mb-4">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <AuthInput
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@company.com"
              />
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-['Outfit'] font-semibold text-muted-foreground">
                    Password
                  </span>
                  <button
                    onClick={() => {
                      setForgotEmail(email)
                      setError('')
                      setView('forgot')
                    }}
                    className="text-xs text-[#6C5FE6] font-['Outfit'] font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <AuthInput
                  label=""
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  rightEl={
                    <button
                      onClick={() => setShowPw(!showPw)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Eye size={15} />
                    </button>
                  }
                />
              </div>
            </div>

            <PrimaryBtn full onClick={handleLogin} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={15} />
                </>
              )}
            </PrimaryBtn>

            <p className="text-center text-sm text-muted-foreground font-['Inter'] mt-6">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="text-[#6C5FE6] font-['Outfit'] font-semibold hover:underline"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    )

  // ── View: Forgot Password ────────────────────────────────────────────────────
  if (view === 'forgot')
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <button
              onClick={() => {
                setError('')
                setView('login')
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit'] font-semibold mb-8 transition-colors"
            >
              <ArrowLeft size={15} /> Back to sign in
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#6C5FE6]/12 flex items-center justify-center mb-6">
              <HelpCircle size={26} className="text-[#6C5FE6]" />
            </div>

            <div className="mb-7">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Forgot password?
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                Email password recovery is not configured yet. Enter your account email to view the
                available support option.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-['Inter'] rounded-xl px-4 py-3 mb-4">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div className="mb-6">
              <AuthInput
                label="Email address"
                type="email"
                value={forgotEmail}
                onChange={setForgotEmail}
                placeholder="you@company.com"
              />
            </div>

            <PrimaryBtn full onClick={handleForgot} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Checking…
                </>
              ) : (
                <>
                  Continue <ArrowRight size={15} />
                </>
              )}
            </PrimaryBtn>

            <div className="mt-6 p-4 rounded-xl bg-[#EDF0F8] border border-black/6">
              <div className="text-xs font-['Outfit'] font-semibold text-foreground mb-1">
                Password recovery
              </div>
              <ol className="space-y-1">
                {[
                  'Email delivery will be added in a later integration',
                  'No reset codes are generated or simulated',
                  'Contact your account administrator for assistance',
                ].map((s, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground font-['Inter'] flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#6C5FE6]/15 text-[#6C5FE6] text-[9px] font-['JetBrains_Mono'] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    )

  // ── View: OTP Verification ───────────────────────────────────────────────────
  if (view === 'otp')
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <button
              onClick={() => {
                setOtp(Array(6).fill(''))
                setOtpError('')
                setView('forgot')
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit'] font-semibold mb-8 transition-colors"
            >
              <ArrowLeft size={15} /> Back
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#00A882]/12 flex items-center justify-center mb-6">
              <Inbox size={26} className="text-[#00A882]" />
            </div>

            <div className="mb-2">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Check your email
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                We sent a 6-digit code to{' '}
                <strong className="text-foreground font-semibold">{forgotEmail}</strong>.<br />
                It expires in 10 minutes.
              </p>
            </div>

            <div className="my-8">
              <OtpInput value={otp} onChange={setOtp} />
              {otpError && (
                <p className="text-center text-xs text-red-500 font-['Inter'] mt-3 flex items-center justify-center gap-1">
                  <AlertTriangle size={11} /> {otpError}
                </p>
              )}
            </div>

            <PrimaryBtn
              full
              onClick={handleVerifyOtp}
              disabled={loading || otp.join('').length < 6}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Verifying…
                </>
              ) : (
                <>
                  Verify Code <ArrowRight size={15} />
                </>
              )}
            </PrimaryBtn>

            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="text-sm text-muted-foreground font-['Inter']">
                Didn't receive it?
              </span>
              {resendTimer > 0 ? (
                <span className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  onClick={() => {
                    setOtp(Array(6).fill(''))
                    setResendTimer(30)
                  }}
                  className="text-sm text-[#6C5FE6] font-['Outfit'] font-semibold hover:underline"
                >
                  Resend code
                </button>
              )}
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setForgotEmail('')
                  setView('forgot')
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-['Inter'] hover:underline"
              >
                Wrong email address? Change it
              </button>
            </div>
          </div>
        </div>
      </div>
    )

  // ── View: Reset Password ─────────────────────────────────────────────────────
  if (view === 'reset') {
    const strength =
      newPw.length === 0
        ? 0
        : newPw.length < 6
          ? 1
          : newPw.length < 10
            ? 2
            : /[A-Z]/.test(newPw) && /[0-9]/.test(newPw)
              ? 4
              : 3
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-[#00A882]']
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-[#6C5FE6]/12 flex items-center justify-center mb-6">
              <Shield size={26} className="text-[#6C5FE6]" />
            </div>

            <div className="mb-7">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Set new password
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                Your identity is verified. Choose a strong new password.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-['Inter'] rounded-xl px-4 py-3 mb-4">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <AuthInput
                  label="New password"
                  type={showNewPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={setNewPw}
                  placeholder="Min. 8 characters"
                  rightEl={
                    <button
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Eye size={15} />
                    </button>
                  }
                />
                {newPw && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-black/8'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-['JetBrains_Mono'] text-muted-foreground w-12 text-right">
                      {strengthLabels[strength]}
                    </span>
                  </div>
                )}
              </div>
              <AuthInput
                label="Confirm new password"
                type="password"
                value={confirmNewPw}
                onChange={setConfirmNewPw}
                placeholder="Re-enter password"
                error={
                  confirmNewPw && confirmNewPw !== newPw ? 'Passwords do not match' : undefined
                }
              />
            </div>

            <div className="rounded-xl bg-[#EDF0F8] p-4 mb-6 space-y-1.5">
              {[
                ['At least 8 characters', newPw.length >= 8],
                ['At least one uppercase letter', /[A-Z]/.test(newPw)],
                ['At least one number', /[0-9]/.test(newPw)],
              ].map(([rule, met]) => (
                <div key={rule as string} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${met ? 'bg-[#00A882]' : 'bg-black/10'}`}
                  >
                    {met && <Check size={9} className="text-white" />}
                  </div>
                  <span
                    className={`text-xs font-['Inter'] transition-colors ${met ? 'text-[#00A882]' : 'text-muted-foreground'}`}
                  >
                    {rule as string}
                  </span>
                </div>
              ))}
            </div>

            <PrimaryBtn full onClick={handleReset} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Updating password…
                </>
              ) : (
                <>
                  Reset Password <ArrowRight size={15} />
                </>
              )}
            </PrimaryBtn>
          </div>
        </div>
      </div>
    )
  }

  // ── View: Reset Success ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex">
      {leftPanel}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-[#00A882]/12 flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-[#00A882]" />
          </div>
          <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-2">
            Password reset!
          </h1>
          <p className="text-muted-foreground font-['Inter'] text-sm mb-8">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <PrimaryBtn
            full
            onClick={() => {
              setView('login')
              setPassword('')
              setNewPw('')
              setConfirmNewPw('')
              setOtp(Array(6).fill(''))
            }}
          >
            Back to Sign In <ArrowRight size={15} />
          </PrimaryBtn>
        </div>
      </div>
    </div>
  )
}

