-- Add highest_loss_streak column to the leaderboard table
ALTER TABLE leaderboard 
ADD COLUMN IF NOT EXISTS highest_loss_streak INTEGER NOT NULL DEFAULT 0;