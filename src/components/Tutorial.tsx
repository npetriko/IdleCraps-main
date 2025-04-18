import React, { useState, useEffect } from 'react';
import '../Tutorial.css';
import { FaArrowRight, FaForward, FaTimes } from 'react-icons/fa';

interface TutorialProps {
  onComplete: () => void;
  currentStep?: number;
  isVisible: boolean;
}

interface TutorialStep {
  title: string;
  content: JSX.Element;
  highlight?: string;
}

const Tutorial: React.FC<TutorialProps> = ({ 
  onComplete, 
  currentStep = 0,
  isVisible 
}) => {
  const [step, setStep] = useState(currentStep);
  const [fadeClass, setFadeClass] = useState('');
  
  // Reset step when tutorial becomes visible again
  useEffect(() => {
    if (isVisible) {
      setStep(currentStep);
      setFadeClass('fade-in');
    }
  }, [isVisible, currentStep]);
  
  // Define all tutorial steps content
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to Idle Craps!",
      content: (
        <>
          <p>Craps is one of the most exciting casino games, known for its community atmosphere and potential for big wins.</p>
          <p>It's both a <strong>fun group event</strong> at the casino and one of the <strong>smartest ways to bet your money</strong> since it offers some of the best odds for players.</p>
          <p>This tutorial will teach you the basics of playing Craps and guide you through the game interface.</p>
          <p><em>Later, more tutorials will be unlocked as you progress in the game. They'll explain more advanced bets as well as some 'casino etiquette' tips.</em></p>
        </>
      )
    },
    {
      title: "Your Bankroll",
      content: (
        <>
          <p>Your <strong>bankroll</strong> is the total amount of money you have available to play with.</p>
          <p>In Idle Craps, your bankroll increases when you win bets and through passive income.</p>
          <p>Watch your bankroll grow as you make smart bets and upgrade your income!</p>
        </>
      ),
      highlight: "bankroll-section"
    },
    {
      title: "Passive Income",
      content: (
        <>
          <p><strong>Passive income</strong> is money you earn automatically over time - even when you're not actively playing!</p>
          <p>Every few seconds, you'll receive a payment based on your current passive income rate.</p>
          <p>Your passive income is based off of your total winnings - win more, earn more!</p>
          <p><em>Obviously, there is no passive income in a real casino! This feature is intended to provide a safe landing for when you fall and lose - which will happen a lot!</em></p>
          <p>Don't worry about losing your bankroll - that's what passive income is for! Feel free to be riskier with your bets and have fun experimenting with different strategies.</p>
          <p>If your bankroll gets too low, it may be time to take a break and let your passive income do its thing for a bit.</p>
          </>
      ),
      highlight: "passive-income-section"
    },
    {
      title: "Chip Selection",
      content: (
        <>
          <p>The <strong>chip selector</strong> determines how much money you bet per click on the betting areas.</p>
          <p>Select a chip value before placing your bet on the table. Each time you click a betting area, you'll place a bet equal to the selected chip value.</p>
          <p>Start with smaller bets as you learn, then increase as you become more comfortable with the game.</p>
          <p>You'll unlock higher value chips as you progress in the game.</p>
          <p><em>Higher chip values exist in this game primarily to help prevent carpal tunnel syndrome!</em></p>
        </>
      ),
      highlight: "chip-selector"
    },
    {
      title: "Dice and Roll Button",
      content: (
        <>
          <p>The <strong>dice</strong> show the result of your last roll.</p>
          <p>Click the <strong>Roll Dice</strong> button or press <strong>Space Bar</strong> to roll the dice and determine the outcome of your bets.</p>
          <p>In Craps, different number combinations have different meanings depending on when they're rolled.</p>
          <p>The excitement of Craps comes from watching those dice tumble!</p>
          <p><em>Still working on the dice animation, it'll be cooler soon I promise!</em></p>
        </>
      ),
      highlight: "dice-container"
    },
    {
      title: "Achievements",
      content: (
        <>
          <p><strong>Achievements</strong> are special rewards you earn for reaching milestones in the game.</p>
          <p>Each achievement you unlock can provide bonuses to your gameplay.</p>
          <p>Try to unlock all achievements to maximize your gaming experience!</p>
          <p>Some achievements are straightforward, while others may require specific strategies.</p>
          <p><em>Can you unlock all 20 hidden achievements? Hint: there aren't actually 20 of them!</em></p>
        </>
      ),
      highlight: "achievements-button"
    },
    /* Upgrade Menu tutorial - commented out for initial tutorial but kept for later use
    {
      title: "Upgrade Menu",
      content: (
        <>
          <p>The <strong>Upgrade Menu</strong> is where you can spend your bankroll to improve your game.</p>
          <p>Upgrades can increase your passive income, unlock new bet types, and provide other benefits.</p>
          <p>Strategically choosing upgrades is key to maximizing your long-term earnings.</p>
          <p>Check the menu regularly to see what new improvements you can afford!</p>
          <p><em>These upgrades will mainly unlock new betting types - make sure you understand the base gameplay first!</em></p>
        </>
      ),
      highlight: "upgrades-button"
    },
    */
    {
      title: "Recent Results",
      content: (
        <>
          <p>The <strong>Recent Results</strong> section shows your most recent game events.</p>
          <p>This includes dice rolls, wins, losses, special events, your win streak,and achievements you unlock.</p>
          <p>Keep an eye on this section to track your performance and any patterns that might emerge.</p>
        </>
      ),
      highlight: "results-section"
    },
    {
      title: "Pass Line Bet and How to Get Started",
      content: (
        <>
          <p>The <strong>Pass Line</strong> is the most fundamental bet in Craps. It is also the only bet you have unlocked in the beginning!</p>
          <p><strong>How to bet:</strong> Click on the Pass Line area to place a bet. The amount you bet is determined by your selected chip value.</p>
          <p><strong>How to remove a bet:</strong> Right-click on any bet to remove it. Note that Pass Line bets can only be removed when the point is OFF (before a point is established).</p>
          <p>When you place a Pass Line bet:</p>
          <ul>
            <li>You win immediately if the first roll (come-out roll) is 7 or 11</li>
            <li>You lose immediately if the first roll is 2, 3, or 12</li>
            <li>Any other number (4, 5, 6, 8, 9, 10) becomes the "point"</li>
            <li>If a point is established, you win if that point number is rolled again before a 7</li>
            <li>Once a point is established, your Pass Line bet cannot be removed until the bet is resolved</li>
          </ul>
          <p>Since your only bet is the Pass Line at the beginning, it's normal for many rolls to be irrelevant to your bet. This happens when a point is established and the dice show numbers other than your point or 7.</p>
          <p>The Pass Line is a great bet for beginners with a low house edge of only 1.41%!</p>
          <p><em>Think of the Pass Line bet as your 'core' bet - you're betting on whether or not the roller will hit their point. More on this later!</em></p>
        </>
      ),
      highlight: "pass-line"
    },
    {
      title: "Ready to Play!",
      content: (
        <>
          <p>Congratulations! You now know the basics of Idle Craps.</p>
          <p>Remember these key tips:</p>
          <ul>
            <li>Start with Pass Line bets - they're simple and offer good odds</li>
            <li>Upgrade your passive income regularly to establish a safety net when you lose</li>
            <li>Don't spend it all in one place - save some for upgrades, or for bets</li>
            <li>Have fun and don't be afraid to take risks!</li>
          </ul>
          <p>Click "Start Playing" to begin your Craps adventure!</p>
        </>
      )
    }
  ];

  // Handle step transitions with fade effect
  const nextStep = () => {
    if (step < tutorialSteps.length - 1) {
      setFadeClass('fade-out');
      setTimeout(() => {
        setStep(step + 1);
        setFadeClass('fade-in');
      }, 300);
    } else {
      completeHandler();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setFadeClass('fade-out');
      setTimeout(() => {
        setStep(step - 1);
        setFadeClass('fade-in');
      }, 300);
    }
  };

  const completeHandler = () => {
    setFadeClass('fade-out');
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  // Handle highlighting of UI elements
  useEffect(() => {
    // Remove any existing highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });

    // Add highlight to the current step's target element if specified
    const currentStepData = tutorialSteps[step];
    if (currentStepData.highlight) {
      const elementToHighlight = document.querySelector(`.${currentStepData.highlight}`);
      if (elementToHighlight) {
        elementToHighlight.classList.add('tutorial-highlight');
      }
    }

    // Reset fade class after component mounts
    setFadeClass('fade-in');
  }, [step]);

  if (!isVisible) return null;

  const currentStepData = tutorialSteps[step];
  const isLastStep = step === tutorialSteps.length - 1;

  return (
    <div className="tutorial-overlay">
      <div className={`tutorial-container ${fadeClass}`}>
        <div className="tutorial-header">
          <h2>{currentStepData.title}</h2>
          <div className="tutorial-step-counter">
            Step {step + 1} of {tutorialSteps.length}
          </div>
        </div>
        
        <div className="tutorial-content">
          {currentStepData.content}
        </div>
        
        <div className="tutorial-navigation">
          {step > 0 && (
            <button className="tutorial-prev-button" onClick={prevStep}>
              Back
            </button>
          )}
          <button className="tutorial-next-button" onClick={nextStep}>
            {isLastStep ? 'Start Playing!' : 'Continue'} <FaArrowRight />
          </button>
          {!isLastStep && (
            <button className="tutorial-skip-button" onClick={completeHandler}>
              Skip Tutorial <FaForward />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tutorial; 