import React, { useState, useEffect } from 'react';
import '../Tutorial.css';
import { FaArrowRight, FaTimes } from 'react-icons/fa';

interface QuestTutorialProps {
  onComplete: () => void;
  questId: string;
  isVisible: boolean;
}

interface TutorialContent {
  title: string;
  content: JSX.Element;
}

// Define all quest tutorials content
const questTutorials: Record<string, TutorialContent> = {
  /* 'first-point' tutorial removed to avoid redundancy with First Win tutorial
  'first-point': {
    title: "First Quest Unlocked!",
    content: (
      <>
        <p>Congratulations on hitting your first point!</p>
        <p>Your new quest is to win 3 bets total.</p>
        <p>Complete this quest to unlock the 6 and 8 Place bets!</p>
        <p>Place bets are great for building your bankroll with a low house edge.</p>
        <p>Check the <strong>Quests</strong> tab to see your current progress.</p>
        <p><em>Good luck and may the dice be ever in your favor!</em></p>
      </>
    )
  },
  */
  'first-win': {
    title: 'First Win!',
    content: (
      <>
        <p><strong>Congratulations on your first win!</strong></p>
        <p>You've unlocked the <strong>Pass Line Master</strong> quest.</p>
        <p>Complete this quest by winning 3 Pass Line bets to unlock Place bets.</p>
        <p>Pass Line is the fundamental bet in craps and offers one of the best odds in the game.</p>
      </>
    )
  },
  'place-bets-unlocked': {
    title: "Place Bets Unlocked!",
    content: (
      <>
        <p>Congratulations on completing the Pass Line Master quest!</p>
        <p>You've unlocked the 6 and 8 Place bets.</p>
        <p>Your new quest is to win 3 Place bets to unlock the Field bet.</p>
        <p>This quest is now active - check your Quests tab to track your progress!</p>
        
        <h3>About Place Bets:</h3>
        <ul>
          <li><strong>When to make them:</strong> Place bets can be made at any time, but are most effective after a point is established</li>
          <li><strong>How they work:</strong> You're betting that a specific number (6 or 8) will be rolled before a 7</li>
          <li><strong>When they're active:</strong> Place bets stay active until a 7 is rolled or you remove them, giving you multiple chances to win</li>
          <li><strong>Multiple bets:</strong> You can (and should!) place multiple Place bets at the same time to cover different numbers</li>
        </ul>
        
        <p>The 6 and 8 are the most commonly rolled numbers (after 7), making them a smart choice for building your bankroll.</p>
        <p>Remember: You can place multiple Place bets at once to increase your chances of winning on each roll!</p>
      </>
    )
  },
  'field-bets-unlocked': {
    title: "Field Bet Unlocked!",
    content: (
      <>
        <p>Congratulations on completing the Place Bet Master quest!</p>
        <p>You've unlocked the <strong>Field bet</strong>!</p>
        
        <h3>About Field Bets:</h3>
        <ul>
          <li><strong>Single-roll bet:</strong> Field bets are decided on the very next roll only</li>
          <li><strong>Winning numbers:</strong> You win if ANY of these numbers are rolled: 2, 3, 4, 9, 10, 11, or 12</li>
          <li><strong>Payouts:</strong> Most numbers pay even money (1:1), but 2 and 12 pay double (2:1)!</li>
          <li><strong>After each roll:</strong> Field bets are removed after each roll (win or lose), so you need to place them again for the next roll</li>
          <li><strong>Removing bets:</strong> You can remove Field bets at any time by right-clicking them</li>
        </ul>
        
        <p>Your new quest is to win 3 Field bets to unlock access to all Place bets in the Upgrade Menu.</p>
        <p>Field bets are exciting because they cover many numbers and give you a chance to win on a single roll!</p>
      </>
    )
  },
  'field-bet-master-completed': {
    title: "Field Bet Master Completed!",
    content: (
      <>
        <p>Congratulations on winning 3 Field bets!</p>
        <p>You've proven your skill with Field bets.</p>
        <p>Your next quest is to unlock all Place Bets in the <strong>Upgrade Menu</strong>.</p>
        <p>The Upgrade Menu allows you to purchase new bet types with your bankroll.</p>
        <p>Place bets on 4, 5, 9, and 10 provide excellent long-term value for your bankroll.</p>
      </>
    )
  },
  'upgrade-menu-unlocked': {
    title: "Place Bet Collector Completed!",
    content: (
      <>
        <p>Congratulations on unlocking all Place bets!</p>
        <p>You now have access to the full range of Place betting options.</p>
        <p>Your next quest is to win a Place bet on each number (4, 5, 6, 8, 9, and 10).</p>
        <p>This will help you master each bet and understand the different payouts and odds.</p>
        
        <div className="place-bet-payouts">
          <h3>Place Bet Payouts Reference:</h3>
          <ul>
            <li><strong>Place 4 or 10:</strong> Pays 9:5 (1.8:1)</li>
            <li><strong>Place 5 or 9:</strong> Pays 7:5 (1.4:1)</li>
            <li><strong>Place 6 or 8:</strong> Pays 7:6 (1.17:1)</li>
          </ul>
        </div>
        
        <p>Place bets on 4, 5, 6, 8, 9, and 10 give you multiple ways to win on each roll.</p>
        <p>These bets offer some of the best odds in craps and can help you build your bankroll steadily.</p>
        <p>Remember that Place bets win when their number is rolled and lose when a 7 is rolled.</p>
      </>
    )
  },
  'place-bet-statistics': {
    title: "Place Bet Expert Achieved!",
    content: (
      <>
        <p>Congratulations! You've successfully won a Place bet on every number!</p>
        <p>You've mastered one of the most important aspects of craps strategy.</p>
        <p>As a reward, you've unlocked the Come bet - a versatile bet that works like a Pass Line bet but can be placed at any time.</p>
        <p>Your next quest will be to win 3 Come bets to continue your craps journey.</p>
        <p>Keep exploring different betting strategies to maximize your bankroll!</p>
      </>
    )
  },
  'come-bets': {
    title: "Come Bet Master!",
    content: (
      <>
        <p>Congratulations on winning 3 Come bets!</p>
        <p>You've proven your skill with one of the best bets in craps.</p>
        <p>As a reward, you've unlocked the Don't Come bet - the opposite of the Come bet with nearly the same excellent odds.</p>
        <p>The Don't Come bet wins when 7 is rolled before your point, and loses when your point is rolled.</p>
        <p>Like the Pass and Don't Pass combination, experienced players sometimes use Come and Don't Come bets together as part of hedging strategies.</p>
      </>
    )
  },
  'dont-come-bets': {
    title: "Don't Come Bet Unlocked!",
    content: (
      <>
        <p>Congratulations! You've mastered the Come bet and unlocked the <strong>Don't Come</strong> bet.</p>
        <p>The Don't Come bet is the opposite of the Come bet - you're betting against the shooter.</p>
        <p>Don't Come bets win when a 7 rolls before the point number after the Come point is established.</p>
        <p>This bet offers one of the lowest house edges in craps, similar to the Don't Pass.</p>
        <p>Your next quest is to win 3 Don't Come bets to unlock the Don't Pass bet.</p>
      </>
    )
  },
  'dont-come-bet-master': {
    title: "Don't Come Bet Master!",
    content: (
      <>
        <p>Congratulations on winning 3 Don't Come bets!</p>
        <p>You've proven your skill with one of the most strategic bets in craps.</p>
        <p>As a reward, you've unlocked the Don't Pass bet - the opposite of the Pass Line bet with excellent odds.</p>
        <p>The Don't Pass bet wins when 7 is rolled before the point, and loses when the point is rolled.</p>
        <p>This bet offers one of the lowest house edges in the game, making it a favorite among experienced players.</p>
      </>
    )
  },
  'dont-pass-bet-master': {
    title: "Don't Pass Bet Master!",
    content: (
      <>
        <p>Congratulations on winning 3 Don't Pass bets!</p>
        <p>You've mastered all the fundamental betting strategies in craps!</p>
        <p>You now have a complete understanding of both "right way" and "wrong way" betting.</p>
        <p>This knowledge allows you to adapt your strategy based on table conditions and your personal preferences.</p>
        <p>Continue building your bankroll and exploring different betting combinations!</p>
      </>
    )
  }
};

const QuestTutorial: React.FC<QuestTutorialProps> = ({ 
  onComplete, 
  questId,
  isVisible 
}) => {
  const [isFading, setIsFading] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      setIsFading(false);
    }
  }, [isVisible, questId]);
  
  const handleComplete = () => {
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 300); // Match the CSS transition time
  };

  // Get current tutorial content
  const currentTutorial = questTutorials[questId] || {
    title: "New Quest Unlocked!",
    content: <p>You've unlocked a new quest. Check the Quests tab to see your new goal!</p>
  };

  if (!isVisible) return null;

  return (
    <div className={`tutorial-overlay ${isFading ? 'fade-out' : 'fade-in'}`}>
      <div className="tutorial-container quest-tutorial">
        <div className="tutorial-header">
          <h2>{currentTutorial.title}</h2>
          <button className="close-button" onClick={handleComplete}>
            <FaTimes />
          </button>
        </div>
        
        <div className="tutorial-content">
          {currentTutorial.content}
        </div>
        
        <div className="tutorial-navigation">
          <button className="tutorial-next-button" onClick={handleComplete}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestTutorial; 