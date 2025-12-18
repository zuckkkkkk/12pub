import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle errors from Supabase
  if (error) {
    console.error('Auth error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/auth?error=${error}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Exchange error:', exchangeError.message)
      return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
    }

    // Check if user has a profile
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      
      if (!profile?.username) {
        return NextResponse.redirect(`${origin}/auth/username`)
      }
    }
    
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  return NextResponse.redirect(`${origin}/auth?error=no_code`)
}