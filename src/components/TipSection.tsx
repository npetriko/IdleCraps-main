import React, { useState, useEffect, useMemo } from 'react';
import { FaLightbulb } from 'react-icons/fa';
import { CRAPS_TIPS } from '../data/crapsTips';
import './TipSection.css';

const TipSection: React.FC = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const currentTip = useMemo(() => CRAPS_TIPS[currentTipIndex], [currentTipIndex]);

  useEffect(() => {
    // Change the tip every 10 seconds
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % CRAPS_TIPS.length);
    }, 10000);

    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tip-section">
      <div className="tip-header">
        <FaLightbulb className="tip-icon" />
        <span className="tip-title">Casino Etiquette</span>
      </div>
      <div className="tip-content">
        {currentTip}
      </div>
    </div>
  );
};

export default TipSection; 