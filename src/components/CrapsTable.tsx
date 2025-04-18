import { useState } from 'react';
import './CrapsTable.css';
import { FaLock } from 'react-icons/fa';
import { formatNumber } from '../utils/formatNumber';

interface CrapsTableProps {
  point: number | null;
  lastRoll: [number, number];
  onBet: (betType: string) => void;
  activeBets: {
    [key: string]: number;
  };
  unlockedBets: {
    [key: string]: boolean;
  };
}

const DICE_FACES = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅'
};

const CrapsTable = ({ point, onBet, activeBets, unlockedBets }: CrapsTableProps) => {
  const [activeSection, setActiveSection] = useState<'hardways' | 'props' | null>(null);

  const getPointClass = (num: number) => {
    if (point === num) return 'active-point';
    return '';
  };

  const toggleSection = (section: 'hardways' | 'props') => {
    setActiveSection(activeSection === section ? null : section);
  };

  const getBetAmount = (betType: string) => {
    return activeBets[betType] || 0;
  };

  const isLocked = (betType: string) => {
    return !unlockedBets[betType];
  };

  const renderLockIcon = (betType: string) => {
    if (isLocked(betType)) {
      return <div className="lock-icon"><FaLock /></div>;
    }
    return null;
  };

  return (
    <div className="craps-table">
      <div className="table-body">
        <div className="table-row">
          <div className={`box dont-come ${isLocked('dont-come') ? 'locked' : ''}`} onClick={() => onBet('dont-come')}>
            <div className="bet-label">DON'T COME</div>
            <div className="bet-amount">{formatNumber(getBetAmount('dont-come'), false)}</div>
            {renderLockIcon('dont-come')}
          </div>
          <div className={`box four ${getPointClass(4)} ${isLocked('place-4') ? 'locked' : ''}`} onClick={() => onBet('place-4')}>
            <div className="bet-label">4</div>
            <div className="bet-amount">{formatNumber(getBetAmount('place-4'), false)}</div>
            {point === 4 && <div className="on-puck">ON</div>}
            {renderLockIcon('place-4')}
          </div>
          <div className={`box five ${getPointClass(5)} ${isLocked('place-5') ? 'locked' : ''}`} onClick={() => onBet('place-5')}>
            <div className="bet-label">5</div>
            <div className="bet-amount">{formatNumber(getBetAmount('place-5'), false)}</div>
            {point === 5 && <div className="on-puck">ON</div>}
            {renderLockIcon('place-5')}
          </div>
          <div className={`box six ${getPointClass(6)} ${isLocked('place-6') ? 'locked' : ''}`} onClick={() => onBet('place-6')}>
            <div className="bet-label">6</div>
            <div className="bet-amount">{formatNumber(getBetAmount('place-6'), false)}</div>
            {point === 6 && <div className="on-puck">ON</div>}
            {renderLockIcon('place-6')}
          </div>
          <div className={`box eight ${getPointClass(8)} ${isLocked('place-8') ? 'locked' : ''}`} onClick={() => onBet('place-8')}>
            <div className="bet-label">8</div>
            <div className="bet-amount">{formatNumber(getBetAmount('place-8'), false)}</div>
            {point === 8 && <div className="on-puck">ON</div>}
            {renderLockIcon('place-8')}
          </div>
          <div className={`box nine ${getPointClass(9)} ${isLocked('place-9') ? 'locked' : ''}`} onClick={() => onBet('place-9')}>
            <div className="bet-label">9</div>
            <div className="bet-amount">{formatNumber(getBetAmount('place-9'), false)}</div>
            {point === 9 && <div className="on-puck">ON</div>}
            {renderLockIcon('place-9')}
          </div>
          <div className={`box ten ${getPointClass(10)} ${isLocked('place-10') ? 'locked' : ''}`} onClick={() => onBet('place-10')}>
            <div className="bet-label">10</div>
            <div className="bet-amount">{formatNumber(getBetAmount('place-10'), false)}</div>
            {point === 10 && <div className="on-puck">ON</div>}
            {renderLockIcon('place-10')}
          </div>
        </div>
        
        <div className="table-row">
          <div className={`box come ${isLocked('come') ? 'locked' : ''}`} onClick={() => onBet('come')}>
            <div className="bet-label">COME</div>
            <div className="bet-amount">{formatNumber(getBetAmount('come'), false)}</div>
            {renderLockIcon('come')}
          </div>
        </div>
        
        <div className="table-row">
          <div className={`box field-box ${isLocked('field') ? 'locked' : ''}`} onClick={() => onBet('field')}>
            <div className="field-content">
              <div className="field-text">FIELD</div>
              <div className="field-numbers">2 3 4 9 10 11 12</div>
              <div className="field-payout">2 & 12 Pay Double!</div>
              <div className="bet-amount">{formatNumber(getBetAmount('field'), false)}</div>
              {renderLockIcon('field')}
            </div>
          </div>
        </div>

        <div className="table-row">
          <div className={`box pass-line ${isLocked('pass-line') ? 'locked' : ''}`} onClick={() => onBet('pass-line')}>
            <div className="bet-label">PASS LINE</div>
            <div className="bet-amount">{formatNumber(getBetAmount('pass-line'), false)}</div>
            {renderLockIcon('pass-line')}
            
            {/* Only show Pass Line Odds bet option when there's a point, active pass line bet, and it's unlocked */}
            {point !== null && activeBets['pass-line'] && !isLocked('pass-line-odds') && (
              <div className="pass-line-odds-container" onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent pass-line bet
                onBet('pass-line-odds');
              }}>
                <div className="pass-line-odds-bet">
                  <div className="bet-label">ODDS</div>
                  <div className="bet-amount">{formatNumber(getBetAmount('pass-line-odds'), false)}</div>
                  <div className="payout-info">
                    {point === 4 || point === 10 ? "2:1" : 
                     point === 5 || point === 9 ? "3:2" : 
                     point === 6 || point === 8 ? "6:5" : ""}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="table-row">
          <div className={`box dont-pass ${isLocked('dont-pass') ? 'locked' : ''}`} onClick={() => onBet('dont-pass')}>
            <div className="bet-label">DON'T PASS</div>
            <div className="bet-amount">{formatNumber(getBetAmount('dont-pass'), false)}</div>
            {renderLockIcon('dont-pass')}
          </div>
        </div>

        <div className="side-bets-section">
          <div className="side-bets-header">
            <button 
              className={`section-title-button ${activeSection === 'hardways' ? 'active' : ''}`}
              onClick={() => toggleSection('hardways')}
            >
              HARDWAYS
            </button>
            <button 
              className={`section-title-button ${activeSection === 'props' ? 'active' : ''}`}
              onClick={() => toggleSection('props')}
            >
              SINGLE ROLL
            </button>
          </div>
          <div className="side-bets-grid">
            <div className={`hardways-section ${activeSection === 'hardways' ? 'expanded' : ''}`}>
              <div className="hardways-grid">
                <div className={`hardway-box ${isLocked('hard-4') ? 'locked' : ''}`} onClick={() => onBet('hard-4')}>
                  <div className="hardway-title">HARD 4</div>
                  <div className="dice-combination">{DICE_FACES[2]}{DICE_FACES[2]}</div>
                  <div className="payout">7:1</div>
                  <div className="bet-amount">{formatNumber(getBetAmount('hard-4'), false)}</div>
                  {renderLockIcon('hard-4')}
                </div>
                <div className={`hardway-box ${isLocked('hard-6') ? 'locked' : ''}`} onClick={() => onBet('hard-6')}>
                  <div className="hardway-title">HARD 6</div>
                  <div className="dice-combination">{DICE_FACES[3]}{DICE_FACES[3]}</div>
                  <div className="payout">9:1</div>
                  <div className="bet-amount">{formatNumber(getBetAmount('hard-6'), false)}</div>
                  {renderLockIcon('hard-6')}
                </div>
                <div className={`hardway-box ${isLocked('hard-8') ? 'locked' : ''}`} onClick={() => onBet('hard-8')}>
                  <div className="hardway-title">HARD 8</div>
                  <div className="dice-combination">{DICE_FACES[4]}{DICE_FACES[4]}</div>
                  <div className="payout">9:1</div>
                  <div className="bet-amount">{formatNumber(getBetAmount('hard-8'), false)}</div>
                  {renderLockIcon('hard-8')}
                </div>
                <div className={`hardway-box ${isLocked('hard-10') ? 'locked' : ''}`} onClick={() => onBet('hard-10')}>
                  <div className="hardway-title">HARD 10</div>
                  <div className="dice-combination">{DICE_FACES[5]}{DICE_FACES[5]}</div>
                  <div className="payout">7:1</div>
                  <div className="bet-amount">{formatNumber(getBetAmount('hard-10'), false)}</div>
                  {renderLockIcon('hard-10')}
                </div>
              </div>
            </div>

            <div className={`prop-section ${activeSection === 'props' ? 'expanded' : ''}`}>
              <div className="prop-grid">
                <div className={`prop-box any-seven ${isLocked('any-7') ? 'locked' : ''}`} onClick={() => onBet('any-7')}>
                  <div className="prop-title">ANY 7</div>
                  <div className="payout">4:1</div>
                  <div className="bet-amount">{formatNumber(getBetAmount('any-7'), false)}</div>
                  {renderLockIcon('any-7')}
                </div>
                <div className={`prop-box ${isLocked('any-craps') ? 'locked' : ''}`} onClick={() => onBet('any-craps')}>
                  <div className="prop-title">ANY CRAPS</div>
                  <div className="payout">8:1</div>
                  <div className="bet-amount">{formatNumber(getBetAmount('any-craps'), false)}</div>
                  {renderLockIcon('any-craps')}
                </div>
                <div className={`prop-box ${isLocked('eleven') ? 'locked' : ''}`} onClick={() => onBet('eleven')}>
                  <div className="prop-title">ELEVEN</div>
                  <div className="payout">16:1</div>
                  <div className="bet-amount">{formatNumber(getBetAmount('eleven'), false)}</div>
                  {renderLockIcon('eleven')}
                </div>
                <div className={`prop-box ${isLocked('ace-deuce') ? 'locked' : ''}`} onClick={() => onBet('ace-deuce')}>
                  <div className="prop-title">ACE-DEUCE</div>
                  <div className="payout">16:1</div>
                  <div className="bet-amount">{formatNumber(getBetAmount('ace-deuce'), false)}</div>
                  {renderLockIcon('ace-deuce')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrapsTable; 