import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')

    if (error) {
      console.error('Leaderboard error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' }, 
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
