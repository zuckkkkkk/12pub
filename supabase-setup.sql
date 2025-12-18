-- 12 Pubs of Christmas - Database Setup
-- Run this in the Supabase SQL Editor

-- ============================================
-- 1. TABLES
-- ============================================

-- Activities table (pre-populated with pub locations)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
  sequence_order INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity completions table
CREATE TABLE IF NOT EXISTS activity_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (completed_at - checked_in_at))::INTEGER) STORED,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_id)
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_completions_user ON activity_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_activity ON activity_completions(activity_id);
CREATE INDEX IF NOT EXISTS idx_activities_sequence ON activities(sequence_order);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ============================================
-- 3. LEADERBOARD VIEW
-- ============================================

CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id,
  p.username,
  COUNT(ac.id)::INTEGER as completed_count,
  ROUND(AVG(ac.duration_seconds)::numeric, 2) as avg_duration_seconds,
  ROUND(
    (SUM(ac.duration_seconds * a.difficulty)::numeric / NULLIF(SUM(a.difficulty), 0)::numeric),
    2
  ) as weighted_score
FROM profiles p
LEFT JOIN activity_completions ac ON p.id = ac.user_id
LEFT JOIN activities a ON ac.activity_id = a.id
GROUP BY p.id, p.username
ORDER BY weighted_score ASC NULLS LAST, completed_count DESC;

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_completions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Activities policies (readable by all authenticated users)
CREATE POLICY "Activities are publicly readable" 
  ON activities FOR SELECT 
  TO authenticated 
  USING (true);

-- Activity completions policies
CREATE POLICY "Users can read own completions" 
  ON activity_completions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" 
  ON activity_completions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Grant access to leaderboard view
GRANT SELECT ON leaderboard TO authenticated;

-- ============================================
-- 5. STORAGE BUCKET
-- ============================================

-- Create bucket for completion photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('completion-photos', 'completion-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'completion-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Photos are publicly readable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'completion-photos');

CREATE POLICY "Users can update own photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'completion-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'completion-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- 6. SEED DATA - Sample Bologna Pubs
-- ============================================

INSERT INTO activities (name, description, latitude, longitude, difficulty, sequence_order) VALUES
('The Swan', 'Prima tappa! Birra di riscaldamento 🍺', 44.4949, 11.3426, 1, 1),
('Irish Times', 'Guinness obbligatoria! ☘️', 44.4938, 11.3425, 2, 2),
('Ristoro della Montagnola', 'Aperitivo in piazza 🍹', 44.5009, 11.3442, 3, 3),
('Cantina Bentivoglio', 'Jazz e vino! 🎷', 44.4936, 11.3521, 4, 4),
('Camera a Sud', 'Cocktail creativi 🍸', 44.4928, 11.3419, 5, 5),
('Osteria del Sole', 'La più antica di Bologna! 🏺', 44.4935, 11.3427, 6, 6),
('Lab 16', 'Birre artigianali 🍻', 44.4912, 11.3445, 6, 7),
('Ruggine', 'Atmosfera industriale 🔧', 44.4895, 11.3468, 7, 8),
('Bar Calice', 'Vino naturale 🍷', 44.4941, 11.3401, 7, 9),
('Sette Tavoli', 'Shot time! 🥃', 44.4955, 11.3432, 8, 10),
('Punto e Basta', 'Quasi alla fine! 💪', 44.4922, 11.3456, 9, 11),
('The Final Countdown', 'Congratulazioni! 🎉🏆', 44.4901, 11.3450, 10, 12)
ON CONFLICT (sequence_order) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  difficulty = EXCLUDED.difficulty;
