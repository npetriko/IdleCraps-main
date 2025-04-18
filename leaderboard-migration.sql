-- Add new columns to the leaderboard table
ALTER TABLE leaderboard 
ADD COLUMN IF NOT EXISTS passive_income NUMERIC NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS highest_win_streak INTEGER NOT NULL DEFAULT 0;