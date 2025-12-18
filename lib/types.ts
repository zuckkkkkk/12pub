export interface Activity {
  id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  difficulty: number
  sequence_order: number
  created_at: string
}

export interface Profile {
  id: string
  username: string
  phone: string
  created_at: string
}

export interface ActivityCompletion {
  id: string
  user_id: string
  activity_id: string
  checked_in_at: string
  completed_at: string
  duration_seconds: number
  photo_url: string
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  username: string
  completed_count: number
  avg_duration_seconds: number | null
  weighted_score: number | null
}

export interface ActivityWithStatus extends Activity {
  status: 'completed' | 'current' | 'locked'
  completion?: ActivityCompletion
}
