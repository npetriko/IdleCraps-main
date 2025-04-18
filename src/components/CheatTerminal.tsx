import { FaTimes, FaCoins, FaDice, FaPlay, FaTrophy, FaUnlock, FaTrash } from 'react-icons/fa';

interface CheatTerminalProps {
  onClose: () => void;
  onSetDice: (die1: number, die2: number) => void;
  onAddMoney: (amount: number) => void;
  onUnlockAll: () => void;
  onCompleteQuest?: (questId: string) => void;
  onUnlockQuest?: (questId: string) => void;
  quests?: Array<{id: string, name: string, completed: boolean, unlocked: boolean}>;
  onWipeProgress?: () => void;
}

const CheatTerminal = ({
  onClose,
  onSetDice,
  onAddMoney,
  onUnlockAll,
  onCompleteQuest,
  onUnlockQuest,
  onWipeProgress,
  quests = []
}: CheatTerminalProps) => {
  // Generate all possible dice combinations (1-6 for each die)
  const diceCombinations = [];
  for (let die1 = 1; die1 <= 6; die1++) {
    for (let die2 = 1; die2 <= 6; die2++) {
      diceCombinations.push({ die1, die2, total: die1 + die2 });
    }
  }

  // Group dice combinations by total
  const diceByTotal: { [key: number]: { die1: number, die2: number }[] } = {};
  diceCombinations.forEach(combo => {
    if (!diceByTotal[combo.total]) {
      diceByTotal[combo.total] = [];
    }
    diceByTotal[combo.total].push({ die1: combo.die1, die2: combo.die2 });
  });

  // Commonly used totals in craps
  const keyTotals = [7, 11, 2, 3, 12, 4, 5, 6, 8, 9, 10];
  
  // Filter quests into different categories
  const unlockedQuests = quests.filter(q => q.unlocked && !q.completed);
  const lockedQuests = quests.filter(q => !q.unlocked);
  
  return (
    <div className="cheat-terminal-overlay">
      <div className="cheat-terminal">
        <div className="cheat-terminal-header">
          <h2>Cheat Terminal</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="cheat-terminal-content">
          <section className="cheat-section">
            <h3>Dice Combinations</h3>
            <div className="dice-buttons">
              {keyTotals.map(total => (
                <div key={total} className="dice-total-group">
                  <h4>Roll {total}</h4>
                  <div className="dice-total-buttons">
                    {diceByTotal[total].map((combo, idx) => (
                      <button 
                        key={idx} 
                        className="dice-combo-button"
                        onClick={() => onSetDice(combo.die1, combo.die2)}
                      >
                        <FaDice /> {combo.die1}-{combo.die2}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <section className="cheat-section">
            <h3>Economy Cheats</h3>
            <div className="economy-cheats">
              <button onClick={() => onAddMoney(100)}>
                <FaCoins /> $100
              </button>
              <button onClick={() => onAddMoney(1000)}>
                <FaCoins /> $1,000
              </button>
              <button onClick={() => onAddMoney(10000)}>
                <FaCoins /> $10,000
              </button>
              <button onClick={() => onAddMoney(100000)}>
                <FaCoins /> $100,000
              </button>
            </div>
          </section>
          
          <section className="cheat-section">
            <h3>Game Cheats</h3>
            <div className="game-cheats">
              <button onClick={onUnlockAll} className="unlock-all-button">
                <FaPlay /> Unlock All Bets & Chips
              </button>
              {onWipeProgress && (
                <button onClick={() => {
                  if (window.confirm('Are you sure you want to wipe all progress? This cannot be undone!')) {
                    onWipeProgress();
                  }
                }} className="wipe-progress-button" style={{ backgroundColor: '#d9534f' }}>
                  <FaTrash /> Wipe All Progress
                </button>
              )}
            </div>
          </section>

          {onUnlockQuest && lockedQuests.length > 0 && (
            <section className="cheat-section">
              <h3>Unlock Quests</h3>
              <div className="quest-cheats">
                <button 
                  onClick={() => onUnlockQuest('all')} 
                  className="quest-cheat-button unlock-all-quests"
                >
                  <FaUnlock /> Unlock All Quests
                </button>
                {lockedQuests.map(quest => (
                  <button 
                    key={quest.id} 
                    onClick={() => onUnlockQuest(quest.id)} 
                    className="quest-cheat-button unlock-quest"
                  >
                    <FaUnlock /> Unlock: {quest.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {onCompleteQuest && unlockedQuests.length > 0 && (
            <section className="cheat-section">
              <h3>Complete Quests</h3>
              <div className="quest-cheats">
                <button 
                  onClick={() => onCompleteQuest('all')} 
                  className="quest-cheat-button all-quests"
                >
                  <FaTrophy /> Complete All Quests
                </button>
                {unlockedQuests.map(quest => (
                  <button 
                    key={quest.id} 
                    onClick={() => onCompleteQuest(quest.id)} 
                    className={`quest-cheat-button ${quest.completed ? 'completed' : ''}`}
                    disabled={quest.completed}
                  >
                    <FaTrophy /> Complete: {quest.name}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheatTerminal; 