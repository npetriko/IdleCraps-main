import React, { useState, useEffect } from 'react';
import { FaTrophy, FaUser, FaCoins, FaSpinner } from 'react-icons/fa';
import { formatNumber } from '../utils/formatNumber';

interface LeaderboardEntry {
  username: string;
  bankroll: number;
  total_winnings: number;
  passive_income: number;
  highest_win_streak: number;
  highest_loss_streak: number;
  updated_at: string;
}

type SortField = 'bankroll' | 'highest_win_streak' | 'highest_loss_streak' | 'passive_income';

// Create a custom event for game saves
export const GAME_SAVED_EVENT = 'game-saved';

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('passive_income');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Function to fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leaderboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      const data = await response.json();
      setEntries(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Unable to load leaderboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLeaderboard();
    
    // Refresh leaderboard every 5 minutes
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    
    // Listen for game-saved events
    const handleGameSaved = () => {
      console.log('Leaderboard: Game saved event detected, refreshing data');
      fetchLeaderboard();
    };
    
    window.addEventListener(GAME_SAVED_EVENT, handleGameSaved);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener(GAME_SAVED_EVENT, handleGameSaved);
    };
  }, []);
  
  // Function to handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it as sort field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Get sorted entries
  const sortedEntries = [...entries].sort((a, b) => {
    // Convert to numbers to ensure proper numeric comparison
    const fieldA = Number(a[sortField]);
    const fieldB = Number(b[sortField]);
    
    if (sortDirection === 'asc') {
      return fieldA > fieldB ? 1 : -1;
    } else {
      return fieldA < fieldB ? 1 : -1;
    }
  });
  
  return (
    <div className="leaderboard">
      <h2><FaTrophy /> Leaderboard</h2>
      
      {loading ? (
        <div className="loading">
          <FaSpinner className="spinner" /> Loading leaderboard data...
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : entries.length === 0 ? (
        <div className="empty-message">No leaderboard entries yet. Be the first!</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th className="rank-column">Rank</th>
              <th>Player</th>
              <th
                onClick={() => handleSort('highest_win_streak')}
                className={`sortable ${sortField === 'highest_win_streak' ? 'sorted-' + sortDirection : ''}`}
              >
                Highest Win Streak
              </th>
              <th
                onClick={() => handleSort('highest_loss_streak')}
                className={`sortable ${sortField === 'highest_loss_streak' ? 'sorted-' + sortDirection : ''}`}
              >
                Highest Loss Streak
              </th>
              <th
                onClick={() => handleSort('passive_income')}
                className={`sortable ${sortField === 'passive_income' ? 'sorted-' + sortDirection : ''}`}
              >
                Passive Income
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry, index) => (
              <tr key={index} className={index < 3 ? `top-${index + 1}` : ''}>
                <td>{index + 1}</td>
                <td><FaUser /> {entry.username}</td>
                <td>{Number(entry.highest_win_streak).toLocaleString()}</td>
                <td>{Number(entry.highest_loss_streak).toLocaleString()}</td>
                <td><FaCoins /> {formatNumber(Number(entry.passive_income))}/sec</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;