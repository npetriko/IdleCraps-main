import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Create a new pool using environment variables
let pool;

// Check if DATABASE_URL is provided (common in deployment environments like Render)
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for some PostgreSQL providers
    }
  });
} else {
  // Use individual environment variables (common in local development)
  pool = new Pool({
    // Connection details are automatically read from environment variables:
    // PGUSER, PGHOST, PGPASSWORD, PGDATABASE, PGPORT
  });
}

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Helper functions for database operations
export const query = (text, params) => pool.query(text, params);

// User-related queries
export const createUser = async (username, passwordHash) => {
  const result = await query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, is_admin, created_at',
    [username, passwordHash]
  );
  return result.rows[0];
};

export const getUserByUsername = async (username) => {
  const result = await query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
};

export const updateLastLogin = async (userId) => {
  await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
};

// Game state queries
export const saveGameState = async (userId, gameState) => {
  // Check if a game state already exists for this user
  const existingState = await query('SELECT id FROM game_states WHERE user_id = $1', [userId]);
  
  if (existingState.rows.length > 0) {
    // Update existing game state
    await query(
      `UPDATE game_states SET 
        bankroll = $2,
        passive_income = $3,
        total_rolls = $4,
        total_wins = $5,
        total_winnings = $6,
        streak = $7,
        unlocked_bets = $8,
        unlocked_chips = $9,
        achievements = $10,
        place_bet_expert_wins = $11,
        quests = $12,
        upgrade_count = $13,
        has_won_first_bet = $14,
        completed_tutorial = $15,
        unlocked_tutorials = $16,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1`,
      [
        userId,
        gameState.bankroll,
        gameState.passiveIncome,
        gameState.totalRolls,
        gameState.totalWins,
        gameState.totalWinnings,
        gameState.streak,
        JSON.stringify(gameState.unlockedBets),
        JSON.stringify(gameState.unlockedChips),
        JSON.stringify(gameState.achievements),
        JSON.stringify(gameState.placeBetExpertWins),
        JSON.stringify(gameState.quests),
        gameState.upgradeCount,
        gameState.hasWonFirstBet,
        gameState.completedTutorial,
        JSON.stringify(gameState.unlockedTutorials)
      ]
    );
  } else {
    // Create new game state
    await query(
      `INSERT INTO game_states (
        user_id, bankroll, passive_income, total_rolls, total_wins, total_winnings,
        streak, unlocked_bets, unlocked_chips, achievements, place_bet_expert_wins,
        quests, upgrade_count, has_won_first_bet, completed_tutorial, unlocked_tutorials
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        userId,
        gameState.bankroll,
        gameState.passiveIncome,
        gameState.totalRolls,
        gameState.totalWins,
        gameState.totalWinnings,
        gameState.streak,
        JSON.stringify(gameState.unlockedBets),
        JSON.stringify(gameState.unlockedChips),
        JSON.stringify(gameState.achievements),
        JSON.stringify(gameState.placeBetExpertWins),
        JSON.stringify(gameState.quests),
        gameState.upgradeCount,
        gameState.hasWonFirstBet,
        gameState.completedTutorial,
        JSON.stringify(gameState.unlockedTutorials)
      ]
    );
  }
  
  // Update leaderboard
  await updateLeaderboard(userId, gameState.bankroll, gameState.totalWinnings);
};

export const getGameState = async (userId) => {
  const result = await query('SELECT * FROM game_states WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) return null;
  
  const gameState = result.rows[0];
  
  // Convert JSON strings back to objects
  return {
    bankroll: gameState.bankroll,
    passiveIncome: gameState.passive_income,
    totalRolls: gameState.total_rolls,
    totalWins: gameState.total_wins,
    totalWinnings: gameState.total_winnings,
    streak: gameState.streak,
    unlockedBets: gameState.unlocked_bets,
    unlockedChips: gameState.unlocked_chips,
    achievements: gameState.achievements,
    placeBetExpertWins: gameState.place_bet_expert_wins,
    quests: gameState.quests,
    upgradeCount: gameState.upgrade_count,
    hasWonFirstBet: gameState.has_won_first_bet,
    completedTutorial: gameState.completed_tutorial,
    unlockedTutorials: gameState.unlocked_tutorials,
    lastSaveTime: gameState.updated_at
  };
};

// Leaderboard queries
export const updateLeaderboard = async (userId, bankroll, totalWinnings) => {
  // Get username
  const userResult = await query('SELECT username FROM users WHERE id = $1', [userId]);
  const username = userResult.rows[0].username;
  
  // Update or insert leaderboard entry
  await query(
    `INSERT INTO leaderboard (user_id, username, bankroll, total_winnings, updated_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id) 
     DO UPDATE SET 
       bankroll = $3,
       total_winnings = $4,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, username, bankroll, totalWinnings]
  );
};

export const getLeaderboard = async (limit = 100) => {
  const result = await query(
    'SELECT username, bankroll, total_winnings, updated_at FROM leaderboard ORDER BY bankroll DESC LIMIT $1',
    [limit]
  );
  return result.rows;
};

export default pool;