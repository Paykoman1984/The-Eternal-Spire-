
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
import { GEAR_SLOTS } from './constants';
import { ITEM_TEMPLATES } from './data/items';

const PROFILES_STORAGE_KEY = 'eternal_spire_profiles';

const ICON_BASE = "https://api.iconify.design/game-icons";
const COLOR_PARAM = "?color=%23e2e8f0";

const App: React.FC = () => {
  const [gameScreen, setGameScreen] = useState<GameScreen>('start');
  const [isPortrait, setIsPortrait] = useState(true);
  const [checkpointAlert, setCheckpointAlert] = useState<number | null>(null);

  // Portrait Mode Check - Rebuilt to be robust against keyboard flicker
  useEffect(() => {
    // The most reliable method is the Screen Orientation API, as it tracks physical rotation.
    const screenOrientation = window.screen?.orientation;
    // The fallback is a CSS media query, which is better than checking dimensions directly.
    const portraitMediaQuery = window.matchMedia?.("(orientation: portrait)");

    const handleOrientationChange = () => {
      if (screenOrientation) {
        setIsPortrait(screenOrientation.type.startsWith("portrait"));
      } else if (portraitMediaQuery) {
        setIsPortrait(portraitMediaQuery.matches);
      } else {
        // Last resort for very old browsers, only checked on initial load.
        setIsPortrait(window.innerHeight > window.innerWidth);
      }
    };

    // Set the initial state
    handleOrientationChange();

    // Attach the most reliable listener available
    if (screenOrientation) {
      screenOrientation.addEventListener("change", handleOrientationChange);
    } else if (portraitMediaQuery?.addEventListener) {
      portraitMediaQuery.addEventListener("change", handleOrientationChange);
    }
    // IMPORTANT: We NO LONGER add a 'resize' event listener. The 'resize' event is the
    // root cause of the flickering bug when the on-screen keyboard appears on Android.
    // By removing it, we sacrifice dynamic orientation detection on very old browsers
    // in favor of making the app usable on all modern mobile devices.

    // Cleanup listeners
    return () => {
      if (screenOrientation) {
        screenOrientation.removeEventListener("change", handleOrientationChange);
      }
      if (portraitMediaQuery?.removeEventListener) {
        portraitMediaQuery.removeEventListener("change", handleOrientationChange);
      }
    };
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
                            
                            // Migration: Add Inventory Array if missing
                            if (!updatedProfile.inventory) {
                                updatedProfile.inventory = [];
                            }
                            
                            // Migration: Add Eternal Dust
                            if (updatedProfile.eternalDust === undefined) {
                                updatedProfile.eternalDust = 0;
                            }
                            if (updatedProfile.totalLifetimeDust === undefined) {
                                updatedProfile.totalLifetimeDust = 0;
                            }

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
                            
                            const fixIcon = (item: Equipment) => {
                                // 1. URL-based generic fixes (for items with broken filenames)
                                if (item.icon) {
                                    if (item.icon.includes('morning-star')) item.icon = `${ICON_BASE}/flanged-mace.svg${COLOR_PARAM}`;
                                    
                                    if (item.icon.includes('bastard-sword') || item.icon.includes('great-sword') || item.icon.includes('falchion') || item.icon.includes('gladius')) item.icon = `${ICON_BASE}/broadsword.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('two-handed-sword')) item.icon = `${ICON_BASE}/two-handed-sword.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('dagger') || item.icon.includes('bowie-knife') || item.icon.includes('kris') || item.icon.includes('stiletto') || item.icon.includes('sacrificial-dagger')) item.icon = `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('thor-hammer')) item.icon = `${ICON_BASE}/warhammer.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('bow-string') || item.icon.includes('high-shot') || item.icon.includes('composite-bow')) item.icon = `${ICON_BASE}/bow-arrow.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('heavy-crossbow')) item.icon = `${ICON_BASE}/crossbow.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('crystal-wand') || item.icon.includes('crescent-staff')) item.icon = `${ICON_BASE}/wizard-staff.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('orb-wand')) item.icon = `${ICON_BASE}/crystal-ball.svg${COLOR_PARAM}`;
                                    
                                    if (item.icon.includes('tower-shield') || item.icon.includes('checked-shield')) item.icon = `${ICON_BASE}/shield.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('attached-shield')) item.icon = `${ICON_BASE}/round-shield.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('book-cover')) item.icon = `${ICON_BASE}/spell-book.svg${COLOR_PARAM}`;
                                    
                                    if (item.icon.includes('closed-barbute') || item.icon.includes('crested-helmet') || item.icon.includes('circlet')) item.icon = `${ICON_BASE}/visored-helm.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('wizard-hat')) item.icon = `${ICON_BASE}/pointy-hat.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('cultist')) item.icon = `${ICON_BASE}/hood.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('abdominal-armor') || item.icon.includes('plate-armor')) item.icon = `${ICON_BASE}/breastplate.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('ninja-armor') || item.icon.includes('studded-leather')) item.icon = `${ICON_BASE}/leather-armor.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('tunic') || item.icon.includes('leather-vest')) item.icon = `${ICON_BASE}/sleeveless-jacket.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('cloak')) item.icon = `${ICON_BASE}/robe.svg${COLOR_PARAM}`;
                                    
                                    if (item.icon.includes('magic-boots') || item.icon.includes('sandals')) item.icon = `${ICON_BASE}/boots.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('walking-boot') || item.icon.includes('light-shoes')) item.icon = `${ICON_BASE}/leather-boot.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('armored-boot') || item.icon.includes('greaves')) item.icon = `${ICON_BASE}/metal-boot.svg${COLOR_PARAM}`;
                                    
                                    if (item.icon.includes('leather-glove') || item.icon.includes('winter-gloves') || item.icon.includes('magic-palm') || item.icon.includes('fingerless-gloves') || item.icon.includes('spellbinders')) item.icon = `${ICON_BASE}/gloves.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('metal-hand') || item.icon.includes('iron-gauntlets')) item.icon = `${ICON_BASE}/mailed-fist.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('mystic-wraps') || item.icon.includes('cloth-wraps')) item.icon = `${ICON_BASE}/hand-bandage.svg${COLOR_PARAM}`;
                                    
                                    // Fix Belt Icons
                                    if (item.icon.includes('sash')) item.icon = `${ICON_BASE}/belt-buckles.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('belt.svg')) item.icon = `${ICON_BASE}/belt-buckles.svg${COLOR_PARAM}`;
                                }
                                
                                // Consolidated Scepter/Sceptre Fix
                                // Matches any existing icon with 'scepter'/'sceptre' OR any item named 'Scepter'/'Sceptre'
                                if (
                                    item.icon.includes('scepter') || 
                                    item.icon.includes('sceptre') || 
                                    (item.name && (item.name.includes('Scepter') || item.name.includes('Sceptre')))
                                ) {
                                    item.icon = `${ICON_BASE}/sceptre-of-power.svg${COLOR_PARAM}`;
                                }

                                // 2. Name-based Specific Overrides (Stronger than generic URL checks)
                                if (item.name) {
                                    if (item.name.includes('Leather Vest')) item.icon = `${ICON_BASE}/sleeveless-jacket.svg${COLOR_PARAM}`;
                                    if (item.name.includes('Tower Shield')) item.icon = `${ICON_BASE}/shield.svg${COLOR_PARAM}`;
                                    if (item.name.includes('Longbow')) item.icon = `${ICON_BASE}/bow-arrow.svg${COLOR_PARAM}`;
                                    if (item.name.includes('Iron Shield')) item.icon = `${ICON_BASE}/shield.svg${COLOR_PARAM}`;
                                    if (item.name.includes('Greatsword') || item.name.includes('Zweihander')) item.icon = `${ICON_BASE}/two-handed-sword.svg${COLOR_PARAM}`;
                                    
                                    if (item.name.includes('Sash') || item.name.includes('Girdle')) item.icon = `${ICON_BASE}/belt-buckles.svg${COLOR_PARAM}`;
                                    if (item.name.includes('Belt') && !item.name.includes('Heavy')) item.icon = `${ICON_BASE}/belt-buckles.svg${COLOR_PARAM}`;
                                }

                                return item;
                            };

                            if (updatedProfile.equipment) {
                                (Object.keys(updatedProfile.equipment) as GearSlot[]).forEach(slot => {
                                    if (updatedProfile.equipment[slot]) {
                                        updatedProfile.equipment[slot] = fixIcon(updatedProfile.equipment[slot]!);
                                    }
                                });
                            }
                            // Fix icons in inventory too
                            if (updatedProfile.inventory) {
                                updatedProfile.inventory = updatedProfile.inventory.map(fixIcon);
                            }
                            
                            if (updatedProfile.shopInventory) {
                                updatedProfile.shopInventory = updatedProfile.shopInventory.map((item: any) => {
                                     let newItem = { ...item };
                                     if (newItem.slot === 'Weapon') newItem.slot = 'MainHand';
                                     if (newItem.itemLevel === undefined) newItem.itemLevel = updatedProfile.level || 1;
                                     return fixIcon(newItem);
                                 });
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
          
          // Auto Refresh Shop every 5 levels
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

    // Checkpoint Calculation
    // Logic: Floor 1-10 -> Start 1. Floor 11-20 -> Start 11. Floor 21-30 -> Start 21.
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
      pendingLoot: null,
      enemiesKilled: 0,
      shardsEarned: 0,
      isAutoBattling: false, // Default to false
    });
    setCombatLogs([]);

    const introText = checkpointFloor > 1 
        ? `You use the Waystone to warp to Floor ${checkpointFloor}.`
        : `You enter the Spire.`;

    addLog(`${introText} A ${initialEnemy.name} appears!`, 'text-slate-200');
    setGameScreen('combat');
  }, [activeProfileIndex, profiles]);

  const advanceToNextFloor = useCallback((targetFloor: number, currentPlayerLevel: number) => {
    // 1. Update Player Achievements (Side Effect moved out of state setter)
    updateCurrentPlayer(player => {
        let newPlayer = { ...player };
        if (targetFloor > newPlayer.maxFloorReached) {
            newPlayer.maxFloorReached = targetFloor;
        }
        newPlayer = updateAchievementProgress(newPlayer, null, 'reach_floor', targetFloor);
        return newPlayer;
    });

    // Checkpoint Alert Logic
    // If targetFloor is 11, 21, 31, etc., it means we just beat a boss (e.g., Floor 10) and unlocked the checkpoint.
    if (targetFloor > 1 && (targetFloor - 1) % 10 === 0) {
        setCheckpointAlert(targetFloor);
        setTimeout(() => setCheckpointAlert(null), 3500); // Show for 3.5 seconds
        addLog(`Checkpoint Secured! You will now start runs at Floor ${targetFloor}.`, 'text-yellow-400');
    }

    // 2. Generate Next Enemy
    const nextEnemy = generateEnemy(targetFloor, currentPlayerLevel);
    addLog(`You advance to Floor ${targetFloor}. A ${nextEnemy.name} appears!`, 'text-[#D6721C]');

    // 3. Update Run State
    setRunState(prevRunState => {
        if (!prevRunState) return null;
        return {
            ...prevRunState,
            floor: targetFloor,
            currentEnemy: nextEnemy,
            pendingLoot: null,
            isAutoBattling: false, // Reset auto combat on new floor
        };
    });
  }, [updateCurrentPlayer, updateAchievementProgress]);

  const handleAttack = useCallback(() => {
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer || !runState || runState.pendingLoot) return;
  
    // Fix: Correctly structure the new state without circular nesting of stats
    let newRunState = { 
        ...runState, 
        currentEnemy: { 
            ...runState.currentEnemy, 
            stats: { ...runState.currentEnemy.stats } 
        } 
    };
    
    let logs: { message: string, color: CombatLog['color'] }[] = [];
    let playerDefeated = false;
    let lootDropped: Equipment | null = null;
  
    if (Math.random() * 100 < newRunState.currentEnemy.stats.evasion) {
        logs.push({ message: `The ${newRunState.currentEnemy.name} dodged your attack!`, color: 'text-red-400' });
    } else {
        const playerCrit = Math.random() * 100 < activePlayer.currentStats.critRate;
        const playerAttackStat = Math.max(activePlayer.currentStats.str, activePlayer.currentStats.dex, activePlayer.currentStats.int);
        
        // --- NEW PLAYER DAMAGE LOGIC ---
        // 1. Base Hit (Raw Stat - Defense)
        let playerDamage = Math.max(1, playerAttackStat - newRunState.currentEnemy.stats.defense);
        
        // 2. Random Variance (+/- 15%)
        const damageVariance = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
        playerDamage = Math.floor(playerDamage * damageVariance);
        
        // 3. Crit Multiplier (2.0x)
        if (playerCrit) playerDamage = Math.floor(playerDamage * 2);
        
        // 4. Ensure min 1 damage if it hit
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
      
      if (loot.equipment) {
          lootDropped = loot.equipment;
          newRunState.pendingLoot = loot.equipment;
          logs.push({ message: `The enemy dropped a piece of equipment: ${loot.equipment.name}!`, color: 'text-[#D6721C]' });
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
          newRunState.playerCurrentHpInRun = nextPlayer.currentStats.maxHp; 
          logs.push({ message: `You leveled up to Run Level ${newRunState.runLevel}! HP Restored!`, color: 'text-[#D6721C]' });
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
          // Pass the arguments explicitly to prevent stale closure issues
          const nextFloor = newRunState.floor + 1;
          const playerLevel = nextPlayer.level;
          setTimeout(() => advanceToNextFloor(nextFloor, playerLevel), 1000);
      }

    } else { 
      // --- ENEMY ATTACK LOGIC ---
      if (Math.random() * 100 < activePlayer.currentStats.evasion) {
          logs.push({ message: `You dodged the ${newRunState.currentEnemy.name}'s attack!`, color: 'text-red-400' });
      } else {
          let blocked = false;
          if (Math.random() * 100 < activePlayer.currentStats.blockChance) {
              blocked = true;
          }

          const playerDefense = activePlayer.currentStats.defense;
          // 1. Base Hit
          let enemyDamage = Math.max(1, newRunState.currentEnemy.stats.attack - playerDefense);
          
          // 2. Random Variance (+/- 15%)
          const enemyDamageVariance = 0.85 + Math.random() * 0.3;
          enemyDamage = Math.floor(enemyDamage * enemyDamageVariance);
          
          // 3. Block Multiplier (0.5x)
          if (blocked) {
              enemyDamage = Math.max(1, Math.floor(enemyDamage * 0.5));
          }
          
          // 4. Ensure min 1 damage
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

    // Stop conditions for auto-battle
    if (runState.pendingLoot || runState.currentEnemy.stats.hp <= 0 || runState.playerCurrentHpInRun <= 0) {
        setRunState(prev => prev ? ({ ...prev, isAutoBattling: false }) : null);
        return;
    }

    const timer = setTimeout(() => {
        handleAttack();
    }, 1000); // 1 second turn delay

    return () => clearTimeout(timer);
  }, [runState, handleAttack]);

  const handleToggleAutoCombat = useCallback(() => {
      setRunState(prev => prev ? ({ ...prev, isAutoBattling: !prev.isAutoBattling }) : null);
  }, []);

  const handleLootDecision = useCallback((action: 'take' | 'sell' | 'equip') => {
    if (!runState || !runState.pendingLoot) return;
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer) return;

    const lootItem = runState.pendingLoot;
    const occupiedSlots = activePlayer.inventory.length + (activePlayer.potionCount > 0 ? 1 : 0);
    const bagFull = occupiedSlots >= 24;
    
    if (action === 'equip') {
        updateCurrentPlayer(player => {
             // Logic Check: Can we equip this?
             const canEquipClass = !lootItem.weaponType || player.classInfo.allowedWeaponTypes.includes(lootItem.weaponType);
             
             // Logic Check: OffHand restriction
             let canEquipOffHand = true;
             if (lootItem.slot === 'OffHand') {
                 const mainHand = player.equipment.MainHand;
                 if (!mainHand || mainHand.isTwoHanded) canEquipOffHand = false;
             }
             
             if (!canEquipClass || !canEquipOffHand) return player;

             let updatedPlayer = { ...player };
             const newInventory = [...updatedPlayer.inventory];
             
             // --- SWAP LOGIC ---
             let oldItem: Equipment | undefined;
             
             // 1. Identify which slot we are filling
             if (lootItem.slot === 'MainHand') {
                 oldItem = updatedPlayer.equipment.MainHand;
                 updatedPlayer.equipment.MainHand = lootItem;
                 
                 // Special Case: Equipping 2H un-equips Offhand
                 if (lootItem.isTwoHanded && updatedPlayer.equipment.OffHand) {
                     // We need space for the offhand too!
                     // For simplicity, if we have to unequip TWO items (Main + Off), we need space.
                     // The generic bagFull check might fail here if we only had 1 slot.
                     // But let's push both.
                     newInventory.push(updatedPlayer.equipment.OffHand);
                     delete updatedPlayer.equipment.OffHand;
                 }
             } else if (lootItem.slot === 'OffHand') {
                 oldItem = updatedPlayer.equipment.OffHand;
                 updatedPlayer.equipment.OffHand = lootItem;
             } else {
                 oldItem = updatedPlayer.equipment[lootItem.slot];
                 updatedPlayer.equipment[lootItem.slot] = lootItem;
             }

             // 2. Move old item to inventory
             if (oldItem) {
                 newInventory.push(oldItem);
             }
             
             // 3. Check if we overfilled the bag (Should be blocked by UI, but double check)
             const newOccupiedCount = newInventory.length + (player.potionCount > 0 ? 1 : 0);
             if (newOccupiedCount > 24) {
                 addLog("Cannot equip: Inventory full for swapped item.", 'text-red-400');
                 return player; // Abort
             }
             
             updatedPlayer.inventory = newInventory;
             addLog(`You equipped ${lootItem.name}.`, 'text-cyan-400');
             
             // Recalculate stats immediately
             const hpBefore = updatedPlayer.currentHp;
             const maxHpBefore = updatedPlayer.currentStats.maxHp;
             updatedPlayer = recalculatePlayerStats(updatedPlayer);
             const maxHpAfter = updatedPlayer.currentStats.maxHp;
             
             // Adjust HP percentage if max changed
             if (maxHpAfter !== maxHpBefore && maxHpBefore > 0) {
                 const hpPercentage = hpBefore / maxHpBefore;
                 updatedPlayer.currentHp = Math.round(maxHpAfter * hpPercentage);
             }
             // Update Run HP
             setRunState(prev => prev ? ({...prev, playerCurrentHpInRun: updatedPlayer.currentHp}) : null);

             return updatedPlayer;
        });
    } else if (action === 'take') {
        if (bagFull) {
            addLog("Inventory is full! Sold item instead.", 'text-red-400');
            // Fallback to sell logic if full
            const sellValue = Math.floor((lootItem.cost || 10) * 0.2);
            updateCurrentPlayer(player => ({
                ...player,
                eternalShards: player.eternalShards + sellValue,
                totalLifetimeShards: (player.totalLifetimeShards || 0) + sellValue
            }));
            setRunState(prev => prev ? ({...prev, shardsEarned: prev.shardsEarned + sellValue}) : null);
        } else {
            // Add to Inventory
            updateCurrentPlayer(player => ({
                ...player,
                inventory: [...player.inventory, lootItem]
            }));
            addLog(`You picked up ${lootItem.name}.`, 'text-slate-200');
        }

    } else if (action === 'sell') {
        const sellValue = Math.floor((lootItem.cost || 10) * 0.2);
        updateCurrentPlayer(player => ({
            ...player,
            eternalShards: player.eternalShards + sellValue,
            totalLifetimeShards: (player.totalLifetimeShards || 0) + sellValue
        }));
        setRunState(prev => prev ? ({...prev, shardsEarned: prev.shardsEarned + sellValue}) : null);
        addLog(`You sold ${lootItem.name} for ${sellValue} shards.`, 'text-purple-400');
    }

    advanceToNextFloor(runState.floor + 1, activePlayer.level);
  }, [runState, advanceToNextFloor, updateCurrentPlayer, activeProfileIndex, profiles]);

  // Equip from Bag (Inventory -> GearSlot)
  const handleEquipFromBag = useCallback((inventoryIndex: number) => {
      if (activeProfileIndex === null) return;
      
      updateCurrentPlayer(player => {
          const itemToEquip = player.inventory[inventoryIndex];
          if (!itemToEquip) return player;

          // Check Requirements
          const canEquipClass = !itemToEquip.weaponType || player.classInfo.allowedWeaponTypes.includes(itemToEquip.weaponType);
          if (!canEquipClass) return player; 

          // Check OffHand Requirement
          if (itemToEquip.slot === 'OffHand') {
              const mainHand = player.equipment.MainHand;
              if (!mainHand || mainHand.isTwoHanded) return player;
          }

          let updatedPlayer = { ...player };
          const slot = itemToEquip.slot;
          
          // Remove from inventory
          const newInventory = [...updatedPlayer.inventory];
          newInventory.splice(inventoryIndex, 1);
          
          let oldItem: Equipment | undefined;

          if (slot === 'MainHand') {
              oldItem = updatedPlayer.equipment.MainHand;
              updatedPlayer.equipment.MainHand = itemToEquip;
              
              // If equipping 2H, unequip offhand
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
          
          // Return old item to inventory
          if (oldItem) {
              newInventory.push(oldItem);
          }
          
          updatedPlayer.inventory = newInventory;

          // Stats Recalculation
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

  // Unequip Item (GearSlot -> Inventory)
  const handleUnequip = useCallback((slot: GearSlot) => {
      if (activeProfileIndex === null) return;

      updateCurrentPlayer(player => {
          const itemToUnequip = player.equipment[slot];
          if (!itemToUnequip) return player;

          // Check Bag Space
          const occupiedSlots = player.inventory.length + (player.potionCount > 0 ? 1 : 0);
          if (occupiedSlots >= 24) return player; // Bag full

          let updatedPlayer = { ...player };
          
          // Remove from Equipment
          delete updatedPlayer.equipment[slot];

          // Add to Inventory
          updatedPlayer.inventory = [...updatedPlayer.inventory, itemToUnequip];

          // Stats Recalculation
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

  // Sell Item from Inventory
  const handleSellFromBag = useCallback((inventoryIndex: number) => {
      if (activeProfileIndex === null) return;

      updateCurrentPlayer(player => {
          const itemToSell = player.inventory[inventoryIndex];
          if (!itemToSell) return player;

          const sellValue = Math.floor((itemToSell.cost || 10) * 0.2);
          
          let updatedPlayer = { ...player };
          
          // Remove from Inventory
          const newInventory = [...updatedPlayer.inventory];
          newInventory.splice(inventoryIndex, 1);
          updatedPlayer.inventory = newInventory;

          // Add Shards
          updatedPlayer.eternalShards += sellValue;
          updatedPlayer.totalLifetimeShards = (updatedPlayer.totalLifetimeShards || 0) + sellValue;

          return updatedPlayer;
      });
  }, [activeProfileIndex, updateCurrentPlayer]);

  // Disenchant Item from Inventory
  const handleDisenchantFromBag = useCallback((inventoryIndex: number) => {
      if (activeProfileIndex === null) return;

      updateCurrentPlayer(player => {
          const item = player.inventory[inventoryIndex];
          if (!item) return player;

          // Dust Value Formula
          // Common: 1, Uncommon: 3, Rare: 10, Epic: 25, Legendary: 100
          // Scaled by Item Level slightly
          const baseDust = {
              'Common': 1,
              'Uncommon': 3,
              'Rare': 10,
              'Epic': 25,
              'Legendary': 100
          }[item.rarity || 'Common'] || 1;

          const dustValue = Math.floor(baseDust * (1 + (item.itemLevel / 20)));

          let updatedPlayer = { ...player };
          
          // Remove from Inventory
          const newInventory = [...updatedPlayer.inventory];
          newInventory.splice(inventoryIndex, 1);
          updatedPlayer.inventory = newInventory;

          // Add Dust
          updatedPlayer.eternalDust = (updatedPlayer.eternalDust || 0) + dustValue;
          updatedPlayer.totalLifetimeDust = (updatedPlayer.totalLifetimeDust || 0) + dustValue;
          
          // We can't log here easily without runState, but UI will update.
          return updatedPlayer;
      });
  }, [activeProfileIndex, updateCurrentPlayer]);

  const handleUsePotion = useCallback(() => {
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer || !runState || runState.pendingLoot || activePlayer.potionCount <= 0 || runState.playerCurrentHpInRun >= activePlayer.currentStats.maxHp) return;

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
        isAutoBattling: false // Stop auto battle on flee
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
      
      // Check Bag Space logic
      const occupiedSlots = player.inventory.length + (player.potionCount > 0 ? 1 : 0);
      if (occupiedSlots >= 24) return player; // Bag Full, can't buy

      let updatedPlayer = { ...player };
      updatedPlayer.eternalShards -= itemToBuy.cost;
      
      // Bought item goes to Inventory now, not auto-equipped
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
            onToggleAutoCombat={handleToggleAutoCombat} // Use toggle instead of attack
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
