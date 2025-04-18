import React, { useState, useEffect } from 'react';
import { FaUserShield, FaTrash, FaCoins, FaCalendarAlt, FaClock } from 'react-icons/fa';
import '../AdminPanel.css';
import { formatNumber } from '../utils/formatNumber';

interface AdminPanelProps {
  currentUser: string | null;
}

interface UserWithStats {
  id: number;
  username: string;
  is_admin: boolean;
  created_at: string;
  last_login: string;
  bankroll?: number;
  passive_income?: number;
  total_rolls?: number;
  total_wins?: number;
  total_winnings?: number;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get users from API
  const getUsers = async () => {
    try {
      // Import the API function
      const { getAllUsers } = await import('../api');
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users. Please try again.');
    }
  };

  // Load users when panel is opened
  useEffect(() => {
    if (showPanel) {
      getUsers();
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
  const handleDeleteUser = async (userId: number, username: string) => {
    if (username === currentUser) {
      alert("You cannot delete your own account");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the account for ${username}?`)) {
      try {
        // Import the API function
        const { deleteUser } = await import('../api');
        await deleteUser(userId);
        
        // Refresh the user list
        getUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
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
            Total accounts: {users.length}
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
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className={user.is_admin ? 'admin-user' : ''}>
                      {user.username} {user.is_admin && '(Admin)'}
                    </td>
                    <td>
                      {user.passive_income
                        ? `${formatNumber(user.passive_income)}/tick`
                        : 'N/A'}
                    </td>
                    <td title={formatDate(user.created_at)}>
                      {formatTimeSince(user.created_at)}
                    </td>
                    <td title={formatDate(user.last_login)}>
                      {formatTimeSince(user.last_login)}
                    </td>
                    <td>
                      <button
                        className="delete-user-button"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        disabled={user.is_admin || user.username === currentUser}
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