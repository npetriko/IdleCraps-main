import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pool, * as db from './src/db.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
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
    
    res.json({
      message: 'Login successful',
      user: {
        username: user.username,
        isAdmin: user.is_admin
      }
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
app.get('/api/user', isAuthenticated, (req, res) => {
  res.json({
    username: req.session.username,
    isAdmin: req.session.isAdmin
  });
});

// Save game state
app.post('/api/gamestate', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const gameState = req.body;
    
    await db.saveGameState(userId, gameState);
    
    res.json({ 
      message: 'Game state saved successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Save game state error:', error);
    res.status(500).json({ error: 'Server error during save' });
  }
});

// Load game state
app.get('/api/gamestate', isAuthenticated, async (req, res) => {
  try {
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