import React, { useState, useEffect } from 'react';
import { User } from './AccountSystem';
import { FaUserShield, FaTrash, FaCoins, FaCalendarAlt, FaClock } from 'react-icons/fa';
import '../AdminPanel.css';

interface AdminPanelProps {
  currentUser: string | null;
}

interface UserWithStats extends User {
  passiveIncome?: number;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<{ [key: string]: UserWithStats }>({});
  const [showPanel, setShowPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get users from localStorage
  const getUsers = (): { [key: string]: UserWithStats } => {
    const users = localStorage.getItem('idleCrapsUsers');
    return users ? JSON.parse(users) : {};
  };

  // Save users to localStorage
  const saveUsers = (users: { [key: string]: UserWithStats }) => {
    localStorage.setItem('idleCrapsUsers', JSON.stringify(users));
  };

  // Load users when panel is opened
  useEffect(() => {
    if (showPanel) {
      setUsers(getUsers());
    }
  }, [showPanel]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format time since
  const formatTimeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  // Delete a user account
  const deleteUser = (username: string) => {
    if (username === currentUser) {
      alert("You cannot delete your own account");
      return;
    }
    
    if (username === 'admin') {
      alert("Cannot delete the admin account");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the account for ${username}?`)) {
      const updatedUsers = { ...users };
      delete updatedUsers[username];
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
    }
  };

  // Filter users based on search term
  const filteredUsers = Object.entries(users).filter(([username]) => 
    username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-panel-container">
      <button 
        className="admin-toggle-button" 
        onClick={() => setShowPanel(!showPanel)}
      >
        <FaUserShield /> {showPanel ? 'Close' : 'Admin Panel'}
      </button>
      
      {showPanel && (
        <div className="admin-panel">
          <h2>Admin Panel</h2>
          <div className="admin-search">
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="user-count">
            Total accounts: {Object.keys(users).length}
          </div>
          
          <div className="admin-users-list">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th><FaCoins /> Passive Income</th>
                  <th><FaCalendarAlt /> Created</th>
                  <th><FaClock /> Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(([username, user]) => (
                  <tr key={username}>
                    <td className={user.isAdmin ? 'admin-user' : ''}>
                      {username} {user.isAdmin && '(Admin)'}
                    </td>
                    <td>
                      {user.gameState?.passiveIncome 
                        ? `$${user.gameState.passiveIncome.toFixed(2)}/tick` 
                        : 'N/A'}
                    </td>
                    <td title={formatDate(user.createdAt)}>
                      {formatTimeSince(user.createdAt)}
                    </td>
                    <td title={formatDate(user.lastLogin)}>
                      {formatTimeSince(user.lastLogin)}
                    </td>
                    <td>
                      <button 
                        className="delete-user-button"
                        onClick={() => deleteUser(username)}
                        disabled={username === 'admin' || username === currentUser}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 