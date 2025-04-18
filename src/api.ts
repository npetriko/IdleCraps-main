/**
 * API utility functions for IdleCraps
 * Handles communication with the server API endpoints
 */

// Save game state to the server
export const saveGameState = async (gameState: any) => {
  try {
    console.log('API: Saving game state to server', gameState);
    
    // Ensure we have a valid game state object
    if (!gameState || typeof gameState !== 'object') {
      throw new Error('Invalid game state object');
    }
    
    const response = await fetch('/api/gamestate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameState),
      credentials: 'include' // Important: include credentials for session cookies
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server returned error:', response.status, errorData);
      throw new Error(`Failed to save game state: ${response.status} ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    console.log('API: Save successful', result);
    return result;
  } catch (error) {
    console.error('Error saving game state:', error);
    throw error;
  }
};

// Load game state from the server
export const loadGameState = async () => {
  try {
    console.log('API: Loading game state from server');
    
    const response = await fetch('/api/gamestate', {
      credentials: 'include' // Important: include credentials for session cookies
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('No saved game state found on server');
        return null;
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error('Server returned error:', response.status, errorData);
      throw new Error(`Failed to load game state: ${response.status} ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if we got a message about no saved state
    if (data.message === 'No saved game state found') {
      console.log('API: No saved game state found');
      return null;
    }
    
    console.log('API: Load successful', data);
    return data;
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

// Admin API functions

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const response = await fetch('/api/admin/users');
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Delete a user (admin only)
export const deleteUser = async (userId: number) => {
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
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