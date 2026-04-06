'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { FcGoogle } from 'react-icons/fc'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

const fieldInputClass =
  'w-full rounded-(--auth-radius-input) border border-(--auth-input-border) bg-(--auth-input-bg) py-2.5 pl-[38px] pr-3 text-[13.5px] text-(--auth-marketing-text) outline-none transition-all duration-200 placeholder:text-(--auth-marketing-text-muted) focus:border-(--auth-input-focus-border) focus:bg-(--auth-input-focus-bg) focus:shadow-[0_0_0_3px_var(--auth-input-focus-ring)] disabled:opacity-60'

const fieldPasswordInputClass =
  'w-full rounded-(--auth-radius-input) border border-(--auth-input-border) bg-(--auth-input-bg) py-2.5 pl-[38px] pr-10 text-[13.5px] text-(--auth-marketing-text) outline-none transition-all duration-200 placeholder:text-(--auth-marketing-text-muted) focus:border-(--auth-input-focus-border) focus:bg-(--auth-input-focus-bg) focus:shadow-[0_0_0_3px_var(--auth-input-focus-ring)] disabled:opacity-60'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    setError(null)
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) {
        setError(authError.message)
        return
      }
      setSuccess(true)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: process.env.NEXT_PUBLIC_APP_URL + '/auth/callback',
        scopes: 'email profile',
      },
    })
  }

  if (success) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-[22px] font-bold tracking-[-0.5px] text-(--auth-marketing-text)">Check your email</h1>
        <p className="text-[13.5px] text-(--auth-marketing-text-secondary)">
          We sent a confirmation link to{' '}
          <strong className="text-(--auth-marketing-text)">{email}</strong>
        </p>
        <Link
          href="/login"
          className="text-[13px] font-semibold text-(--auth-electric-bright) no-underline transition-colors hover:text-(--auth-electric-glow)"
        >
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="mb-[26px]">
        <h1 className="mb-1.5 text-[22px] font-bold tracking-[-0.5px] text-(--auth-marketing-text)">
          Get started free
        </h1>
        <p className="text-[13.5px] font-normal text-(--auth-marketing-text-secondary)">
          No credit card required
        </p>
      </div>

      <button type="button" onClick={handleGoogleLogin} className="auth-google-btn">
        <FcGoogle className="size-[17px] shrink-0" />
        Sign up with Google
      </button>

      <div className="mb-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-(image:--auth-or-line)" />
        <span className="whitespace-nowrap text-[11.5px] font-medium text-(--auth-marketing-text-muted)">
          or use your email
        </span>
        <span className="h-px flex-1 bg-(image:--auth-or-line)" />
      </div>

      <form
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
        className="flex flex-col gap-3.5"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-email" className="text-xs font-semibold tracking-[0.3px] text-(--auth-marketing-text-secondary)">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-[13px] top-1/2 size-[15px] -translate-y-1/2 text-(--auth-marketing-text-muted)" strokeWidth={1.75} />
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
              autoComplete="email"
              className={fieldInputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-password" className="text-xs font-semibold tracking-[0.3px] text-(--auth-marketing-text-secondary)">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-[13px] top-1/2 size-[15px] -translate-y-1/2 text-(--auth-marketing-text-muted)" strokeWidth={1.75} />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              disabled={isLoading}
              autoComplete="new-password"
              className={fieldPasswordInputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent p-0 text-(--auth-marketing-text-muted) transition-colors hover:text-(--auth-marketing-text-secondary)"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-[15px]" strokeWidth={1.75} /> : <Eye className="size-[15px]" strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-semibold tracking-[0.3px] text-(--auth-marketing-text-secondary)">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-[13px] top-1/2 size-[15px] -translate-y-1/2 text-(--auth-marketing-text-muted)" strokeWidth={1.75} />
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="new-password"
              className={fieldPasswordInputClass}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent p-0 text-(--auth-marketing-text-muted) transition-colors hover:text-(--auth-marketing-text-secondary)"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? <EyeOff className="size-[15px]" strokeWidth={1.75} /> : <Eye className="size-[15px]" strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {error && <p className="text-[13px] text-(--destructive)">{error}</p>}

        <button type="submit" disabled={isLoading} className="auth-submit-primary">
          {isLoading ? 'Creating account...' : 'Create my account →'}
        </button>
      </form>

      <p className="mt-[18px] text-center text-[13px] text-(--auth-marketing-text-muted)">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-(--auth-electric-bright) no-underline transition-colors hover:text-(--auth-electric-glow)"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
