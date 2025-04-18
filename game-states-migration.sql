-- Add highest_streak column to the game_states table
ALTER TABLE game_states 
ADD COLUMN IF NOT EXISTS highest_streak INTEGER NOT NULL DEFAULT 0;

-- Update existing records to set highest_streak equal to streak if it's higher
UPDATE game_states
SET highest_streak = streak
WHERE highest_streak < streak;