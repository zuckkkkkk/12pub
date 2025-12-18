import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { activity_id, checked_in_at, completed_at, photo_url } = await request.json()

    // Validate required fields
    if (!activity_id || !checked_in_at || !completed_at || !photo_url) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Verify this is the current activity
    const { data: activities } = await supabase
      .from('activities')
      .select('id')
      .order('sequence_order', { ascending: true })

    const { data: completions } = await supabase
      .from('activity_completions')
      .select('activity_id')
      .eq('user_id', user.id)

    const completedIds = new Set(completions?.map(c => c.activity_id) || [])
    const currentActivity = activities?.find(a => !completedIds.has(a.id))

    if (currentActivity?.id !== activity_id) {
      return NextResponse.json(
        { error: 'This is not your current activity' }, 
        { status: 400 }
      )
    }

    // Check if already completed (shouldn't happen but safety check)
    if (completedIds.has(activity_id)) {
      return NextResponse.json(
        { error: 'Activity already completed' }, 
        { status: 400 }
      )
    }

    // Insert completion
    const { data, error } = await supabase
      .from('activity_completions')
      .insert({
        user_id: user.id,
        activity_id,
        checked_in_at,
        completed_at,
        photo_url,
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save completion' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, completion: data })
  } catch (error) {
    console.error('Complete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
