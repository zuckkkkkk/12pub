import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 3) return 'text-emerald-400'
  if (difficulty <= 6) return 'text-yellow-400'
  if (difficulty <= 8) return 'text-orange-400'
  return 'text-red-400'
}

export function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return 'Facile'
  if (difficulty <= 4) return 'Normale'
  if (difficulty <= 6) return 'Impegnativa'
  if (difficulty <= 8) return 'Difficile'
  return 'Estrema'
}

export function getOrdinalSuffix(n: number): string {
  return `${n}°`
}
