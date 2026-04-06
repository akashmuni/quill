'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { FcGoogle } from 'react-icons/fc'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

const fieldInputClass =
  'w-full rounded-[var(--auth-radius-input)] border border-[var(--auth-input-border)] bg-[var(--auth-input-bg)] py-2.5 pl-[38px] pr-3 text-[13.5px] text-[var(--auth-marketing-text)] outline-none transition-all duration-200 placeholder:text-[var(--auth-marketing-text-muted)] focus:border-[var(--auth-input-focus-border)] focus:bg-[var(--auth-input-focus-bg)] focus:shadow-[0_0_0_3px_var(--auth-input-focus-ring)] disabled:opacity-60'

const fieldPasswordInputClass =
  'w-full rounded-[var(--auth-radius-input)] border border-[var(--auth-input-border)] bg-[var(--auth-input-bg)] py-2.5 pl-[38px] pr-10 text-[13.5px] text-[var(--auth-marketing-text)] outline-none transition-all duration-200 placeholder:text-[var(--auth-marketing-text-muted)] focus:border-[var(--auth-input-focus-border)] focus:bg-[var(--auth-input-focus-bg)] focus:shadow-[0_0_0_3px_var(--auth-input-focus-ring)] disabled:opacity-60'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(authError.message)
        return
      }
      router.push('/')
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

  return (
    <div className="flex flex-col">
      <div className="mb-[26px]">
        <h1 className="mb-1.5 text-[22px] font-bold tracking-[-0.5px] text-[var(--auth-marketing-text)]">
          Welcome back
        </h1>
        <p className="text-[13.5px] font-normal text-[var(--auth-marketing-text-secondary)]">
          Sign in to your Quill workspace
        </p>
      </div>

      <button type="button" onClick={handleGoogleLogin} className="auth-google-btn">
        <FcGoogle className="size-[17px] shrink-0" />
        Continue with Google
      </button>

      <div className="mb-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[image:var(--auth-or-line)]" />
        <span className="whitespace-nowrap text-[11.5px] font-medium text-[var(--auth-marketing-text-muted)]">
          or continue with email
        </span>
        <span className="h-px flex-1 bg-[image:var(--auth-or-line)]" />
      </div>

      <form
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
        className="flex flex-col gap-3.5"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold tracking-[0.3px] text-[var(--auth-marketing-text-secondary)]">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-[13px] top-1/2 size-[15px] -translate-y-1/2 text-[var(--auth-marketing-text-muted)]" strokeWidth={1.75} />
            <input
              id="email"
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
          <label htmlFor="password" className="text-xs font-semibold tracking-[0.3px] text-[var(--auth-marketing-text-secondary)]">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-[13px] top-1/2 size-[15px] -translate-y-1/2 text-[var(--auth-marketing-text-muted)]" strokeWidth={1.75} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              disabled={isLoading}
              autoComplete="current-password"
              className={fieldPasswordInputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent p-0 text-[var(--auth-marketing-text-muted)] transition-colors hover:text-[var(--auth-marketing-text-secondary)]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-[15px]" strokeWidth={1.75} /> : <Eye className="size-[15px]" strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {error && <p className="text-[13px] text-(--destructive)">{error}</p>}

        <button type="submit" disabled={isLoading} className="auth-submit-primary">
          {isLoading ? 'Signing in...' : 'Sign in to Quill'}
        </button>
      </form>

      <p className="mt-[18px] text-center text-[13px] text-[var(--auth-marketing-text-muted)]">
        New to Quill?{' '}
        <Link
          href="/signup"
          className="font-semibold text-[var(--auth-electric-bright)] no-underline transition-colors hover:text-[var(--auth-electric-glow)]"
        >
          Create a free account →
        </Link>
      </p>
    </div>
  )
}
