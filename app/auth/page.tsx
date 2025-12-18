'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, CheckCircle } from 'lucide-react'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  
  const supabase =  createClient()
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-zinc-950 to-zinc-950" />
      <div className="absolute top-20 left-10 text-6xl animate-float opacity-20">🎄</div>
      <div className="absolute bottom-20 right-10 text-4xl animate-float-delayed opacity-20">🍺</div>
      
      <Card className="w-full max-w-md bg-zinc-900/80 border-zinc-800 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🍻</div>
          <CardTitle className="text-2xl font-playfair text-white">
            <span className="text-gold-400">12</span> Pubs of Bologna
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {sent ? 'Controlla la tua email!' : 'Accedi con la tua email'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="mario@esempio.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-gold-500 focus:ring-gold-500"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              
              <Button
                type="submit"
                disabled={loading || !email}
                className="bg-blue-500 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none shadow-lg px-4 py-2 w-full h-12 white from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-zinc-900 font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Dai vez invia sto link ✨'
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Email inviata!</h3>
              <p className="text-zinc-400 mb-4">
                Abbiamo inviato un magic link a<br />
                <span className="text-gold-400 font-medium">{email}</span>
              </p>
              <p className="text-zinc-500 text-sm">
                Clicca il link nell'email per accedere
              </p>
              <Button
                variant="ghost"
                onClick={() => setSent(false)}
                className="mt-4 text-zinc-400 hover:text-white"
              >
                Usa un'altra email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}