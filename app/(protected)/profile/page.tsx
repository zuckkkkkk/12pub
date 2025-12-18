import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/utils'
import { User, Trophy, Clock, Camera, LogOut, Beer } from 'lucide-react'
import { LogoutButton } from './logout-button'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/username')
  }

  // Get completions with activity info
  const { data: completions } = await supabase
    .from('activity_completions')
    .select(`
      *,
      activity:activities(name, sequence_order)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  // Get leaderboard position
  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('id')

  const position = leaderboard?.findIndex(l => l.id === user.id) ?? -1

  // Calculate stats
  const completedCount = completions?.length || 0
  const totalDuration = completions?.reduce((sum, c) => sum + c.duration_seconds, 0) || 0
  const avgDuration = completedCount > 0 ? Math.round(totalDuration / completedCount) : 0

  return (
    <div className="container py-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gold/10 rounded-full">
              <User className="h-8 w-8 text-gold" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-zinc-100">
                {profile.username}
              </h1>
              <p className="text-sm text-zinc-500">{profile.phone}</p>
            </div>
            <LogoutButton />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Beer className="h-6 w-6 text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-zinc-100">{completedCount}/12</p>
            <p className="text-xs text-zinc-500">Tappe completate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-6 w-6 text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-zinc-100">
              {position >= 0 ? `${position + 1}°` : '-'}
            </p>
            <p className="text-xs text-zinc-500">Posizione</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-6 w-6 text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-zinc-100">
              {avgDuration > 0 ? formatDuration(avgDuration) : '-'}
            </p>
            <p className="text-xs text-zinc-500">Tempo medio</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Camera className="h-6 w-6 text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-zinc-100">{completedCount}</p>
            <p className="text-xs text-zinc-500">Foto scattate</p>
          </CardContent>
        </Card>
      </div>

      {/* Photo Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Camera className="h-5 w-5 text-gold" />
            La tua galleria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completions && completions.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {completions.map((completion: any) => (
                <div key={completion.id} className="relative group">
                  <div className="aspect-square rounded-xl overflow-hidden border border-zinc-800">
                    <img
                      src={completion.photo_url}
                      alt={completion.activity?.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white text-sm font-medium truncate">
                        {completion.activity?.sequence_order}. {completion.activity?.name}
                      </p>
                      <p className="text-white/70 text-xs">
                        {formatDuration(completion.duration_seconds)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna foto ancora.</p>
              <p className="text-sm">Completa la tua prima tappa per iniziare!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
