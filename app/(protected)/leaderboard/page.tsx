import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LeaderboardTable } from '@/components/leaderboard-table'
import { Button } from '@/components/ui/button'
import { RefreshCw, Trophy } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const supabase = await createClient()  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }

  // Get leaderboard
  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-lg">
            <Trophy className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-zinc-100">
              Classifica
            </h1>
            <p className="text-sm text-zinc-400">
              Aggiornata in tempo reale
            </p>
          </div>
        </div>
        <Link href="/leaderboard">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
        </Link>
      </div>

      {/* Scoring explanation */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
        <p>
          <strong className="text-zinc-200">Come funziona lo score:</strong>{' '}
          Il punteggio considera il tempo medio pesato per difficoltà. 
          Score più basso = più veloce = migliore!
        </p>
      </div>

      <LeaderboardTable 
        entries={leaderboard || []} 
        currentUserId={user.id}
      />
    </div>
  )
}
