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
  console.log(`DB: Saving game state for user ${userId}`);
  
  try {
    // Check if a game state already exists for this user
    const existingState = await query('SELECT id FROM game_states WHERE user_id = $1', [userId]);
    
    // Ensure all values are properly formatted
    const bankroll = parseFloat(gameState.bankroll) || 0;
    const passiveIncome = parseFloat(gameState.passiveIncome) || 1;
    const totalRolls = parseInt(gameState.totalRolls) || 0;
    const totalWins = parseInt(gameState.totalWins) || 0;
    const totalWinnings = parseFloat(gameState.totalWinnings) || 0;
    const streak = parseInt(gameState.streak) || 0;
    const highestStreak = parseInt(gameState.highestStreak) || 0;
    const lossStreak = parseInt(gameState.lossStreak) || 0;
    const highestLossStreak = parseInt(gameState.highestLossStreak) || 0;
    const upgradeCount = parseInt(gameState.upgradeCount) || 0;
    const hasWonFirstBet = gameState.hasWonFirstBet === true;
    const completedTutorial = gameState.completedTutorial === true;
    
    // Ensure objects are properly serialized
    const unlockedBets = JSON.stringify(gameState.unlockedBets || {});
    const unlockedChips = JSON.stringify(gameState.unlockedChips || []);
    const achievements = JSON.stringify(gameState.achievements || []);
    const placeBetExpertWins = JSON.stringify(gameState.placeBetExpertWins || []);
    const quests = JSON.stringify(gameState.quests || []);
    const unlockedTutorials = JSON.stringify(gameState.unlockedTutorials || []);
    
    if (existingState.rows.length > 0) {
      // Update existing game state
      console.log(`DB: Updating existing game state for user ${userId}`);
      await query(
        `UPDATE game_states SET
          bankroll = $2,
          passive_income = $3,
          total_rolls = $4,
          total_wins = $5,
          total_winnings = $6,
          streak = $7,
          highest_streak = $8,
          loss_streak = $9,
          highest_loss_streak = $10,
          unlocked_bets = $11,
          unlocked_chips = $12,
          achievements = $13,
          place_bet_expert_wins = $14,
          quests = $15,
          upgrade_count = $16,
          has_won_first_bet = $17,
          completed_tutorial = $18,
          unlocked_tutorials = $19,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1`,
        [
          userId,
          bankroll,
          passiveIncome,
          totalRolls,
          totalWins,
          totalWinnings,
          streak,
          highestStreak,
          lossStreak,
          highestLossStreak,
          unlockedBets,
          unlockedChips,
          achievements,
          placeBetExpertWins,
          quests,
          upgradeCount,
          hasWonFirstBet,
          completedTutorial,
          unlockedTutorials
        ]
      );
    } else {
      // Create new game state
      console.log(`DB: Creating new game state for user ${userId}`);
      await query(
        `INSERT INTO game_states (
          user_id, bankroll, passive_income, total_rolls, total_wins, total_winnings,
          streak, highest_streak, loss_streak, highest_loss_streak, unlocked_bets, unlocked_chips,
          achievements, place_bet_expert_wins, quests, upgrade_count, has_won_first_bet,
          completed_tutorial, unlocked_tutorials
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          userId,
          bankroll,
          passiveIncome,
          totalRolls,
          totalWins,
          totalWinnings,
          streak,
          highestStreak,
          lossStreak,
          highestLossStreak,
          unlockedBets,
          unlockedChips,
          achievements,
          placeBetExpertWins,
          quests,
          upgradeCount,
          hasWonFirstBet,
          completedTutorial,
          unlockedTutorials
        ]
      );
    }
    
    // Update leaderboard
    await updateLeaderboard(userId, bankroll, totalWinnings);
    
    return { success: true, message: 'Game state saved successfully' };
  } catch (error) {
    console.error('Error in saveGameState:', error);
    throw error;
  }
};

export const getGameState = async (userId) => {
  console.log(`DB: Getting game state for user ${userId}`);
  
  try {
    const result = await query('SELECT * FROM game_states WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      console.log(`DB: No game state found for user ${userId}`);
      return null;
    }
    
    const gameState = result.rows[0];
    console.log(`DB: Found game state for user ${userId}, last updated: ${gameState.updated_at}`);
    
    // Parse JSON strings back to objects
    try {
      // Create the return object with proper parsing
      const parsedState = {
        bankroll: parseFloat(gameState.bankroll) || 0,
        passiveIncome: parseFloat(gameState.passive_income) || 1,
        totalRolls: parseInt(gameState.total_rolls) || 0,
        totalWins: parseInt(gameState.total_wins) || 0,
        totalWinnings: parseFloat(gameState.total_winnings) || 0,
        streak: parseInt(gameState.streak) || 0,
        highestStreak: parseInt(gameState.highest_streak) || 0,
        lossStreak: parseInt(gameState.loss_streak) || 0,
        highestLossStreak: parseInt(gameState.highest_loss_streak) || 0,
        unlockedBets: typeof gameState.unlocked_bets === 'string' ? JSON.parse(gameState.unlocked_bets) : gameState.unlocked_bets || {},
        unlockedChips: typeof gameState.unlocked_chips === 'string' ? JSON.parse(gameState.unlocked_chips) : gameState.unlocked_chips || [],
        achievements: typeof gameState.achievements === 'string' ? JSON.parse(gameState.achievements) : gameState.achievements || [],
        placeBetExpertWins: typeof gameState.place_bet_expert_wins === 'string' ? JSON.parse(gameState.place_bet_expert_wins) : gameState.place_bet_expert_wins || [],
        quests: typeof gameState.quests === 'string' ? JSON.parse(gameState.quests) : gameState.quests || [],
        upgradeCount: parseInt(gameState.upgrade_count) || 0,
        hasWonFirstBet: gameState.has_won_first_bet === true,
        completedTutorial: gameState.completed_tutorial === true,
        unlockedTutorials: typeof gameState.unlocked_tutorials === 'string' ? JSON.parse(gameState.unlocked_tutorials) : gameState.unlocked_tutorials || [],
        lastSaveTime: gameState.updated_at
      };
      
      return parsedState;
    } catch (parseError) {
      console.error('Error parsing game state JSON:', parseError);
      // Return a basic state if parsing fails
      return {
        bankroll: parseFloat(gameState.bankroll) || 0,
        passiveIncome: parseFloat(gameState.passive_income) || 1,
        totalRolls: parseInt(gameState.total_rolls) || 0,
        totalWins: parseInt(gameState.total_wins) || 0,
        totalWinnings: parseFloat(gameState.total_winnings) || 0,
        streak: parseInt(gameState.streak) || 0,
        highestStreak: parseInt(gameState.highest_streak) || 0,
        lossStreak: parseInt(gameState.loss_streak) || 0,
        highestLossStreak: parseInt(gameState.highest_loss_streak) || 0,
        unlockedBets: { 'pass-line': true },
        unlockedChips: [1, 5, 10],
        lastSaveTime: gameState.updated_at
      };
    }
  } catch (error) {
    console.error('Error in getGameState:', error);
    throw error;
  }
};

// Leaderboard queries
export const updateLeaderboard = async (userId, bankroll, totalWinnings) => {
  try {
    // Get username and game state data
    const userResult = await query('SELECT username FROM users WHERE id = $1', [userId]);
    const username = userResult.rows[0].username;
    
    // Get highest streak, highest loss streak, and passive income from game_states
    const gameStateResult = await query(
      'SELECT streak, highest_streak, loss_streak, highest_loss_streak, passive_income FROM game_states WHERE user_id = $1',
      [userId]
    );
    
    let highestStreak = 0;
    let highestLossStreak = 0;
    let passiveIncome = 1;
    
    if (gameStateResult.rows.length > 0) {
      // Use the highest_streak field if it exists, otherwise fall back to streak
      highestStreak = parseInt(gameStateResult.rows[0].highest_streak) ||
                      parseInt(gameStateResult.rows[0].streak) || 0;
      highestLossStreak = parseInt(gameStateResult.rows[0].highest_loss_streak) ||
                          parseInt(gameStateResult.rows[0].loss_streak) || 0;
      passiveIncome = parseFloat(gameStateResult.rows[0].passive_income) || 1;
    }
    
    // Check if the new columns exist
    const checkColumns = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'leaderboard'
      AND column_name IN ('passive_income', 'highest_win_streak', 'highest_loss_streak')
    `);
    
    const hasNewColumns = checkColumns.rows.length === 3;
    
    // Check if user already exists in leaderboard
    const existingEntry = await query(
      'SELECT id FROM leaderboard WHERE user_id = $1',
      [userId]
    );
    
    if (existingEntry.rows.length > 0) {
      // Update existing entry
      if (hasNewColumns) {
        // If we have the new columns, get the current highest streak
        const streakResult = await query(
          'SELECT highest_win_streak FROM leaderboard WHERE user_id = $1',
          [userId]
        );
        
        const currentHighestStreak = streakResult.rows.length > 0 ?
          (parseInt(streakResult.rows[0].highest_win_streak) || 0) : 0;
        
        // Only update highest_win_streak if current highest streak is higher
        const newHighestStreak = Math.max(currentHighestStreak, highestStreak);
        
        // Update with new columns
        await query(
          `UPDATE leaderboard
           SET bankroll = $2, total_winnings = $3, passive_income = $4,
           highest_win_streak = $5, highest_loss_streak = $6, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1`,
          [userId, bankroll, totalWinnings, passiveIncome, newHighestStreak, highestLossStreak]
        );
      } else {
        // Update without new columns
        await query(
          `UPDATE leaderboard
           SET bankroll = $2, total_winnings = $3, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1`,
          [userId, bankroll, totalWinnings]
        );
      }
    } else {
      // Insert new entry
      if (hasNewColumns) {
        // Insert with new columns
        await query(
          `INSERT INTO leaderboard
           (user_id, username, bankroll, total_winnings, passive_income, highest_win_streak, highest_loss_streak, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
          [userId, username, bankroll, totalWinnings, passiveIncome, highestStreak, highestLossStreak]
        );
      } else {
        // Insert without new columns
        await query(
          `INSERT INTO leaderboard
           (user_id, username, bankroll, total_winnings, updated_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
          [userId, username, bankroll, totalWinnings]
        );
      }
    }
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    // Don't throw the error, just log it
    // This prevents the game state save from failing if leaderboard update fails
  }
};

export const getLeaderboard = async (limit = 100) => {
  try {
    // First, check if the new columns exist
    const checkColumns = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'leaderboard'
      AND column_name IN ('passive_income', 'highest_win_streak')
    `);
    
    const hasNewColumns = checkColumns.rows.length === 2;
    
    let result;
    if (hasNewColumns) {
      // If new columns exist, use them
      result = await query(
        `SELECT username, bankroll, total_winnings, passive_income, highest_win_streak, highest_loss_streak, updated_at
         FROM leaderboard
         ORDER BY bankroll DESC LIMIT $1`,
        [limit]
      );
    } else {
      // If new columns don't exist, use only existing columns
      result = await query(
        `SELECT username, bankroll, total_winnings, updated_at
         FROM leaderboard
         ORDER BY bankroll DESC LIMIT $1`,
        [limit]
      );
      
      // Add default values for missing columns
      result.rows = result.rows.map(row => ({
        ...row,
        passive_income: 1,
        highest_win_streak: 0,
        highest_loss_streak: 0
      }));
    }
    
    return result.rows;
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    // Return empty array in case of error
    return [];
  }
};

export default pool;