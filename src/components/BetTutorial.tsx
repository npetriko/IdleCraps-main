import React, { useState, useEffect } from 'react';
import '../Tutorial.css';
import { FaArrowRight } from 'react-icons/fa';

interface BetTutorialProps {
  onComplete: () => void;
  betType: string;
  isVisible: boolean;
}

interface TutorialContent {
  title: string;
  content: JSX.Element;
}

// Define all bet type tutorials content
const betTutorials: Record<string, TutorialContent> = {
  'place-bet': {
    title: "Place Bets",
    content: (
      <>
        <p>Congratulations on unlocking <strong>Place Bets</strong>!</p>
        <p>Place bets are direct wagers on a specific number being rolled before a 7 comes up.</p>
        <p>In a casino, Place bets are some of the most popular bets because they're simple to understand, have decent odds, and allow players to pick specific numbers they feel are "hot".</p>
        <p>Place bets pay different odds depending on the number:</p>
        <ul>
          <li>Place 6 or 8: pays 7:6 (best odds)</li>
          <li>Place 5 or 9: pays 7:5</li>
          <li>Place 4 or 10: pays 9:5</li>
        </ul>
        <p>Unlike Pass Line bets, you can make Place bets at any time, and you can remove them whenever you want before a decision is reached.</p>
      </>
    )
  },
  'dont-pass': {
    title: "Don't Pass Bets",
    content: (
      <>
        <p>Congratulations on unlocking <strong>Don't Pass Bets</strong>!</p>
        <p>Don't Pass is essentially the opposite of the Pass Line bet. It's sometimes called "betting against the shooter" or "dark side" betting.</p>
        <p>When you place a Don't Pass bet:</p>
        <ul>
          <li>You win if the first roll is 2 or 3</li>
          <li>You push (tie) if the first roll is 12</li>
          <li>You lose if the first roll is 7 or 11</li>
          <li>Any other number (4, 5, 6, 8, 9, 10) becomes the "point"</li>
          <li>If a point is established, you win if a 7 is rolled before that point number</li>
        </ul>
        <p>Don't Pass bets have a very low house edge of only 1.36%!</p>
        <p><em>Warning: In a real casino, other players can be very superstitious and might frown upon this bet, as you're essentially betting against them. But it's a good thing you're playing offline and can do whatever you want with no accountability!</em></p>
      </>
    )
  },
  'come-bet': {
    title: "Come Bets",
    content: (
      <>
        <p>Congratulations on unlocking <strong>Come Bets</strong>!</p>
        <p>The Come bet is essentially a Pass Line bet that you can make after a point has been established.</p>
        <p>Here's how it works:</p>
        <ul>
          <li>You can only place a Come bet after a point is established</li>
          <li>The next roll acts as a special "come-out roll" just for this bet</li>
          <li>You win if that roll is 7 or 11</li>
          <li>You lose if that roll is 2, 3, or 12</li>
          <li>Any other number becomes your "Come point"</li>
          <li>Your bet moves to that number, and you win if it's rolled before a 7</li>
        </ul>
        <p>Come bets are perfect for players who arrived at the table after a point was established and want to get action similar to a Pass Line bet. They have the same low house edge of 1.41%.</p>
      </>
    )
  },
  'dont-come': {
    title: "Don't Come Bet",
    content: (
      <>
        <p>Congratulations on unlocking the <strong>Don't Come Bet</strong>!</p>
        <p>The Don't Come bet is the opposite of the Come bet - it's essentially a Don't Pass bet that you can make at any time.</p>
        <p>Here's how Don't Come bets work:</p>
        <ul>
          <li>When you place a Don't Come bet, the next roll becomes your personal "come-out roll"</li>
          <li>If that roll is 7 or 11, you lose immediately</li>
          <li>If it's 2 or 3, you win immediately</li>
          <li>If it's 12, it's usually a push (tie)</li>
          <li>If any other number is rolled (4, 5, 6, 8, 9, 10), that becomes your "Don't Come point"</li>
          <li>Your Don't Come bet moves to that number's box on the table</li>
          <li>You win if a 7 is rolled before your Don't Come point</li>
        </ul>
        <p>The Don't Come bet has one of the lowest house edges in the casino at just 1.36%, making it an excellent choice for smart players!</p>
      </>
    )
  },
  'field-bet': {
    title: "Field Bets",
    content: (
      <>
        <p>Congratulations on unlocking <strong>Field Bets</strong>!</p>
        <p>The Field bet is one of the most popular bets in craps because it's easy to understand and gives instant results. It's a one-roll bet that wins if the dice total 2, 3, 4, 9, 10, 11, or 12.</p>
        <p>Your next quest is to win 3 Field bets to unlock additional betting options!</p>
        <p>In traditional casino craps, Field bets have special payouts:</p>
        <ul>
          <li>Numbers 3, 4, 9, 10, or 11: pays 1:1 (even money)</li>
          <li>Number 2: pays 2:1 (double your bet)</li>
          <li>Number 12: pays 2:1 (double your bet)</li>
        </ul>
        <p>Some casinos offer enhanced Field bets where 2 or 12 might pay 3:1 instead of 2:1.</p>
        <p>Field bets lose if a 5, 6, 7, or 8 is rolled. These are the most common dice combinations (20 of 36 possible rolls), which is why the Field bet has a house edge of around 5.5%.</p>
        <p>Strategy tip: Since Field bets are one-roll wagers, they're perfect for quick action. Place your bet by clicking on the Field area, and it will be paid or collected after the next roll.</p>
      </>
    )
  },
  'hardway-bet': {
    title: "Hardway Bets",
    content: (
      <>
        <p>Congratulations on unlocking <strong>Hardway Bets</strong>!</p>
        <p>Hardway bets are wagers that a specific "hard" total will be rolled before either a 7 or the "easy" version of that total.</p>
        <p>A "hard" roll means both dice show the same number (doubles):</p>
        <ul>
          <li>Hard 4: betting that 2+2 will be rolled before any 7 or "easy 4" (3+1)</li>
          <li>Hard 6: betting that 3+3 will be rolled before any 7 or "easy 6" (5+1, 4+2)</li>
          <li>Hard 8: betting that 4+4 will be rolled before any 7 or "easy 8" (6+2, 5+3)</li>
          <li>Hard 10: betting that 5+5 will be rolled before any 7 or "easy 10" (6+4)</li>
        </ul>
        <p>These are known as "dealer's bets" because dealers often encourage them to increase tips, despite their high house edge (9-11%).</p>
        <p>Hardway bets pay higher odds but are more difficult to win - they're a favorite among risk-takers and thrill-seekers!</p>
      </>
    )
  },
  'any-seven': {
    title: "Any Seven Bet",
    content: (
      <>
        <p>Congratulations on unlocking the <strong>Any Seven Bet</strong>!</p>
        <p>The Any Seven bet (sometimes called "Big Red") is a one-roll bet that wins if the next roll is a 7, regardless of how it's made (6+1, 5+2, 4+3).</p>
        <p>Since 7 is the most common number that can be rolled with two dice, this might seem like a good bet, but the payout doesn't match the true odds:</p>
        <ul>
          <li>True odds: 5:1 (6 ways to roll 7 out of 36 possible combinations)</li>
          <li>Actual payout: 4:1 (meaning a $5 bet would win $20)</li>
        </ul>
        <p>This creates a hefty house edge of 16.7%, making it one of the worst bets on the table - but many players still love it for the quick action and potential big payouts on small bets.</p>
      </>
    )
  },
  'any-craps': {
    title: "Any Craps Bet",
    content: (
      <>
        <p>Congratulations on unlocking the <strong>Any Craps Bet</strong>!</p>
        <p>The Any Craps bet wins if the next roll is 2, 3, or 12 - collectively known as "craps" rolls. These are the same numbers that make you lose on a Pass Line come-out roll.</p>
        <p>This is a one-roll bet that pays 7:1, meaning a $5 bet would win $35 plus your original $5 back.</p>
        <p>While the payout seems attractive, the house edge is relatively high at 11.1%. There are only 4 ways to roll craps numbers out of 36 possible dice combinations, but the true odds would be 8:1.</p>
        <p>This bet is popular with players looking for a big payout on a small wager, even though the odds aren't in their favor.</p>
      </>
    )
  },
  'eleven': {
    title: "Yo/Eleven Bet",
    content: (
      <>
        <p>Congratulations on unlocking the <strong>Yo/Eleven Bet</strong>!</p>
        <p>The Yo or Eleven bet is a single-roll proposition bet that wins only if the next roll is exactly 11 (5+6).</p>
        <p>In a casino, this bet is often called "Yo Eleven" or just "Yo" to avoid confusion with "seven" in a noisy environment.</p> 
        <p>It pays 15:1 (though the true odds are 17:1), giving the house a significant edge of 11.1%.</p>
        <p>There are only 2 ways to roll an 11 (5+6 and 6+5) out of 36 possible dice combinations, making this a fairly difficult bet to win.</p>
        <p>Despite the poor odds, it remains popular because of the high payout potential - a $5 bet would win $75!</p>
      </>
    )
  },
  'ace-deuce': {
    title: "Ace-Deuce Bet",
    content: (
      <>
        <p>Congratulations on unlocking the <strong>Ace-Deuce Bet</strong>!</p>
        <p>The Ace-Deuce bet is a single-roll proposition bet that wins only if the next roll is exactly 3 (2+1).</p>
        <p>"Ace" refers to the 1 on the die, while "deuce" refers to the 2, hence "ace-deuce" means a roll of 1+2.</p>
        <p>This bet pays 15:1 (though the true odds are 17:1), giving the house an edge of 11.1%.</p>
        <p>There are only 2 ways to roll a 3 (1+2 and 2+1) out of 36 possible dice combinations.</p>
        <p>Like most proposition bets, the Ace-Deuce offers a high payout but has poor odds. It's best used sparingly for entertainment value rather than as a serious betting strategy.</p>
      </>
    )
  },
  'pass-line-odds': {
    title: "Pass Line Odds Bet",
    content: (
      <>
        <p>Congratulations on unlocking <strong>Pass Line Odds</strong>!</p>
        <p>The Pass Line Odds bet is one of the best bets in any casino game because it has <em>zero</em> house edge - it pays true odds!</p>
        <p>This special bet can only be made after placing a Pass Line bet and a point is established. It's an additional bet that "backs up" your original Pass Line bet.</p>
        <p>The payout depends on the point number:</p>
        <ul>
          <li>Points of 4 or 10 pay 2:1</li>
          <li>Points of 5 or 9 pay 3:2</li>
          <li>Points of 6 or 8 pay 6:5</li>
        </ul>
        <p>These odds exactly match the true probability of rolling the point before a 7, which means there's no built-in house advantage!</p>
        <p>This is why experienced craps players will always "take the odds" when it's available - it's the best bet in the house.</p>
      </>
    )
  },
  'dont-pass-odds': {
    title: "Don't Pass Odds Bet",
    content: (
      <>
        <p>Congratulations on unlocking <strong>Don't Pass Odds</strong>!</p>
        <p>Like Pass Line Odds, the Don't Pass Odds bet has <em>zero</em> house edge - it pays true odds!</p>
        <p>This special bet can only be made after placing a Don't Pass bet and a point is established. It's an additional bet that "backs up" your original Don't Pass bet.</p>
        <p>The payout depends on the point number:</p>
        <ul>
          <li>Points of 4 or 10 pay 1:2 (you risk more to win less)</li>
          <li>Points of 5 or 9 pay 2:3 (you risk more to win less)</li>
          <li>Points of 6 or 8 pay 5:6 (you risk more to win less)</li>
        </ul>
        <p>With Don't Pass Odds, you're betting that a 7 will appear before the point, so you have to risk more to win less (the opposite of Pass Line Odds).</p>
        <p>Despite the reversed odds, this is still one of the best bets in the casino with zero house edge!</p>
      </>
    )
  },
  'come-odds': {
    title: "Come Odds Bet",
    content: (
      <>
        <p>Congratulations on unlocking <strong>Come Odds</strong>!</p>
        <p>Come Odds work exactly like Pass Line Odds, but they apply to Come bets instead.</p>
        <p>After you place a Come bet and a Come point is established, you can place Come Odds behind your Come bet.</p>
        <p>Like all Odds bets, Come Odds have <em>zero</em> house edge - they pay true odds!</p>
        <p>The payout depends on the Come point number:</p>
        <ul>
          <li>Come points of 4 or 10 pay 2:1</li>
          <li>Come points of 5 or 9 pay 3:2</li>
          <li>Come points of 6 or 8 pay 6:5</li>
        </ul>
        <p>The advantage of Come Odds is that you can have multiple Come bets with Odds working at the same time, giving you several ways to win with the best odds in the casino!</p>
      </>
    )
  },
  'dont-come-odds': {
    title: "Don't Come Odds Bet",
    content: (
      <>
        <p>Congratulations on unlocking <strong>Don't Come Odds</strong>!</p>
        <p>Don't Come Odds work exactly like Don't Pass Odds, but they apply to Don't Come bets instead.</p>
        <p>After you place a Don't Come bet and a Don't Come point is established, you can place Don't Come Odds behind your Don't Come bet.</p>
        <p>Like all Odds bets, Don't Come Odds have <em>zero</em> house edge - they pay true odds!</p>
        <p>The payout depends on the Don't Come point number:</p>
        <ul>
          <li>Don't Come points of 4 or 10 pay 1:2 (you risk more to win less)</li>
          <li>Don't Come points of 5 or 9 pay 2:3 (you risk more to win less)</li>
          <li>Don't Come points of 6 or 8 pay 5:6 (you risk more to win less)</li>
        </ul>
        <p>With Don't Come Odds, you're betting that a 7 will appear before the Don't Come point, so you have to risk more to win less.</p>
        <p>The advantage is that you can have multiple Don't Come bets with Odds working at the same time, all with zero house edge!</p>
      </>
    )
  },
  'come': {
    title: "Come Bet",
    content: (
      <>
        <p>Congratulations on unlocking the <strong>Come Bet</strong>!</p>
        <p>The Come bet is essentially a Pass Line bet that you can make at any time, even after the point is established.</p>
        <p>Your next quest is to win 3 Come bets to continue your craps journey!</p>
        <p>Here's how Come bets work:</p>
        <ul>
          <li>When you place a Come bet, the next roll becomes your personal "come-out roll"</li>
          <li>If that roll is 7 or 11, you win immediately</li>
          <li>If it's 2, 3, or 12, you lose immediately</li>
          <li>If any other number is rolled (4, 5, 6, 8, 9, 10), that becomes your "Come point"</li>
          <li>Your Come bet moves to that number's box on the table</li>
          <li>You win if your Come point is rolled before a 7</li>
        </ul>
        <p>The beauty of Come bets is that you can have multiple Come bets working on different numbers at the same time, giving you several ways to win on each roll!</p>
      </>
    )
  }
};

const BetTutorial: React.FC<BetTutorialProps> = ({ 
  onComplete, 
  betType,
  isVisible 
}) => {
  const [fadeClass, setFadeClass] = useState('');
  
  // Handle fade effect
  useEffect(() => {
    if (isVisible) {
      setFadeClass('fade-in');
    }
  }, [isVisible]);

  // Get current tutorial content
  // For place bets, they all use the 'place-bet' generic tutorial
  const normalizedBetType = betType.startsWith('place-') ? 'place-bet' : betType;
  
  // Get tutorial content or use a fallback
  const currentTutorial = betTutorials[normalizedBetType] || {
    title: `${betType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Bet`,
    content: <p>You've unlocked the {betType.replace(/-/g, ' ')} bet. Look for it on the table and experiment with this new betting option!</p>
  };

  const completeHandler = () => {
    setFadeClass('fade-out');
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="tutorial-overlay">
      <div className={`tutorial-container ${fadeClass}`}>
        <div className="tutorial-header">
          <h2>{currentTutorial.title}</h2>
        </div>
        
        <div className="tutorial-content">
          {currentTutorial.content}
        </div>
        
        <div className="tutorial-navigation">
          <button className="tutorial-next-button" onClick={completeHandler}>
            Got it! <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetTutorial; 