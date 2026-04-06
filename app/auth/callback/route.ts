import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const nextParam = searchParams.get('next')
    const safeNext = nextParam?.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/'

    if (code) {
      const supabase = await createSupabaseServerClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        return NextResponse.redirect(`${origin}${safeNext}`)
      }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  } catch {
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }
}
