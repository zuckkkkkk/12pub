import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ActivityCard } from '@/components/activity-card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Activity, ActivityCompletion, ActivityWithStatus } from '@/lib/types'
import { Beer, Trophy } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getActivitiesWithStatus(userId: string): Promise<ActivityWithStatus[]> {
  const supabase = await createClient()  
  // Get all activities
  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .order('sequence_order', { ascending: true })

  if (!activities) return []

  // Get user completions
  const { data: completions } = await supabase
    .from('activity_completions')
    .select('*')
    .eq('user_id', userId)

  const completionMap = new Map(
    completions?.map(c => [c.activity_id, c]) || []
  )

  // Find current activity (first non-completed)
  let foundCurrent = false
  
  return activities.map((activity: Activity) => {
    const completion = completionMap.get(activity.id)
    
    let status: 'completed' | 'current' | 'locked'
    if (completion) {
      status = 'completed'
    } else if (!foundCurrent) {
      status = 'current'
      foundCurrent = true
    } else {
      status = 'locked'
    }

    return {
      ...activity,
      status,
      completion,
    }
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/username')
  }

  const activities = await getActivitiesWithStatus(user.id)
  const completedCount = activities.filter(a => a.status === 'completed').length
  const progress = (completedCount / 12) * 100

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-zinc-100">
          Ciao, <span className="text-gold">{profile.username}</span>! 👋
        </h1>
        <p className="text-zinc-400">
          {completedCount === 12 
            ? 'Hai completato tutte le tappe! 🎉'
            : completedCount === 0
            ? 'Inizia la tua avventura!'
            : `Continua la tua avventura, ti mancano ${12 - completedCount} tappe!`
          }
        </p>
      </div>

      {/* Progress Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold/10 rounded-lg">
              <Beer className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Progresso</p>
              <p className="text-xl font-bold text-zinc-100">{completedCount} / 12 tappe</p>
            </div>
          </div>
          <Link href="/leaderboard">
            <Badge variant="outline" className="cursor-pointer hover:bg-zinc-800">
              <Trophy className="h-3 w-3 mr-1" />
              Classifica
            </Badge>
          </Link>
        </div>
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Inizio</span>
          <span>{Math.round(progress)}% completato</span>
          <span>Fine</span>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-zinc-100">
          Le 12 Tappe
        </h2>
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  )
}
