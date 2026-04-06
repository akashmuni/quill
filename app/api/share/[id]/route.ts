import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { shareUpdateSchema } from '@/lib/validations'
import { nanoid } from 'nanoid'
import { calculateExpiry, getShareUrl } from '@/lib/utils'
import type { GenerationPublic } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseServiceClient()

    const { data: row, error } = await supabase
      .from('generations')
      .select('*')
      .eq('id', id)
      .eq('is_shared', true)
      .eq('is_public', true)
      .single()

    if (error || !row) {
      return NextResponse.json(
        { error: 'This link is not available or has expired' },
        { status: 404 }
      )
    }

    if (row.share_expires_at !== null && new Date(row.share_expires_at) <= new Date()) {
      return NextResponse.json(
        { error: 'This link is not available or has expired' },
        { status: 404 }
      )
    }

    const publicData: GenerationPublic = {
      id: row.id,
      input_text: row.input_text,
      generation_type: row.generation_type,
      output_text: row.output_text,
      created_at: row.created_at,
    }

    return NextResponse.json({ data: publicData })
  } catch (error) {
    console.error('GET /api/share/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()
    const result = shareUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { isShared, isPublic, expiresIn } = result.data

    const { data: existing, error: findError } = await supabase
      .from('generations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (findError || !existing) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {
      is_shared: isShared,
      is_public: isPublic,
      share_expires_at: calculateExpiry(expiresIn ?? null)?.toISOString() ?? null,
    }

    if (isShared && !existing.share_id) {
      updateData.share_id = nanoid(12)
    }

    const { data: updated, error: updateError } = await supabase
      .from('generations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError || !updated) {
      console.error('PATCH /api/share/[id] update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update share settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      shareId: updated.share_id,
      shareUrl: updated.share_id && isShared ? getShareUrl(updated.share_id) : null,
      shareExpiresAt: updated.share_expires_at,
    })
  } catch (error) {
    console.error('PATCH /api/share/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
