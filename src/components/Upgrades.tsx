import React, { useState } from 'react';
import { FaUnlock, FaLock, FaTimes } from 'react-icons/fa';
import '../App.css';

interface UpgradesProps {
  unlockedBets: { [key: string]: boolean };
  unlockedChips: number[];
  unlockBet: (betType: string) => void;
  unlockChip: (chipValue: number) => void;
  onClose: () => void;
}

// Define the constants here since we're moving this from App.tsx
export const BET_UNLOCK_COSTS = {
  // Place bets (most common to least common)
  'place-5': 100,
  'place-9': 100,
  'place-4': 200,
  'place-10': 200,
  // Base bets
  'dont-pass': 10,
  'come': 30,
  'dont-come': 40,
  'field': 25,
  // Hardways
  'hard-6': 60,
  'hard-8': 60,
  'hard-4': 70,
  'hard-10': 70,
  // Prop bets (most expensive as they're high risk/reward)
  'any-7': 80,
  'any-craps': 90,
  'eleven': 100,
  'ace-deuce': 110,
  // Special bets
  'pass-line-odds': 150
};

// Chip unlock costs
export const CHIP_UNLOCK_COSTS = {
  '25': 200,
  '50': 500,
  '100': 1000,
  '1000': 5000
};

type UpgradeTab = 'place' | 'chips' | 'other' | 'advanced';

const Upgrades: React.FC<UpgradesProps> = ({ 
  unlockedBets, 
  unlockedChips, 
  unlockBet, 
  unlockChip, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<UpgradeTab>('place');
  
  return (
    <div className="upgrades-panel">
      <div className="title-container">
        <h2>Upgrades</h2>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      
      <div className="upgrades-tabs">
        <button 
          className={`upgrade-tab ${activeTab === 'place' ? 'active' : ''}`}
          onClick={() => setActiveTab('place')}
        >
          Place Bets
        </button>
        <button 
          className={`upgrade-tab ${activeTab === 'chips' ? 'active' : ''}`}
          onClick={() => setActiveTab('chips')}
        >
          Chips
        </button>
      </div>
      
      {activeTab === 'place' && (
        <div className="section-header">Unlock Place Bets</div>
      )}
      
      <div className="upgrades-list">
        {activeTab === 'place' && (
          Object.entries(BET_UNLOCK_COSTS)
            .filter(([betType]) => betType.startsWith('place-') && betType !== 'place-6' && betType !== 'place-8')
            .map(([betType, cost]) => (
              <div 
                key={betType} 
                className={`upgrade-item ${unlockedBets[betType] ? 'unlocked' : ''}`}
                onClick={() => !unlockedBets[betType] && unlockBet(betType)}
              >
                <div className="upgrade-icon">
                  {unlockedBets[betType] ? <FaUnlock /> : <FaLock />}
                </div>
                <div className="upgrade-details">
                  <div className="upgrade-name">
                    Place {betType.replace('place-', '')}
                  </div>
                  {unlockedBets[betType] ? (
                    <div className="upgrade-status">Unlocked</div>
                  ) : (
                    <div className="upgrade-cost">${cost}</div>
                  )}
                </div>
              </div>
            ))
        )}
        
        {activeTab === 'chips' && (
          <>
            <div className="section-header">Unlock Chip Values</div>
            {Object.entries(CHIP_UNLOCK_COSTS).map(([chipValue, cost]) => {
              const value = parseInt(chipValue);
              return (
                <div 
                  key={chipValue}
                  className={`upgrade-item ${unlockedChips.includes(value) ? 'unlocked' : ''}`}
                  onClick={() => !unlockedChips.includes(value) && unlockChip(value)}
                >
                  <div className={`upgrade-icon chip-icon value-${chipValue}`}>
                    ${Math.floor(parseInt(chipValue))}
                  </div>
                  <div className="upgrade-details">
                    <div className="upgrade-name">
                      ${chipValue} Chip
                    </div>
                    {unlockedChips.includes(value) ? (
                      <div className="upgrade-status">Unlocked</div>
                    ) : (
                      <div className="upgrade-cost">${cost}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default Upgrades; 