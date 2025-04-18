const handleSaveState = useCallback(() => {
    try {
      // Only save if user is logged in
      if (!isLoggedIn || !currentUser) {
        addResult("Please log in to save your game state.");
        return;
      }

      const gameState = {
        bankroll,
        passiveIncome,
        totalRolls,
        totalWins,
        totalWinnings,
        streak,
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

      // Save to API
      fetch('/api/gamestate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameState),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to save game state');
        }
        return response.json();
      })
      .then(data => {
        const now = new Date();
        setLastSaveTime(now);
        addResult(`Game state saved! (${now.toLocaleTimeString()})`);
        console.log("Saving game state:", gameState);
      })
      .catch(error => {
        console.error("Error saving game state:", error);
        addResult("Error saving game state.");
      });
    } catch (error) {
      console.error("Error preparing game state:", error);
      addResult("Error saving game state.");
    }
  }, [
    bankroll, passiveIncome, totalRolls, totalWins, totalWinnings, streak,
    unlockedBets, unlockedChips, achievements, placeBetExpertWins, quests,
    upgradeCount, hasWonFirstBet, completedTutorial, unlockedTutorials,
    isLoggedIn, currentUser, addResult
  ]); // Dependencies for useCallback
