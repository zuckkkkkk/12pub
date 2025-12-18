import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?error=${error}`, origin)
    )
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return NextResponse.redirect(
        new URL('/auth?error=auth_failed', origin)
      )
    }

    return NextResponse.redirect(
      new URL('/dashboard', origin)
    )
  }

  return NextResponse.redirect(
    new URL('/auth?error=no_code', origin)
  )
}
