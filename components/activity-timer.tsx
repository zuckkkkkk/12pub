'use client'

import { useState, useEffect } from 'react'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ActivityTimerProps {
  startTime: Date | null
  className?: string
}

export function ActivityTimer({ startTime, className }: ActivityTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!startTime) {
      setElapsedSeconds(0)
      return
    }

    // Initial calculation
    setElapsedSeconds(Math.floor((Date.now() - startTime.getTime()) / 1000))

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  if (!startTime) {
    return (
      <div className={cn('text-center', className)}>
        <div className="font-mono text-5xl font-bold text-zinc-600">
          00:00
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          Pronto per iniziare
        </p>
      </div>
    )
  }

  return (
    <div className={cn('text-center', className)}>
      <div className="relative inline-block">
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gold/20 rounded-full blur-xl animate-pulse" />
        
        {/* Timer display */}
        <div className="relative font-mono text-5xl md:text-6xl font-bold text-gold animate-timer-pulse">
          {formatTime(elapsedSeconds)}
        </div>
      </div>
      <p className="mt-3 text-sm text-zinc-400">
        Timer attivo
      </p>
    </div>
  )
}
