import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { generateContent } from '@/lib/ai/generate'
import { checkRateLimit } from '@/lib/rate-limit'
import { generateSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = generateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      )
    }

    const { input, type } = result.data

    const { success: rateLimitOk, remaining, reset } = await checkRateLimit(user.id)

    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
        }
      )
    }

    let output: string
    try {
      output = await generateContent(input, type)
    } catch {
      return NextResponse.json(
        { error: 'AI service unavailable. Please try again.' },
        { status: 502 }
      )
    }

    const { data: generation, error: insertError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        input_text: input,
        generation_type: type,
        output_text: output,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to save generation:', insertError)
      return NextResponse.json(
        { error: 'Failed to save generation' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { data: generation },
      {
        headers: {
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
        },
      }
    )
  } catch (error) {
    console.error('POST /api/generate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
