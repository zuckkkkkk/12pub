'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Loader2 } from 'lucide-react'

export default function UsernamePage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase =  createClient()
  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('Sessione scaduta')
      setLoading(false)
      return
    }

    // Check if username is taken
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .single()

    if (existing) {
      setError('Username già in uso')
      setLoading(false)
      return
    }

    // Create or update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: username.toLowerCase(),
        email: user.email,
      })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-zinc-950 to-zinc-950" />
      
      <Card className="w-full max-w-md bg-zinc-900/80 border-zinc-800 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🎅</div>
          <CardTitle className="text-2xl font-playfair text-white">
            Scegli il tuo username
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Come vuoi essere chiamato nella classifica?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="username"
                  type="text"
                  placeholder="babbonatale"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-gold-500 focus:ring-gold-500"
                  minLength={3}
                  maxLength={20}
                  required
                />
              </div>
              <p className="text-xs text-zinc-500">Solo lettere, numeri e underscore</p>
            </div>
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            
            <Button
              type="submit"
              disabled={loading || username.length < 3}
                className="bg-blue-500 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none shadow-lg px-4 py-2 w-full h-12 white from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-zinc-900 font-semibold"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Vai billone è giusto'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}