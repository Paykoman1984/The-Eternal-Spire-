
import React, { useState, useCallback, useEffect } from 'react';
import type { GameScreen, Player, PlayerClass, RunState, CombatLog, Equipment, GearSlot, Achievement, Rarity } from './types';
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
import StatsScreen from './components/screens/StatsScreen';
import NameSelectionScreen from './components/screens/NameSelectionScreen';
import { GEAR_SLOTS, CLASSES } from './constants';
import { ITEM_TEMPLATES } from './data/items';

const PROFILES_STORAGE_KEY = 'eternal_spire_profiles';

const ICON_BASE = "https://api.iconify.design/game-icons";
const COLOR_PARAM = "?color=%23e2e8f0";

const App: React.FC = () => {
  const [gameScreen, setGameScreen] = useState<GameScreen>('start');
  const [isPortrait, setIsPortrait] = useState(true);
  const [checkpointAlert, setCheckpointAlert] = useState<number | null>(null);

  // Portrait Mode Check
  useEffect(() => {
    const checkOrientation = () => {
      if (window.matchMedia) {
        const matches = window.matchMedia("(orientation: portrait)").matches;
        setIsPortrait(matches);
      } else {
        setIsPortrait(window.innerHeight >= window.innerWidth);
      }
    };

    checkOrientation();

    if (window.matchMedia) {
        const mediaQuery = window.matchMedia("(orientation: portrait)");
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", checkOrientation);
        } else if (mediaQuery.addListener) {
            mediaQuery.addListener(checkOrientation);
        }
        
        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener("change", checkOrientation);
            } else if (mediaQuery.removeListener) {
                mediaQuery.removeListener(checkOrientation);
            }
        };
    } else {
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }
  }, []);

  // Load profiles from localStorage
  const [profiles, setProfiles] = useState<(Player | null)[]>(() => {
    try {
        const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
        if (savedProfiles) {
            const parsedProfiles = JSON.parse(savedProfiles);
            if (Array.isArray(parsedProfiles) && (parsedProfiles.length === 2)) {
                return parsedProfiles.map((p: any) => {
                    try {
                        if (p) {
                            const updatedProfile = { ...p };
                            
                            if (!updatedProfile.inventory) updatedProfile.inventory = [];
                            if (updatedProfile.eternalDust === undefined) updatedProfile.eternalDust = 0;
                            if (updatedProfile.totalLifetimeDust === undefined) updatedProfile.totalLifetimeDust = 0;

                            if (!updatedProfile.name && updatedProfile.classInfo && updatedProfile.classInfo.name) {
                                updatedProfile.name = updatedProfile.classInfo.name;
                            }
                            
                            if (!updatedProfile.shopRefreshes) {
                                updatedProfile.shopRefreshes = { level: updatedProfile.level || 1, count: 0 };
                            }
                            if (updatedProfile.shopRefreshesUsed !== undefined) {
                                if (updatedProfile.shopRefreshes.level === updatedProfile.level) {
                                    updatedProfile.shopRefreshes.count = updatedProfile.shopRefreshesUsed;
                                }
                                delete updatedProfile.shopRefreshesUsed;
                            }

                            if (!updatedProfile.baseStats) updatedProfile.baseStats = {};
                            if (!updatedProfile.currentStats) updatedProfile.currentStats = {};
                            
                            if (updatedProfile.baseStats.blockChance === undefined) updatedProfile.baseStats.blockChance = 0;
                            if (updatedProfile.baseStats.lifesteal === undefined) updatedProfile.baseStats.lifesteal = 0;
                            if (updatedProfile.currentStats.blockChance === undefined) updatedProfile.currentStats.blockChance = 0;
                            if (updatedProfile.currentStats.lifesteal === undefined) updatedProfile.currentStats.lifesteal = 0;

                            // Migration logic for 2H weapons and stats
                            if (updatedProfile.equipment && updatedProfile.equipment.Weapon) {
                                const oldWeapon = updatedProfile.equipment.Weapon;
                                let isTwoHanded = false;
                                if (oldWeapon.weaponType && ['Bow', 'Staff', 'Hammer'].includes(oldWeapon.weaponType)) {
                                     if (oldWeapon.name && (oldWeapon.name.includes("Great") || oldWeapon.name.includes("Maul") || oldWeapon.name.includes("Bow") || oldWeapon.name.includes("Staff"))) {
                                         isTwoHanded = true;
                                     }
                                }
                                updatedProfile.equipment.MainHand = {
                                    ...oldWeapon,
                                    slot: 'MainHand',
                                    isTwoHanded: isTwoHanded
                                };
                                delete updatedProfile.equipment.Weapon;
                            }

                            if (updatedProfile.equipment) {
                                GEAR_SLOTS.forEach(slot => {
                                    if (updatedProfile.equipment[slot] && updatedProfile.equipment[slot].itemLevel === undefined) {
                                        updatedProfile.equipment[slot].itemLevel = updatedProfile.level || 1;
                                    }
                                });
                            }
                            
                            // NEW: Sync Class Definitions (Enables Mage Shields / Updates for existing saves)
                            if (updatedProfile.classInfo && updatedProfile.classInfo.name) {
                                const classDef = CLASSES.find(c => c.name === updatedProfile.classInfo.name);
                                if (classDef) {
                                    updatedProfile.classInfo.allowedWeaponTypes = classDef.allowedWeaponTypes;
                                }
                            }

                            return updatedProfile;
                        }
                    } catch (migrationError) {
                        return p;
                    }
                    return p;
                });
            }
        }
    } catch (error) {
        console.error("Failed to load profiles:", error);
    }
    return [null, null];
  });

  const [activeProfileIndex, setActiveProfileIndex] = useState<number | null>(null);
  const [newGameName, setNewGameName] = useState<string>('');
  const [runState, setRunState] = useState<RunState | null>(null);
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([]);

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
    setNewGameName('');
    setGameScreen('name_selection');
  }, []);

  const handleNameConfirm = useCallback((name: string) => {
    setNewGameName(name);
    setGameScreen('class_selection');
  }, []);

  const handleCancelNameSelection = useCallback(() => {
      setActiveProfileIndex(null);
      setGameScreen('profile_selection');
  }, []);

  const handleDeleteProfile = useCallback((index: number) => {
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
        startingWeapon = { name: 'Dusty Sword', slot: 'MainHand', icon: `${ICON_BASE}/broadsword.svg${COLOR_PARAM}`, stats: { str: 1, blockChance: 5 }, rarity: 'Common', itemLevel: 1, weaponType: 'Sword', isTwoHanded: false };
    } else if (selectedClass.name === 'Rogue') {
        startingWeapon = { name: 'Rusty Dagger', slot: 'MainHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, stats: { dex: 1, critRate: 2 }, rarity: 'Common', itemLevel: 1, weaponType: 'Dagger', isTwoHanded: false };
    } else if (selectedClass.name === 'Mage') {
        startingWeapon = { name: 'Rusty Staff', slot: 'MainHand', icon: `${ICON_BASE}/wizard-staff.svg${COLOR_PARAM}`, stats: { int: 1, lifesteal: 2 }, rarity: 'Common', itemLevel: 1, weaponType: 'Staff', isTwoHanded: true };
    }
    
    if (startingWeapon) {
        startingEquipment.MainHand = startingWeapon;
    }

    const initialPlayer: Player = {
      name: newGameName || selectedClass.name,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      classInfo: selectedClass,
      baseStats: baseStats,
      currentStats: { ...baseStats },
      accountBuffs: {},
      currentHp: baseStats.maxHp,
      eternalShards: 0,
      eternalDust: 0,
      potionCount: 1,
      equipment: startingEquipment,
      inventory: [],
      shopInventory: [],
      lastShopRefreshLevel: 1,
      shopRefreshes: { level: 1, count: 0 },
      achievementProgress: {},
      claimedAchievements: [],
      maxFloorReached: 0,
      totalEnemiesKilled: 0,
      totalDeaths: 0,
      totalAccumulatedXp: 0,
      totalLifetimeShards: 0,
      totalLifetimeDust: 0,
      totalFlees: 0,
    };
    
    const finalPlayer = recalculatePlayerStats(initialPlayer);
    finalPlayer.currentHp = finalPlayer.currentStats.maxHp;
    
    finalPlayer.shopInventory = generateShopInventory(finalPlayer);

    setProfiles(currentProfiles => {
      const newProfiles = [...currentProfiles];
      newProfiles[activeProfileIndex] = finalPlayer;
      return newProfiles;
    });
    setGameScreen('main_game');
  }, [activeProfileIndex, newGameName]);
  
  const handleAccountLevelUp = useCallback((currentPlayer: Player): Player => {
      let updatedPlayer = { ...currentPlayer };
      let shouldRefreshShop = false;

      while (updatedPlayer.xp >= updatedPlayer.xpToNextLevel) {
          updatedPlayer.xp -= updatedPlayer.xpToNextLevel;
          updatedPlayer.level += 1;
          updatedPlayer.xpToNextLevel = Math.floor(updatedPlayer.xpToNextLevel * 1.5);
          updatedPlayer.baseStats.maxHp += 10;
          updatedPlayer.baseStats.str += 1;
          updatedPlayer.baseStats.dex += 1;
          updatedPlayer.baseStats.int += 1;
          updatedPlayer.baseStats.defense += 1;
          
          if (updatedPlayer.level % 5 === 0) {
              shouldRefreshShop = true;
          }
      }

      updatedPlayer = recalculatePlayerStats(updatedPlayer);
      
      if (shouldRefreshShop) {
          updatedPlayer.shopInventory = generateShopInventory(updatedPlayer);
      }

      return updatedPlayer;
  }, []);

  const handleCloseSummary = useCallback(() => {
    if (!runState || activeProfileIndex === null) return;
    updateCurrentPlayer(player => {
        let updatedPlayer = { ...player };
        updatedPlayer.currentHp = updatedPlayer.currentStats.maxHp;
        return updatedPlayer;
    });
    setRunState(null);
    setCombatLogs([]);
    setGameScreen('main_game');
  }, [runState, activeProfileIndex, updateCurrentPlayer]);

  const updateAchievementProgress = useCallback((playerState: Player, runState: RunState | null, type: 'slay' | 'reach_floor', value: string | number): Player => {
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

    const maxFloor = activePlayer.maxFloorReached || 0;
    const checkpointFloor = Math.max(1, Math.floor((maxFloor - 1) / 10) * 10 + 1);

    const initialEnemy = generateEnemy(checkpointFloor, activePlayer.level);
    setRunState({
      floor: checkpointFloor,
      runLevel: 1,
      runXp: 0,
      runXpToNextLevel: 50,
      playerCurrentHpInRun: activePlayer.currentStats.maxHp,
      currentEnemy: initialEnemy,
      pendingLoot: [], // Init empty array
      enemiesKilled: 0,
      shardsEarned: 0,
      isAutoBattling: false,
      pendingLevelUpHeal: false,
    });
    setCombatLogs([]);

    const introText = checkpointFloor > 1 
        ? `You use the Waystone to warp to Floor ${checkpointFloor}.`
        : `You enter the Spire.`;

    addLog(`${introText} A ${initialEnemy.name} appears!`, 'text-slate-200');
    setGameScreen('combat');
  }, [activeProfileIndex, profiles]);

  const advanceToNextFloor = useCallback((targetFloor: number, currentPlayerLevel: number) => {
    updateCurrentPlayer(player => {
        let newPlayer = { ...player };
        if (targetFloor > newPlayer.maxFloorReached) {
            newPlayer.maxFloorReached = targetFloor;
        }
        newPlayer = updateAchievementProgress(newPlayer, null, 'reach_floor', targetFloor);
        return newPlayer;
    });

    if (targetFloor > 1 && (targetFloor - 1) % 10 === 0) {
        setCheckpointAlert(targetFloor);
        setTimeout(() => setCheckpointAlert(null), 3500); 
        addLog(`Checkpoint Secured! You will now start runs at Floor ${targetFloor}.`, 'text-yellow-400');
    }

    const nextEnemy = generateEnemy(targetFloor, currentPlayerLevel);
    addLog(`You advance to Floor ${targetFloor}. A ${nextEnemy.name} appears!`, 'text-[#D6721C]');

    setRunState(prevRunState => {
        if (!prevRunState) return null;
        return {
            ...prevRunState,
            floor: targetFloor,
            currentEnemy: nextEnemy,
            pendingLoot: [], // Reset to empty array
            isAutoBattling: false, 
            pendingLevelUpHeal: false,
        };
    });
  }, [updateCurrentPlayer, updateAchievementProgress]);

  const handleAttack = useCallback(() => {
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer || !runState || runState.pendingLoot.length > 0) return;
  
    let newRunState = { 
        ...runState, 
        currentEnemy: { 
            ...runState.currentEnemy, 
            stats: { ...runState.currentEnemy.stats } 
        } 
    };
    
    let logs: { message: string, color: CombatLog['color'] }[] = [];
    let playerDefeated = false;
    let lootDropped = false;
  
    // PLAYER ATTACK LOGIC (Same as before)
    if (Math.random() * 100 < newRunState.currentEnemy.stats.evasion) {
        logs.push({ message: `The ${newRunState.currentEnemy.name} dodged your attack!`, color: 'text-red-400' });
    } else {
        const playerCrit = Math.random() * 100 < activePlayer.currentStats.critRate;
        const playerAttackStat = Math.max(activePlayer.currentStats.str, activePlayer.currentStats.dex, activePlayer.currentStats.int);
        
        let playerDamage = Math.max(1, playerAttackStat - newRunState.currentEnemy.stats.defense);
        const damageVariance = 0.85 + Math.random() * 0.3; 
        playerDamage = Math.floor(playerDamage * damageVariance);
        if (playerCrit) playerDamage = Math.floor(playerDamage * 2);
        playerDamage = Math.max(1, playerDamage);
        
        newRunState.currentEnemy.stats.hp = Math.max(0, newRunState.currentEnemy.stats.hp - playerDamage);
        logs.push({ message: `You hit the ${newRunState.currentEnemy.name} for ${playerDamage} damage${playerCrit ? ' (CRIT!)' : ''}.`, color: playerCrit ? 'text-green-400' : 'text-slate-200' });
        
        if (activePlayer.currentStats.lifesteal > 0 && playerDamage > 0 && newRunState.playerCurrentHpInRun < activePlayer.currentStats.maxHp) {
            const healAmount = Math.max(1, Math.floor(playerDamage * (activePlayer.currentStats.lifesteal / 100)));
            newRunState.playerCurrentHpInRun = Math.min(activePlayer.currentStats.maxHp, newRunState.playerCurrentHpInRun + healAmount);
            logs.push({ message: `You drained ${healAmount} HP from the enemy.`, color: 'text-pink-400' });
        }
    }

    if (newRunState.currentEnemy.stats.hp <= 0) {
      logs.push({ message: `You have defeated the ${newRunState.currentEnemy.name}!`, color: 'text-[#D6721C]' });
      newRunState.enemiesKilled += 1;
      
      let xpGained = newRunState.currentEnemy.xpReward;
      const loot = generateLoot(newRunState.floor, activePlayer.level);
      
      if (newRunState.currentEnemy.isElite && Math.random() < 0.5) {
          loot.shards += Math.floor(Math.random() * 10) + 5;
      }
      
      // Handle Multiple Drops
      if (loot.equipment.length > 0) {
          lootDropped = true;
          newRunState.pendingLoot = loot.equipment;
          logs.push({ message: `The enemy dropped ${loot.equipment.length} item(s)!`, color: 'text-[#D6721C]' });
      }

      let nextPlayer = { ...activePlayer };
      nextPlayer.totalEnemiesKilled = (nextPlayer.totalEnemiesKilled || 0) + 1;
      nextPlayer = updateAchievementProgress(nextPlayer, newRunState, 'slay', newRunState.currentEnemy.id);

      newRunState.runXp += xpGained; 
      nextPlayer.xp += xpGained;
      nextPlayer.totalAccumulatedXp = (nextPlayer.totalAccumulatedXp || 0) + xpGained;
      logs.push({ message: `You gained ${xpGained} XP.`, color: 'text-[#D6721C]' });

      const oldMaxHpAccount = nextPlayer.currentStats.maxHp;
      nextPlayer = handleAccountLevelUp(nextPlayer); 
      const newMaxHpAccount = nextPlayer.currentStats.maxHp;
      const hpDiffAccount = newMaxHpAccount - oldMaxHpAccount;

      if (nextPlayer.level > activePlayer.level) {
          logs.push({ message: `Account Level Up! You are now level ${nextPlayer.level}.`, color: 'text-[#D6721C]' });
          if (Math.floor(nextPlayer.level / 5) > Math.floor(activePlayer.level / 5)) {
               logs.push({ message: `Shop New Arrivals! Stock refreshed.`, color: 'text-purple-400' });
          }
      }
      if (hpDiffAccount > 0) {
          newRunState.playerCurrentHpInRun += hpDiffAccount;
          logs.push({ message: `Max HP increased by ${hpDiffAccount} from Account Level Up.`, color: 'text-[#D6721C]' });
      }

      if (newRunState.runXp >= newRunState.runXpToNextLevel) {
          newRunState.runXp -= newRunState.runXpToNextLevel;
          newRunState.runLevel += 1;
          newRunState.runXpToNextLevel = Math.floor(newRunState.runXpToNextLevel * 1.8);
          // DEFERRED HEAL: Don't heal immediately. Set flag.
          newRunState.pendingLevelUpHeal = true;
          logs.push({ message: `You leveled up to Run Level ${newRunState.runLevel}!`, color: 'text-[#D6721C]' });
      }

      if (loot.shards > 0) {
          nextPlayer.eternalShards += loot.shards;
          nextPlayer.totalLifetimeShards = (nextPlayer.totalLifetimeShards || 0) + loot.shards;
          newRunState.shardsEarned += loot.shards;
          logs.push({ message: `The enemy dropped ${loot.shards} Eternal Shards.`, color: 'text-purple-400' });
      }
      if (loot.potions > 0) {
          const potionsGained = Math.min(loot.potions, 5 - nextPlayer.potionCount);
          if (potionsGained > 0) {
              nextPlayer.potionCount += potionsGained;
              logs.push({ message: `You found a Health Potion! You now have ${nextPlayer.potionCount}.`, color: 'text-[#D6721C]' });
          }
      }

      updateCurrentPlayer(() => nextPlayer);
      
      if (!lootDropped) {
          // Automatic progression logic - handle deferred heal here if no loot
          if (newRunState.pendingLevelUpHeal) {
             nextPlayer.currentHp = nextPlayer.currentStats.maxHp;
             newRunState.playerCurrentHpInRun = nextPlayer.currentStats.maxHp;
             newRunState.pendingLevelUpHeal = false;
             logs.push({ message: `HP Restored!`, color: 'text-green-400' });
             updateCurrentPlayer(() => nextPlayer);
          }
          const nextFloor = newRunState.floor + 1;
          const playerLevel = nextPlayer.level;
          setTimeout(() => advanceToNextFloor(nextFloor, playerLevel), 1000);
      }

    } else { 
      // ENEMY ATTACK LOGIC (Same as before)
      if (Math.random() * 100 < activePlayer.currentStats.evasion) {
          logs.push({ message: `You dodged the ${newRunState.currentEnemy.name}'s attack!`, color: 'text-red-400' });
      } else {
          let blocked = false;
          if (Math.random() * 100 < activePlayer.currentStats.blockChance) {
              blocked = true;
          }

          const playerDefense = activePlayer.currentStats.defense;
          let enemyDamage = Math.max(1, newRunState.currentEnemy.stats.attack - playerDefense);
          const enemyDamageVariance = 0.85 + Math.random() * 0.3;
          enemyDamage = Math.floor(enemyDamage * enemyDamageVariance);
          if (blocked) enemyDamage = Math.max(1, Math.floor(enemyDamage * 0.5));
          enemyDamage = Math.max(1, enemyDamage);
          
          newRunState.playerCurrentHpInRun = Math.max(0, newRunState.playerCurrentHpInRun - enemyDamage);
          
          if (blocked) {
              logs.push({ message: `You BLOCKED! Took reduced damage (${enemyDamage}).`, color: 'text-cyan-400' });
          } else {
              logs.push({ message: `${newRunState.currentEnemy.name} hits you for ${enemyDamage} damage.`, color: 'text-slate-200' });
          }
      }
  
      if (newRunState.playerCurrentHpInRun <= 0) {
        playerDefeated = true;
        updateCurrentPlayer(player => ({ ...player, totalDeaths: (player.totalDeaths || 0) + 1 }));
        logs.push({ message: `You have been defeated...`, color: 'text-[#D6721C]' });
      }
    }

    setCombatLogs(prev => [...prev, ...logs.map(log => ({...log, id: Date.now() + Math.random() * logs.indexOf(log)}))]);
    setRunState(newRunState);

    if (playerDefeated) {
      setTimeout(() => setGameScreen('run_summary'), 2000);
    }
  }, [activeProfileIndex, profiles, runState, advanceToNextFloor, updateAchievementProgress, updateCurrentPlayer, handleAccountLevelUp]);

  // Auto Combat Loop
  useEffect(() => {
    if (!runState || !runState.isAutoBattling) return;

    if (runState.pendingLoot.length > 0 || runState.currentEnemy.stats.hp <= 0 || runState.playerCurrentHpInRun <= 0) {
        setRunState(prev => prev ? ({ ...prev, isAutoBattling: false }) : null);
        return;
    }

    const timer = setTimeout(() => {
        handleAttack();
    }, 1000); 

    return () => clearTimeout(timer);
  }, [runState, handleAttack]);

  const handleToggleAutoCombat = useCallback(() => {
      setRunState(prev => prev ? ({ ...prev, isAutoBattling: !prev.isAutoBattling }) : null);
  }, []);

  const handleLootDecision = useCallback((action: 'take' | 'sell' | 'equip', targetSlot?: GearSlot) => {
    if (!runState || !runState.pendingLoot || runState.pendingLoot.length === 0) return;
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer) return;

    const lootItem = runState.pendingLoot[0];
    const occupiedSlots = activePlayer.inventory.length + (activePlayer.potionCount > 0 ? 1 : 0);
    const bagFull = occupiedSlots >= 24;
    
    // Check if this is the last item to decide on, to apply pending heals after
    const isLastItem = runState.pendingLoot.length === 1;
    const shouldHeal = runState.pendingLevelUpHeal;

    if (action === 'equip') {
        updateCurrentPlayer(player => {
             const canEquipClass = !lootItem.weaponType || player.classInfo.allowedWeaponTypes.includes(lootItem.weaponType);
             
             // Base check (ignoring dual wield logic for a moment, just raw class compatibility)
             if (!canEquipClass) return player;

             // Determine the actual slot (allow override if targetSlot is passed)
             let finalSlot = targetSlot || lootItem.slot;

             // Force MainHand if item is TwoHanded (can never be OffHand)
             if (lootItem.isTwoHanded) finalSlot = 'MainHand';

             // Clone item and update its slot property if we are reassigning it (e.g. Sword to OffHand)
             const itemToEquip: Equipment = { ...lootItem, slot: finalSlot };
             
             // Dual Wield Slot Integrity Checks:
             // 1. If equipping to OffHand, ensure item isn't 2H (handled above)
             // 2. If equipping to OffHand, ensure MainHand isn't 2H. If it is, unequip MainHand.
             // 3. If equipping to MainHand and item is 2H, unequip OffHand.

             let updatedPlayer = { ...player };
             const newInventory = [...updatedPlayer.inventory];
             let oldItem: Equipment | undefined;

             if (finalSlot === 'OffHand') {
                 // Check if MainHand is 2H, if so unequip it
                 if (updatedPlayer.equipment.MainHand && updatedPlayer.equipment.MainHand.isTwoHanded) {
                     newInventory.push(updatedPlayer.equipment.MainHand);
                     delete updatedPlayer.equipment.MainHand;
                 }
                 
                 oldItem = updatedPlayer.equipment.OffHand;
                 updatedPlayer.equipment.OffHand = itemToEquip;
             } else if (finalSlot === 'MainHand') {
                 // Check if new item is 2H, if so unequip OffHand
                 if (itemToEquip.isTwoHanded && updatedPlayer.equipment.OffHand) {
                     newInventory.push(updatedPlayer.equipment.OffHand);
                     delete updatedPlayer.equipment.OffHand;
                 }
                 
                 oldItem = updatedPlayer.equipment.MainHand;
                 updatedPlayer.equipment.MainHand = itemToEquip;
             } else {
                 // Armor slots
                 oldItem = updatedPlayer.equipment[finalSlot];
                 updatedPlayer.equipment[finalSlot] = itemToEquip;
             }

             if (oldItem) newInventory.push(oldItem);
             
             const newOccupiedCount = newInventory.length + (player.potionCount > 0 ? 1 : 0);
             if (newOccupiedCount > 24) {
                 addLog("Cannot equip: Inventory full for swapped item.", 'text-red-400');
                 return player; 
             }
             
             updatedPlayer.inventory = newInventory;
             addLog(`You equipped ${itemToEquip.name}.`, 'text-cyan-400');
             
             const hpBefore = updatedPlayer.currentHp;
             const maxHpBefore = updatedPlayer.currentStats.maxHp;
             updatedPlayer = recalculatePlayerStats(updatedPlayer);
             const maxHpAfter = updatedPlayer.currentStats.maxHp;
             
             // SCALING / HEALING LOGIC
             if (isLastItem && shouldHeal) {
                 updatedPlayer.currentHp = maxHpAfter; // Full heal to NEW max HP
                 addLog(`HP Restored!`, 'text-green-400');
             } else if (maxHpAfter !== maxHpBefore && maxHpBefore > 0) {
                 const hpPercentage = hpBefore / maxHpBefore;
                 updatedPlayer.currentHp = Math.round(maxHpAfter * hpPercentage);
             }
             
             // Sync Run State HP
             setRunState(prev => prev ? ({...prev, playerCurrentHpInRun: updatedPlayer.currentHp}) : null);

             return updatedPlayer;
        });
    } else if (action === 'take') {
        if (bagFull) {
            addLog("Inventory is full! Sold item instead.", 'text-red-400');
            const sellValue = Math.floor((lootItem.cost || 10) * 0.2);
            updateCurrentPlayer(player => {
                const updated = {
                    ...player,
                    eternalShards: player.eternalShards + sellValue,
                    totalLifetimeShards: (player.totalLifetimeShards || 0) + sellValue
                }
                // Apply deferred heal if needed
                if (isLastItem && shouldHeal) {
                    updated.currentHp = updated.currentStats.maxHp;
                    addLog(`HP Restored!`, 'text-green-400');
                }
                if (isLastItem && shouldHeal) {
                     setRunState(prev => prev ? ({...prev, playerCurrentHpInRun: updated.currentStats.maxHp}) : null);
                }
                return updated;
            });
            setRunState(prev => prev ? ({...prev, shardsEarned: prev.shardsEarned + sellValue}) : null);
        } else {
            updateCurrentPlayer(player => {
                const updated = {
                    ...player,
                    inventory: [...player.inventory, lootItem]
                };
                // Apply deferred heal if needed
                if (isLastItem && shouldHeal) {
                    updated.currentHp = updated.currentStats.maxHp;
                    addLog(`HP Restored!`, 'text-green-400');
                }
                if (isLastItem && shouldHeal) {
                     setRunState(prev => prev ? ({...prev, playerCurrentHpInRun: updated.currentStats.maxHp}) : null);
                }
                return updated;
            });
            addLog(`You picked up ${lootItem.name}.`, 'text-slate-200');
        }

    } else if (action === 'sell') {
        const sellValue = Math.floor((lootItem.cost || 10) * 0.2);
        updateCurrentPlayer(player => {
            const updated = {
                ...player,
                eternalShards: player.eternalShards + sellValue,
                totalLifetimeShards: (player.totalLifetimeShards || 0) + sellValue
            };
            // Apply deferred heal if needed
            if (isLastItem && shouldHeal) {
                updated.currentHp = updated.currentStats.maxHp;
                addLog(`HP Restored!`, 'text-green-400');
            }
            if (isLastItem && shouldHeal) {
                 setRunState(prev => prev ? ({...prev, playerCurrentHpInRun: updated.currentStats.maxHp}) : null);
            }
            return updated;
        });
        setRunState(prev => prev ? ({...prev, shardsEarned: prev.shardsEarned + sellValue}) : null);
        addLog(`You sold ${lootItem.name} for ${sellValue} shards.`, 'text-purple-400');
    }

    // Queue Management
    const remainingLoot = runState.pendingLoot.slice(1);
    
    if (remainingLoot.length > 0) {
        // Show next item
        setRunState(prev => prev ? ({ ...prev, pendingLoot: remainingLoot }) : null);
    } else {
        // Finished Queue
        setRunState(prev => prev ? ({ ...prev, pendingLoot: [], pendingLevelUpHeal: false }) : null);
        advanceToNextFloor(runState.floor + 1, activePlayer.level);
    }

  }, [runState, advanceToNextFloor, updateCurrentPlayer, activeProfileIndex, profiles]);

  // Equip from Bag
  const handleEquipFromBag = useCallback((inventoryIndex: number) => {
      if (activeProfileIndex === null) return;
      
      updateCurrentPlayer(player => {
          const itemToEquip = player.inventory[inventoryIndex];
          if (!itemToEquip) return player;
          const canEquipClass = !itemToEquip.weaponType || player.classInfo.allowedWeaponTypes.includes(itemToEquip.weaponType);
          if (!canEquipClass) return player; 
          
          // Logic to check dual wield for bag equip (simplified - defaults to slot)
          if (itemToEquip.slot === 'OffHand') {
              const mainHand = player.equipment.MainHand;
              if (!mainHand || mainHand.isTwoHanded) return player;
          }

          let updatedPlayer = { ...player };
          let slot = itemToEquip.slot;

          // SMART EQUIP LOGIC: Auto-fill OffHand with 1H weapon if MainHand is full but OffHand is empty
          if (slot === 'MainHand' && !itemToEquip.isTwoHanded) {
              if (updatedPlayer.equipment.MainHand && !updatedPlayer.equipment.OffHand) {
                  // Ensure current MainHand isn't 2H (which blocks OffHand)
                  if (!updatedPlayer.equipment.MainHand.isTwoHanded) {
                      slot = 'OffHand';
                  }
              }
          }
          
          const newInventory = [...updatedPlayer.inventory];
          newInventory.splice(inventoryIndex, 1);
          
          let oldItem: Equipment | undefined;

          if (slot === 'MainHand') {
              oldItem = updatedPlayer.equipment.MainHand;
              updatedPlayer.equipment.MainHand = itemToEquip;
              if (itemToEquip.isTwoHanded && updatedPlayer.equipment.OffHand) {
                  newInventory.push(updatedPlayer.equipment.OffHand);
                  delete updatedPlayer.equipment.OffHand;
              }
          } else if (slot === 'OffHand') {
              oldItem = updatedPlayer.equipment.OffHand;
              updatedPlayer.equipment.OffHand = itemToEquip;
          } else {
              oldItem = updatedPlayer.equipment[slot];
              updatedPlayer.equipment[slot] = itemToEquip;
          }
          
          if (oldItem) newInventory.push(oldItem);
          
          updatedPlayer.inventory = newInventory;

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
  }, [activeProfileIndex, updateCurrentPlayer]);

  // Unequip Item
  const handleUnequip = useCallback((slot: GearSlot) => {
      if (activeProfileIndex === null) return;

      updateCurrentPlayer(player => {
          const itemToUnequip = player.equipment[slot];
          if (!itemToUnequip) return player;
          const occupiedSlots = player.inventory.length + (player.potionCount > 0 ? 1 : 0);
          if (occupiedSlots >= 24) return player;

          let updatedPlayer = { ...player };
          delete updatedPlayer.equipment[slot];
          updatedPlayer.inventory = [...updatedPlayer.inventory, itemToUnequip];

          const hpBefore = updatedPlayer.currentHp;
          const maxHpBefore = updatedPlayer.currentStats.maxHp;
          updatedPlayer = recalculatePlayerStats(updatedPlayer);
          const maxHpAfter = updatedPlayer.currentStats.maxHp;

          if (maxHpAfter !== maxHpBefore && maxHpBefore > 0) {
              const hpPercentage = hpBefore / maxHpBefore;
              updatedPlayer.currentHp = Math.round(maxHpAfter * hpPercentage);
          }
          updatedPlayer.currentHp = Math.min(updatedPlayer.currentHp, updatedPlayer.currentStats.maxHp);
          
          return updatedPlayer;
      });
  }, [activeProfileIndex, updateCurrentPlayer]);

  // Sell Item
  const handleSellFromBag = useCallback((inventoryIndex: number) => {
      if (activeProfileIndex === null) return;

      updateCurrentPlayer(player => {
          const itemToSell = player.inventory[inventoryIndex];
          if (!itemToSell) return player;
          const sellValue = Math.floor((itemToSell.cost || 10) * 0.2);
          
          let updatedPlayer = { ...player };
          const newInventory = [...updatedPlayer.inventory];
          newInventory.splice(inventoryIndex, 1);
          updatedPlayer.inventory = newInventory;
          updatedPlayer.eternalShards += sellValue;
          updatedPlayer.totalLifetimeShards = (updatedPlayer.totalLifetimeShards || 0) + sellValue;

          return updatedPlayer;
      });
  }, [activeProfileIndex, updateCurrentPlayer]);

  // Disenchant Item
  const handleDisenchantFromBag = useCallback((inventoryIndex: number) => {
      if (activeProfileIndex === null) return;

      updateCurrentPlayer(player => {
          const item = player.inventory[inventoryIndex];
          if (!item) return player;

          const baseDust = {
              'Common': 1,
              'Uncommon': 3,
              'Rare': 10,
              'Epic': 25,
              'Legendary': 100
          }[item.rarity || 'Common'] || 1;

          const dustValue = Math.floor(baseDust * (1 + (item.itemLevel / 20)));

          let updatedPlayer = { ...player };
          const newInventory = [...updatedPlayer.inventory];
          newInventory.splice(inventoryIndex, 1);
          updatedPlayer.inventory = newInventory;
          updatedPlayer.eternalDust = (updatedPlayer.eternalDust || 0) + dustValue;
          updatedPlayer.totalLifetimeDust = (updatedPlayer.totalLifetimeDust || 0) + dustValue;
          
          return updatedPlayer;
      });
  }, [activeProfileIndex, updateCurrentPlayer]);

  const handleUsePotion = useCallback(() => {
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer || !runState || runState.pendingLoot.length > 0 || activePlayer.potionCount <= 0 || runState.playerCurrentHpInRun >= activePlayer.currentStats.maxHp) return;

    let newRunState = { ...runState };
    let logs: { message: string, color: CombatLog['color'] }[] = [];
    const POTION_HEAL_AMOUNT = 50;

    updateCurrentPlayer(player => ({ ...player, potionCount: player.potionCount - 1 }));

    const healAmount = POTION_HEAL_AMOUNT;
    newRunState.playerCurrentHpInRun = Math.min(activePlayer.currentStats.maxHp, newRunState.playerCurrentHpInRun + healAmount);
    logs.push({ message: `You used a Health Potion and restored ${healAmount} HP.`, color: 'text-slate-200' });

    setCombatLogs(prev => [...prev, ...logs.map(log => ({...log, id: Date.now() + Math.random() * logs.indexOf(log)}))]);
    setRunState(newRunState);
  }, [activeProfileIndex, profiles, runState, updateCurrentPlayer]);
  
  const handleFlee = useCallback(() => {
    if (!runState) return;

    const xpLost = Math.floor(runState.runXp * 0.15);
    const shardsLost = Math.floor(runState.shardsEarned * 0.15);

    updateCurrentPlayer(player => ({ 
        ...player, 
        totalFlees: (player.totalFlees || 0) + 1,
        xp: Math.max(0, player.xp - xpLost),
        eternalShards: Math.max(0, player.eternalShards - shardsLost)
    }));
    
    setRunState(prev => prev ? ({
        ...prev,
        fleePenalty: {
            xpLost,
            shardsLost
        },
        isAutoBattling: false 
    }) : null);

    setGameScreen('run_summary');
  }, [runState, updateCurrentPlayer]);

  const handleExitToProfiles = useCallback(() => {
    setActiveProfileIndex(null);
    setRunState(null);
    setCombatLogs([]);
    setGameScreen('profile_selection');
  }, []);

  const handleEnterShop = useCallback(() => setGameScreen('shop'), []);
  const handleEnterAchievements = useCallback(() => setGameScreen('achievements'), []);
  const handleEnterStats = useCallback(() => setGameScreen('stats'), []);
  const handleExitSubScreen = useCallback(() => setGameScreen('main_game'), []);

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
      
      const occupiedSlots = player.inventory.length + (player.potionCount > 0 ? 1 : 0);
      if (occupiedSlots >= 24) return player;

      let updatedPlayer = { ...player };
      updatedPlayer.eternalShards -= itemToBuy.cost;
      updatedPlayer.inventory = [...updatedPlayer.inventory, itemToBuy];
      updatedPlayer.shopInventory = updatedPlayer.shopInventory.filter(item => item.name !== itemToBuy.name);
      
      return updatedPlayer;
    });
  }, [updateCurrentPlayer]);

  const handleRefreshShop = useCallback(() => {
    updateCurrentPlayer(player => {
        const currentLevelRefreshes = (player.shopRefreshes && player.shopRefreshes.level === player.level) ? player.shopRefreshes.count : 0;
        if (player.eternalShards < 1000 || currentLevelRefreshes >= 3) return player;
        return {
            ...player,
            eternalShards: player.eternalShards - 1000,
            shopRefreshes: {
                level: player.level,
                count: currentLevelRefreshes + 1
            },
            shopInventory: generateShopInventory(player)
        };
    });
  }, [updateCurrentPlayer]);

  const handleClaimAchievement = useCallback((achievementId: string) => {
    updateCurrentPlayer(player => {
      const achievement = ACHIEVEMENTS.find(ach => ach.id === achievementId);
      if (!achievement || player.claimedAchievements.includes(achievementId) || achievement.isBuff) return player;
      let updatedPlayer = { ...player };
      updatedPlayer.eternalShards += achievement.rewards.shards || 0;
      updatedPlayer.totalLifetimeShards = (updatedPlayer.totalLifetimeShards || 0) + (achievement.rewards.shards || 0);
      updatedPlayer.potionCount = Math.min(5, updatedPlayer.potionCount + (achievement.rewards.potions || 0));
      updatedPlayer.claimedAchievements = [...updatedPlayer.claimedAchievements, achievementId];
      return updatedPlayer;
    });
  }, [updateCurrentPlayer]);

  if (!isPortrait) {
      return (
          <div className="h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center animate-fadeIn text-slate-200 font-serif overflow-hidden">
               <div className="w-16 h-16 mb-4 text-[#D6721C] animate-pulse">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                  </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#D6721C] mb-2">Portrait Mode Required</h1>
              <p className="text-slate-400">Please rotate your device to play The Eternal Spire.</p>
          </div>
      )
  }

  const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;

  const renderScreen = () => {
    switch (gameScreen) {
      case 'start':
        return <StartScreen onStart={handleStartGame} />;
      case 'profile_selection':
        return <ProfileScreen profiles={profiles} onLoadProfile={handleLoadProfile} onStartNewGame={handleStartNewGameInSlot} onDeleteProfile={handleDeleteProfile} />;
      case 'name_selection':
          return <NameSelectionScreen onNameConfirm={handleNameConfirm} onCancel={handleCancelNameSelection} />;
      case 'class_selection':
        return <ClassSelectionScreen onClassSelect={handleClassSelect} />;
      case 'main_game':
        if (activePlayer) {
          return <MainGameScreen 
            player={activePlayer} 
            onEnterSpire={handleEnterSpire} 
            onExitToProfiles={handleExitToProfiles} 
            onEnterShop={handleEnterShop} 
            onEnterAchievements={handleEnterAchievements} 
            onEnterStats={handleEnterStats} 
            onEquipFromBag={handleEquipFromBag} 
            onSellFromBag={handleSellFromBag}
            onDisenchantFromBag={handleDisenchantFromBag}
            onUnequip={handleUnequip}
          />;
        }
        return null; 
      case 'combat':
        if (activePlayer && runState) {
          return <CombatScreen 
            player={activePlayer} 
            runState={runState} 
            logs={combatLogs} 
            onToggleAutoCombat={handleToggleAutoCombat}
            onFlee={handleFlee} 
            onLootAction={handleLootDecision} 
            onUsePotion={handleUsePotion} 
          />;
        }
        return null;
      case 'run_summary':
        if (runState) {
          return <RunSummaryScreen runState={runState} onClose={handleCloseSummary} />;
        }
        return null;
      case 'shop':
        if (activePlayer) {
          return <ShopScreen player={activePlayer} onExit={handleExitSubScreen} onBuyPotion={handleBuyPotion} onBuyShopItem={handleBuyShopItem} onRefresh={handleRefreshShop}/>;
        }
        return null;
      case 'achievements':
        if (activePlayer) {
          return <AchievementsScreen player={activePlayer} achievements={ACHIEVEMENTS} onExit={handleExitSubScreen} onClaim={handleClaimAchievement} />;
        }
        return null;
      case 'stats':
        if (activePlayer) {
          return <StatsScreen player={activePlayer} onExit={handleExitSubScreen} />;
        }
        return null;
      default:
        return null;
    }
  };

  return (
      <div className="h-screen w-screen bg-transparent text-slate-200 font-serif no-scrollbar overflow-hidden relative">
           {checkpointAlert && (
            <div className="absolute top-[20%] left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="bg-slate-900/95 border border-[#D6721C] px-6 py-2 rounded-xl shadow-lg backdrop-blur-sm animate-bounce">
                    <p className="text-[#D6721C] font-bold text-sm uppercase tracking-widest text-center">
                        Checkpoint Reached: Floor {checkpointAlert}
                    </p>
                </div>
            </div>
          )}
          {renderScreen()}
      </div>
  );
};

export default App;
