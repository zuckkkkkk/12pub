'use client'

import Link from 'next/link'
import { cn, formatDuration, getDifficultyColor, getDifficultyLabel, getOrdinalSuffix } from '@/lib/utils'
import { ActivityWithStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  Lock, 
  CheckCircle2, 
  MapPin,
  Clock,
  Flame
} from 'lucide-react'

interface ActivityCardProps {
  activity: ActivityWithStatus
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const isLocked = activity.status === 'locked'
  const isCompleted = activity.status === 'completed'
  const isCurrent = activity.status === 'current'

  const content = (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        isLocked && 'opacity-60',
        isCurrent && 'ring-2 ring-gold/50 animate-pulse-gold',
        isCompleted && 'border-emerald-600/50'
      )}
    >
      {/* Decorative gradient */}
      <div 
        className={cn(
          'absolute inset-0 opacity-5',
          isCurrent && 'bg-gradient-to-br from-gold via-transparent to-transparent opacity-20',
          isCompleted && 'bg-gradient-to-br from-emerald-500 via-transparent to-transparent opacity-20'
        )}
      />
      
      <div className="relative p-4 flex items-center gap-4">
        {/* Order number */}
        <div 
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold',
            isCompleted && 'bg-emerald-500/20 text-emerald-400',
            isCurrent && 'bg-gold/20 text-gold',
            isLocked && 'bg-zinc-800 text-zinc-500'
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : isLocked ? (
            <Lock className="h-5 w-5" />
          ) : (
            getOrdinalSuffix(activity.sequence_order)
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={cn(
                'font-display text-lg font-semibold truncate',
                isLocked ? 'text-zinc-500' : 'text-zinc-100'
              )}>
                {activity.name}
              </h3>
              {activity.description && (
                <p className="text-sm text-zinc-500 truncate">
                  {activity.description}
                </p>
              )}
            </div>
            
            {/* Difficulty badge */}
            <Badge 
              variant="outline" 
              className={cn(
                'shrink-0',
                getDifficultyColor(activity.difficulty)
              )}
            >
              <Flame className="h-3 w-3 mr-1" />
              {activity.difficulty}
            </Badge>
          </div>

          {/* Completion info */}
          {activity.completion && (
            <div className="mt-2 flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(activity.completion.duration_seconds)}
              </span>
            </div>
          )}

          {/* Current activity indicator */}
          {isCurrent && (
            <div className="mt-2">
              <Badge variant="default" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Prossima tappa
              </Badge>
            </div>
          )}
        </div>

        {/* Arrow for clickable cards */}
        {!isLocked && (
          <div className={cn(
            'text-zinc-600',
            isCurrent && 'text-gold',
            isCompleted && 'text-emerald-500'
          )}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </Card>
  )

  if (isLocked) {
    return content
  }

  return (
    <Link href={`/activity/${activity.id}`} className="block">
      {content}
    </Link>
  )
}
