import React, { useState, useEffect } from 'react';

// Array of craps tips
const CRAPS_TIPS = [
  "Always handle your chips and dice with one hand only. Two hands on the table could be seen as cheating!",
  "Never say the word 'seven' at the craps table - it's considered bad luck!",
  "The Pass Line bet has one of the lowest house edges in the casino at 1.41%.",
  "Place bets on 6 and 8 have a better payout ratio than other place bets.",
  "Field bets are resolved after just one roll, making them perfect for quick action.",
  "Don't touch your Pass Line bet once the point is established.",
  "Because the Don't Pass and Don't Come bets are against the roller, they are sometimes considered dick moves.",
  "The 'Don't Pass' bet has a slightly better house edge than the Pass Line.",
  "Hardway bets stay active until they win, lose, or you remove them.",
  "Tip the dealers occasionally - they'll appreciate it and might give you better service. Unless the bastards lost you a bunch of money.",
  "Place bets can be removed or reduced at any time between rolls.",
  "Come bets work just like Pass Line bets, but can be made after a point is established. Think of them as playing your own personal game of Craps!",
  "Taking odds on your Pass Line bet after a point is established has zero house edge.",
  "The 'Any Seven' bet has one of the highest house edges in craps. Not a great bet.",
  "Craps etiquette: don't throw the dice too hard - keep them on the table.",
  "When throwing the dice, aim for the back wall of the table.",
  "Beginners should stick to Pass Line and Place bets until they understand the game better.",
  "In a casino, always wait for the dealer to push your winnings to you - never grab them.",
  "The 'Iron Cross' strategy involves betting the Field and Place bets on 5, 6, and 8.",
  "Craps tables can be loud and exciting - it's part of the experience!",
  "If you're up to roll, you need to make either a Pass or Don't Pass line bet to participate.",
];

interface CrapsTipsProps {
  className?: string;
}

const CrapsTips: React.FC<CrapsTipsProps> = ({ className = '' }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    // Rotate tips every 10 seconds
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % CRAPS_TIPS.length);
    }, 10000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`craps-tips ${className}`}>
      <div className="tip-content">
        <span className="tip-prefix">💡 Tip: </span>
        {CRAPS_TIPS[currentTipIndex]}
      </div>
    </div>
  );
};

export default CrapsTips;