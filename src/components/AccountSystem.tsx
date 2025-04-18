import React, { useState, useEffect } from 'react';
import '../AccountSystem.css';
import { FaUser, FaLock, FaSave, FaSignOutAlt } from 'react-icons/fa';

export interface User {
  username: string;
  isAdmin?: boolean;
}

interface AccountSystemProps {
  onLogin: (username: string, isAdmin: boolean) => void;
  onLogout: () => void;
  onSaveState: () => void;
  isLoggedIn: boolean;
  currentUser: string | null;
  isAdmin: boolean;
  lastSaveTime: Date | null;
}

const AccountSystem: React.FC<AccountSystemProps> = ({
  onLogin,
  onLogout,
  onSaveState,
  isLoggedIn,
  currentUser,
  isAdmin,
  lastSaveTime
}) => {
  const [showLogin, setShowLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in via session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include' // Add credentials for session cookies
        });
        if (response.ok) {
          const data = await response.json();
          onLogin(data.username, data.isAdmin);
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    if (!isLoggedIn) {
      checkSession();
    }
  }, [isLoggedIn, onLogin]);

  // Register a new user
  const registerUser = async () => {
    if (!username || !password) {
      setErrorMessage('Username and password are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include' // Add credentials for session cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMessage('Account created! You can now login.');
      setErrorMessage('');
      setIsRegistering(false);
      setPassword('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const loginUser = async () => {
    if (!username || !password) {
      setErrorMessage('Username and password are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include' // Add credentials for session cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Call the onLogin callback to update parent component state
      onLogin(data.user.username, data.user.isAdmin);

      // Close the login modal
      setShowLogin(false);
      setErrorMessage('');
      setPassword('');

      setSuccessMessage(`Welcome back, ${data.user.username}!`);
      setTimeout(() => setSuccessMessage(''), 3000);

      // Check if there's localStorage data to migrate
      migrateLocalStorageData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Migrate localStorage data if available
  const migrateLocalStorageData = async () => {
    try {
      // Check for localStorage game state
      const savedGameState = localStorage.getItem('idleCrapsGameState');
      if (savedGameState) {
        try {
          // Import the API function
          const { migrateLocalStorageData: migrateData } = await import('../api');
          
          // Migrate data to server
          await migrateData(JSON.parse(savedGameState));
          
          setSuccessMessage('Game data migrated successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
          
          // Optionally clear localStorage after successful migration
          // localStorage.removeItem('idleCrapsGameState');
        } catch (apiError) {
          console.error('Migration API error:', apiError);
        }
      }
    } catch (error) {
      console.error('Error during migration:', error);
    }
  };

  // Save current game state
  const triggerSave = () => {
    if (!currentUser) return;

    onSaveState(); // Call the save function passed from App

    setSuccessMessage('Save triggered!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      registerUser();
    } else {
      loginUser();
    }
  };

  // Toggle between login and register
  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include' // Add credentials for session cookies
      });
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="account-system">
      {!isLoggedIn ? (
        <button className="account-button" onClick={() => setShowLogin(true)}>
          <FaUser /> Login / Register
        </button>
      ) : (
        <div className="account-controls">
          <span className="user-greeting">
            <FaUser /> {currentUser} {isAdmin && "(Admin)"}
          </span>
          <button className="save-button" onClick={triggerSave}>
            <FaSave /> Save
          </button>
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
          {lastSaveTime && (
            <div className="last-saved">
              Last saved: {lastSaveTime.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {showLogin && (
        <div className="login-overlay">
          <div className="login-modal">
            <h2>{isRegistering ? 'Create Account' : 'Login'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">
                  <FaUser /> Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  <FaLock /> Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isLoading}
                />
              </div>
              
              {errorMessage && <div className="error-message">{errorMessage}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              
              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
                </button>
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => setShowLogin(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
            
            <div className="form-toggle">
              <button onClick={toggleForm} disabled={isLoading}>
                {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSystem;
