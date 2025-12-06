






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
import StatsScreen from './components/screens/StatsScreen';
import NameSelectionScreen from './components/screens/NameSelectionScreen';
import { GEAR_SLOTS } from './constants';
import { ITEM_TEMPLATES } from './data/items';

const PROFILES_STORAGE_KEY = 'eternal_spire_profiles';

const ICON_BASE = "https://api.iconify.design/game-icons";
const COLOR_PARAM = "?color=%23e2e8f0";

const App: React.FC = () => {
  const [gameScreen, setGameScreen] = useState<GameScreen>('start');
  const [isLandscape, setIsLandscape] = useState(false);

  // Load profiles from localStorage once on initial component load using a lazy initializer with robust error handling.
  const [profiles, setProfiles] = useState<(Player | null)[]>(() => {
    try {
        const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
        if (savedProfiles) {
            const parsedProfiles = JSON.parse(savedProfiles);
            if (Array.isArray(parsedProfiles) && (parsedProfiles.length === 2)) {
                // Migration logic wrapped to prevent crash on malformed data
                return parsedProfiles.map((p: any) => {
                    try {
                        if (p) {
                            const updatedProfile = { ...p };
                            
                            // Safe name migration
                            if (!updatedProfile.name && updatedProfile.classInfo && updatedProfile.classInfo.name) {
                                updatedProfile.name = updatedProfile.classInfo.name;
                            }
                            
                            // Migrate from shopRefreshesUsed to the new shopRefreshes object
                            if (!updatedProfile.shopRefreshes) {
                                updatedProfile.shopRefreshes = { level: updatedProfile.level || 1, count: 0 };
                            }
                            if (updatedProfile.shopRefreshesUsed !== undefined) {
                                if (updatedProfile.shopRefreshes.level === updatedProfile.level) {
                                    updatedProfile.shopRefreshes.count = updatedProfile.shopRefreshesUsed;
                                }
                                delete updatedProfile.shopRefreshesUsed;
                            }

                            // Stats Migration for Block/Lifesteal
                            if (!updatedProfile.baseStats) updatedProfile.baseStats = {};
                            if (!updatedProfile.currentStats) updatedProfile.currentStats = {};
                            
                            if (updatedProfile.baseStats.blockChance === undefined) updatedProfile.baseStats.blockChance = 0;
                            if (updatedProfile.baseStats.lifesteal === undefined) updatedProfile.baseStats.lifesteal = 0;
                            if (updatedProfile.currentStats.blockChance === undefined) updatedProfile.currentStats.blockChance = 0;
                            if (updatedProfile.currentStats.lifesteal === undefined) updatedProfile.currentStats.lifesteal = 0;

                            // WEAPON SLOT MIGRATION: Weapon -> MainHand
                            if (updatedProfile.equipment && updatedProfile.equipment.Weapon) {
                                const oldWeapon = updatedProfile.equipment.Weapon;
                                // Determine if 2H based on templates or type
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

                            // Item Level Migration
                            if (updatedProfile.equipment) {
                                GEAR_SLOTS.forEach(slot => {
                                    if (updatedProfile.equipment[slot] && updatedProfile.equipment[slot].itemLevel === undefined) {
                                        updatedProfile.equipment[slot].itemLevel = updatedProfile.level || 1;
                                    }
                                });
                            }
                            
                            // FIX BROKEN ICONS - COMPREHENSIVE OVERHAUL
                            const fixIcon = (item: Equipment) => {
                                // Specific Fixes based on User Reports
                                if (item.name && item.name.includes('Leather Vest')) item.icon = `${ICON_BASE}/sleeveless-jacket.svg${COLOR_PARAM}`;
                                if (item.name && item.name.includes('Tower Shield')) item.icon = `${ICON_BASE}/shield.svg${COLOR_PARAM}`;
                                if (item.name && item.name.includes('Longbow')) item.icon = `${ICON_BASE}/bow-arrow.svg${COLOR_PARAM}`;
                                if (item.name && item.name.includes('Iron Shield')) item.icon = `${ICON_BASE}/shield.svg${COLOR_PARAM}`;

                                // General Pattern Matching to Replace Potentially Broken Icons
                                if (item.icon) {
                                    // Weapons
                                    if (item.icon.includes('scepter') || item.icon.includes('morning-star')) item.icon = `${ICON_BASE}/flanged-mace.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('bastard-sword') || item.icon.includes('great-sword') || item.icon.includes('falchion') || item.icon.includes('gladius')) item.icon = `${ICON_BASE}/broadsword.svg${COLOR_PARAM}`; // Simplify to broadsword if confused, but we kept two-handed-sword in template
                                    if (item.icon.includes('two-handed-sword')) item.icon = `${ICON_BASE}/two-handed-sword.svg${COLOR_PARAM}`; // Ensure 2H sword uses valid icon
                                    if (item.icon.includes('dagger') || item.icon.includes('bowie-knife') || item.icon.includes('kris') || item.icon.includes('stiletto') || item.icon.includes('sacrificial-dagger')) item.icon = `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('thor-hammer')) item.icon = `${ICON_BASE}/warhammer.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('bow-string') || item.icon.includes('high-shot') || item.icon.includes('composite-bow')) item.icon = `${ICON_BASE}/bow-arrow.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('heavy-crossbow')) item.icon = `${ICON_BASE}/crossbow.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('crystal-wand') || item.icon.includes('crescent-staff')) item.icon = `${ICON_BASE}/wizard-staff.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('orb-wand')) item.icon = `${ICON_BASE}/crystal-ball.svg${COLOR_PARAM}`;
                                    
                                    // Armor / Offhand
                                    if (item.icon.includes('tower-shield') || item.icon.includes('checked-shield')) item.icon = `${ICON_BASE}/shield.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('attached-shield')) item.icon = `${ICON_BASE}/round-shield.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('book-cover')) item.icon = `${ICON_BASE}/spell-book.svg${COLOR_PARAM}`;
                                    
                                    // Apparel
                                    if (item.icon.includes('closed-barbute') || item.icon.includes('crested-helmet') || item.icon.includes('circlet')) item.icon = `${ICON_BASE}/visored-helm.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('wizard-hat')) item.icon = `${ICON_BASE}/pointy-hat.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('cultist')) item.icon = `${ICON_BASE}/hood.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('abdominal-armor') || item.icon.includes('plate-armor')) item.icon = `${ICON_BASE}/breastplate.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('ninja-armor') || item.icon.includes('studded-leather')) item.icon = `${ICON_BASE}/leather-armor.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('tunic') || item.icon.includes('leather-vest')) item.icon = `${ICON_BASE}/sleeveless-jacket.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('cloak')) item.icon = `${ICON_BASE}/robe.svg${COLOR_PARAM}`;
                                    
                                    // Boots/Gloves
                                    if (item.icon.includes('magic-boots') || item.icon.includes('sandals')) item.icon = `${ICON_BASE}/boots.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('walking-boot') || item.icon.includes('light-shoes')) item.icon = `${ICON_BASE}/leather-boot.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('armored-boot') || item.icon.includes('greaves')) item.icon = `${ICON_BASE}/metal-boot.svg${COLOR_PARAM}`;
                                    
                                    if (item.icon.includes('leather-glove') || item.icon.includes('winter-gloves') || item.icon.includes('magic-palm') || item.icon.includes('fingerless-gloves') || item.icon.includes('spellbinders')) item.icon = `${ICON_BASE}/gloves.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('metal-hand') || item.icon.includes('iron-gauntlets')) item.icon = `${ICON_BASE}/mailed-fist.svg${COLOR_PARAM}`;
                                    if (item.icon.includes('mystic-wraps') || item.icon.includes('cloth-wraps')) item.icon = `${ICON_BASE}/hand-bandage.svg${COLOR_PARAM}`;
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
                        console.error("Error migrating profile:", migrationError);
                        // Return profile as-is if migration fails, or null if critically broken. 
                        // Returning p prevents data loss, though might be unstable.
                        return p;
                    }
                    return p;
                });
            }
        }
    } catch (error) {
        console.error("Failed to load profiles:", error);
    }
    return [null, null]; // Default if nothing is saved or data is invalid
  });

  const [activeProfileIndex, setActiveProfileIndex] = useState<number | null>(null);
  const [newGameName, setNewGameName] = useState<string>(''); // Temp state for name creation
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

  // Effect to listen for orientation changes using SAFE checks
  useEffect(() => {
    const handleOrientationChange = () => {
      try {
          if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.type) {
            setIsLandscape(screen.orientation.type.includes('landscape'));
          } else if (typeof window !== 'undefined') {
             // Fallback for devices without screen.orientation API
             const mql = window.matchMedia("(orientation: landscape)");
             setIsLandscape(mql.matches);
          }
      } catch (e) {
          console.warn("Orientation check failed", e);
      }
    };

    try {
        if (typeof screen !== 'undefined' && screen.orientation) {
            handleOrientationChange(); 
            screen.orientation.addEventListener('change', handleOrientationChange);
            return () => {
                screen.orientation.removeEventListener('change', handleOrientationChange);
            };
        } else {
            const mediaQuery = window.matchMedia("(orientation: landscape)");
            const handleMediaQueryChange = (e: MediaQueryListEvent) => setIsLandscape(e.matches);
            
            setIsLandscape(mediaQuery.matches); 
            mediaQuery.addEventListener('change', handleMediaQueryChange);
            return () => {
                mediaQuery.removeEventListener('change', handleMediaQueryChange);
            };
        }
    } catch (e) {
        console.warn("Failed to setup orientation listener", e);
    }
  }, []);


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
    setNewGameName(''); // Reset name
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
      potionCount: 1,
      equipment: startingEquipment,
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

    // Pass player level to generator for better scaling/elite chance
    const initialEnemy = generateEnemy(1, activePlayer.level);
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
        
        const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
        const nextFloor = prevRunState.floor + 1;

        updateCurrentPlayer(player => {
            let newPlayer = { ...player };
            if (nextFloor > newPlayer.maxFloorReached) {
                newPlayer.maxFloorReached = nextFloor;
            }
            newPlayer = updateAchievementProgress(newPlayer, prevRunState, 'reach_floor', nextFloor);
            return newPlayer;
        });

        const nextEnemy = generateEnemy(nextFloor, activePlayer ? activePlayer.level : 1);
        addLog(`You advance to Floor ${nextFloor}. A ${nextEnemy.name} appears!`, 'text-[#D6721C]');

        return {
            ...prevRunState,
            floor: nextFloor,
            currentEnemy: nextEnemy,
            pendingLoot: null,
        };
    });
  }, [updateCurrentPlayer, updateAchievementProgress, activeProfileIndex, profiles]);

  const handleAttack = useCallback(() => {
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer || !runState || runState.pendingLoot) return;
  
    let newRunState = { 
        ...runState, 
        currentEnemy: { ...runState.currentEnemy, stats: { ...runState.currentEnemy.stats } } 
    };
    let logs: { message: string, color: CombatLog['color'] }[] = [];
    let playerDefeated = false;
    let lootDropped: Equipment | null = null;
  
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
        
        if (activePlayer.currentStats.lifesteal > 0 && playerDamage > 0 && newRunState.playerCurrentHpInRun < activePlayer.currentStats.maxHp) {
            const healAmount = Math.max(1, Math.floor(playerDamage * (activePlayer.currentStats.lifesteal / 100)));
            newRunState.playerCurrentHpInRun = Math.min(activePlayer.currentStats.maxHp, newRunState.playerCurrentHpInRun + healAmount);
            logs.push({ message: `You drained ${healAmount} HP from the enemy.`, color: 'text-pink-400' });
        }
    }

    if (newRunState.currentEnemy.stats.hp <= 0) {
      logs.push({ message: `You have defeated the ${newRunState.currentEnemy.name}!`, color: 'text-[#D6721C]' });
      newRunState.enemiesKilled += 1;
      
      // Elite bonus logic handled in loot gen or XP calculation
      let xpGained = newRunState.currentEnemy.xpReward;
      
      const loot = generateLoot(newRunState.floor, activePlayer.level);
      
      // Double shard chance for Elites
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
          setTimeout(advanceToNextFloor, 1000);
      }

    } else { 
      if (Math.random() * 100 < activePlayer.currentStats.evasion) {
          logs.push({ message: `You dodged the ${newRunState.currentEnemy.name}'s attack!`, color: 'text-red-400' });
      } else {
          let blocked = false;
          if (Math.random() * 100 < activePlayer.currentStats.blockChance) {
              blocked = true;
          }

          const playerDefense = activePlayer.currentStats.defense;
          let enemyDamage = Math.max(1, newRunState.currentEnemy.stats.attack - playerDefense);
          
          if (blocked) {
              enemyDamage = Math.max(1, Math.floor(enemyDamage * 0.5));
          }
          
          enemyDamage = Math.floor(enemyDamage);
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

  const handleLootDecision = useCallback((equip: boolean) => {
    if (!runState || !runState.pendingLoot) return;
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer) return;

    const lootItem = runState.pendingLoot;
    if (equip) {
        // Validation: Cannot equip OffHand if using 2H or no MainHand
        if (lootItem.slot === 'OffHand') {
            const mainHand = activePlayer.equipment.MainHand;
            if (!mainHand || mainHand.isTwoHanded) {
                addLog("Cannot equip Off-Hand: Requires a One-Handed weapon.", 'text-red-400');
                advanceToNextFloor();
                return;
            }
        }

        updateCurrentPlayer(player => {
            let updatedPlayer = { ...player };
            const slot = lootItem.slot;
            
            // LOGIC FOR 2H and DUAL WIELD
            if (slot === 'MainHand') {
                updatedPlayer.equipment.MainHand = lootItem;
                if (lootItem.isTwoHanded) {
                    delete updatedPlayer.equipment.OffHand; // Unequip offhand if 2H equipped
                }
            } else if (slot === 'OffHand') {
                updatedPlayer.equipment.OffHand = lootItem;
            } else {
                updatedPlayer.equipment[slot] = lootItem;
            }
            
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
  }, [runState, advanceToNextFloor, updateCurrentPlayer, activeProfileIndex, profiles]);

  const handleUsePotion = useCallback(() => {
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer || !runState || runState.pendingLoot || activePlayer.potionCount <= 0 || runState.playerCurrentHpInRun >= activePlayer.currentStats.maxHp) return;

    let newRunState = { ...runState };
    let logs: { message: string, color: CombatLog['color'] }[] = [];
    let playerDefeated = false;
    const POTION_HEAL_AMOUNT = 50;

    updateCurrentPlayer(player => ({ ...player, potionCount: player.potionCount - 1 }));

    const healAmount = POTION_HEAL_AMOUNT;
    
    const oldHp = newRunState.playerCurrentHpInRun;
    newRunState.playerCurrentHpInRun = Math.min(activePlayer.currentStats.maxHp, newRunState.playerCurrentHpInRun + healAmount);
    const actualHeal = newRunState.playerCurrentHpInRun - oldHp;
    logs.push({ message: `You used a Health Potion and restored ${actualHeal} HP.`, color: 'text-slate-200' });

    if (newRunState.currentEnemy.stats.hp > 0) {
      if (Math.random() * 100 < activePlayer.currentStats.evasion) {
          logs.push({ message: `You dodged the ${newRunState.currentEnemy.name}'s attack!`, color: 'text-red-400' });
      } else {
           let blocked = false;
           if (Math.random() * 100 < activePlayer.currentStats.blockChance) {
               blocked = true;
           }

          let enemyDamage = Math.max(1, newRunState.currentEnemy.stats.attack - activePlayer.currentStats.defense);
          
          if (blocked) {
              enemyDamage = Math.max(1, Math.floor(enemyDamage * 0.5));
          }

          enemyDamage = Math.floor(enemyDamage);
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
        }
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
      
      const slot = itemToBuy.slot;
      
      // Validation: Cannot buy OffHand if using 2H or no MainHand
      if (slot === 'OffHand') {
          const mainHand = player.equipment.MainHand;
          if (!mainHand || mainHand.isTwoHanded) {
              return player; // Prevent buy
          }
      }

      let updatedPlayer = { ...player };
      updatedPlayer.eternalShards -= itemToBuy.cost;
      
      // LOGIC FOR 2H and DUAL WIELD in SHOP
      if (slot === 'MainHand') {
            updatedPlayer.equipment.MainHand = { ...itemToBuy };
            if (itemToBuy.isTwoHanded) {
                delete updatedPlayer.equipment.OffHand;
            }
        } else if (slot === 'OffHand') {
            updatedPlayer.equipment.OffHand = { ...itemToBuy };
        } else {
            updatedPlayer.equipment[slot] = { ...itemToBuy };
        }

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

  const handleRefreshShop = useCallback(() => {
    updateCurrentPlayer(player => {
        const currentLevelRefreshes = (player.shopRefreshes && player.shopRefreshes.level === player.level) ? player.shopRefreshes.count : 0;
        
        if (player.eternalShards < 1000 || currentLevelRefreshes >= 3) {
            return player;
        }
        
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

  if (isLandscape) {
    return (
       <div className="min-h-screen bg-slate-900/85 text-slate-200 flex flex-col items-center justify-center p-8 text-center font-serif">
         <div className="text-4xl mb-4">📱</div>
         <h2 className="text-xl font-bold text-[#D6721C] mb-2">Portrait Mode Required</h2>
         <p className="text-sm text-slate-400">Please rotate your device to vertical orientation to play The Eternal Spire.</p>
       </div>
    );
  }

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
      case 'name_selection':
        return <NameSelectionScreen
            onNameConfirm={handleNameConfirm}
            onCancel={handleCancelNameSelection}
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
            onEnterStats={handleEnterStats}
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
            onFlee={handleFlee} 
            onLootDecision={handleLootDecision}
            onUsePotion={handleUsePotion}
          />;
        }
        break;
      case 'shop':
        if (activePlayer) {
          return <ShopScreen
            player={activePlayer}
            onExit={handleExitSubScreen}
            onBuyPotion={handleBuyPotion}
            onBuyShopItem={handleBuyShopItem}
            onRefresh={handleRefreshShop}
          />;
        }
        break;
      case 'achievements':
        if (activePlayer) {
          return <AchievementsScreen
            player={activePlayer}
            achievements={ACHIEVEMENTS}
            onExit={handleExitSubScreen}
            onClaim={handleClaimAchievement}
          />;
        }
        break;
      case 'stats':
          if (activePlayer) {
              return <StatsScreen
                player={activePlayer}
                onExit={handleExitSubScreen}
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
    setGameScreen('start');
    return <StartScreen onStart={handleStartGame} />;
  };

  return (
    <div className="min-h-screen bg-black/50 text-slate-200 font-serif flex flex-col">
        {renderScreen()}
    </div>
  );
};

export default App;
