/**
 * API utility functions for IdleCraps
 * Handles communication with the server API endpoints
 */

// Save game state to the server
export const saveGameState = async (gameState: any) => {
  try {
    const response = await fetch('/api/gamestate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameState),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save game state');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving game state:', error);
    throw error;
  }
};

// Load game state from the server
export const loadGameState = async () => {
  try {
    const response = await fetch('/api/gamestate');
    
    if (!response.ok) {
      throw new Error('Failed to load game state');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error loading game state:', error);
    throw error;
  }
};

// Register a new user
export const registerUser = async (username: string, password: string) => {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Registration failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Login failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await fetch('/api/user');
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Migrate localStorage data to server
export const migrateLocalStorageData = async (gameState: any) => {
  try {
    const response = await fetch('/api/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameState }),
    });
    
    if (!response.ok) {
      throw new Error('Migration failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error migrating data:', error);
    throw error;
  }
};

// Get leaderboard data
export const getLeaderboard = async (limit = 100) => {
  try {
    const response = await fetch(`/api/leaderboard?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};