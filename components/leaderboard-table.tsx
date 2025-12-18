'use client'

import { LeaderboardEntry } from '@/lib/types'
import { formatDuration, cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award } from 'lucide-react'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />
      case 2:
        return <Medal className="h-5 w-5 text-zinc-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-zinc-500 font-mono">{position}</span>
    }
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nessun partecipante ancora.</p>
        <p className="text-sm">Sii il primo a completare un'attività!</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-800/50 hover:bg-zinc-800/50">
            <TableHead className="w-16 text-center">#</TableHead>
            <TableHead>Partecipante</TableHead>
            <TableHead className="text-center">Tappe</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Tempo Medio</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => {
            const position = index + 1
            const isCurrentUser = entry.id === currentUserId
            
            return (
              <TableRow 
                key={entry.id}
                className={cn(
                  isCurrentUser && 'bg-gold/5 hover:bg-gold/10',
                  position <= 3 && 'font-medium'
                )}
              >
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    {getPositionIcon(position)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      isCurrentUser && 'text-gold'
                    )}>
                      {entry.username}
                    </span>
                    {isCurrentUser && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">
                        Tu
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={entry.completed_count === 12 ? 'success' : 'secondary'}
                    className="font-mono"
                  >
                    {entry.completed_count}/12
                  </Badge>
                </TableCell>
                <TableCell className="text-right hidden sm:table-cell text-zinc-400">
                  {entry.avg_duration_seconds 
                    ? formatDuration(Math.round(entry.avg_duration_seconds))
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    'font-mono',
                    position === 1 && 'text-yellow-400',
                    position === 2 && 'text-zinc-300',
                    position === 3 && 'text-amber-500'
                  )}>
                    {entry.weighted_score 
                      ? entry.weighted_score.toFixed(1)
                      : '-'
                    }
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
