import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MapView } from '@/components/map-view'
import { Badge } from '@/components/ui/badge'
import { Activity, ActivityCompletion } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function MapPage() {
  const supabase = await createClient()  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }

  // Get all activities
  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .order('sequence_order', { ascending: true })

  // Get user completions
  const { data: completions } = await supabase
    .from('activity_completions')
    .select('*')
    .eq('user_id', user.id)

  // Find current activity
  const completedIds = new Set(completions?.map(c => c.activity_id) || [])
  const currentActivity = activities?.find(a => !completedIds.has(a.id))

  const completedCount = completions?.length || 0

  return (
    <div className="container py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-zinc-100">
          Mappa dei Pub
        </h1>
        <Badge variant="outline">
          {completedCount}/12 completati
        </Badge>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-500" />
          <span className="text-zinc-400">Completato</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gold" />
          <span className="text-zinc-400">Tappa corrente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-zinc-500" />
          <span className="text-zinc-400">Da visitare</span>
        </div>
      </div>

      {/* Map */}
      <div className="h-[calc(100vh-220px)] md:h-[calc(100vh-200px)] rounded-xl overflow-hidden border border-zinc-800">
        <MapView
          activities={activities || []}
          completions={completions || []}
          currentActivityId={currentActivity?.id}
          className="h-full"
        />
      </div>
    </div>
  )
}
