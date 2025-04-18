import { useState } from 'react';
import './RealisticCrapsTable.css';
import { FaLock } from 'react-icons/fa';
import { formatNumber } from '../utils/formatNumber';

interface RealisticCrapsTableProps {
  point: number | null;
  lastRoll: [number, number];
  onBet: (betType: string) => void;
  onRemoveBet?: (betType: string) => void;
  activeBets: {
    [key: string]: number;
  };
  unlockedBets: {
    [key: string]: boolean;
  };
  comePoints?: {
    [key: string]: number;
  };
  dontComePoints?: {
    [key: string]: number;
  };
  selectedChip?: number;
}

const DICE_FACES = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅'
};

const RealisticCrapsTable = ({
  point,
  onBet,
  onRemoveBet,
  activeBets,
  unlockedBets,
  comePoints = {},
  dontComePoints = {},
  selectedChip
}: RealisticCrapsTableProps) => {

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

  // Check if a number has a come bet on it
  const hasComeBetOn = (num: number) => {
    return Object.keys(comePoints).some(key => {
      const pointNumber = parseInt(key.split('-')[2]);
      return pointNumber === num;
    });
  };

  // Get come bet amount for a specific number
  const getComeBetAmount = (num: number) => {
    const key = Object.keys(comePoints).find(key => {
      const pointNumber = parseInt(key.split('-')[2]);
      return pointNumber === num;
    });
    
    return key ? activeBets[key] : 0;
  };

  // Check if a number has a don't come bet on it
  const hasDontComeBetOn = (num: number) => {
    return Object.keys(dontComePoints).some(key => {
      const pointNumber = parseInt(key.split('-')[3]);
      return pointNumber === num;
    });
  };

  // Get don't come bet amount for a specific number
  const getDontComeBetAmount = (num: number) => {
    const key = Object.keys(dontComePoints).find(key => {
      const pointNumber = parseInt(key.split('-')[3]);
      return pointNumber === num;
    });
    
    return key ? activeBets[key] : 0;
  };

  const getNumberClass = (num: number) => {
    return `number-box number-${num} ${point === num ? 'active' : ''} ${isLocked(`place-${num}`) ? 'locked-bet' : ''} ${hasComeBetOn(num) ? 'has-come-bet' : ''} ${hasDontComeBetOn(num) ? 'has-dont-come-bet' : ''}`;
  };
  
  // Handle right-click on bet areas to remove bets
  const handleRightClick = (e: React.MouseEvent, betType: string) => {
    e.preventDefault(); // Prevent default context menu
    if (onRemoveBet && activeBets[betType]) {
      onRemoveBet(betType);
    }
  };

  // Show active chip value when hovering over betting areas
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  return (
    <div className="realistic-craps-table">
      {/* Point status indicator */}
      {point === null && (
        <div className="point-status">
          COME OUT ROLL
        </div>
      )}
      
      {/* OFF puck display when no point is established */}
      <div className={`puck-container ${point === null ? 'visible' : 'hidden'}`}>
        <div className="off-puck"></div>
      </div>
      
      {/* Show selected chip value when hovering */}
      {hoveredArea && selectedChip && (
        <div className="hover-chip-value">
          {formatNumber(selectedChip, false)}
        </div>
      )}
      
      <div className="table-layout">
        {/* Don't Come section */}
        <div 
          className={`section dont-come-section ${isLocked('dont-come') ? 'locked-bet' : ''}`}
          onClick={() => onBet('dont-come')}
          onContextMenu={(e) => handleRightClick(e, 'dont-come')}
          onMouseEnter={() => setHoveredArea('dont-come')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          <div className="dont-come-text">Don't Come Bar</div>
          <div className="dice-icon">{DICE_FACES[2]}{DICE_FACES[1]}</div>
          {getBetAmount('dont-come') > 0 && <div className="bet-amount">{formatNumber(getBetAmount('dont-come'), false)}</div>}
          {renderLockIcon('dont-come')}
        </div>
        
        {/* Numbers section */}
        <div className="numbers-section">
          {/* Number 4 box */}
          <div 
            className={getNumberClass(4)}
            onClick={() => onBet('place-4')}
            onContextMenu={(e) => handleRightClick(e, 'place-4')}
            onMouseEnter={() => setHoveredArea('place-4')}
            onMouseLeave={() => setHoveredArea(null)}
          >
            <span>4</span>
            {point === 4 && <div className="on-puck"></div>}
            {getBetAmount('place-4') > 0 && <div className="place-bet-amount">{formatNumber(getBetAmount('place-4'), false)}</div>}
            {hasComeBetOn(4) && <div className="come-bet-indicator">{formatNumber(getComeBetAmount(4), false)}</div>}
            {hasDontComeBetOn(4) && <div className="dont-come-bet-indicator">{formatNumber(getDontComeBetAmount(4), false)}</div>}
            {renderLockIcon('place-4')}
          </div>
          
          {/* Number 5 box */}
          <div 
            className={getNumberClass(5)}
            onClick={() => onBet('place-5')}
            onContextMenu={(e) => handleRightClick(e, 'place-5')}
            onMouseEnter={() => setHoveredArea('place-5')}
            onMouseLeave={() => setHoveredArea(null)}
          >
            <span>5</span>
            {point === 5 && <div className="on-puck"></div>}
            {getBetAmount('place-5') > 0 && <div className="place-bet-amount">{formatNumber(getBetAmount('place-5'), false)}</div>}
            {hasComeBetOn(5) && <div className="come-bet-indicator">{formatNumber(getComeBetAmount(5), false)}</div>}
            {hasDontComeBetOn(5) && <div className="dont-come-bet-indicator">{formatNumber(getDontComeBetAmount(5), false)}</div>}
            {renderLockIcon('place-5')}
          </div>
          
          {/* Number 6 box - displayed as "SIX" in the image */}
          <div 
            className={getNumberClass(6)}
            onClick={() => onBet('place-6')}
            onContextMenu={(e) => handleRightClick(e, 'place-6')}
            onMouseEnter={() => setHoveredArea('place-6')}
            onMouseLeave={() => setHoveredArea(null)}
          >
            <span style={{ transform: 'rotate(-20deg)' }}>SIX</span>
            {point === 6 && <div className="on-puck"></div>}
            {getBetAmount('place-6') > 0 && <div className="place-bet-amount">{formatNumber(getBetAmount('place-6'), false)}</div>}
            {hasComeBetOn(6) && <div className="come-bet-indicator">{formatNumber(getComeBetAmount(6), false)}</div>}
            {hasDontComeBetOn(6) && <div className="dont-come-bet-indicator">{formatNumber(getDontComeBetAmount(6), false)}</div>}
            {renderLockIcon('place-6')}
          </div>
          
          {/* Number 8 box */}
          <div 
            className={getNumberClass(8)}
            onClick={() => onBet('place-8')}
            onContextMenu={(e) => handleRightClick(e, 'place-8')}
            onMouseEnter={() => setHoveredArea('place-8')}
            onMouseLeave={() => setHoveredArea(null)}
          >
            <span>8</span>
            {point === 8 && <div className="on-puck"></div>}
            {getBetAmount('place-8') > 0 && <div className="place-bet-amount">{formatNumber(getBetAmount('place-8'), false)}</div>}
            {hasComeBetOn(8) && <div className="come-bet-indicator">{formatNumber(getComeBetAmount(8), false)}</div>}
            {hasDontComeBetOn(8) && <div className="dont-come-bet-indicator">{formatNumber(getDontComeBetAmount(8), false)}</div>}
            {renderLockIcon('place-8')}
          </div>
          
          {/* Number 9 box - displayed as "NINE" in the image */}
          <div 
            className={getNumberClass(9)}
            onClick={() => onBet('place-9')}
            onContextMenu={(e) => handleRightClick(e, 'place-9')}
            onMouseEnter={() => setHoveredArea('place-9')}
            onMouseLeave={() => setHoveredArea(null)}
          >
            <span style={{ transform: 'rotate(-20deg)' }}>NINE</span>
            {point === 9 && <div className="on-puck"></div>}
            {getBetAmount('place-9') > 0 && <div className="place-bet-amount">{formatNumber(getBetAmount('place-9'), false)}</div>}
            {hasComeBetOn(9) && <div className="come-bet-indicator">{formatNumber(getComeBetAmount(9), false)}</div>}
            {hasDontComeBetOn(9) && <div className="dont-come-bet-indicator">{formatNumber(getDontComeBetAmount(9), false)}</div>}
            {renderLockIcon('place-9')}
          </div>
          
          {/* Number 10 box */}
          <div 
            className={getNumberClass(10)}
            onClick={() => onBet('place-10')}
            onContextMenu={(e) => handleRightClick(e, 'place-10')}
            onMouseEnter={() => setHoveredArea('place-10')}
            onMouseLeave={() => setHoveredArea(null)}
          >
            <span>10</span>
            {point === 10 && <div className="on-puck"></div>}
            {getBetAmount('place-10') > 0 && <div className="place-bet-amount">{formatNumber(getBetAmount('place-10'), false)}</div>}
            {hasComeBetOn(10) && <div className="come-bet-indicator">{formatNumber(getComeBetAmount(10), false)}</div>}
            {hasDontComeBetOn(10) && <div className="dont-come-bet-indicator">{formatNumber(getDontComeBetAmount(10), false)}</div>}
            {renderLockIcon('place-10')}
          </div>
        </div>
        
        {/* COME section */}
        <div 
          className={`section come-section ${isLocked('come') ? 'locked-bet' : ''}`}
          onClick={() => onBet('come')}
          onContextMenu={(e) => handleRightClick(e, 'come')}
          onMouseEnter={() => setHoveredArea('come')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          <div className="come-text">COME</div>
          {getBetAmount('come') > 0 && <div className="bet-amount">{formatNumber(getBetAmount('come'), false)}</div>}
          {renderLockIcon('come')}
        </div>
        
        {/* Field section */}
        <div 
          className={`section field-section ${isLocked('field') ? 'locked-bet' : ''}`}
          onClick={() => onBet('field')}
          onContextMenu={(e) => handleRightClick(e, 'field')}
          onMouseEnter={() => setHoveredArea('field')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          <div className="field-text">FIELD</div>
          <div className="field-numbers">
            <div className="field-number circled-number">2</div>
            <div className="field-number">3</div>
            <div className="field-number">4</div>
            <div className="field-number">9</div>
            <div className="field-number">10</div>
            <div className="field-number">11</div>
            <div className="field-number circled-number">12</div>
          </div>
          {getBetAmount('field') > 0 && <div className="bet-amount">{formatNumber(getBetAmount('field'), false)}</div>}
          {renderLockIcon('field')}
        </div>
        
        {/* Don't Pass Bar section */}
        <div 
          className={`section dont-pass-section ${isLocked('dont-pass') ? 'locked-bet' : ''}`}
          onClick={() => onBet('dont-pass')}
          onContextMenu={(e) => handleRightClick(e, 'dont-pass')}
          onMouseEnter={() => setHoveredArea('dont-pass')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          <div className="dont-pass-text">Don't Pass Bar</div>
          <div className="dice-icon">{DICE_FACES[2]}{DICE_FACES[1]}</div>
          {getBetAmount('dont-pass') > 0 && <div className="bet-amount">{formatNumber(getBetAmount('dont-pass'), false)}</div>}
          {renderLockIcon('dont-pass')}
        </div>
        
        {/* Pass Line section */}
        <div 
          className={`section pass-line-section ${isLocked('pass-line') ? 'locked-bet' : ''}`}
          onClick={() => onBet('pass-line')}
          onContextMenu={(e) => handleRightClick(e, 'pass-line')}
          onMouseEnter={() => setHoveredArea('pass-line')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          <div className="pass-line-text">PASS LINE</div>
          {getBetAmount('pass-line') > 0 && <div className="bet-amount">{formatNumber(getBetAmount('pass-line'), false)}</div>}
          {renderLockIcon('pass-line')}
          
          {/* Only show Pass Line Odds bet option when there's a point, active pass line bet, and it's unlocked */}
          {point !== null && activeBets['pass-line'] && !isLocked('pass-line-odds') && (
            <div 
              className="pass-line-odds-container" 
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent pass-line bet
                onBet('pass-line-odds');
              }}
              onContextMenu={(e) => {
                e.stopPropagation(); // Prevent triggering the parent pass-line bet
                e.preventDefault(); // Prevent default context menu
                handleRightClick(e, 'pass-line-odds');
              }}
            >
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
    </div>
  );
};

export default RealisticCrapsTable; 