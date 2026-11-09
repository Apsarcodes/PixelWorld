import React, { useState, useEffect } from 'react'
import { AlertTriangle, ArrowRight, Check, ChevronLeft, Eye, Inbox, Phone, RefreshCw, Sparkles } from 'lucide-react'
import type { Screen, AppUser } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn } from '@/components/common/UIComponents'
import { GoogleIcon, AuthPanel, AuthInput, OtpInput } from '@/components/common/AuthComponents'
import { savePreviewSession, previewAuthorizationHeaders } from '@/lib/session'

export function SignupScreen({
  onNavigate,
  onAuthenticated,
}: {
  onNavigate: (s: Screen) => void
  onAuthenticated: (user: AppUser) => void
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  // step 1 — credentials
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  // step 2 — profile
  const [role, setRole] = useState<'advertiser' | 'agency' | 'business'>('advertiser')
  const [company, setCompany] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  // step 3 — email OTP
  const [emailOtp, setEmailOtp] = useState<string[]>(Array(6).fill(''))
  const [otpError, setOtpError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  // step 4 — onboarding
  const [onboardGoal, setOnboardGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupError, setSignupError] = useState('')

  const pwStrength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : /[A-Z]/.test(password) && /[0-9]/.test(password)
            ? 4
            : 3
  const pwLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const pwColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-[#00A882]']

  useEffect(() => {
    if (step !== 3) return
    setResendTimer(30)
    const t = setInterval(() => setResendTimer((n) => (n > 0 ? n - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [step])

  const handleCreateAccount = async () => {
    setSignupError('')
    setLoading(true)
    try {
      const response = await fetch('/api/app-auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          accountType: role,
          company,
          preferredCategories: selectedCats,
          agreed,
        }),
        credentials: 'include',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to create account.')
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
      setStep(4)
    } catch (createError) {
      setSignupError(
        createError instanceof Error ? createError.message : 'Unable to create account.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = () => {
    if (emailOtp.join('').length < 6) {
      setOtpError('Please enter the full 6-digit code.')
      return
    }
    setOtpError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(4)
    }, 1000)
  }

  const handleFinish = () => {
    onNavigate('dashboard')
  }

  const leftPanel = (
    <AuthPanel
      gradient="bg-gradient-to-br from-[#00A882] via-[#008F6E] to-[#006B52]"
      title={
        <>
          Start advertising
          <br />
          in minutes.
        </>
      }
      subtitle="Join thousands of businesses already reaching their audience on PixelWorld's interactive canvas."
    />
  )

  const STEP_LABELS = ['Account details', 'Profile & role', 'Account created', 'Get started']

  const StepIndicator = () => (
    <div className="flex items-center gap-1.5 mb-8">
      {STEP_LABELS.map((label, i) => {
        const s = i + 1
        const done = step > s
        const active = step === s
        return (
          <React.Fragment key={s}>
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-['Outfit'] font-bold transition-all ${done ? 'bg-[#00A882] text-white' : active ? 'bg-[#6C5FE6] text-white' : 'bg-[#EDF0F8] text-muted-foreground'}`}
              >
                {done ? <Check size={11} /> : s}
              </div>
              <span
                className={`text-[11px] font-['Outfit'] font-semibold hidden sm:block ${active ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`flex-1 h-px min-w-[12px] transition-colors ${step > s ? 'bg-[#00A882]' : 'bg-black/8'}`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )

  // ── Step 1: Credentials ──────────────────────────────────────────────────────
  if (step === 1)
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-6">
              <PwLogo size="sm" />
            </div>
            <StepIndicator />
            <div className="mb-6">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Create account
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                Start your PixelWorld journey
              </p>
            </div>

            <button
              disabled
              title="Google sign-up is not configured"
              className="w-full flex items-center justify-center gap-3 border border-black/10 bg-white rounded-2xl px-5 py-3 text-sm font-['Outfit'] font-semibold text-muted-foreground opacity-60 cursor-not-allowed mb-5"
            >
              <GoogleIcon /> Sign up with Google
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-black/8" />
              <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                or with email
              </span>
              <div className="flex-1 h-px bg-black/8" />
            </div>

            <div className="space-y-3.5 mb-6">
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ['First name', firstName, setFirstName],
                    ['Last name', lastName, setLastName],
                  ] as const
                ).map(([lbl, val, set]) => (
                  <div key={lbl}>
                    <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1.5">
                      {lbl}
                    </label>
                    <input
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      placeholder={lbl}
                      className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-3.5 py-2.5 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50 focus:bg-white transition-colors"
                    />
                  </div>
                ))}
              </div>
              <AuthInput
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@company.com"
              />
              <AuthInput
                label="Phone number"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="+91 98765 43210"
              />
              <div>
                <AuthInput
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="Min. 8 characters"
                  rightEl={
                    <button
                      onClick={() => setShowPw(!showPw)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Eye size={15} />
                    </button>
                  }
                />
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? pwColors[pwStrength] : 'bg-black/8'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-['JetBrains_Mono'] text-muted-foreground">
                      {pwLabels[pwStrength]}
                    </span>
                  </div>
                )}
              </div>
              <AuthInput
                label="Confirm password"
                type="password"
                value={confirmPw}
                onChange={setConfirmPw}
                placeholder="Re-enter password"
                error={confirmPw && confirmPw !== password ? 'Passwords do not match' : undefined}
              />
            </div>

            <PrimaryBtn
              full
              onClick={() => setStep(2)}
              disabled={!firstName || !email || !password || password !== confirmPw}
            >
              Continue <ArrowRight size={15} />
            </PrimaryBtn>
            <p className="text-center text-sm text-muted-foreground font-['Inter'] mt-5">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-[#6C5FE6] font-['Outfit'] font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    )

  // ── Step 2: Profile & Role ───────────────────────────────────────────────────
  if (step === 2)
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-6">
              <PwLogo size="sm" />
            </div>
            <StepIndicator />
            <div className="mb-6">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Your profile
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                Tell us how you'll use PixelWorld
              </p>
            </div>

            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                  Account type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'advertiser', label: 'Individual', emoji: '👤', desc: 'Personal ads' },
                    { value: 'business', label: 'Business', emoji: '🏢', desc: 'Company brand' },
                    { value: 'agency', label: 'Agency', emoji: '🏛️', desc: 'Manage clients' },
                  ].map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value as typeof role)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${role === r.value ? 'border-[#6C5FE6] bg-[#6C5FE6]/8' : 'border-black/8 bg-card hover:border-[#6C5FE6]/30'}`}
                    >
                      <div className="text-xl mb-1">{r.emoji}</div>
                      <div
                        className={`text-xs font-['Outfit'] font-bold ${role === r.value ? 'text-[#6C5FE6]' : 'text-foreground'}`}
                      >
                        {r.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-['Inter']">
                        {r.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {(role === 'business' || role === 'agency') && (
                <AuthInput
                  label={role === 'agency' ? 'Agency name' : 'Company name'}
                  value={company}
                  onChange={setCompany}
                  placeholder="e.g. Acme Advertising"
                />
              )}
              <div>
                <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                  Preferred ad categories{' '}
                  <span className="text-muted-foreground font-normal">(pick any)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Food & Dining',
                    'Real Estate',
                    'Fashion',
                    'Electronics',
                    'Jobs',
                    'Travel',
                    'Healthcare',
                    'Fintech',
                    'Entertainment',
                    'Automotive',
                  ].map((cat) => {
                    const on = selectedCats.includes(cat)
                    return (
                      <button
                        key={cat}
                        onClick={() =>
                          setSelectedCats(
                            on ? selectedCats.filter((c) => c !== cat) : [...selectedCats, cat],
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg border text-xs font-['Outfit'] font-semibold transition-all ${on ? 'border-[#6C5FE6] bg-[#6C5FE6]/10 text-[#6C5FE6]' : 'border-black/8 bg-[#EDF0F8] text-muted-foreground hover:border-[#6C5FE6]/30 hover:text-[#6C5FE6]'}`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>
              <label
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => setAgreed(!agreed)}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${agreed ? 'bg-[#6C5FE6] border-[#6C5FE6]' : 'border-black/20 bg-white group-hover:border-[#6C5FE6]/50'}`}
                >
                  {agreed && <Check size={11} className="text-white" />}
                </div>
                <span className="text-xs text-muted-foreground font-['Inter'] leading-relaxed">
                  I agree to PixelWorld's{' '}
                  <span className="text-[#6C5FE6] font-semibold">Terms of Service</span> and{' '}
                  <span className="text-[#6C5FE6] font-semibold">Privacy Policy</span>
                </span>
              </label>
            </div>

            {signupError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-['Inter'] rounded-xl px-4 py-3 mb-4">
                <AlertTriangle size={14} /> {signupError}
              </div>
            )}
            <div className="flex gap-3">
              <GhostBtn onClick={() => setStep(1)}>
                <ChevronLeft size={15} /> Back
              </GhostBtn>
              <div className="flex-1">
                <PrimaryBtn full onClick={handleCreateAccount} disabled={!agreed || loading}>
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" /> Creating account…
                    </>
                  ) : (
                    <>
                      Create Account <ArrowRight size={15} />
                    </>
                  )}
                </PrimaryBtn>
              </div>
            </div>
          </div>
        </div>
      </div>
    )

  // ── Step 3: Verify Email ─────────────────────────────────────────────────────
  if (step === 3)
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-6">
              <PwLogo size="sm" />
            </div>
            <StepIndicator />

            <div className="w-14 h-14 rounded-2xl bg-[#00A882]/12 flex items-center justify-center mb-6">
              <Inbox size={26} className="text-[#00A882]" />
            </div>
            <div className="mb-2">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Verify your email
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                We sent a 6-digit code to <strong className="text-foreground">{email}</strong>.
                Enter it below to activate your account.
              </p>
            </div>

            <div className="my-8">
              <OtpInput value={emailOtp} onChange={setEmailOtp} />
              {otpError && (
                <p className="text-center text-xs text-red-500 font-['Inter'] mt-3 flex items-center justify-center gap-1">
                  <AlertTriangle size={11} /> {otpError}
                </p>
              )}
            </div>

            <PrimaryBtn
              full
              onClick={handleVerifyEmail}
              disabled={loading || emailOtp.join('').length < 6}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Verifying…
                </>
              ) : (
                <>
                  Verify & Continue <ArrowRight size={15} />
                </>
              )}
            </PrimaryBtn>

            <div className="flex items-center justify-center gap-2 mt-5">
              <span className="text-sm text-muted-foreground font-['Inter']">Didn't get it?</span>
              {resendTimer > 0 ? (
                <span className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  onClick={() => {
                    setEmailOtp(Array(6).fill(''))
                    setResendTimer(30)
                  }}
                  className="text-sm text-[#6C5FE6] font-['Outfit'] font-semibold hover:underline"
                >
                  Resend code
                </button>
              )}
            </div>

            <div className="mt-3 text-center">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-muted-foreground hover:text-foreground font-['Inter'] hover:underline"
              >
                Wrong email? Go back and change it
              </button>
            </div>
          </div>
        </div>
      </div>
    )

  // ── Step 4: Onboarding ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex">
      {leftPanel}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6">
            <PwLogo size="sm" />
          </div>
          <StepIndicator />

          <div className="mb-7">
            <div className="text-3xl mb-4">🎉</div>
            <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
              Welcome, {firstName}!
            </h1>
            <p className="text-muted-foreground font-['Inter'] text-sm">
              Your account is ready. Let's personalise your experience to get you started fast.
            </p>
          </div>

          <div className="space-y-4 mb-7">
            <div>
              <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                What's your primary goal?
              </label>
              <div className="space-y-2">
                {[
                  { id: 'brand', label: 'Build brand awareness', emoji: '📣' },
                  { id: 'leads', label: 'Generate leads or enquiries', emoji: '🎯' },
                  { id: 'sales', label: 'Drive direct sales', emoji: '🛍️' },
                  { id: 'local', label: 'Reach a local neighbourhood', emoji: '📍' },
                  { id: 'explore', label: 'Just exploring the platform', emoji: '🔭' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setOnboardGoal(g.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${onboardGoal === g.id ? 'border-[#6C5FE6] bg-[#6C5FE6]/8' : 'border-black/8 bg-card hover:border-[#6C5FE6]/20'}`}
                  >
                    <span className="text-xl">{g.emoji}</span>
                    <span
                      className={`text-sm font-['Outfit'] font-semibold ${onboardGoal === g.id ? 'text-[#6C5FE6]' : 'text-foreground'}`}
                    >
                      {g.label}
                    </span>
                    {onboardGoal === g.id && <Check size={14} className="text-[#6C5FE6] ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-[#6C5FE6]/6 border border-[#6C5FE6]/15 p-4">
              <div className="text-xs font-['Outfit'] font-bold text-[#6C5FE6] mb-2 flex items-center gap-1.5">
                <Sparkles size={12} /> What's waiting for you
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Explore the canvas', 'Browse live ads across cities'],
                  ['Book your first space', 'Pick a spot that fits your budget'],
                  ['Launch in 24 hrs', 'Ads go live after quick review'],
                  ['Track performance', 'Live clicks, views, and CTR'],
                ].map(([t, d]) => (
                  <div key={t} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#6C5FE6]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="text-[#6C5FE6]" />
                    </div>
                    <div>
                      <div className="text-xs font-['Outfit'] font-semibold text-foreground">
                        {t}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-['Inter']">{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <PrimaryBtn full onClick={handleFinish} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" /> Setting up your dashboard…
              </>
            ) : (
              <>
                Go to Dashboard <ArrowRight size={15} />
              </>
            )}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  )
}

