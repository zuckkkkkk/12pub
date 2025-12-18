import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()  
      const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { activity_id } = await request.json()

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

    // Optional: Log check-in for analytics
    console.log(`User ${user.id} checked in to activity ${activity_id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
