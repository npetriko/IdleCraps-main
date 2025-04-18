-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create game_states table
CREATE TABLE IF NOT EXISTS game_states (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bankroll NUMERIC NOT NULL DEFAULT 100,
  passive_income NUMERIC NOT NULL DEFAULT 1,
  total_rolls INTEGER NOT NULL DEFAULT 0,
  total_wins INTEGER NOT NULL DEFAULT 0,
  total_winnings NUMERIC NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  unlocked_bets JSONB NOT NULL DEFAULT '{"pass-line": true}'::JSONB,
  unlocked_chips JSONB NOT NULL DEFAULT '[1, 5, 10]'::JSONB,
  achievements JSONB NOT NULL DEFAULT '[]'::JSONB,
  place_bet_expert_wins JSONB NOT NULL DEFAULT '[]'::JSONB,
  quests JSONB NOT NULL DEFAULT '[]'::JSONB,
  upgrade_count INTEGER NOT NULL DEFAULT 0,
  has_won_first_bet BOOLEAN NOT NULL DEFAULT FALSE,
  completed_tutorial BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_tutorials JSONB NOT NULL DEFAULT '["basics"]'::JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  bankroll NUMERIC NOT NULL,
  total_winnings NUMERIC NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for express-session with connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- Create index on session expiration
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Create admin user if it doesn't exist (password: @W7PreRL)
INSERT INTO users (username, password_hash, is_admin)
VALUES ('azurim', '$2b$10$3euPcmQFCiblsZeEu5s7p.9wVsruW1zf.gP.IfY5dtWw3jQUy3BPu', TRUE)
ON CONFLICT (username) DO NOTHING;