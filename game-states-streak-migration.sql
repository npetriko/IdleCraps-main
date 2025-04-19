-- Add streak-related columns to the game_states table
ALTER TABLE game_states 
ADD COLUMN IF NOT EXISTS highest_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE game_states 
ADD COLUMN IF NOT EXISTS loss_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE game_states 
ADD COLUMN IF NOT EXISTS highest_loss_streak INTEGER NOT NULL DEFAULT 0;