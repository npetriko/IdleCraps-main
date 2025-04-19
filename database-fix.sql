-- Add missing columns to game_states table
ALTER TABLE game_states 
ADD COLUMN IF NOT EXISTS highest_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE game_states 
ADD COLUMN IF NOT EXISTS loss_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE game_states 
ADD COLUMN IF NOT EXISTS highest_loss_streak INTEGER NOT NULL DEFAULT 0;

-- Add columns to leaderboard table (in case they're missing)
ALTER TABLE leaderboard 
ADD COLUMN IF NOT EXISTS passive_income NUMERIC NOT NULL DEFAULT 1;

ALTER TABLE leaderboard 
ADD COLUMN IF NOT EXISTS highest_win_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE leaderboard 
ADD COLUMN IF NOT EXISTS highest_loss_streak INTEGER NOT NULL DEFAULT 0;

-- Verify the columns were added
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'game_states' 
AND column_name IN ('loss_streak', 'highest_streak', 'highest_loss_streak');

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'leaderboard' 
AND column_name IN ('passive_income', 'highest_win_streak', 'highest_loss_streak');