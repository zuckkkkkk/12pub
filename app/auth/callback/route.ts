import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if user has a profile
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        
        // If no profile or no username, redirect to username selection
        if (!profile?.username) {
          return NextResponse.redirect(`${origin}/auth/username`)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to auth page on error
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}