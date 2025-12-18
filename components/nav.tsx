'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Map, 
  Trophy, 
  User,
  Beer
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/map', label: 'Mappa', icon: Map },
  { href: '/leaderboard', label: 'Classifica', icon: Trophy },
  { href: '/profile', label: 'Profilo', icon: User },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-lg md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors',
                  isActive 
                    ? 'text-gold' 
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]')} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Beer className="h-8 w-8 text-gold" />
            <span className="font-display text-xl text-zinc-100">12 Pubs of Bologna</span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all',
                    isActive 
                      ? 'bg-gold/10 text-gold' 
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
