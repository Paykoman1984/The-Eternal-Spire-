import React, { useState, useCallback, useEffect } from 'react';
import type { GameScreen, Player, PlayerClass, RunState, CombatLog, Equipment, GearSlot, Achievement } from './types';
import { generateEnemy } from './utils/combat';
import { generateLoot } from './utils/loot';
import { generateShopInventory } from './utils/shop';
import { recalculatePlayerStats } from './utils/stats';
import { ACHIEVEMENTS } from './data/achievements';
import StartScreen from './components/screens/StartScreen';
import ClassSelectionScreen from './components/screens/ClassSelectionScreen';
import MainGameScreen from './components/screens/MainGameScreen';
import CombatScreen from './components/screens/CombatScreen';
import ShopScreen from './components/screens/ShopScreen';
import AchievementsScreen from './components/screens/AchievementsScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import RunSummaryScreen from './components/screens/RunSummaryScreen';

const PROFILES_STORAGE_KEY = 'eternal_spire_profiles';

const App: React.FC = () => {
  const [gameScreen, setGameScreen] = useState<GameScreen>('start');
  
  // Load profiles from localStorage once on initial component load using a lazy initializer.
  const [profiles, setProfiles] = useState<(Player | null)[]>(() => {
    try {
        const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
        if (savedProfiles) {
            const parsedProfiles = JSON.parse(savedProfiles);
            if (Array.isArray(parsedProfiles) && (parsedProfiles.length === 2)) {
                return parsedProfiles;
            }
        }
    } catch (error) {
        console.error("Failed to load profiles:", error);
    }
    return [null, null]; // Default if nothing is saved or data is invalid
  });

  const [activeProfileIndex, setActiveProfileIndex] = useState<number | null>(null);
  const [runState, setRunState] = useState<RunState | null>(null);
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([]);

  // Effect to automatically save profiles to localStorage whenever they change.
  useEffect(() => {
      try {
          localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      } catch (error) {
          console.error("Failed to save profiles:", error);
      }
  }, [profiles]);


  const updateCurrentPlayer = useCallback((updater: (player: Player) => Player) => {
    if (activeProfileIndex === null) return;
    
    setProfiles(currentProfiles => {
        const newProfiles = [...currentProfiles];
        const currentPlayer = newProfiles[activeProfileIndex];
        if (currentPlayer) {
            newProfiles[activeProfileIndex] = updater(currentPlayer);
        }
        return newProfiles;
    });
  }, [activeProfileIndex]);

  const addLog = (message: string, color: CombatLog['color']) => {
    setCombatLogs(prev => [...prev, { id: Date.now() + Math.random(), message, color }]);
  };

  const handleStartGame = useCallback(() => {
    setGameScreen('profile_selection');
  }, []);

  const handleLoadProfile = useCallback((index: number) => {
    if (profiles[index]) {
      setActiveProfileIndex(index);
      setGameScreen('main_game');
    }
  }, [profiles]);
  
  const handleStartNewGameInSlot = useCallback((index: number) => {
    setActiveProfileIndex(index);
    setGameScreen('class_selection');
  }, []);

  const handleDeleteProfile = useCallback((index: number) => {
    // No window.confirm here, relying on UI confirmation
    setProfiles(currentProfiles => {
      const newProfiles = [...currentProfiles];
      newProfiles[index] = null;
      return newProfiles;
    });
  }, []);

  const handleClassSelect = useCallback((selectedClass: PlayerClass) => {
    if (activeProfileIndex === null) return;

    const baseStats = { ...selectedClass.baseStats };
    const startingEquipment: Partial<Record<GearSlot, Equipment>> = {};
    let startingWeapon: Equipment | null = null;

    if (selectedClass.name === 'Warrior') {
        startingWeapon = { name: 'Dusty Sword', slot: 'Weapon', icon: '⚔️', stats: { str: 1 } };
    } else if (selectedClass.name === 'Rogue') {
        startingWeapon = { name: 'Rusty Dagger', slot: 'Weapon', icon: '🔪', stats: { dex: 1 } };
    } else if (selectedClass.name === 'Mage') {
        startingWeapon = { name: 'Rusty Staff', slot: 'Weapon', icon: '🪄', stats: { int: 1 } };
    }
    
    if (startingWeapon) {
        startingEquipment.Weapon = startingWeapon;
    }

    const initialPlayer: Player = {
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      classInfo: selectedClass,
      baseStats: baseStats,
      currentStats: { ...baseStats },
      accountBuffs: {},
      currentHp: baseStats.maxHp,
      eternalShards: 0,
      potionCount: 1,
      equipment: startingEquipment,
      shopInventory: [],
      lastShopRefreshLevel: 1,
      achievementProgress: {},
      claimedAchievements: [],
      maxFloorReached: 0,
    };
    
    const finalPlayer = recalculatePlayerStats(initialPlayer);
    finalPlayer.currentHp = finalPlayer.currentStats.maxHp;

    setProfiles(currentProfiles => {
      const newProfiles = [...currentProfiles];
      newProfiles[activeProfileIndex] = finalPlayer;
      return newProfiles;
    });
    setGameScreen('main_game');
  }, [activeProfileIndex]);
  
  const handleAccountLevelUp = useCallback((currentPlayer: Player): Player => {
      let updatedPlayer = { ...currentPlayer };
      const levelBeforeUpdate = updatedPlayer.level;

      while (updatedPlayer.xp >= updatedPlayer.xpToNextLevel) {
          updatedPlayer.xp -= updatedPlayer.xpToNextLevel;
          updatedPlayer.level += 1;
          updatedPlayer.xpToNextLevel = Math.floor(updatedPlayer.xpToNextLevel * 1.5);
          updatedPlayer.baseStats.maxHp += 10;
          updatedPlayer.baseStats.str += 1;
          updatedPlayer.baseStats.dex += 1;
          updatedPlayer.baseStats.int += 1;
          updatedPlayer.baseStats.defense += 1;
      }

      updatedPlayer = recalculatePlayerStats(updatedPlayer);

      if (Math.floor(updatedPlayer.level / 5) > Math.floor(levelBeforeUpdate / 5)) {
          if (updatedPlayer.level > updatedPlayer.lastShopRefreshLevel) {
              updatedPlayer.shopInventory = generateShopInventory(updatedPlayer);
              updatedPlayer.lastShopRefreshLevel = updatedPlayer.level;
          }
      }
      
      return updatedPlayer;
  }, []);

  // Actual logic to apply rewards and clear state
  const handleCloseSummary = useCallback(() => {
    if (!runState || activeProfileIndex === null) return;

    updateCurrentPlayer(player => {
        let updatedPlayer = { ...player, xp: player.xp + runState.runXp };
        updatedPlayer = handleAccountLevelUp(updatedPlayer);
        updatedPlayer.currentHp = updatedPlayer.currentStats.maxHp;
        return updatedPlayer;
    });

    setRunState(null);
    setCombatLogs([]);
    setGameScreen('main_game');
  }, [runState, activeProfileIndex, handleAccountLevelUp, updateCurrentPlayer]);

  const updateAchievementProgress = useCallback((playerState: Player, runState: RunState, type: 'slay' | 'reach_floor', value: string | number): Player => {
      const newPlayer = { ...playerState };
      
      ACHIEVEMENTS.forEach(ach => {
          if (ach.type === 'slay' && type === 'slay' && ach.targetId === value) {
              const currentProgress = newPlayer.achievementProgress[ach.id] || 0;
              newPlayer.achievementProgress[ach.id] = currentProgress + 1;
          } else if (ach.type === 'reach_floor' && type === 'reach_floor') {
              const floor = value as number;
              const currentProgress = newPlayer.achievementProgress[ach.id] || 0;
              if (floor > currentProgress) {
                  newPlayer.achievementProgress[ach.id] = floor;
              }
          }
      });

      return newPlayer;
  }, []);

  const handleEnterSpire = useCallback(() => {
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer) return;

    const initialEnemy = generateEnemy(1);
    setRunState({
      floor: 1,
      runLevel: 1,
      runXp: 0,
      runXpToNextLevel: 50,
      playerCurrentHpInRun: activePlayer.currentStats.maxHp,
      currentEnemy: initialEnemy,
      pendingLoot: null,
      enemiesKilled: 0,
      shardsEarned: 0,
    });
    setCombatLogs([]);
    addLog(`You enter the Spire. A ${initialEnemy.name} appears!`, 'text-slate-200');
    setGameScreen('combat');
  }, [activeProfileIndex, profiles]);

  const advanceToNextFloor = useCallback(() => {
    setRunState(prevRunState => {
        if (!prevRunState) return null;
        
        const nextFloor = prevRunState.floor + 1;

        updateCurrentPlayer(player => {
            let newPlayer = { ...player };
            if (nextFloor > newPlayer.maxFloorReached) {
                newPlayer.maxFloorReached = nextFloor;
            }
            newPlayer = updateAchievementProgress(newPlayer, prevRunState, 'reach_floor', nextFloor);
            return newPlayer;
        });

        const nextEnemy = generateEnemy(nextFloor);
        addLog(`You advance to Floor ${nextFloor}. A ${nextEnemy.name} appears!`, 'text-[#D6721C]');

        return {
            ...prevRunState,
            floor: nextFloor,
            currentEnemy: nextEnemy,
            pendingLoot: null,
        };
    });
  }, [updateCurrentPlayer, updateAchievementProgress]);

  const handleAttack = useCallback(() => {
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer || !runState || runState.pendingLoot) return;
  
    // We update local copies first, then commit to state
    let newRunState = { 
        ...runState, 
        currentEnemy: { ...runState.currentEnemy, stats: { ...runState.currentEnemy.stats } } 
    };
    let logs: { message: string, color: CombatLog['color'] }[] = [];
    let playerDefeated = false;
    let didPlayerLevelUpInRun = false;
    let lootDropped: Equipment | null = null;
  
    // --- Player Turn ---
    if (Math.random() * 100 < newRunState.currentEnemy.stats.evasion) {
        logs.push({ message: `The ${newRunState.currentEnemy.name} dodged your attack!`, color: 'text-red-400' });
    } else {
        const playerCrit = Math.random() * 100 < activePlayer.currentStats.critRate;
        const playerAttackStat = Math.max(activePlayer.currentStats.str, activePlayer.currentStats.dex, activePlayer.currentStats.int);
        let playerDamage = Math.max(1, playerAttackStat - newRunState.currentEnemy.stats.defense);
        if (playerCrit) playerDamage *= 2;
        playerDamage = Math.floor(playerDamage);
        newRunState.currentEnemy.stats.hp = Math.max(0, newRunState.currentEnemy.stats.hp - playerDamage);
        logs.push({ message: `You hit the ${newRunState.currentEnemy.name} for ${playerDamage} damage${playerCrit ? ' (CRIT!)' : ''}.`, color: playerCrit ? 'text-green-400' : 'text-slate-200' });
    }

    // --- Check Enemy Death ---
    if (newRunState.currentEnemy.stats.hp <= 0) {
      logs.push({ message: `You have defeated the ${newRunState.currentEnemy.name}!`, color: 'text-[#D6721C]' });
      newRunState.enemiesKilled += 1;
      
      // Calculate loot *before* updating state to avoid race conditions
      const loot = generateLoot(newRunState.floor);
      if (loot.equipment) {
          lootDropped = loot.equipment;
          newRunState.pendingLoot = loot.equipment;
          logs.push({ message: `The enemy dropped a piece of equipment: ${loot.equipment.name}!`, color: 'text-[#D6721C]' });
      }

      updateCurrentPlayer(player => {
          let playerAfterUpdate = { ...player };
          
          playerAfterUpdate = updateAchievementProgress(playerAfterUpdate, newRunState, 'slay', newRunState.currentEnemy.id);

          const xpGained = newRunState.currentEnemy.xpReward;
          newRunState.runXp += xpGained;
          logs.push({ message: `You gained ${xpGained} XP.`, color: 'text-[#D6721C]' });

          if (newRunState.runXp >= newRunState.runXpToNextLevel) {
              didPlayerLevelUpInRun = true;
              newRunState.runXp -= newRunState.runXpToNextLevel;
              newRunState.runLevel += 1;
              newRunState.runXpToNextLevel = Math.floor(newRunState.runXpToNextLevel * 1.8);
              
              playerAfterUpdate.baseStats.maxHp += 5;
              playerAfterUpdate.baseStats.str += 1;
              playerAfterUpdate.baseStats.dex += 1;
              playerAfterUpdate.baseStats.int += 1;

              playerAfterUpdate = recalculatePlayerStats(playerAfterUpdate);

              newRunState.playerCurrentHpInRun = playerAfterUpdate.currentStats.maxHp; 
              logs.push({ message: `You leveled up to Run Level ${newRunState.runLevel}! Your stats permanently increase and HP is restored.`, color: 'text-[#D6721C]' });
          }

          if (loot.shards > 0) {
              playerAfterUpdate.eternalShards += loot.shards;
              newRunState.shardsEarned += loot.shards;
              logs.push({ message: `The enemy dropped ${loot.shards} Eternal Shards.`, color: 'text-purple-400' });
          }
          if (loot.potions > 0) {
              const potionsGained = Math.min(loot.potions, 5 - playerAfterUpdate.potionCount);
              if (potionsGained > 0) {
                  playerAfterUpdate.potionCount += potionsGained;
                  logs.push({ message: `You found a Health Potion! You now have ${playerAfterUpdate.potionCount}.`, color: 'text-[#D6721C]' });
              }
          }

          return playerAfterUpdate;
      });
      
      // Only advance automatically if NO equipment dropped
      if (!lootDropped) {
          setTimeout(advanceToNextFloor, 1000);
      }

    } else { 
      // --- Enemy Turn (if still alive) ---
      if (Math.random() * 100 < activePlayer.currentStats.evasion) {
          logs.push({ message: `You dodged the ${newRunState.currentEnemy.name}'s attack!`, color: 'text-red-400' });
      } else {
          const playerDefense = didPlayerLevelUpInRun ? (profiles[activeProfileIndex!]!.currentStats.defense) : activePlayer.currentStats.defense;
          let enemyDamage = Math.max(1, newRunState.currentEnemy.stats.attack - playerDefense);
          enemyDamage = Math.floor(enemyDamage);
          newRunState.playerCurrentHpInRun = Math.max(0, newRunState.playerCurrentHpInRun - enemyDamage);
          logs.push({ message: `${newRunState.currentEnemy.name} hits you for ${enemyDamage} damage.`, color: 'text-slate-200' });
      }
  
      if (newRunState.playerCurrentHpInRun <= 0) {
        playerDefeated = true;
        logs.push({ message: `You have been defeated...`, color: 'text-[#D6721C]' });
      }
    }

    setCombatLogs(prev => [...prev, ...logs.map(log => ({...log, id: Date.now() + Math.random() * logs.indexOf(log)}))]);
    setRunState(newRunState);

    if (playerDefeated) {
      setTimeout(() => setGameScreen('run_summary'), 2000);
    }
  
  }, [activeProfileIndex, profiles, runState, advanceToNextFloor, updateAchievementProgress, updateCurrentPlayer]);

  const handleLootDecision = useCallback((equip: boolean) => {
    if (!runState || !runState.pendingLoot) return;

    const lootItem = runState.pendingLoot;
    if (equip) {
        updateCurrentPlayer(player => {
            let updatedPlayer = { ...player };
            const slot = lootItem.slot;
            
            updatedPlayer.equipment[slot] = lootItem;
            
            const oldMaxHp = updatedPlayer.currentStats.maxHp;
            updatedPlayer = recalculatePlayerStats(updatedPlayer);
            const newMaxHp = updatedPlayer.currentStats.maxHp;
            
            const hpDiff = newMaxHp - oldMaxHp;
            setRunState(prev => prev ? {...prev, playerCurrentHpInRun: Math.min(prev.playerCurrentHpInRun + hpDiff, newMaxHp)} : null);

            return updatedPlayer;
        });
        addLog(`You equipped ${lootItem.name}.`, 'text-slate-200');
    } else {
        addLog(`You discarded ${lootItem.name}.`, 'text-slate-200');
    }

    advanceToNextFloor();
  }, [runState, advanceToNextFloor, updateCurrentPlayer]);

  const handleUsePotion = useCallback(() => {
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer || !runState || runState.pendingLoot || activePlayer.potionCount <= 0 || runState.playerCurrentHpInRun >= activePlayer.currentStats.maxHp) return;

    let newRunState = { ...runState };
    let logs: { message: string, color: CombatLog['color'] }[] = [];
    let playerDefeated = false;
    const POTION_HEAL_PERCENT = 0.3;

    updateCurrentPlayer(player => ({ ...player, potionCount: player.potionCount - 1 }));

    const healAmount = Math.floor(activePlayer.currentStats.maxHp * POTION_HEAL_PERCENT);
    const oldHp = newRunState.playerCurrentHpInRun;
    newRunState.playerCurrentHpInRun = Math.min(activePlayer.currentStats.maxHp, newRunState.playerCurrentHpInRun + healAmount);
    const actualHeal = newRunState.playerCurrentHpInRun - oldHp;
    logs.push({ message: `You used a Health Potion and restored ${actualHeal} HP.`, color: 'text-slate-200' });

    if (newRunState.currentEnemy.stats.hp > 0) {
      if (Math.random() * 100 < activePlayer.currentStats.evasion) {
          logs.push({ message: `You dodged the ${newRunState.currentEnemy.name}'s attack!`, color: 'text-red-400' });
      } else {
          let enemyDamage = Math.max(1, newRunState.currentEnemy.stats.attack - activePlayer.currentStats.defense);
          enemyDamage = Math.floor(enemyDamage);
          newRunState.playerCurrentHpInRun = Math.max(0, newRunState.playerCurrentHpInRun - enemyDamage);
          logs.push({ message: `${newRunState.currentEnemy.name} hits you for ${enemyDamage} damage.`, color: 'text-slate-200' });
      }
    
      if (newRunState.playerCurrentHpInRun <= 0) {
        playerDefeated = true;
        logs.push({ message: `You have been defeated...`, color: 'text-[#D6721C]' });
      }
    }

    setCombatLogs(prev => [...prev, ...logs.map(log => ({...log, id: Date.now() + Math.random() * logs.indexOf(log)}))]);
    setRunState(newRunState);

    if (playerDefeated) {
      setTimeout(() => setGameScreen('run_summary'), 2000);
    }
  }, [activeProfileIndex, profiles, runState, updateCurrentPlayer]);
  
  const handleExitToProfiles = useCallback(() => {
    setActiveProfileIndex(null);
    setRunState(null);
    setCombatLogs([]);
    setGameScreen('profile_selection');
  }, []);

  const handleEnterShop = useCallback(() => setGameScreen('shop'), []);
  const handleEnterAchievements = useCallback(() => setGameScreen('achievements'), []);
  const handleExitAchievements = useCallback(() => setGameScreen('main_game'), []);
  const handleExitShop = useCallback(() => setGameScreen('main_game'), []);

  const handleBuyPotion = useCallback(() => {
    updateCurrentPlayer(player => {
      const POTION_COST = 50;
      if (player.eternalShards >= POTION_COST && player.potionCount < 5) {
        return {
          ...player,
          eternalShards: player.eternalShards - POTION_COST,
          potionCount: player.potionCount + 1,
        };
      }
      return player;
    });
  }, [updateCurrentPlayer]);

  const handleBuyShopItem = useCallback((itemToBuy: Equipment) => {
    updateCurrentPlayer(player => {
      if (!itemToBuy.cost || player.eternalShards < itemToBuy.cost) return player;

      let updatedPlayer = { ...player };
      updatedPlayer.eternalShards -= itemToBuy.cost;
      updatedPlayer.equipment[itemToBuy.slot] = { ...itemToBuy };
      updatedPlayer.shopInventory = updatedPlayer.shopInventory.filter(item => item.name !== itemToBuy.name);
      
      const hpBefore = updatedPlayer.currentHp;
      const maxHpBefore = updatedPlayer.currentStats.maxHp;
      updatedPlayer = recalculatePlayerStats(updatedPlayer);
      
      const maxHpAfter = updatedPlayer.currentStats.maxHp;
      if (maxHpAfter !== maxHpBefore && maxHpBefore > 0) {
          const hpPercentage = hpBefore / maxHpBefore;
          updatedPlayer.currentHp = Math.round(maxHpAfter * hpPercentage);
      }
      updatedPlayer.currentHp = Math.min(updatedPlayer.currentHp, updatedPlayer.currentStats.maxHp);
      if (updatedPlayer.currentHp <= 0) updatedPlayer.currentHp = 1;

      return updatedPlayer;
    });
  }, [updateCurrentPlayer]);

  const handleClaimAchievement = useCallback((achievementId: string) => {
    updateCurrentPlayer(player => {
      const achievement = ACHIEVEMENTS.find(ach => ach.id === achievementId);
      if (!achievement || player.claimedAchievements.includes(achievementId) || achievement.isBuff) return player;
      let updatedPlayer = { ...player };
      updatedPlayer.eternalShards += achievement.rewards.shards || 0;
      updatedPlayer.potionCount = Math.min(5, updatedPlayer.potionCount + (achievement.rewards.potions || 0));
      updatedPlayer.claimedAchievements = [...updatedPlayer.claimedAchievements, achievementId];
      return updatedPlayer;
    });
  }, [updateCurrentPlayer]);

  const renderScreen = () => {
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;

    switch (gameScreen) {
      case 'start':
        return <StartScreen onStart={handleStartGame} />;
      case 'profile_selection':
        return <ProfileScreen 
          profiles={profiles}
          onLoadProfile={handleLoadProfile}
          onStartNewGame={handleStartNewGameInSlot}
          onDeleteProfile={handleDeleteProfile}
        />;
      case 'class_selection':
        return <ClassSelectionScreen onClassSelect={handleClassSelect} />;
      case 'main_game':
        if (activePlayer) {
          return <MainGameScreen 
            player={activePlayer} 
            onExitToProfiles={handleExitToProfiles} 
            onEnterSpire={handleEnterSpire}
            onEnterShop={handleEnterShop}
            onEnterAchievements={handleEnterAchievements}
          />;
        }
        break;
      case 'combat':
        if (activePlayer && runState) {
          return <CombatScreen 
            player={activePlayer} 
            runState={runState} 
            logs={combatLogs} 
            onAttack={handleAttack} 
            onFlee={() => setGameScreen('run_summary')} 
            onLootDecision={handleLootDecision}
            onUsePotion={handleUsePotion}
          />;
        }
        break;
      case 'shop':
        if (activePlayer) {
          return <ShopScreen
            player={activePlayer}
            onExit={handleExitShop}
            onBuyPotion={handleBuyPotion}
            onBuyShopItem={handleBuyShopItem}
          />;
        }
        break;
      case 'achievements':
        if (activePlayer) {
          return <AchievementsScreen
            player={activePlayer}
            achievements={ACHIEVEMENTS}
            onExit={handleExitAchievements}
            onClaim={handleClaimAchievement}
          />;
        }
        break;
      case 'run_summary':
        if (runState) {
          return <RunSummaryScreen
            runState={runState}
            onClose={handleCloseSummary}
          />;
        }
        break;
    }
    // Fallback to start screen if state is invalid
    setGameScreen('start');
    return <StartScreen onStart={handleStartGame} />;
  };

  return (
    <div className="min-h-screen bg-black/50 text-slate-200 flex items-center justify-center p-4 font-serif">
      <div className="w-full max-w-4xl mx-auto">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;