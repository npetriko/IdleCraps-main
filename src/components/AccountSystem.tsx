import React, { useState, useEffect } from 'react';
import '../AccountSystem.css';
import { FaUser, FaLock, FaSave, FaSignOutAlt } from 'react-icons/fa';

export interface User {
  username: string;
  passwordHash: string;
  gameState: any;
  createdAt: string;
  lastLogin: string;
  isAdmin?: boolean;
}

interface AccountSystemProps {
  onLogin: (username: string, isAdmin: boolean) => void;
  onLogout: () => void;
  onSaveState: () => void; // Changed: No longer needs username/gameState args
  gameState: any; // Keep gameState prop if needed elsewhere, or remove if truly unused
  isLoggedIn: boolean;
  currentUser: string | null;
  isAdmin: boolean;
  lastSaveTime: Date | null; // Add the new prop
}

const AccountSystem: React.FC<AccountSystemProps> = ({
  onLogin,
  onLogout,
  onSaveState, // Keep the function prop itself
  // gameState, // Remove if unused
  isLoggedIn,
  currentUser,
  isAdmin,
  lastSaveTime // Destructure the new prop
}) => {
  const [showLogin, setShowLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  // Remove internal lastSaved state: const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Simple hash function for passwords
  const hashPassword = (password: string): string => {
    // This is a very basic hash for demonstration
    // In a real app, use a proper crypto library
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  };

  // Create admin account if it doesn't exist
  useEffect(() => {
    const users = getUsers();
    
    // Remove the old admin account if it exists
    if (users['admin']) {
      delete users['admin'];
    }
    
    // Check if azurim admin account exists
    if (!users['azurim']) {
      // Create admin account with username azurim and password '@W7PreRL'
      const adminUser: User = {
        username: 'azurim',
        passwordHash: hashPassword('@W7PreRL'),
        gameState: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isAdmin: true
      };
      
      users['azurim'] = adminUser;
      saveUsers(users);
      console.log('Admin account created with username: azurim and password: @W7PreRL');
    }
  }, []);

  // Get users from localStorage
  const getUsers = (): { [key: string]: User } => {
    const users = localStorage.getItem('idleCrapsUsers');
    return users ? JSON.parse(users) : {};
  };

  // Save users to localStorage
  const saveUsers = (users: { [key: string]: User }) => {
    localStorage.setItem('idleCrapsUsers', JSON.stringify(users));
  };

  // Register a new user
  const registerUser = () => {
    if (!username || !password) {
      setErrorMessage('Username and password are required');
      return;
    }

    const users = getUsers();
    
    if (users[username]) {
      setErrorMessage('Username already exists');
      return;
    }

    const newUser: User = {
      username,
      passwordHash: hashPassword(password),
      gameState: null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isAdmin: false // Regular users are not admins
    };

    users[username] = newUser;
    saveUsers(users);
    
    setSuccessMessage('Account created! You can now login.');
    setErrorMessage('');
    setIsRegistering(false);
    
    // Clear form
    setPassword('');
  };

  // Login user
  const loginUser = () => {
    if (!username || !password) {
      setErrorMessage('Username and password are required');
      return;
    }

    const users = getUsers();
    const user = users[username];
    
    if (!user) {
      setErrorMessage('Username not found');
      return;
    }

    if (user.passwordHash !== hashPassword(password)) {
      setErrorMessage('Incorrect password');
      return;
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    users[username] = user;
    saveUsers(users);
    
    // Call the onLogin callback to update parent component state
    onLogin(username, !!user.isAdmin);
    
    // Close the login modal
    setShowLogin(false);
    setErrorMessage('');
    setPassword('');
    
    setSuccessMessage(`Welcome back, ${username}!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Save current game state (now just calls the passed function)
  const triggerSave = () => {
    if (!currentUser) return; // Still need user context potentially

    onSaveState(); // Call the save function passed from App

    // Success message might be handled by App's addResult now, or keep it here
    setSuccessMessage('Save triggered!'); // Or use message from App?
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Remove the auto-save logic from here, it's handled in App.tsx
  // useEffect(() => { ... }, []);

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
          {/* Use triggerSave instead of saveGameState */}
          <button className="save-button" onClick={triggerSave}>
            <FaSave /> Save
          </button>
          <button className="logout-button" onClick={onLogout}>
            <FaSignOutAlt /> Logout
          </button>
          {/* Use the lastSaveTime prop */}
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
                />
              </div>
              
              {errorMessage && <div className="error-message">{errorMessage}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {isRegistering ? 'Register' : 'Login'}
                </button>
                <button type="button" className="cancel-button" onClick={() => setShowLogin(false)}>
                  Cancel
                </button>
              </div>
            </form>
            
            <div className="form-toggle">
              <button onClick={toggleForm}>
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
