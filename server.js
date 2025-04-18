import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';
import pool, * as db from './src/db.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://idlecraps.com'
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up session with PostgreSQL store
const PgSession = pgSession(session);
app.use(session({
  store: new PgSession({
    pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'idle-craps-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',  // Changed from 'lax' to 'none' for cross-site requests
    httpOnly: true,    // Add httpOnly attribute
    domain: process.env.NODE_ENV === 'production' ? '.idlecraps.com' : 'localhost' // Add domain attribute
  }
}));

// Debug middleware to log all requests and their session data
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request cookies:', req.headers.cookie);
  console.log('Session data:', req.session);
  next();
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  console.log('Session data:', req.session);
  console.log('Cookies:', req.headers.cookie);
  
  if (req.session.userId) {
    console.log('User authenticated:', req.session.userId, req.session.username);
    next();
  } else {
    console.log('Authentication failed - no userId in session');
    res.status(401).json({ error: 'Authentication required' });
  }
};

// API Routes

// Register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if username already exists
    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = await db.createUser(username, passwordHash);
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        isAdmin: newUser.is_admin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find user
    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    
    // Update last login
    await db.updateLastLogin(user.id);
    
    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.isAdmin = user.is_admin;
    
    // Save session explicitly
    console.log('Before save - Session data:', req.session);
    
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Error saving session' });
      }
      
      console.log('After save - Session data:', req.session);
      console.log('Session ID:', req.session.id);
      
      res.json({
        message: 'Login successful',
        user: {
          username: user.username,
          isAdmin: user.is_admin
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
app.get('/api/user', (req, res) => {
  console.log('/api/user - Session data:', req.session);
  console.log('/api/user - Cookies:', req.headers.cookie);
  
  if (req.session.userId) {
    console.log('/api/user - User authenticated:', req.session.userId, req.session.username);
    res.json({
      username: req.session.username,
      isAdmin: req.session.isAdmin
    });
  } else {
    console.log('/api/user - No userId in session');
    res.status(401).json({ error: 'Authentication required' });
  }
});

// Save game state
app.post('/api/gamestate', isAuthenticated, async (req, res) => {
  try {
    console.log('/api/gamestate POST - Session data:', req.session);
    const userId = req.session.userId;
    const gameState = req.body;
    
    console.log(`Saving game state for user ${userId}`);
    
    // Validate the game state has required fields
    if (!gameState) {
      return res.status(400).json({ error: 'No game state provided' });
    }
    
    await db.saveGameState(userId, gameState);
    
    res.json({
      message: 'Game state saved successfully',
      timestamp: new Date(),
      userId: userId
    });
  } catch (error) {
    console.error('Save game state error:', error);
    res.status(500).json({ error: 'Server error during save', details: error.message });
  }
});

// Debug endpoint to check session status
app.get('/api/debug/session', (req, res) => {
  console.log('Debug session - Session data:', req.session);
  console.log('Debug session - Cookies:', req.headers.cookie);
  
  res.json({
    sessionExists: !!req.session,
    hasUserId: !!req.session.userId,
    userId: req.session.userId,
    username: req.session.username,
    cookiesHeader: req.headers.cookie
  });
});

// Load game state
app.get('/api/gamestate', isAuthenticated, async (req, res) => {
  try {
    console.log('/api/gamestate GET - Session data:', req.session);
    const userId = req.session.userId;
    const gameState = await db.getGameState(userId);
    
    if (!gameState) {
      return res.json({ message: 'No saved game state found' });
    }
    
    res.json(gameState);
  } catch (error) {
    console.error('Load game state error:', error);
    res.status(500).json({ error: 'Server error during load' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const leaderboard = await db.getLeaderboard(limit);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
});

// Admin routes
// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.userId && req.session.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Get all users (admin only)
app.get('/api/admin/users', isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.username, u.is_admin, u.created_at, u.last_login,
       g.bankroll, g.passive_income, g.total_rolls, g.total_wins, g.total_winnings
       FROM users u
       LEFT JOIN game_states g ON u.id = g.user_id
       ORDER BY u.created_at DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// Delete a user (admin only)
app.delete('/api/admin/users/:id', isAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Don't allow deleting self
    if (userId === req.session.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    // Check if user exists and is not an admin
    const userResult = await db.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (userResult.rows[0].is_admin) {
      return res.status(400).json({ error: 'Cannot delete admin accounts' });
    }
    
    // Delete user (cascade will delete game_states and leaderboard entries)
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
});

// Migrate localStorage data to database
app.post('/api/migrate', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { gameState } = req.body;
    
    // Check if user already has game state in database
    const existingState = await db.getGameState(userId);
    if (existingState) {
      return res.status(400).json({ error: 'User already has game state in database' });
    }
    
    // Save migrated game state
    await db.saveGameState(userId, gameState);
    
    res.json({ message: 'Game state migrated successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Server error during migration' });
  }
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// For any other request, send the index.html file
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});