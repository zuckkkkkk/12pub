import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ActivityClient } from './activity-client'

export default async function ActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }

  // Get activity
  const { data: activity } = await supabase
    .from('activities')
    .select('*')
    .eq('id', id)
    .single()

  if (!activity) {
    redirect('/dashboard')
  }

  // Get all completions to check sequence
  const { data: completions } = await supabase
    .from('activity_completions')
    .select('activity_id')
    .eq('user_id', user.id)

  const completedIds = new Set(completions?.map(c => c.activity_id) || [])

  // Check if already completed
  const isCompleted = completedIds.has(activity.id)

  // Get all activities to find current
  const { data: allActivities } = await supabase
    .from('activities')
    .select('id, sequence_order')
    .order('sequence_order', { ascending: true })

  // Find current activity (first non-completed)
  const currentActivity = allActivities?.find(a => !completedIds.has(a.id))
  const isCurrent = currentActivity?.id === activity.id

  // Check if this activity is accessible
  if (!isCompleted && !isCurrent) {
    redirect('/dashboard')
  }

  return (
    <ActivityClient 
      activity={activity} 
      isCompleted={isCompleted}
      userId={user.id}
    />
  )
}