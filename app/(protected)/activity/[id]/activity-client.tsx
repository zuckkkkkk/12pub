'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ActivityTimer } from '@/components/activity-timer'
import { PhotoUpload } from '@/components/photo-upload'
import { MapPin, Clock, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Activity {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  difficulty: number
  sequence_order: number
}

interface ActivityClientProps {
  activity: Activity
  isCompleted: boolean
  userId: string
}

export function ActivityClient({ activity, isCompleted, userId }: ActivityClientProps) {
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkinTime, setCheckinTime] = useState<Date | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const stored = localStorage.getItem(`activity_${activity.id}_checkin`)
    if (stored) {
      setCheckedIn(true)
      setCheckinTime(new Date(stored))
    }
  }, [activity.id])

  const handleCheckin = () => {
    const now = new Date()
    localStorage.setItem(`activity_${activity.id}_checkin`, now.toISOString())
    setCheckedIn(true)
    setCheckinTime(now)
  }

  const handleComplete = async () => {
    if (!photo || !checkinTime) return

    setLoading(true)
    setError('')

    try {
      const fileExt = photo.name.split('.').pop()
      const filePath = `${userId}/${activity.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('completion-photos')
        .upload(filePath, photo, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('completion-photos')
        .getPublicUrl(filePath)


      const { error: completionError } = await supabase
        .from('activity_completions')
        .insert({
          user_id: userId,
          activity_id: activity.id,
          checked_in_at: checkinTime.toISOString(),
          completed_at: new Date().toISOString(),
          photo_url: publicUrl,
        })

      if (completionError) throw completionError

      localStorage.removeItem(`activity_${activity.id}_checkin`)

      router.push('/dashboard')
      router.refresh()

    } catch (err: any) {
      setError(err.message || 'Errore durante il completamento')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 md:pb-8">
      <div className="bg-gradient-to-b from-emerald-950/30 to-zinc-950 pt-6 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <Link href="/dashboard" className="inline-flex items-center text-zinc-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla lista
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <Badge className="mb-2 bg-gold-500/20 text-gold-400 border-gold-500/30">
                Tappa {activity.sequence_order}
              </Badge>
              <h1 className="text-2xl font-playfair text-white">{activity.name}</h1>
            </div>
            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
              Difficoltà {activity.difficulty}/10
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        <div className="max-w-lg mx-auto space-y-4">
          {isCompleted ? (
            <Card className="bg-emerald-950/30 border-emerald-800">
              <CardContent className="flex items-center gap-3 py-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="text-emerald-400 font-semibold">Completata!</p>
                  <p className="text-emerald-500/70 text-sm">Hai già completato questa tappa</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gold-400" />
                    {checkedIn ? 'Tempo' : 'Check-in'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!checkedIn ? (
                    <div className="text-center py-4">
                      <p className="text-zinc-400 mb-4">Sei arrivato al pub? Inizia il timer!</p>
                      <Button 
                        onClick={handleCheckin}
                        className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Check-in
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <ActivityTimer startTime={checkinTime!} />
                      <p className="text-zinc-500 text-sm mt-2">Timer in corso...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {checkedIn && (
                <Card className="bg-zinc-900/80 border-zinc-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-white">📸 Prova fotografica</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-400 text-sm mb-4">
                      Scatta una foto al tuo drink per completare la tappa
                    </p>
                    <PhotoUpload onPhotoSelect={setPhoto} selectedPhoto={photo} />
                  </CardContent>
                </Card>
              )}

              {checkedIn && (
                <div className="pt-4">
                  {error && (
                    <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
                  )}
                  <Button
                    onClick={handleComplete}
                    disabled={!photo || loading}
                    className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Completa Tappa 🍻'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}

          <Card className="bg-zinc-900/80 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">📍 Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">{activity.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}