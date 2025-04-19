import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'
import RealisticCrapsTable from './components/RealisticCrapsTable'
import { FaQuestion, FaShareAlt, FaTrophy, FaTerminal, FaCoins, FaFire, FaLock, FaTimes, FaListOl } from 'react-icons/fa'
import AccountSystem from './components/AccountSystem'
import AdminPanel from './components/AdminPanel'
import CheatTerminal from './components/CheatTerminal'
import Tutorial from './components/Tutorial'
import TutorialSelector, { TutorialTopic } from './components/TutorialSelector'
import Quests, { Quest } from './components/Quests';
import QuestTutorial from './components/QuestTutorial';
import Upgrades, { BET_UNLOCK_COSTS, CHIP_UNLOCK_COSTS } from './components/Upgrades'; // Import Upgrades and costs
import ReactConfetti from 'react-confetti'; // Import confetti
import useWindowSize from 'react-use/lib/useWindowSize'; // Import hook for window size
import Leaderboard, { LeaderboardRef } from './components/Leaderboard'; // Import Leaderboard component and its ref type
import { formatNumber } from './utils/formatNumber'; // Import number formatting utility

// Dice face characters
const DICE_FACES: { [key: number]: string } = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅'
};

// Achievement definitions (Keep as is for now)
const ACHIEVEMENTS = [
  { id: 'first_win', name: 'First Win', description: 'Win your first bet', icon: '🎉', unlocked: false, reward: 50 },
  { id: 'big_winner', name: 'Big Winner', description: 'Win $500 in a single roll', icon: '💰', unlocked: false, reward: 100 },
  { id: 'streak_3', name: 'Hot Streak', description: 'Win 3 bets in a row', icon: '🔥', unlocked: false, reward: 75 },
  { id: 'bankroll_5000', name: 'High Roller', description: 'Reach a bankroll of $5,000', icon: '💎', unlocked: false, reward: 200 },
  { id: 'all_bets', name: 'Betting Expert', description: 'Place all types of bets', icon: '🎲', unlocked: false, reward: 150 },
  { id: 'daily_7', name: 'Consistent Player', description: 'Play 7 days in a row', icon: '📅', unlocked: false, reward: 250 },
  { id: 'streak_10', name: 'Legend', description: 'Win 10 bets in a row', icon: '👑', unlocked: false, reward: 500 },
  { id: 'rolls_100', name: 'Dice Master', description: 'Roll the dice 100 times', icon: '🎯', unlocked: false, reward: 100 },
  { id: 'share_game', name: 'Influencer', description: 'Share the game on social media', icon: '📱', unlocked: false, reward: 75 },
  { id: 'upgrade_5', name: 'Entrepreneur', description: 'Upgrade passive income 5 times', icon: '📈', unlocked: false, reward: 150 },
  { id: 'bankroll_10000', name: 'Millionaire', description: 'Reach a bankroll of $10,000', icon: '💸', unlocked: false, reward: 500 },
  { id: 'comeback', name: 'Comeback Kid', description: 'Win after dropping below $100', icon: '🔄', unlocked: false, reward: 200 },
  { id: 'unlock_all', name: 'Completionist', description: 'Unlock all betting options', icon: '🔑', unlocked: false, reward: 1000 },
];

// Available chip values
// const CHIP_VALUES = [1, 5, 10, 25, 50, 100];

// Tick speed in ms
const TickSpeed = 10000;

// Payout Multipliers/Odds
const PLACE_BET_PAYOUTS: { [key: number]: number } = {
  4: 9/5,
  5: 7/5,
  6: 7/6,
  8: 7/6,
  9: 7/5,
  10: 9/5,
};
const FIELD_BET_PAYOUTS: { [key: number]: number } = {
  2: 2, // Pays 2:1
  3: 1, // Pays 1:1
  4: 1,
  9: 1,
  10: 1,
  11: 1,
  12: 2, // Pays 2:1
};

function App() {
  // Basic game state
  const [bankroll, setBankroll] = useState(100);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [point, setPoint] = useState<number | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [passiveIncome, setPassiveIncome] = useState(1);
  const [totalWinnings, setTotalWinnings] = useState(0); // Track total PROFIT from bets
  const animationDurations = useRef<[number, number]>([0.5, 0.5]);
  const leaderboardRef = useRef<LeaderboardRef>(null);

  // Additional state for betting
  const [activeBets, setActiveBets] = useState<{ [key: string]: number }>({});
  const [unlockedBets, setUnlockedBets] = useState<{ [key: string]: boolean }>({
    'pass-line': true
  });
  const [selectedChip, setSelectedChip] = useState(5);
  const [comePoints, setComePoints] = useState<{ [key: string]: number }>({});
  const [dontComePoints, setDontComePoints] = useState<{ [key: string]: number }>({});
  const [placeBetExpertWins, setPlaceBetExpertWins] = useState<Set<number>>(new Set()); // Track unique wins for quest
  const [unlockedChips, setUnlockedChips] = useState<number[]>([1, 5, 10]); // Add state for unlocked chips
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null); // Track last save time

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(true); // Start with tutorial visible
  const [completedTutorial, setCompletedTutorial] = useState(false);
  const [showTutorialSelector, setShowTutorialSelector] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [unlockedTutorials, setUnlockedTutorials] = useState<string[]>(['basics']);
  const [showQuestTutorial, setShowQuestTutorial] = useState(false);
  const [currentQuestTutorial, setCurrentQuestTutorial] = useState<string | null>(null);


  // UI state
  const [showAchievements, setShowAchievements] = useState(false);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showCheatTerminal, setShowCheatTerminal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [upgradeCount, setUpgradeCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [lossStreak, setLossStreak] = useState(0);
  const [highestLossStreak, setHighestLossStreak] = useState(0);
  const [totalRolls, setTotalRolls] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [hasWonFirstBet, setHasWonFirstBet] = useState(false); // Keep for now, simpler for quest/tutorial unlock
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);
  const [showResultsHistory, setShowResultsHistory] = useState(false);
  const [allResults, setAllResults] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false); // State for confetti


  // Quest state
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: 'pass-line-master',
      name: 'Pass Line Master',
      description: 'Win 3 Pass Line bets',
      goal: 3,
      progress: 0,
      completed: false,
      reward: 'Unlock 6 and 8 Place Bets',
      unlocked: false, // Will be unlocked after first Pass Line win
      unlockTutorial: 'first-win'
    },
    {
      id: 'place-bet-master',
      name: 'Place Bet Master',
      description: 'Win 3 Place bets to unlock the Field bet',
      goal: 3,
      progress: 0,
      completed: false,
      reward: 'Unlock Field Bet',
      unlocked: false, // Unlocked after completing Pass Line Master
      unlockTutorial: 'place-bets-unlocked'
    },
    {
      id: 'field-bet-master',
      name: 'Field Bet Master',
      description: 'Win 3 Field bets',
      goal: 3,
      progress: 0,
      completed: false,
      reward: 'Unlock all Place Bets in the Upgrade menu',
      unlocked: false, // Unlocked after completing Place Bet Master
      unlockTutorial: 'field-bets-unlocked'
    },
    {
      id: 'place-bet-collector',
      name: 'Place Bet Collector',
      description: 'Unlock all Place bets in the Upgrade menu',
      goal: 6,
      progress: 0,
      completed: false,
      reward: 'Access to more betting options',
      unlocked: false, // Unlocked after completing Field Bet Master
      unlockTutorial: 'upgrade-menu-unlocked'
    },
    {
      id: 'place-bet-expert',
      name: 'Place Bet Expert',
      description: 'Win a Place bet on each number (4, 5, 6, 8, 9, 10)',
      goal: 6,
      progress: 0, // Progress now derived from placeBetExpertWins.size
      completed: false,
      reward: 'Unlock Come Bet',
      unlocked: false, // Unlocked after completing Place Bet Collector
      unlockTutorial: 'place-bet-statistics'
    },
    {
      id: 'come-bet-master',
      name: 'Come Bet Master',
      description: 'Win 3 Come bets',
      goal: 3,
      progress: 0,
      completed: false,
      reward: 'Unlock Don\'t Come Bet',
      unlocked: false, // Unlocked after completing Place Bet Expert
      unlockTutorial: 'come-bets'
    },
    {
      id: 'dont-come-bet-master',
      name: 'Don\'t Come Bet Master',
      description: 'Win 3 Don\'t Come bets',
      goal: 3,
      progress: 0,
      completed: false,
      reward: 'Unlock Don\'t Pass Bet',
      unlocked: false, // Unlocked after completing Come Bet Master
      unlockTutorial: 'dont-come-bet-master'
    },
    {
      id: 'dont-pass-bet-master',
      name: 'Don\'t Pass Bet Master',
      description: 'Win 3 Don\'t Pass bets',
      goal: 3,
      progress: 0,
      completed: false,
      reward: 'Master of Craps',
      unlocked: false, // Unlocked after completing Don't Come Bet Master
      unlockTutorial: 'dont-pass-bet-master'
    }
  ]);

  // Additional state for UI overlays
  const [showStatsOverlay, setShowStatsOverlay] = useState(false); // Stats overlay state


  // --- Helper to check quest completion ---
  const isQuestCompleted = (questId: string): boolean => {
    const quest = quests.find(q => q.id === questId);
    return quest?.completed ?? false;
  };

  // --- Refactored Achievement Progress Calculation ---
  const achievementProgressCalculators: { [key: string]: () => number } = {
    'rolls_100': () => Math.min(totalRolls / 100, 1),
    'streak_3': () => Math.min(streak / 3, 1),
    'streak_10': () => Math.min(streak / 10, 1),
    'bankroll_5000': () => Math.min(bankroll / 5000, 1),
    'bankroll_10000': () => Math.min(bankroll / 10000, 1),
    'upgrade_5': () => Math.min(upgradeCount / 5, 1),
    // Add calculators for other achievements with progress bars here
  };

  const getAchievementProgress = (id: string): number => {
    const calculator = achievementProgressCalculators[id];
    return calculator ? calculator() : (achievements.find(a => a.id === id)?.unlocked ? 1 : 0); // Default to 1 if unlocked, 0 otherwise
  };
  // --- End Refactored Achievement Progress ---


  // --- Upgrade Functions ---
  const unlockBet = (betType: string) => {
    const cost = BET_UNLOCK_COSTS[betType as keyof typeof BET_UNLOCK_COSTS];
    if (bankroll >= cost && !unlockedBets[betType]) {
      setBankroll(prev => prev - cost);
      setUnlockedBets(prev => ({ ...prev, [betType]: true }));
      addResult(`Unlocked ${betType.replace('-', ' ')} bet for ${formatNumber(cost)}`);
      // Potentially update 'place-bet-collector' quest progress here if needed
      const collectorQuest = quests.find(q => q.id === 'place-bet-collector');
      if (collectorQuest && collectorQuest.unlocked && !collectorQuest.completed && betType.startsWith('place-')) {
         // Count all place bets that are now unlocked, including the one being unlocked
         const currentPlaceBets = Object.keys(unlockedBets).filter(k => k.startsWith('place-')).length + 1;
         
         // Update quest progress
         setQuests(prevQuests => prevQuests.map(q => {
           if (q.id === 'place-bet-collector') {
             const newProgress = currentPlaceBets;
             const completed = newProgress >= q.goal;
             return { ...q, progress: newProgress, completed };
           }
           return q;
         }));
         
         // Log progress for debugging
         console.log(`Place Bet Collector progress: ${currentPlaceBets}/${collectorQuest.goal}`);
      }
    } else if (unlockedBets[betType]) {
      addResult(`${betType.replace('-', ' ')} bet already unlocked.`);
    } else {
      addResult(`Not enough funds to unlock ${betType.replace('-', ' ')} bet (cost: ${formatNumber(cost)})`);
    }
  };

  const unlockChip = (chipValue: number) => {
    const cost = CHIP_UNLOCK_COSTS[chipValue.toString() as keyof typeof CHIP_UNLOCK_COSTS];
     if (bankroll >= cost && !unlockedChips.includes(chipValue)) {
       setBankroll(prev => prev - cost);
       setUnlockedChips(prev => [...prev, chipValue].sort((a, b) => a - b)); // Add and sort
       addResult(`Unlocked ${formatNumber(chipValue, false)} chip for ${formatNumber(cost)}`);
     } else if (unlockedChips.includes(chipValue)) {
       addResult(`${formatNumber(chipValue, false)} chip already unlocked.`);
     } else {
       addResult(`Not enough funds to unlock ${formatNumber(chipValue, false)} chip (cost: ${formatNumber(cost)})`);
     }
  };
  // --- End Upgrade Functions ---


  // Set up timer for passive income - Removed progress bar logic
  useEffect(() => {
    const timer = setInterval(() => {
      setBankroll(prev => prev + passiveIncome);
      addResult(`+ ${formatNumber(passiveIncome)} passive income`);
    }, TickSpeed);

    return () => clearInterval(timer); // Clean up timer
  }, [passiveIncome]); // Rerun effect only if passiveIncome rate changes

  // Function to add a result to the results list
  const addResult = (result: string) => {
    // Filter results to only show important events
    const isImportantEvent =
      result.includes('Won') ||
      result.includes('Lost') ||
      result.includes('Quest') ||
      result.includes('completed') ||
      result.includes('Achievement');
    
    // Check if this is a bet placement message
    const isBetPlacement = result.includes('Placed $') && result.includes(' on ');
    
    // Only add important events to the results panel
    if (isImportantEvent && !isBetPlacement) {
      setResults(prev => [result, ...prev].slice(0, 5));
    }
    
    // Only add important events to the full history
    if (isImportantEvent) {
      setAllResults(prev => [result, ...prev].slice(0, 100));
    }
  };

  // Function to place a bet (Keep as is)
  const placeBet = (betType: string) => {
    if (selectedChip > bankroll) {
      addResult("Not enough funds!");
      return;
    }
    if (betType === 'pass-line' && point !== null) {
      addResult('Cannot place Pass Line bet after point is established');
      return;
    }
    setActiveBets(prevBets => {
      const newBets = { ...prevBets };
      newBets[betType] = (newBets[betType] || 0) + selectedChip;
      return newBets;
    });
    setBankroll(prevBankroll => prevBankroll - selectedChip);
    addResult(`Placed ${formatNumber(selectedChip)} on ${betType.replace(/-/g, ' ')}`);
  };

  // Function to remove a bet (Keep as is)
  const removeBet = (betType: string) => {
    if (!activeBets[betType]) return;
    const canRemoveBet = (betType: string) => {
      if (betType === 'pass-line') return point === null;
      if (betType.startsWith('place-')) return true;
      if (betType === 'field') return false;
      return true; // Default allow
    };
    if (canRemoveBet(betType)) {
      setBankroll(prev => prev + activeBets[betType]);
      setActiveBets(prev => {
        const newBets = { ...prev };
        delete newBets[betType];
        return newBets;
      });
      addResult(`Removed ${betType.replace(/-/g, ' ')} bet`);
    } else {
      addResult(`Cannot remove ${betType.replace(/-/g, ' ')} bet at this time`);
    }
  };

  // Function to get total bet amount (Keep as is)
  const getTotalBets = () => {
    return Object.values(activeBets).reduce((sum, bet) => sum + bet, 0);
  };

  // --- Refactored Win Handling ---
  // Standardized: Expects PROFIT only, updates bankroll by (bet + profit)
  const handleStandardWin = (betType: string, betAmount: number, profit: number, returnBet: boolean = true) => {
    addResult(`Won ${formatNumber(profit)} on ${betType.replace(/-/g, ' ')}`);
    // Only return the original bet if returnBet is true
    setBankroll(prev => prev + profit + (returnBet ? betAmount : 0));
    setStreak(prev => {
      const newStreak = prev + 1;
      // Update highest streak if current streak is higher
      setHighestStreak(current => Math.max(current, newStreak));
      return newStreak;
    });
    setLossStreak(0); // Reset loss streak on win
    setTotalWins(prev => prev + 1);
    setTotalWinnings(prev => prev + profit); // Add PROFIT to total winnings

    // First win tracking & quest unlock
    if (!hasWonFirstBet) {
      setHasWonFirstBet(true);
      const passLineMaster = quests.find(q => q.id === 'pass-line-master');
      if (!passLineMaster?.unlocked) {
        setQuests(prevQuests => prevQuests.map(quest =>
          quest.id === 'pass-line-master' ? { ...quest, unlocked: true } : quest
        ));
        addResult(`🏆 Quest unlocked: Pass Line Master!`);
        if (!unlockedTutorials.includes('first-win')) {
          setUnlockedTutorials(prev => [...prev, 'first-win']);
          setCurrentQuestTutorial('first-win');
          setShowQuestTutorial(true);
        }
      }
    }
  };

  // Specific handler for Pass Line (wins even money, profit = betAmount)
  // Bet stays on the table after winning.
  const handlePassLineWin = (betAmount: number, messagePrefix: string = "") => {
    const profit = betAmount; // Pass line pays 1:1
    addResult(`${messagePrefix}Won ${formatNumber(profit)} on Pass Line`);
    setBankroll(prev => prev + profit); // Only add profit, bet stays
    setShowConfetti(true); // Trigger confetti
    setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds (increased from 3)
    setStreak(prev => {
      const newStreak = prev + 1;
      // Update highest streak if current streak is higher
      setHighestStreak(current => Math.max(current, newStreak));
      return newStreak;
    });
    setLossStreak(0); // Reset loss streak on win
    setTotalWins(prev => prev + 1);
    setTotalWinnings(prev => prev + profit); // Add PROFIT to total winnings
    updateQuestProgress('pass-line-master', 1);

    // First win tracking & quest unlock (duplicated slightly, but ok for now)
    if (!hasWonFirstBet) {
      setHasWonFirstBet(true);
      const passLineMaster = quests.find(q => q.id === 'pass-line-master');
      if (!passLineMaster?.unlocked) {
        setQuests(prevQuests => prevQuests.map(quest =>
          quest.id === 'pass-line-master' ? { ...quest, unlocked: true } : quest
        ));
        addResult(`🏆 Quest unlocked: Pass Line Master!`);
        if (!unlockedTutorials.includes('first-win')) {
          setUnlockedTutorials(prev => [...prev, 'first-win']);
          setCurrentQuestTutorial('first-win');
          setShowQuestTutorial(true);
        }
      }
    }
  };

  // Handle Loss
  const handleLoss = (betType: string, betAmount: number, messageSuffix: string = "") => {
    addResult(`Lost ${formatNumber(betAmount)} on ${betType.replace(/-/g, ' ')}${messageSuffix}`);
    setStreak(0);
    setLossStreak(prev => {
      const newLossStreak = prev + 1;
      // Update highest loss streak if current loss streak is higher
      setHighestLossStreak(current => Math.max(current, newLossStreak));
      return newLossStreak;
    });
    // Bankroll already reduced when bet was placed
    // Remove the losing bet from active bets
    setActiveBets(prev => {
      const newBets = { ...prev };
      delete newBets[betType];
      return newBets;
    });
  };
  // --- End Refactored Win/Loss Handling ---


  // Update passive income when total winnings change: $1 + (1% of Total Profit)
  useEffect(() => {
    const newPassiveIncome = 1 + (totalWinnings * 0.01);
    // Ensure passive income doesn't go below $1 if totalWinnings is somehow negative, though it shouldn't be.
    setPassiveIncome(Math.max(1, newPassiveIncome));
  }, [totalWinnings]);

  // Function to update quest progress - Simplified: only updates progress/completion status
  const updateQuestProgress = (questId: string, progressIncrement: number, winningNumber?: number) => {
    setQuests(prevQuests => prevQuests.map(quest => {
      if (quest.id === questId && quest.unlocked && !quest.completed) {
        // Handle place-bet-expert separately using its state
        if (questId === 'place-bet-expert') {
          if (winningNumber && !placeBetExpertWins.has(winningNumber)) {
            setPlaceBetExpertWins(prevSet => new Set(prevSet).add(winningNumber));
            // Actual progress update for this quest happens in the useEffect below
          }
          return quest; // Return early, useEffect handles the rest
        }

        // Standard progress update
        const newProgress = quest.progress + progressIncrement;
        const completed = newProgress >= quest.goal;

        // Only update progress and completion status here
        // Side effects (rewards, unlocks) are handled in the useEffect below
        return { ...quest, progress: newProgress, completed };
      }
      return quest;
    }));
  };

  // Custom hook to get the previous value of a prop/state
  function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  // Effect to handle side effects of quest completion (rewards, unlocks)
  const prevQuests = usePrevious(quests);
  useEffect(() => {
    if (!prevQuests) return; // Skip first render

    quests.forEach((currentQuest, index) => {
      const previousQuest = prevQuests[index];
      // Check if the quest *just* became completed in this update
      if (currentQuest.completed && !previousQuest.completed) {
        // --- Quest Completion Side Effects ---
        const questId = currentQuest.id;
        const questName = currentQuest.name;

        // No cash reward for quest completion
        addResult(`🏆 Quest completed: ${questName}!`);

        // 2. Trigger unlocks (bets, next quests) and tutorials
        let rewardMsg = "";
        switch (questId) {
          case 'pass-line-master':
            setUnlockedBets(prev => ({ ...prev, 'place-6': true, 'place-8': true }));
            setQuests(prevQ => prevQ.map(q => q.id === 'place-bet-master' ? { ...q, unlocked: true } : q)); // Unlock next quest
            rewardMsg = "Unlocked Place bets for 6 and 8.";
            if (!unlockedTutorials.includes('place-bets-unlocked')) {
              setUnlockedTutorials(prev => [...prev, 'place-bets-unlocked']);
              setCurrentQuestTutorial('place-bets-unlocked'); setShowQuestTutorial(true);
            }
            break;
          case 'place-bet-master':
            setUnlockedBets(prev => ({ ...prev, 'field': true }));
            setQuests(prevQ => prevQ.map(q => q.id === 'field-bet-master' ? { ...q, unlocked: true } : q));
            rewardMsg = "Unlocked Field bet.";
            // Show field-bets-unlocked tutorial when Place Bet Master is completed
            if (!unlockedTutorials.includes('field-bets-unlocked')) {
              setUnlockedTutorials(prev => [...prev, 'field-bets-unlocked']);
              setCurrentQuestTutorial('field-bets-unlocked'); setShowQuestTutorial(true);
            }
            break;
          case 'field-bet-master':
            // Unlock next quest AND explicitly grant upgrade menu access (though button handles visibility)
            setQuests(prevQ => prevQ.map(q => q.id === 'place-bet-collector' ? { ...q, unlocked: true } : q));
            rewardMsg = "Place Bet Collector quest unlocked & Upgrade Menu access granted!";
            if (!unlockedTutorials.includes('field-bet-master-completed')) {
              setUnlockedTutorials(prev => [...prev, 'field-bet-master-completed']);
              setCurrentQuestTutorial('field-bet-master-completed'); setShowQuestTutorial(true);
            }
            // This quest's reward is unlocking the bets via the upgrade menu,
            // so the main reward is unlocking the next quest.
            // The actual bet unlocks happen via the unlockBet function.
            setQuests(prevQ => prevQ.map(q => q.id === 'place-bet-expert' ? { ...q, unlocked: true } : q));
            rewardMsg = "Place Bet Expert quest unlocked.";
            // Don't show place-bet-statistics tutorial here - it will be shown when place-bet-expert is completed
            break;
          case 'place-bet-collector':
            // Unlock the next quest
            setQuests(prevQ => prevQ.map(q => q.id === 'place-bet-expert' ? { ...q, unlocked: true } : q));
            rewardMsg = "Place Bet Expert quest unlocked.";
            // Show the upgrade-menu-unlocked tutorial with place bet payouts
            if (!unlockedTutorials.includes('upgrade-menu-unlocked')) {
              setUnlockedTutorials(prev => [...prev, 'upgrade-menu-unlocked']);
              setCurrentQuestTutorial('upgrade-menu-unlocked');
              setShowQuestTutorial(true);
            }
            break;
          case 'place-bet-expert':
            setUnlockedBets(prev => ({ ...prev, 'come': true }));
            if (!unlockedTutorials.includes('place-bet-statistics')) {
              setUnlockedTutorials(prev => [...prev, 'place-bet-statistics']);
              setCurrentQuestTutorial('place-bet-statistics');
              setShowQuestTutorial(true);
            }
            setQuests(prevQ => prevQ.map(q => q.id === 'come-bet-master' ? { ...q, unlocked: true } : q));
            rewardMsg = "Come bet unlocked.";
            // Add come-bets tutorial to unlocked tutorials, but don't show it now
            if (!unlockedTutorials.includes('come-bets')) {
              setUnlockedTutorials(prev => [...prev, 'come-bets']);
            }
            break;
          case 'come-bet-master':
            setUnlockedBets(prev => ({ ...prev, 'dont-come': true }));
            // Unlock the next quest in the progression
            setQuests(prevQ => prevQ.map(q => q.id === 'dont-come-bet-master' ? { ...q, unlocked: true } : q));
            rewardMsg = "Don't Come bet unlocked.";
            if (!unlockedTutorials.includes('dont-come-bets')) {
              setUnlockedTutorials(prev => [...prev, 'dont-come-bets']);
              setCurrentQuestTutorial('dont-come-bets'); setShowQuestTutorial(true);
            }
            break;
          case 'dont-come-bet-master':
            setUnlockedBets(prev => ({ ...prev, 'dont-pass': true }));
            // Unlock the next quest in the progression
            setQuests(prevQ => prevQ.map(q => q.id === 'dont-pass-bet-master' ? { ...q, unlocked: true } : q));
            rewardMsg = "Don't Pass bet unlocked.";
            if (!unlockedTutorials.includes('dont-come-bet-master')) {
              setUnlockedTutorials(prev => [...prev, 'dont-come-bet-master']);
              setCurrentQuestTutorial('dont-come-bet-master'); setShowQuestTutorial(true);
            }
            break;
          case 'dont-pass-bet-master':
            // This is the final quest in the progression
            rewardMsg = "You've mastered all betting strategies in craps!";
            if (!unlockedTutorials.includes('dont-pass-bet-master')) {
              setUnlockedTutorials(prev => [...prev, 'dont-pass-bet-master']);
              setCurrentQuestTutorial('dont-pass-bet-master'); setShowQuestTutorial(true);
            }
            break;
        }
        if (rewardMsg) {
          addResult(`🎁 Quest Reward: ${rewardMsg}`);
        }
        // --- End Quest Completion Side Effects ---
      }
    });

    // Handle 'place-bet-expert' progress update separately as it depends on the Set size
    const expertQuestId = 'place-bet-expert';
    const currentExpertQuest = quests.find(q => q.id === expertQuestId);
    // const prevExpertQuest = prevQuests?.find(q => q.id === expertQuestId);
    if (currentExpertQuest && currentExpertQuest.unlocked) {
      const newProgress = placeBetExpertWins.size;
      const goal = currentExpertQuest.goal;
      const completed = newProgress >= goal;
      
      // Update progress and check for completion
      if ((newProgress !== currentExpertQuest.progress || completed !== currentExpertQuest.completed) && !currentExpertQuest.completed) {
        setQuests(prevQuests => prevQuests.map(q =>
          q.id === expertQuestId ? { ...q, progress: newProgress, completed } : q
        ));
        
        // Log for debugging
        console.log(`Place Bet Expert progress: ${newProgress}/${goal}, completed: ${completed}`);
        if (completed) {
          console.log("Place Bet Expert quest completed!");
          addResult(`🏆 Quest completed: ${currentExpertQuest.name}!`);
        }
      }
    }

  }, [quests, prevQuests, placeBetExpertWins, unlockedTutorials]); // Dependencies


  // Handle tutorial toggle (Keep as is)
  const toggleTutorialSelector = () => setShowTutorialSelector(!showTutorialSelector);

  // Handle login/logout (Keep as is)
  const handleLogin = (username: string, isAdmin: boolean) => { setIsLoggedIn(true); setCurrentUser(username); setIsAdmin(isAdmin); };
  const handleLogout = () => { setIsLoggedIn(false); setCurrentUser(""); setIsAdmin(false); };

  // Handle save state
  const handleSaveState = useCallback(async () => {
    try {
      console.log("Save triggered, isLoggedIn:", isLoggedIn);
      
      const gameState = {
        bankroll,
        passiveIncome,
        totalRolls,
        totalWins,
        totalWinnings,
        streak,
        highestStreak,
        lossStreak,
        highestLossStreak,
        unlockedBets,
        unlockedChips,
        achievements: achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
        // Convert Set to Array for JSON serialization
        placeBetExpertWins: Array.from(placeBetExpertWins),
        quests: quests.map(q => ({
          id: q.id,
          // Use the Set size directly here for consistency, loading logic will handle it
          progress: q.id === 'place-bet-expert' ? placeBetExpertWins.size : q.progress,
          completed: q.completed,
          unlocked: q.unlocked
        })),
        upgradeCount,
        hasWonFirstBet,
        completedTutorial,
        unlockedTutorials,
        lastSaveTime: new Date().toISOString() // Add save timestamp
      };
      
      // If user is logged in, save to database via API
      if (isLoggedIn) {
        try {
          // Import saveGameState from api.ts
          const { saveGameState } = await import('./api');
          const result = await saveGameState(gameState);
          const now = new Date();
          setLastSaveTime(now);
          addResult(`Game state saved to database! (${now.toLocaleTimeString()})`);
          console.log("Saving game state to database:", gameState);
          console.log("Save result:", result);
          
          // Refresh leaderboard after saving
          if (leaderboardRef.current) {
            leaderboardRef.current.refreshLeaderboard();
          }
        } catch (apiError) {
          console.error("Error saving game state to database:", apiError);
          addResult("Error saving game state to database. Falling back to localStorage.");
          // Fall back to localStorage if API save fails
          localStorage.setItem('idleCrapsGameState', JSON.stringify(gameState));
          // Still update lastSaveTime even when falling back to localStorage
          const now = new Date();
          setLastSaveTime(now);
          addResult(`Game state saved locally as fallback! (${now.toLocaleTimeString()})`);
        }
      } else {
        // If not logged in, save to localStorage as before
        localStorage.setItem('idleCrapsGameState', JSON.stringify(gameState));
        const now = new Date();
        setLastSaveTime(now);
        addResult(`Game state saved locally! (${now.toLocaleTimeString()})`);
        console.log("Saving game state to localStorage:", gameState);
      }
    } catch (error) {
      console.error("Error saving game state:", error);
      addResult("Error saving game state.");
    }
  }, [
    bankroll, passiveIncome, totalRolls, totalWins, totalWinnings, streak, highestStreak,
    unlockedBets, unlockedChips, achievements, placeBetExpertWins, quests,
    upgradeCount, hasWonFirstBet, completedTutorial, unlockedTutorials, isLoggedIn, addResult
  ]); // Dependencies for useCallback

  // Auto-save periodically
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      handleSaveState();
    }, 60000); // Auto-save every 1 minute (60,000 ms)

    return () => clearInterval(autoSaveInterval); // Cleanup interval on unmount
  }, [handleSaveState]); // Rerun if handleSaveState changes (due to its dependencies)


  // Load state on component mount
  useEffect(() => {
    const loadGameStateData = async () => {
      try {
        let savedState = null;
        
        // Try to load from API if user is logged in
        if (isLoggedIn) {
          try {
            // Import loadGameState from api.ts
            const { loadGameState } = await import('./api');
            const apiState = await loadGameState();
            
            // If we got a valid state from the API, use it
            if (apiState && Object.keys(apiState).length > 0) {
              savedState = apiState;
              console.log("Loading game state from database:", savedState);
              addResult("Game state loaded from database successfully.");
            } else {
              console.log("No saved game state found in database.");
            }
          } catch (apiError) {
            console.error("Error loading game state from database:", apiError);
            addResult("Error loading game state from database. Trying localStorage.");
          }
        }
        
        // Fall back to localStorage if API load failed or user is not logged in
        if (!savedState) {
          const savedStateString = localStorage.getItem('idleCrapsGameState');
          if (savedStateString) {
            savedState = JSON.parse(savedStateString);
            console.log("Loading game state from localStorage:", savedState);
            addResult("Game state loaded from localStorage successfully.");
          } else {
            addResult("No saved game state found. Starting fresh!");
            return; // Exit if no state found
          }
        }

        // Use functional updates where possible to avoid stale state issues
        // Basic values
        if (savedState.bankroll !== undefined) setBankroll(savedState.bankroll);
        if (savedState.passiveIncome !== undefined) setPassiveIncome(savedState.passiveIncome);
        if (savedState.totalRolls !== undefined) setTotalRolls(savedState.totalRolls);
        if (savedState.totalWins !== undefined) setTotalWins(savedState.totalWins);
        if (savedState.totalWinnings !== undefined) setTotalWinnings(savedState.totalWinnings);
        if (savedState.streak !== undefined) setStreak(savedState.streak);
        if (savedState.highestStreak !== undefined) setHighestStreak(savedState.highestStreak);
        if (savedState.lossStreak !== undefined) setLossStreak(savedState.lossStreak);
        if (savedState.highestLossStreak !== undefined) setHighestLossStreak(savedState.highestLossStreak);
        if (savedState.upgradeCount !== undefined) setUpgradeCount(savedState.upgradeCount);
        if (savedState.hasWonFirstBet !== undefined) setHasWonFirstBet(savedState.hasWonFirstBet);
        if (savedState.completedTutorial !== undefined) setCompletedTutorial(savedState.completedTutorial);
        if (savedState.lastSaveTime) setLastSaveTime(new Date(savedState.lastSaveTime));

        // Unlocked items
        if (savedState.unlockedBets) setUnlockedBets(savedState.unlockedBets);
        if (savedState.unlockedChips) setUnlockedChips(savedState.unlockedChips);
        if (savedState.unlockedTutorials) setUnlockedTutorials(savedState.unlockedTutorials);

        // Achievements
        if (savedState.achievements) {
          setAchievements(prevAchievements =>
            prevAchievements.map(defaultAch => {
              const savedAch = savedState.achievements.find((sa: { id: string }) => sa.id === defaultAch.id);
              return savedAch ? { ...defaultAch, unlocked: savedAch.unlocked } : defaultAch;
            })
          );
        }

        // Place Bet Expert Wins (Convert Array back to Set)
        if (savedState.placeBetExpertWins && Array.isArray(savedState.placeBetExpertWins)) {
          setPlaceBetExpertWins(new Set(savedState.placeBetExpertWins));
        }

        // Quests (carefully merge saved progress/status)
        if (savedState.quests) {
          setQuests(prevQuests =>
            prevQuests.map(defaultQuest => {
              const savedQuest = savedState.quests.find((sq: { id: string }) => sq.id === defaultQuest.id);
              if (savedQuest) {
                // For place-bet-expert, progress is derived from the Set, so don't load progress directly
                const progressToSet = defaultQuest.id === 'place-bet-expert'
                  ? (savedState.placeBetExpertWins ? new Set(savedState.placeBetExpertWins).size : 0) // Recalculate from loaded Set data
                  : savedQuest.progress;

                return {
                  ...defaultQuest,
                  progress: progressToSet,
                  completed: savedQuest.completed,
                  unlocked: savedQuest.unlocked
                };
              }
              return defaultQuest;
            })
          );
        }
      } catch (error) {
        console.error("Error loading game state:", error);
        addResult("Error loading game state. Starting fresh.");
        // Optionally clear potentially corrupted storage
        // localStorage.removeItem('idleCrapsGameState');
      }
    };
    
    loadGameStateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]); // Run when component mounts and when login state changes


  // Share game (Keep as is)
  const shareGame = () => { navigator.clipboard.writeText("Check out Idle Craps! I've won $" + (bankroll - 100).toFixed(2) + " so far. Play at https://idlecraps.com"); addResult("Game link copied!"); };


  // --- Refactored Roll Resolution Logic ---
  const resolveRollOutcome = (total: number) => {
    let nextPoint = point;
    let betsToRemove: string[] = [];
    let betsToKeep: string[] = []; // Bets that won/pushed but stay on table
    let nextComePoints = { ...comePoints };
    let nextDontComePoints = { ...dontComePoints };
    
    // Variables for tracking fresh Come bet movement
    let moveFreshComeBet = false;
    let freshComeBetAmount = 0;
    let freshComeBetKey = '';
    
    // Variables for tracking fresh Don't Come bet movement
    let moveFreshDontComeBet = false;
    let freshDontComeBetAmount = 0;
    let freshDontComeBetKey = '';

    // --- Come Out Roll ---
    if (point === null) {
      if (total === 7 || total === 11) {
        // Pass Line wins
        if (activeBets['pass-line']) {
          handlePassLineWin(activeBets['pass-line']);
          betsToKeep.push('pass-line'); // Pass line bet STAYS after win on come out
        }
        // Don't Pass loses
        if (activeBets['dont-pass']) {
          handleLoss('dont-pass', activeBets['dont-pass']);
          // betsToRemove already handles this via handleLoss
        }
        // Come bet wins
        if (activeBets['come']) {
          // Come bet pays 1:1
          handleComeBetWin(activeBets['come']);
          betsToRemove.push('come'); // Come bet is removed after win
        }
        // Don't Come bet loses
        if (activeBets['dont-come']) {
          handleLoss('dont-come', activeBets['dont-come']);
          // betsToRemove already handles this via handleLoss
        }
        
        // Handle existing Come point bets - they lose on a 7 even during come-out roll
        if (total === 7) {
          Object.keys(comePoints).forEach(comeBetKey => {
            if (activeBets[comeBetKey]) {
              const comePoint = comePoints[comeBetKey];
              handleLoss(comeBetKey, activeBets[comeBetKey], ` on ${comePoint}`);
              delete nextComePoints[comeBetKey];
            }
          });
          
          // Handle existing Don't Come point bets - they win on a 7
          Object.keys(dontComePoints).forEach(dontComeBetKey => {
            if (activeBets[dontComeBetKey]) {
              const dontComePoint = dontComePoints[dontComeBetKey];
              const profit = activeBets[dontComeBetKey]; // Don't Come point bet pays 1:1
              addResult(`Won $${profit.toFixed(2)} on Don't Come bet on ${dontComePoint}`);
              setBankroll(prev => prev + activeBets[dontComeBetKey] + profit);
              setStreak(prev => prev + 1);
              setTotalWins(prev => prev + 1);
              setLossStreak(0); // Reset loss streak on win
              setTotalWinnings(prev => prev + profit);
              updateQuestProgress('dont-come-bet-master', 1);
              betsToRemove.push(dontComeBetKey);
              delete nextDontComePoints[dontComeBetKey];
            }
          });
        }
        
        nextPoint = null; // Stays off
      } else if (total === 2 || total === 3 || total === 12) {
        // Pass Line loses
        if (activeBets['pass-line']) {
          handleLoss('pass-line', activeBets['pass-line'], ' (Craps)');
          // betsToRemove already handles this via handleLoss
        }
        // Don't Pass wins (1:1) or pushes (12)
        if (activeBets['dont-pass']) {
          if (total === 12) {
            addResult("Push on Don't Pass (12)");
            setBankroll(prev => prev + activeBets['dont-pass']); // Return bet
            betsToKeep.push('dont-pass'); // Bet stays for next come out
          } else {
            const profit = activeBets['dont-pass']; // 1:1 payout
            // Don't Pass bet stays on the table, so don't return the original bet
            handleStandardWin('dont-pass', activeBets['dont-pass'], profit, false);
            betsToKeep.push('dont-pass'); // Bet stays for next come out
          }
        }
        // Come bet loses on 2, 3, 12
        if (activeBets['come']) {
          handleLoss('come', activeBets['come'], ' (Craps)');
          // betsToRemove already handles this via handleLoss
        }
        // Don't Come bet wins on 2, 3 or pushes on 12
        if (activeBets['dont-come']) {
          if (total === 12) {
            addResult("Push on Don't Come (12)");
            setBankroll(prev => prev + activeBets['dont-come']); // Return bet
            betsToKeep.push('dont-come'); // Bet stays
          } else {
            // 1:1 payout
            handleDontComeBetWin(activeBets['dont-come']);
            betsToRemove.push('dont-come'); // Bet is removed after win
          }
        }
        nextPoint = null; // Stays off
      } else {
        // Point Established
        nextPoint = total;
        addResult(`Point set to ${total}`);
        // Bets stay on table
        if (activeBets['pass-line']) betsToKeep.push('pass-line');
        if (activeBets['dont-pass']) betsToKeep.push('dont-pass');
        
        // Handle Come bet - establish Come point
        if (activeBets['come']) {
          // Create a new come point bet
          const comeBetKey = `come-point-${total}`;
          nextComePoints[comeBetKey] = total;
          addResult(`Come bet moved to ${total}`);
          
          // Move the bet amount to the new come point bet
          setActiveBets(prev => {
            const newBets = { ...prev };
            newBets[comeBetKey] = newBets['come'];
            delete newBets['come'];
            return newBets;
          });
          
          // Remove from betsToKeep since we're handling it specially
          betsToRemove.push('come');
        }
        
        // Handle Don't Come bet - establish Don't Come point
        if (activeBets['dont-come']) {
          // Create a new don't come point bet
          const dontComeBetKey = `dont-come-point-${total}`;
          nextDontComePoints[dontComeBetKey] = total;
          addResult(`Don't Come bet moved to ${total}`);
          
          // Move the bet amount to the new don't come point bet
          setActiveBets(prev => {
            const newBets = { ...prev };
            newBets[dontComeBetKey] = newBets['dont-come'];
            delete newBets['dont-come'];
            return newBets;
          });
          
          // Remove from betsToKeep since we're handling it specially
          betsToRemove.push('dont-come');
        }
      }
    }
    // --- Point Phase ---
    else {
      // Handle Come bets in point phase
      if (activeBets['come']) {
        if (total === 7 || total === 11) {
          // Come bet wins immediately on 7 or 11
          // Come bet pays 1:1
          handleComeBetWin(activeBets['come']);
          betsToRemove.push('come');
        } else if (total === 2 || total === 3 || total === 12) {
          // Come bet loses on 2, 3, 12
          handleLoss('come', activeBets['come'], ' (Craps)');
          // betsToRemove already handles this via handleLoss
        } else {
          // Establish a new Come point
          const comeBetKey = `come-point-${total}`;
          nextComePoints[comeBetKey] = total;
          addResult(`Come bet moved to ${total}`);
          
          // Move the bet amount to the new come point bet
          setActiveBets(prev => {
            const newBets = { ...prev };
            newBets[comeBetKey] = newBets['come'];
            delete newBets['come'];
            return newBets;
          });
          
          // Remove from betsToKeep since we're handling it specially
          betsToRemove.push('come');
        }
      }
      
      // Handle Don't Come bets in point phase
      if (activeBets['dont-come']) {
        if (total === 7 || total === 11) {
          // Don't Come bet loses on 7 or 11
          handleLoss('dont-come', activeBets['dont-come']);
          // betsToRemove already handles this via handleLoss
        } else if (total === 2 || total === 3) {
          // Don't Come bet wins on 2 or 3
          // Don't Come bet pays 1:1
          handleDontComeBetWin(activeBets['dont-come']);
          betsToRemove.push('dont-come');
        } else if (total === 12) {
          // Don't Come bet pushes on 12
          addResult("Push on Don't Come (12)");
          setBankroll(prev => prev + activeBets['dont-come']); // Return bet
          betsToKeep.push('dont-come'); // Bet stays
        } else {
          // Establish a new Don't Come point
          const dontComeBetKey = `dont-come-point-${total}`;
          nextDontComePoints[dontComeBetKey] = total;
          addResult(`Don't Come bet moved to ${total}`);
          
          // Move the bet amount to the new don't come point bet
          setActiveBets(prev => {
            const newBets = { ...prev };
            newBets[dontComeBetKey] = newBets['dont-come'];
            delete newBets['dont-come'];
            return newBets;
          });
          
          // Remove from betsToKeep since we're handling it specially
          betsToRemove.push('dont-come');
        }
      }
      
      // Check if we need to move a fresh Come bet to the point that was just rolled
      
      // Handle existing Come point bets
      Object.keys(comePoints).forEach(comeBetKey => {
        const comePoint = comePoints[comeBetKey];
        if (total === comePoint) {
          // Come point bet wins when its number is rolled
          if (activeBets[comeBetKey]) {
            const profit = activeBets[comeBetKey]; // Come point bet pays 1:1
            addResult(`Won $${profit.toFixed(2)} on Come bet on ${comePoint}`);
            setBankroll(prev => prev + activeBets[comeBetKey] + profit);
            setStreak(prev => prev + 1);
            setTotalWins(prev => prev + 1);
            setLossStreak(0); // Reset loss streak on win
            setTotalWinnings(prev => prev + profit);
            updateQuestProgress('come-bet-master', 1);
            betsToRemove.push(comeBetKey);
            delete nextComePoints[comeBetKey];
            
            // If there's a fresh Come bet, we'll need to move it to this point
            if (activeBets['come']) {
              moveFreshComeBet = true;
              freshComeBetAmount = activeBets['come'];
              freshComeBetKey = `come-point-${total}`;
            }
          }
        } else if (total === 7) {
          // Come point bet loses when 7 is rolled
          if (activeBets[comeBetKey]) {
            handleLoss(comeBetKey, activeBets[comeBetKey], ` on ${comePoint}`);
            delete nextComePoints[comeBetKey];
          }
        } else {
          // Come point bet stays if neither its number nor 7 is rolled
          if (activeBets[comeBetKey]) {
            betsToKeep.push(comeBetKey);
          }
        }
      });
      
      // If we need to move a fresh Come bet
      if (moveFreshComeBet) {
        // Create a new come point bet for the same number
        nextComePoints[freshComeBetKey] = total;
        addResult(`Come bet of $${freshComeBetAmount} moved to ${total}`);
        
        // Mark 'come' for removal since we're moving it
        betsToRemove.push('come');
      }
      
      // Handle existing Don't Come point bets
      Object.keys(dontComePoints).forEach(dontComeBetKey => {
        const dontComePoint = dontComePoints[dontComeBetKey];
        if (total === dontComePoint) {
          // Don't Come point bet loses when its number is rolled
          if (activeBets[dontComeBetKey]) {
            handleLoss(dontComeBetKey, activeBets[dontComeBetKey], ` on ${dontComePoint}`);
            delete nextDontComePoints[dontComeBetKey];
            
            // If there's a fresh Don't Come bet, we'll need to move it to this point
            if (activeBets['dont-come']) {
              moveFreshDontComeBet = true;
              freshDontComeBetAmount = activeBets['dont-come'];
              freshDontComeBetKey = `dont-come-point-${total}`;
            }
          }
        } else if (total === 7) {
          // Don't Come point bet wins when 7 is rolled
          if (activeBets[dontComeBetKey]) {
            const profit = activeBets[dontComeBetKey]; // Don't Come point bet pays 1:1
            addResult(`Won $${profit.toFixed(2)} on Don't Come bet on ${dontComePoint}`);
            setBankroll(prev => prev + activeBets[dontComeBetKey] + profit);
            setStreak(prev => prev + 1);
            setTotalWins(prev => prev + 1);
            setLossStreak(0); // Reset loss streak on win
            setTotalWinnings(prev => prev + profit);
            updateQuestProgress('dont-come-bet-master', 1);
            betsToRemove.push(dontComeBetKey);
            delete nextDontComePoints[dontComeBetKey];
          }
        } else {
          // Don't Come point bet stays if neither its number nor 7 is rolled
          if (activeBets[dontComeBetKey]) {
            betsToKeep.push(dontComeBetKey);
          }
        }
      });
      
      // If we need to move a fresh Don't Come bet
      if (moveFreshDontComeBet) {
        // Create a new don't come point bet for the same number
        nextDontComePoints[freshDontComeBetKey] = total;
        addResult(`Don't Come bet of $${freshDontComeBetAmount} moved to ${total}`);
        
        // Mark 'dont-come' for removal since we're moving it
        betsToRemove.push('dont-come');
      }

      if (total === point) {
        // Point Hit!
        nextPoint = null; // Point goes off
        // Pass Line wins
        if (activeBets['pass-line']) {
          handlePassLineWin(activeBets['pass-line'], `Made point ${point}! `);
          betsToKeep.push('pass-line'); // Bet STAYS after hitting point
        }
        // Don't Pass loses
        if (activeBets['dont-pass']) {
          handleLoss('dont-pass', activeBets['dont-pass']);
          // betsToRemove handled by handleLoss
        }
        // Place Bet on the point wins
        const placeBetType = `place-${point}`;
        if (activeBets[placeBetType]) {
          const betAmount = activeBets[placeBetType];
          const payoutMultiplier = PLACE_BET_PAYOUTS[point];
          const profit = Math.floor(betAmount * payoutMultiplier * 100) / 100;
          // Place bets stay on the table, so don't return the original bet
          handleStandardWin(placeBetType, betAmount, profit, false);
          updateQuestProgress('place-bet-master', 1);
          updateQuestProgress('place-bet-expert', 1, point); // Pass winning number
          betsToKeep.push(placeBetType); // Place bets stay ON unless turned off
        }
        // Other Place Bets remain
        Object.keys(activeBets)
          .filter(bet => bet.startsWith('place-') && bet !== placeBetType)
          .forEach(bet => betsToKeep.push(bet));

      } else if (total === 7) {
        // Seven Out!
        nextPoint = null; // Point goes off
        addResult(`Seven out!`);
        // Pass Line loses
        if (activeBets['pass-line']) {
          handleLoss('pass-line', activeBets['pass-line']);
        }
        // Don't Pass wins
        if (activeBets['dont-pass']) {
          // 1:1 payout
          handleDontPassBetWin(activeBets['dont-pass']);
          betsToRemove.push('dont-pass'); // Bet comes down
        }
        // All Place Bets lose
        Object.keys(activeBets)
          .filter(bet => bet.startsWith('place-'))
          .forEach(bet => {
            handleLoss(bet, activeBets[bet]);
          });
        
        // Come bet loses on a 7 during point phase
        if (activeBets['come']) {
          handleLoss('come', activeBets['come']);
        }
        
        // Don't Come bet wins on a 7 during point phase
        if (activeBets['dont-come']) {
          // 1:1 payout
          handleDontComeBetWin(activeBets['dont-come']);
          betsToRemove.push('dont-come');
        }
        
        // betsToRemove handled by handleLoss

      } else {
        // Roll is not point or 7 - Place bets might win/lose
        nextPoint = point; // Point stays ON
        const placeBetType = `place-${total}`;
        if (activeBets[placeBetType]) {
           // Place bet on the rolled number wins
           const betAmount = activeBets[placeBetType];
           const payoutMultiplier = PLACE_BET_PAYOUTS[total];
           const profit = Math.floor(betAmount * payoutMultiplier * 100) / 100;
           // Place bets stay on the table, so don't return the original bet
           handleStandardWin(placeBetType, betAmount, profit, false);
           updateQuestProgress('place-bet-master', 1);
           updateQuestProgress('place-bet-expert', 1, total); // Pass winning number
           betsToKeep.push(placeBetType); // Place bets stay ON
        }
         // Keep other Place bets, Pass Line, Don't Pass
         Object.keys(activeBets)
           .filter(bet => bet !== placeBetType && (bet.startsWith('place-') || bet === 'pass-line' || bet === 'dont-pass'))
           .forEach(bet => betsToKeep.push(bet));
      }
    }

    // --- Handle Field Bet (Always resolved) ---
    if (activeBets['field']) {
      const betAmount = activeBets['field'];
      if (FIELD_BET_PAYOUTS[total] !== undefined) {
        const payoutMultiplier = FIELD_BET_PAYOUTS[total];
        const profit = betAmount * payoutMultiplier;
        const oddsMsg = payoutMultiplier > 1 ? ` (${payoutMultiplier}:1 on ${total})` : '';
        addResult(`Won $${profit.toFixed(2)} on Field${oddsMsg}`);
        setBankroll(prev => prev + betAmount + profit); // Return bet + profit
        setStreak(prev => prev + 1);
        setTotalWins(prev => prev + 1);
        setLossStreak(0); // Reset loss streak on win
        setTotalWinnings(prev => prev + profit);
        updateQuestProgress('field-bet-master', 1);
        // First win check (could be refactored into handleStandardWin later)
        if (!hasWonFirstBet) setHasWonFirstBet(true); // Simplified first win check
      } else {
        // Field loses on 5, 6, 7, 8
        addResult(`Lost $${betAmount.toFixed(2)} on Field`);
        setStreak(0);
        setLossStreak(prev => {
          const newLossStreak = prev + 1;
          // Update highest loss streak if current loss streak is higher
          setHighestLossStreak(current => Math.max(current, newLossStreak));
          return newLossStreak;
        });
        // Bankroll already reduced
      }
      betsToRemove.push('field'); // Field is always a one-roll bet
    }

    // --- Update State based on resolution ---
    setPoint(nextPoint);
    setComePoints(nextComePoints);
    setDontComePoints(nextDontComePoints);

    // Update Active Bets: Remove losers/resolved winners, keep others
    setActiveBets(prev => {
        const newBets = { ...prev };
        // First, remove all bets marked for removal
        betsToRemove.forEach(bet => delete newBets[bet]);
        // Then, ensure bets marked to keep are still present (handles cases where handleLoss might have removed them)
        // This is a bit belt-and-suspenders, might simplify later.
        betsToKeep.forEach(bet => {
            if (prev[bet] && !newBets[bet]) { // If it was present before but removed by handleLoss, add it back
               newBets[bet] = prev[bet];
            }
        });
        
        // Add the fresh Come bet to its new point if needed
        if (moveFreshComeBet && freshComeBetKey) {
            newBets[freshComeBetKey] = freshComeBetAmount;
        }
        
        // Add the fresh Don't Come bet to its new point if needed
        if (moveFreshDontComeBet && freshDontComeBetKey) {
            newBets[freshDontComeBetKey] = freshDontComeBetAmount;
        }
        
        // Filter out any potential zero/undefined bets just in case
        Object.keys(newBets).forEach(key => {
            if (!newBets[key] || newBets[key] <= 0) {
                delete newBets[key];
            }
        });
        return newBets;
    });
  };


  // Function to roll the dice - Uses resolveRollOutcome
  const rollDice = () => {
    if (isRolling || getTotalBets() === 0) return;

    setIsRolling(true);
    setTotalRolls(prev => prev + 1);

    const die1Duration = 0.5 + Math.random() * 0.5;
    const die2Duration = 0.5 + Math.random() * 0.5;
    animationDurations.current = [die1Duration, die2Duration];

    setTimeout(() => {
      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      const total = die1 + die2;

      setDice([die1, die2]);
      setIsRolling(false);
      addResult(`Rolled ${die1} + ${die2} = ${total}`);

      // Resolve the outcome using the refactored function
      resolveRollOutcome(total);

    }, Math.max(...animationDurations.current) * 1000);
  };

  // Cheat function to set dice - Uses resolveRollOutcome
  const handleSetDice = (die1: number, die2: number) => {
    if (isRolling) return; // Prevent overlap if already rolling

    const total = die1 + die2;
    setDice([die1, die2]);
    addResult(`🧪 CHEAT: Dice set to ${die1}-${die2} (${total})`);

    // Resolve the outcome using the refactored function
    resolveRollOutcome(total);
  };
  // --- End Refactored Roll Resolution Logic ---


  // Add the cheat functions (Keep as is)
  const addCheatMoney = (amount: number) => { setBankroll(prev => prev + amount); addResult(`🧪 CHEAT: Added $${amount}!`); };
  const handleUnlockAll = () => {
    setUnlockedBets({
      'pass-line': true, 'dont-pass': true, 'field': true,
      'place-4': true, 'place-5': true, 'place-6': true, 'place-8': true, 'place-9': true, 'place-10': true,
      'come': true, 'dont-come': true
    });
    addResult("🧪 CHEAT: Unlocked all bets!");
   };

  // Simple quest functions (Keep as is for now, but completion logic might need review)
  // Refactored Cheat Function: completeQuest - Relies on useEffect for side effects
  const completeQuest = (questId: string) => {
    if (questId === 'all') {
      setQuests(prevQuests => prevQuests.map(quest =>
        quest.unlocked && !quest.completed
          ? { ...quest, progress: quest.goal, completed: true }
          : quest
      ));
      addResult(`🧪 CHEAT: Triggered completion for all unlocked quests! (Rewards/unlocks handled by effect)`);
      return;
    }

    setQuests(prevQuests => prevQuests.map(quest => {
      if (quest.id === questId && quest.unlocked && !quest.completed) {
        // Directly mark as completed. The useEffect will handle side effects.
        return { ...quest, progress: quest.goal, completed: true };
      }
      return quest;
    }));
    addResult(`🧪 CHEAT: Triggered completion for quest: ${questId}! (Rewards/unlocks handled by effect)`);
  };

  // Refactored Cheat Function: unlockQuest (no side effects needed here)
  const unlockQuest = (questId: string) => {
     if (questId === 'all') {
       setQuests(prevQuests => prevQuests.map(quest => !quest.unlocked ? { ...quest, unlocked: true } : quest));
       addResult(`🧪 CHEAT: Unlocked all quests!`);
       return;
      }
      setQuests(prevQuests => prevQuests.map(quest => {
        if (quest.id === questId && !quest.unlocked) {
          addResult(`🧪 CHEAT: Unlocked quest: ${quest.name}`);
          return { ...quest, unlocked: true };
        }
        return quest;
      }));
   };

  // Wipe all progress function
  const handleWipeProgress = () => {
    // Reset all game state to initial values
    setBankroll(100);
    setDice([1, 1]);
    setPoint(null);
    setResults([]);
    setPassiveIncome(1);
    setTotalWinnings(0);
    setActiveBets({});
    setUnlockedBets({ 'pass-line': true });
    setSelectedChip(5);
    setComePoints({});
    setDontComePoints({});
    setPlaceBetExpertWins(new Set());
    setUnlockedChips([1, 5, 10]);
    setLastSaveTime(null);
    setShowTutorial(true);
    setCompletedTutorial(false);
    setCurrentTutorialStep(0);
    setUnlockedTutorials(['basics']);
    setShowQuestTutorial(false);
    setCurrentQuestTutorial(null);
    setStreak(0);
    setHighestStreak(0);
    setLossStreak(0);
    setHighestLossStreak(0);
    setTotalRolls(0);
    setTotalWins(0);
    setHasWonFirstBet(false);
    setAchievements(ACHIEVEMENTS);
    setUpgradeCount(0);
    
    // Reset quests to initial state
    setQuests(prevQuests => prevQuests.map(quest => ({
      ...quest,
      progress: 0,
      completed: false,
      unlocked: quest.id === 'pass-line-master' ? false : false
    })));
    
    addResult("🧪 CHEAT: All progress has been wiped! Game reset to initial state.");
    
    // Save the wiped state
    setTimeout(() => {
      handleSaveState();
    }, 500);
  };

  // Tutorial handlers (Keep as is)
  const handleTutorialComplete = () => { setShowTutorial(false); setCompletedTutorial(true); addResult("🏆 Tutorial completed!"); };
  const handleSelectTutorial = (tutorialId: string) => {
     setShowTutorialSelector(false);
     
     // Handle basic tutorials that use the Tutorial component
     if (tutorialId === 'basics') {
       setCurrentTutorialStep(0);
       setShowTutorial(true);
       return;
     }
     else if (tutorialId === 'first-win') {
       setCurrentTutorialStep(7);
       setShowTutorial(true);
       return;
     }
     
     // Handle quest tutorials that use the QuestTutorial component
     const questTutorialIds = [
       'place-bets-unlocked', 'field-bets-unlocked', 'field-bet-master-completed',
       'upgrade-menu-unlocked', 'place-bet-statistics', 'come-bets',
       'dont-come-bets', 'dont-come-bet-master', 'dont-pass-bet-master'
     ];
     
     if (questTutorialIds.includes(tutorialId)) {
       setCurrentQuestTutorial(tutorialId);
       setShowQuestTutorial(true);
       return;
     }
     
     // Fallback for any other tutorial types
     addResult(`Viewing tutorial: ${tutorialId}`);
  };
  useEffect(() => {
     if (hasWonFirstBet && !unlockedTutorials.includes('first-win')) { setUnlockedTutorials(prev => [...prev, 'first-win']); }
     quests.forEach(quest => { if (quest.completed && quest.unlockTutorial && !unlockedTutorials.includes(quest.unlockTutorial)) { setUnlockedTutorials(prev => [...prev, quest.unlockTutorial!]); } });
   }, [hasWonFirstBet, quests, unlockedTutorials]);
   
 // Space bar shortcut for rolling dice
 useEffect(() => {
   const handleKeyDown = (event: KeyboardEvent) => {
     // Check if the pressed key is the space bar
     if (event.code === 'Space' || event.key === ' ') {
       // Prevent default space bar behavior (like scrolling the page)
       event.preventDefault();
       
       // Only roll if not already rolling and there are active bets
       if (!isRolling && getTotalBets() > 0) {
         rollDice();
       }
     }
   };

   // Add event listener
   window.addEventListener('keydown', handleKeyDown);

   // Clean up event listener on component unmount
   return () => {
     window.removeEventListener('keydown', handleKeyDown);
   };
 }, [isRolling, getTotalBets]);
   
 const tutorialTopics: TutorialTopic[] = [
     { id: 'basics', title: 'Craps Basics', description: 'Learn the fundamentals...' },
     { id: 'first-win', title: 'First Win', description: 'Congrats! Access Pass Line Master quest.' },
     { id: 'place-bets-unlocked', title: 'Place Bets Unlocked!', description: 'Use Place bets.' },
     { id: 'field-bets-unlocked', title: 'Field Bets Unlocked!', description: 'Use the Field bet.' },
     { id: 'upgrade-menu-unlocked', title: 'Upgrade Menu Unlocked!', description: 'Enhance betting options.' },
     { id: 'place-bet-statistics', title: 'Place Bet Statistics', description: 'Odds and payouts.' },
     { id: 'come-bets', title: 'Come Bets', description: 'Advanced betting...' },
     { id: 'dont-come-bets', title: 'Don\'t Come Bets', description: 'Opposite of Come bets.' },
     { id: 'dont-come-bet-master', title: 'Don\'t Come Bet Master', description: 'Master the Don\'t Come bet.' },
     { id: 'dont-pass-bet-master', title: 'Don\'t Pass Bet Master', description: 'Master the Don\'t Pass bet.' }
   ];
  const handleQuestTutorialComplete = () => { setShowQuestTutorial(false); setCurrentQuestTutorial(null); };

  // Handle Come bets
  const handleComeBetWin = (betAmount: number) => {
    const profit = betAmount; // Come bet pays 1:1
    handleStandardWin('come', betAmount, profit);
    updateQuestProgress('come-bet-master', 1);
  };
  
  // Handle Don't Come bets
  const handleDontComeBetWin = (betAmount: number) => {
    const profit = betAmount; // Don't Come bet pays 1:1
    handleStandardWin('dont-come', betAmount, profit);
    updateQuestProgress('dont-come-bet-master', 1);
  };
  
  // Handle Don't Pass bets
  const handleDontPassBetWin = (betAmount: number) => {
    const profit = betAmount; // Don't Pass bet pays 1:1
    handleStandardWin('dont-pass', betAmount, profit);
    updateQuestProgress('dont-pass-bet-master', 1);
  };


  // --- JSX Structure ---
  const fieldBetMasterCompleted = isQuestCompleted('field-bet-master');
  const { width, height } = useWindowSize(); // Get window dimensions for confetti

  return (
    <div className="game-container">
      {/* Confetti Overlay */}
      {showConfetti && <ReactConfetti width={width} height={height} recycle={false} numberOfPieces={200} />}

      {/* Tutorial Components */}
      <Tutorial isVisible={showTutorial} onComplete={handleTutorialComplete} currentStep={currentTutorialStep} />
      <TutorialSelector isVisible={showTutorialSelector} onClose={() => setShowTutorialSelector(false)} onSelectTutorial={handleSelectTutorial} topics={tutorialTopics.filter(topic => unlockedTutorials.includes(topic.id))} />
      {showQuestTutorial && currentQuestTutorial && <QuestTutorial isVisible={showQuestTutorial} questId={currentQuestTutorial} onComplete={handleQuestTutorialComplete} />}

      <div className="game-content">
        <div className="left-panel">
          {/* Title & Account */}
          <div className="title-container">
            <h1>Idle Craps</h1>
            <AccountSystem onLogin={handleLogin} onLogout={handleLogout} onSaveState={handleSaveState} isLoggedIn={isLoggedIn} currentUser={currentUser} isAdmin={isAdmin} lastSaveTime={lastSaveTime} />
            {isLoggedIn && isAdmin && <AdminPanel currentUser={currentUser} />}
          </div>

          {/* Tutorial Button */}
          <button className="tutorial-button" onClick={toggleTutorialSelector}><FaQuestion /> Tutorial</button>

          {/* Bankroll Section */}
          <div className="bankroll-section">
            <div className="bankroll-title">Your bankroll</div>
            <div className="bankroll-value">{formatNumber(bankroll)}</div>
            <div className="passive-income">
              <div className="income-header">
                <div className="income-title">Passive Income</div>
                <div className="income-value">{formatNumber(passiveIncome)} / {TickSpeed/1000}s</div>
              </div>
              {/* Progress bar removed */}
            </div>
            <div className="stats-buttons">
              <button className="stats-button" onClick={() => setShowStatsOverlay(true)}><FaCoins /> View Stats</button>
              <button className="stats-button leaderboard-button" onClick={() => setShowLeaderboard(!showLeaderboard)}><FaListOl /> {showLeaderboard ? "Hide" : "Leaderboard"}</button>
            </div>
          </div>

          {/* Info Section (Dice, Point, Roll Button, etc.) */}
          <div className="info-section">
            <div className="dice-container">
              <div className={`die ${isRolling ? 'rolling' : ''}`} style={{ animationDuration: `${animationDurations.current[0]}s` }}>{DICE_FACES[dice[0]]}</div>
              <div className={`die ${isRolling ? 'rolling' : ''}`} style={{ animationDuration: `${animationDurations.current[1]}s` }}>{DICE_FACES[dice[1]]}</div>
            </div>
            {point && <div className="point-value">Point: {point}</div>}
            <div className="streaks-container">{streak > 0 && <div className="streak-counter"><FaFire className="streak-icon" /> {streak} Win Streak</div>}</div>
            <button className="roll-button" onClick={rollDice} disabled={isRolling || getTotalBets() === 0}>Roll Dice</button>

            {/* Viral & Panel Buttons */}
            <div className="viral-buttons">
              <button className="viral-button share-button" onClick={shareGame}><FaShareAlt /> Share</button>
              <button className="viral-button achievement-button" onClick={() => setShowAchievements(!showAchievements)}><FaTrophy /> {showAchievements ? "Hide" : "Achievements"}</button>
              {isAdmin && <button className="viral-button cheat-button" onClick={() => setShowCheatTerminal(true)}><FaTerminal /> Cheat Terminal</button>}
            </div>
            <div className="panel-buttons">
               {/* Upgrades Button: Locked until Field Bet Master is complete */}
               <button
                 className={`toggle-panel-button upgrades-button ${!fieldBetMasterCompleted ? 'locked' : ''}`}
                 onClick={() => {
                   if (fieldBetMasterCompleted) {
                     if (!showUpgrades && showQuests) setShowQuests(false); // Close quests if opening upgrades
                     setShowUpgrades(!showUpgrades);
                   } else {
                     addResult("Complete 'Field Bet Master' quest to unlock Upgrades.");
                   }
                 }}
                 disabled={!fieldBetMasterCompleted}
                 title={!fieldBetMasterCompleted ? "Complete 'Field Bet Master' quest first" : (showUpgrades ? "Hide Upgrades" : "Show Upgrades")}
               >
                 {!fieldBetMasterCompleted && <div className="lock-icon"><FaLock /></div>}
                 {showUpgrades ? 'Hide Upgrades' : 'Show Upgrades'}
               </button>

               {/* Quests Button: Locked until first win */}
               <button
                 className={`toggle-panel-button quests-button ${!hasWonFirstBet ? 'locked' : ''}`}
                 onClick={() => {
                   if (hasWonFirstBet) {
                     if (!showQuests && showUpgrades) setShowUpgrades(false); // Close upgrades if opening quests
                     setShowQuests(!showQuests);
                   }
                 }}
                 disabled={!hasWonFirstBet}
                 title={!hasWonFirstBet ? "Win your first bet to unlock Quests" : (showQuests ? "Hide Quests" : "Show Quests")}
               >
                 {!hasWonFirstBet && <div className="lock-icon"><FaLock /></div>}
                 {showQuests ? 'Hide Quests' : 'Show Quests'}
               </button>
            </div>

            {/* Achievements Panel */}
            {showAchievements && (
              <div className="achievements-panel">
                <h3>Achievements</h3>
                <div className="achievements-list">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className={`achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
                      <div className="achievement-icon">{achievement.icon}</div>
                      <div className="achievement-details">
                        <div className="achievement-name">{achievement.name}</div>
                        <div className="achievement-description">{achievement.description}</div>
                        {achievement.unlocked ? <div className="achievement-status completed">Completed</div> : (
                          <>
                            <div className="achievement-status">Reward: ${achievement.reward}</div>
                            <div className="achievement-progress-container"><div className="achievement-progress-bar" style={{ width: `${getAchievementProgress(achievement.id) * 100}%` }}></div></div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Content (Table, Quests Panel) */}
        <div className="right-content">
          <RealisticCrapsTable point={point} lastRoll={dice} onBet={placeBet} onRemoveBet={removeBet} activeBets={activeBets} unlockedBets={unlockedBets} comePoints={comePoints} dontComePoints={dontComePoints} selectedChip={selectedChip} />
          {/* Render Quests Panel */}
          {showQuests && <Quests quests={quests.filter(quest => quest.unlocked || quest.completed)} onClose={() => setShowQuests(false)} />}
          {/* Render Upgrades Panel */}
          {showUpgrades && fieldBetMasterCompleted && (
            <Upgrades
              unlockedBets={unlockedBets}
              unlockedChips={unlockedChips}
              unlockBet={unlockBet}
              unlockChip={unlockChip}
              onClose={() => setShowUpgrades(false)}
            />
          )}

          {/* Bottom Controls (Chips, Results) */}
          <div className="bottom-controls">
              <div className="chip-selection-section">
                <div className="info-title">Select Chip</div>
                <div className="chip-selector">
                  {/* Only show chips that are unlocked */}
                  {unlockedChips.map(value => (
                    <div
                      key={value}
                      className={`chip value-${value} ${selectedChip === value ? 'selected' : ''}`}
                      onClick={() => setSelectedChip(value)}
                    >
                      ${value}
                    </div>
                  ))}
                </div>
                <div className="selected-chip-info">Selected bet: ${selectedChip}</div>
              </div>
              <div className="results-panel">
              <div className="results-title clickable" onClick={() => setShowResultsHistory(true)}>Recent Results</div>
              <div className="results">
                {results.length > 0 ? results.map((result, index) => <div key={index} className={`result ${result.includes('Won') ? 'win' : result.includes('Lost') ? 'loss' : ''}`}>{result}</div>) : <div className="result">Place a bet and roll!</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlays (Results History, Stats, Cheat Terminal) */}
      {showResultsHistory && (
        <div className="results-history-overlay">
          <div className="results-history-panel">
            <div className="results-history-header"><h3>Results History</h3><button className="close-button" onClick={() => setShowResultsHistory(false)}><FaTimes /></button></div>
            <div className="results-history-list">
              {allResults.map((result, index) => (
                <div key={index} className={`history-result ${
                  result.includes('Won') ? 'win' :
                  result.includes('Lost') ? 'loss' :
                  result.includes('Quest') || result.includes('completed') ? 'quest' :
                  result.includes('Achievement') ? 'achievement' : ''
                }`}>
                  {result}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showStatsOverlay && (
         <div className="stats-overlay">
           <div className="stats-panel">
             <div className="stats-header"><h3>Game Statistics</h3><button className="close-button" onClick={() => setShowStatsOverlay(false)}><FaTimes /></button></div>
             <div className="stats-content">
               <div className="stat-item"><div className="stat-label">Total Profit:</div><div className="stat-value">{formatNumber(totalWinnings)}</div></div>
               <div className="stat-item"><div className="stat-label">Total Rolls:</div><div className="stat-value">{totalRolls}</div></div>
               <div className="stat-item"><div className="stat-label">Total Wins:</div><div className="stat-value">{totalWins}</div></div>
               <div className="stat-item"><div className="stat-label">Win Percentage:</div><div className="stat-value">{totalRolls > 0 ? ((totalWins / totalRolls) * 100).toFixed(1) : 0}%</div></div>
               <div className="stat-item"><div className="stat-label">Current Win Streak:</div><div className="stat-value">{streak}</div></div>
               <div className="stat-item"><div className="stat-label">Highest Win Streak:</div><div className="stat-value">{highestStreak}</div></div>
               <div className="stat-item"><div className="stat-label">Current Loss Streak:</div><div className="stat-value">{lossStreak}</div></div>
               <div className="stat-item"><div className="stat-label">Highest Loss Streak:</div><div className="stat-value">{highestLossStreak}</div></div>
               <div className="stat-item"><div className="stat-label">Passive Income Rate:</div><div className="stat-value">{formatNumber(passiveIncome)}/{TickSpeed/1000}s</div><div className="stat-note">(~1% of Global Winnings)</div></div>
             </div>
             <div className="stats-footer"><button className="exit-button" onClick={() => setShowStatsOverlay(false)}>Close</button></div>
           </div>
         </div>
      )}
      {showCheatTerminal && <CheatTerminal onClose={() => setShowCheatTerminal(false)} onSetDice={handleSetDice} onAddMoney={addCheatMoney} onUnlockAll={handleUnlockAll} onCompleteQuest={completeQuest} onUnlockQuest={unlockQuest} onWipeProgress={handleWipeProgress} quests={quests} />}
      
      {/* Leaderboard Overlay */}
      {showLeaderboard && (
        <div className="leaderboard-overlay">
          <div className="leaderboard-panel">
            <div className="leaderboard-header">
              <h3>Leaderboard</h3>
              <button className="close-button" onClick={() => setShowLeaderboard(false)}><FaTimes /></button>
            </div>
            <div className="leaderboard-content">
              <Leaderboard ref={leaderboardRef} />
            </div>
            <div className="leaderboard-footer">
              <button className="exit-button" onClick={() => setShowLeaderboard(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
