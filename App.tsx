
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { GameScreen, Player, PlayerClass, RunState, CombatLog, Equipment, GearSlot, Achievement, Rarity, Skill } from './types';
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
import SkillTreeScreen from './components/screens/SkillTreeScreen';
import { GEAR_SLOTS, CLASSES, SKILL_TREES } from './constants';

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
                            
                            // Skill System Migration
                            if (updatedProfile.skillPoints === undefined) updatedProfile.skillPoints = Math.max(0, (updatedProfile.level || 1) - 1);
                            
                            if (updatedProfile.skills === undefined) {
                                updatedProfile.skills = {};
                                if (updatedProfile.unlockedSkills) {
                                    updatedProfile.unlockedSkills.forEach((id: string) => {
                                        updatedProfile.skills[id] = 1;
                                    });
                                }
                            }

                            if (updatedProfile.currentEnergy === undefined) updatedProfile.currentEnergy = 0;
                            if (updatedProfile.currentMana === undefined) updatedProfile.currentMana = 0;

                            if (!updatedProfile.name && updatedProfile.classInfo && updatedProfile.classInfo.name) {
                                updatedProfile.name = updatedProfile.classInfo.name;
                            }
                            
                            if (!updatedProfile.shopRefreshes) {
                                updatedProfile.shopRefreshes = { level: updatedProfile.level || 1, count: 0 };
                            }

                            if (!updatedProfile.baseStats) updatedProfile.baseStats = {};
                            if (!updatedProfile.currentStats) updatedProfile.currentStats = {};
                            
                            // Initialize new stats if missing
                            if (updatedProfile.baseStats.maxEnergy === undefined) updatedProfile.baseStats.maxEnergy = 0;
                            if (updatedProfile.baseStats.maxMana === undefined) updatedProfile.baseStats.maxMana = 0;

                            if (updatedProfile.classInfo && updatedProfile.classInfo.name) {
                                const classDef = CLASSES.find(c => c.name === updatedProfile.classInfo.name);
                                if (classDef) {
                                    updatedProfile.classInfo.allowedWeaponTypes = classDef.allowedWeaponTypes;
                                    updatedProfile.classInfo.baseStats = classDef.baseStats;
                                    updatedProfile.baseStats.maxEnergy = classDef.baseStats.maxEnergy;
                                    updatedProfile.baseStats.maxMana = classDef.baseStats.maxMana;
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
        startingWeapon = { name: 'Dusty Sword', slot: 'MainHand', icon: `${ICON_BASE}/broadsword.svg${COLOR_PARAM}`, stats: { str: 1, attackSpeed: 2 }, rarity: 'Common', itemLevel: 1, weaponType: 'Sword', isTwoHanded: false };
    } else if (selectedClass.name === 'Rogue') {
        startingWeapon = { name: 'Rusty Dagger', slot: 'MainHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, stats: { dex: 1, attackSpeed: 4 }, rarity: 'Common', itemLevel: 1, weaponType: 'Dagger', isTwoHanded: false };
    } else if (selectedClass.name === 'Mage') {
        startingWeapon = { name: 'Rusty Staff', slot: 'MainHand', icon: `${ICON_BASE}/wizard-staff.svg${COLOR_PARAM}`, stats: { int: 1, castSpeed: 2 }, rarity: 'Common', itemLevel: 1, weaponType: 'Staff', isTwoHanded: true };
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
      currentEnergy: baseStats.maxEnergy,
      currentMana: baseStats.maxMana,
      skillPoints: 0,
      skills: {},
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
    finalPlayer.currentEnergy = finalPlayer.currentStats.maxEnergy;
    finalPlayer.currentMana = finalPlayer.currentStats.maxMana;
    
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
          updatedPlayer.skillPoints += 1; // Grant Skill Point
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
        updatedPlayer.currentEnergy = updatedPlayer.currentStats.maxEnergy;
        updatedPlayer.currentMana = updatedPlayer.currentStats.maxMana;
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
      playerCurrentHpInRun: activePlayer.currentHp,
      playerCurrentEnergyInRun: activePlayer.currentEnergy,
      playerCurrentManaInRun: activePlayer.currentMana,
      currentEnemy: initialEnemy,
      pendingLoot: [], 
      enemiesKilled: 0,
      shardsEarned: 0,
      isAutoBattling: false,
      skillCooldowns: {},
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
            pendingLoot: [], 
            isAutoBattling: false, 
            pendingLevelUpHeal: false,
        };
    });
  }, [updateCurrentPlayer, updateAchievementProgress]);

  // NEW: Process Victory - Returns updated RunState to ensure correct state application
  const processEnemyDefeated = useCallback((targetRunState: RunState): RunState => {
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer) return targetRunState;

    let nextRunState = { ...targetRunState };
    let logs: { message: string, color: CombatLog['color'] }[] = [];

    logs.push({ message: `You have defeated the ${nextRunState.currentEnemy.name}!`, color: 'text-[#D6721C]' });
    nextRunState.enemiesKilled += 1;
    
    const loot = generateLoot(nextRunState.floor, activePlayer.level);
    if (nextRunState.currentEnemy.isElite && Math.random() < 0.5) loot.shards += Math.floor(Math.random() * 10) + 5;
    
    if (loot.equipment.length > 0) {
        nextRunState.pendingLoot = loot.equipment;
        logs.push({ message: `The enemy dropped ${loot.equipment.length} item(s)!`, color: 'text-[#D6721C]' });
    }

    let nextPlayer = { ...activePlayer };
    nextPlayer.totalEnemiesKilled = (nextPlayer.totalEnemiesKilled || 0) + 1;
    nextPlayer = updateAchievementProgress(nextPlayer, nextRunState, 'slay', nextRunState.currentEnemy.id);

    const xpGained = nextRunState.currentEnemy.xpReward;
    nextRunState.runXp += xpGained; 
    nextPlayer.xp += xpGained;
    nextPlayer.totalAccumulatedXp = (nextPlayer.totalAccumulatedXp || 0) + xpGained;
    logs.push({ message: `You gained ${xpGained} XP.`, color: 'text-[#D6721C]' });

    nextPlayer = handleAccountLevelUp(nextPlayer); 

    if (nextRunState.runXp >= nextRunState.runXpToNextLevel) {
        nextRunState.runXp -= nextRunState.runXpToNextLevel;
        nextRunState.runLevel += 1;
        nextRunState.runXpToNextLevel = Math.floor(nextRunState.runXpToNextLevel * 1.8);
        nextRunState.pendingLevelUpHeal = true;
        logs.push({ message: `You leveled up to Run Level ${nextRunState.runLevel}!`, color: 'text-[#D6721C]' });
    }

    if (loot.shards > 0) {
        nextPlayer.eternalShards += loot.shards;
        nextPlayer.totalLifetimeShards = (nextPlayer.totalLifetimeShards || 0) + loot.shards;
        nextRunState.shardsEarned += loot.shards;
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
    setCombatLogs(prev => [...prev, ...logs.map(l => ({...l, id: Date.now() + Math.random() * 100}))]);
    
    if (nextRunState.pendingLoot.length === 0) {
        if (nextRunState.pendingLevelUpHeal) {
             nextPlayer.currentHp = nextPlayer.currentStats.maxHp;
             nextRunState.playerCurrentHpInRun = nextPlayer.currentStats.maxHp;
             nextRunState.pendingLevelUpHeal = false;
             updateCurrentPlayer(() => nextPlayer);
        }
        const floorToAdvance = nextRunState.floor + 1;
        const playerLvl = nextPlayer.level;
        setTimeout(() => advanceToNextFloor(floorToAdvance, playerLvl), 1000);
    }
    
    return nextRunState;
  }, [activeProfileIndex, profiles, updateAchievementProgress, handleAccountLevelUp, updateCurrentPlayer, advanceToNextFloor]);

  // Manual skill use logic - using functional state updates and returning process victory result
  const handleUseSkill = useCallback((skillId: string) => {
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer || !runState || runState.pendingLoot.length > 0 || runState.playerCurrentHpInRun <= 0) return;

    const classSkills = SKILL_TREES[activePlayer.classInfo.name] || [];
    const skill = classSkills.find(s => s.id === skillId);
    if (!skill || skill.type !== 'active') return;

    const currentLvl = activePlayer.skills[skillId] || 0;
    if (currentLvl <= 0) return;

    if (runState.skillCooldowns[skillId] > 0) return;

    const canAfford = activePlayer.classInfo.name === 'Mage' 
        ? runState.playerCurrentManaInRun >= skill.cost 
        : runState.playerCurrentEnergyInRun >= skill.cost;
    
    if (!canAfford) {
        addLog(`Not enough ${activePlayer.classInfo.name === 'Mage' ? 'Mana' : 'Energy'} for ${skill.name}!`, 'text-red-400');
        return;
    }

    let logs: { message: string, color: CombatLog['color'] }[] = [];
    logs.push({ message: `[SKILL] ${activePlayer.name} used ${skill.name}!`, color: 'text-yellow-400' });

    let playerDamageMultiplier = 1;
    let bonusDamage = 0;
    let ignoreDefense = false;
    const level = activePlayer.skills[skill.id] || 1;

    // Skill Specific Logic
    if (skill.id === 'w_a1') { bonusDamage = activePlayer.currentStats.str * (1.5 + (level - 1) * 0.2); }
    if (skill.id === 'w_a2') { playerDamageMultiplier = 2.5 + (level - 1) * 0.5; }
    if (skill.id === 'w_a3') { playerDamageMultiplier = 6; }
    if (skill.id === 'r_a1') { playerDamageMultiplier = 2 + (level - 1) * 0.3; logs.push({ message: `A flurry of strikes hits twice!`, color: 'text-yellow-400' }); }
    if (skill.id === 'r_a2') { bonusDamage = activePlayer.currentStats.dex * (2 + (level - 1) * 0.4); }
    if (skill.id === 'r_a3') { playerDamageMultiplier = 7; }
    if (skill.id === 'm_a1') { bonusDamage = activePlayer.currentStats.int * (2 + (level - 1) * 0.3); }
    if (skill.id === 'm_a2') { bonusDamage = activePlayer.currentStats.int * (2 + (level - 1) * 0.2); ignoreDefense = true; }
    if (skill.id === 'm_a3') { bonusDamage = activePlayer.currentStats.int * 8; }

    const playerAttackStat = Math.max(activePlayer.currentStats.str, activePlayer.currentStats.dex, activePlayer.currentStats.int);
    
    setRunState(prev => {
        if (!prev || prev.currentEnemy.stats.hp <= 0) return prev;
        
        const effectiveDefense = ignoreDefense ? 0 : prev.currentEnemy.stats.defense;
        let skillDamage = Math.max(1, (playerAttackStat * playerDamageMultiplier) + bonusDamage - effectiveDefense);
        const damageVariance = 0.9 + Math.random() * 0.2; 
        skillDamage = Math.floor(skillDamage * damageVariance);
        
        const playerCrit = Math.random() * 100 < activePlayer.currentStats.critRate;
        if (playerCrit) skillDamage = Math.floor(skillDamage * 2);

        logs.push({ message: `Your ${skill.name} deals ${skillDamage} damage${playerCrit ? ' (CRIT!)' : ''}.`, color: playerCrit ? 'text-green-400' : 'text-slate-200' });

        let newState = { 
            ...prev, 
            currentEnemy: { ...prev.currentEnemy, stats: { ...prev.currentEnemy.stats, hp: Math.max(0, prev.currentEnemy.stats.hp - skillDamage) } },
            skillCooldowns: { ...prev.skillCooldowns, [skillId]: skill.cooldown || 10 }
        };

        if (activePlayer.classInfo.name === 'Mage') {
            newState.playerCurrentManaInRun -= skill.cost;
        } else {
            newState.playerCurrentEnergyInRun -= skill.cost;
        }

        setCombatLogs(prevLogs => [...prevLogs, ...logs.map(log => ({...log, id: Date.now() + Math.random() * 100}))]);

        if (newState.currentEnemy.stats.hp <= 0) {
            // CRITICAL: Call victory logic and RETURN the state it produces
            return processEnemyDefeated(newState);
        }

        return newState;
    });
  }, [activeProfileIndex, profiles, runState, processEnemyDefeated]);

  const handleAttack = useCallback(() => {
    const activePlayer = activeProfileIndex !== null ? profiles[activeProfileIndex] : null;
    if (!activePlayer || !runState || runState.pendingLoot.length > 0) return;
  
    let logs: { message: string, color: CombatLog['color'] }[] = [];
  
    setRunState(prev => {
        if (!prev || prev.currentEnemy.stats.hp <= 0 || prev.playerCurrentHpInRun <= 0) return prev;

        const nextRunState = { 
            ...prev, 
            currentEnemy: { ...prev.currentEnemy, stats: { ...prev.currentEnemy.stats } } 
        };
        
        // PLAYER ATTACK LOGIC (Standard Auto Attack)
        if (Math.random() * 100 < nextRunState.currentEnemy.stats.evasion) {
            logs.push({ message: `The ${nextRunState.currentEnemy.name} dodged your attack!`, color: 'text-red-400' });
        } else {
            const playerCrit = Math.random() * 100 < activePlayer.currentStats.critRate;
            const playerAttackStat = Math.max(activePlayer.currentStats.str, activePlayer.currentStats.dex, activePlayer.currentStats.int);
            
            let playerDamage = Math.max(1, playerAttackStat - nextRunState.currentEnemy.stats.defense);
            const damageVariance = 0.85 + Math.random() * 0.3; 
            playerDamage = Math.floor(playerDamage * damageVariance);
            if (playerCrit) playerDamage = Math.floor(playerDamage * 2);
            playerDamage = Math.max(1, playerDamage);
            
            nextRunState.currentEnemy.stats.hp = Math.max(0, nextRunState.currentEnemy.stats.hp - playerDamage);
            logs.push({ message: `You hit the ${nextRunState.currentEnemy.name} for ${playerDamage} damage${playerCrit ? ' (CRIT!)' : ''}.`, color: playerCrit ? 'text-green-400' : 'text-slate-200' });
            
            if (activePlayer.currentStats.lifesteal > 0 && playerDamage > 0 && nextRunState.playerCurrentHpInRun < activePlayer.currentStats.maxHp) {
                const healAmount = Math.max(1, Math.floor(playerDamage * (activePlayer.currentStats.lifesteal / 100)));
                nextRunState.playerCurrentHpInRun = Math.min(activePlayer.currentStats.maxHp, nextRunState.playerCurrentHpInRun + healAmount);
                logs.push({ message: `You drained ${healAmount} HP from the enemy.`, color: 'text-pink-400' });
            }
        }

        // Resource Regen
        if (activePlayer.classInfo.name === 'Mage') {
            nextRunState.playerCurrentManaInRun = Math.min(activePlayer.currentStats.maxMana, nextRunState.playerCurrentManaInRun + 5);
        } else {
            nextRunState.playerCurrentEnergyInRun = Math.min(activePlayer.currentStats.maxEnergy, nextRunState.playerCurrentEnergyInRun + 10);
        }

        if (nextRunState.currentEnemy.stats.hp <= 0) {
            // CRITICAL: Call victory logic and RETURN the state it produces
            return processEnemyDefeated(nextRunState);
        } else { 
            // ENEMY ATTACK LOGIC
            if (Math.random() * 100 < activePlayer.currentStats.evasion) {
                logs.push({ message: `You dodged the ${nextRunState.currentEnemy.name}'s attack!`, color: 'text-red-400' });
            } else {
                let blocked = false;
                if (Math.random() * 100 < activePlayer.currentStats.blockChance) {
                    blocked = true;
                }

                const playerDefense = activePlayer.currentStats.defense;
                let enemyDamage = Math.max(1, nextRunState.currentEnemy.stats.attack - playerDefense);
                const enemyDamageVariance = 0.85 + Math.random() * 0.3;
                enemyDamage = Math.floor(enemyDamage * enemyDamageVariance);
                if (blocked) enemyDamage = Math.max(1, Math.floor(enemyDamage * 0.5));
                enemyDamage = Math.max(1, enemyDamage);
                
                nextRunState.playerCurrentHpInRun = Math.max(0, nextRunState.playerCurrentHpInRun - enemyDamage);
                
                if (blocked) {
                    logs.push({ message: `You BLOCKED! Took reduced damage (${enemyDamage}).`, color: 'text-cyan-400' });
                } else {
                    logs.push({ message: `${nextRunState.currentEnemy.name} hits you for ${enemyDamage} damage.`, color: 'text-slate-200' });
                }
            }
        
            if (nextRunState.playerCurrentHpInRun <= 0) {
                updateCurrentPlayer(player => ({ ...player, totalDeaths: (player.totalDeaths || 0) + 1 }));
                logs.push({ message: `You have been defeated...`, color: 'text-[#D6721C]' });
                setTimeout(() => setGameScreen('run_summary'), 2000);
            }
        }
        
        setCombatLogs(prevLogs => [...prevLogs, ...logs.map(log => ({...log, id: Date.now() + Math.random() * 100}))]);
        return nextRunState;
    });

  }, [activeProfileIndex, profiles, runState, processEnemyDefeated, updateCurrentPlayer]);

  // Cooldown Ticker Loop
  // Optimized: Cooldown only decreases when in active combat AND in Auto-Fight mode
  useEffect(() => {
    if (!runState) return;

    const cooldownTimer = setInterval(() => {
        setRunState(prev => {
            // Strict condition: only tick down if in run AND auto-fighting AND enemy is alive AND player is alive AND no loot pending
            if (!prev || !prev.isAutoBattling || prev.pendingLoot.length > 0 || prev.playerCurrentHpInRun <= 0 || prev.currentEnemy.stats.hp <= 0) {
                return prev;
            }
            
            const newCooldowns = { ...prev.skillCooldowns };
            let changed = false;
            Object.keys(newCooldowns).forEach(id => {
                if (newCooldowns[id] > 0) {
                    newCooldowns[id] = Math.max(0, newCooldowns[id] - 1);
                    changed = true;
                }
            });
            return changed ? { ...prev, skillCooldowns: newCooldowns } : prev;
        });
    }, 1000);

    return () => clearInterval(cooldownTimer);
  }, [!!runState]);

  // Auto Combat Loop
  useEffect(() => {
    if (!runState || !runState.isAutoBattling) return;

    if (runState.pendingLoot.length > 0 || runState.currentEnemy.stats.hp <= 0 || runState.playerCurrentHpInRun <= 0) {
        setRunState(prev => prev ? ({ ...prev, isAutoBattling: false }) : null);
        return;
    }

    const activePlayer = profiles[activeProfileIndex!];
    let speedBonus = 0;
    if (activePlayer) {
        speedBonus = (activePlayer.currentStats.attackSpeed || 0) + (activePlayer.currentStats.castSpeed || 0);
    }

    const baseDelay = 1000;
    const delay = Math.max(200, Math.floor(baseDelay / (1 + speedBonus / 100)));

    const timer = setTimeout(() => {
        handleAttack();
    }, delay); 

    return () => clearTimeout(timer);
  }, [runState?.isAutoBattling, handleAttack, activeProfileIndex, profiles]);

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
    
    if (action === 'equip') {
        updateCurrentPlayer(player => {
             const canEquipClass = !lootItem.weaponType || player.classInfo.allowedWeaponTypes.includes(lootItem.weaponType);
             if (!canEquipClass) return player;

             let finalSlot = targetSlot || lootItem.slot;
             if (lootItem.isTwoHanded) finalSlot = 'MainHand';

             const itemToEquip: Equipment = { ...lootItem, slot: finalSlot };
             
             let updatedPlayer = { ...player };
             const newInventory = [...updatedPlayer.inventory];
             let oldItem: Equipment | undefined;

             if (finalSlot === 'OffHand') {
                 if (updatedPlayer.equipment.MainHand && updatedPlayer.equipment.MainHand.isTwoHanded) {
                     newInventory.push(updatedPlayer.equipment.MainHand);
                     delete updatedPlayer.equipment.MainHand;
                 }
                 oldItem = updatedPlayer.equipment.OffHand;
                 updatedPlayer.equipment.OffHand = itemToEquip;
             } else if (finalSlot === 'MainHand') {
                 if (itemToEquip.isTwoHanded && updatedPlayer.equipment.OffHand) {
                     newInventory.push(updatedPlayer.equipment.OffHand);
                     delete updatedPlayer.equipment.OffHand;
                 }
                 oldItem = updatedPlayer.equipment.MainHand;
                 updatedPlayer.equipment.MainHand = itemToEquip;
             } else {
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
             
             if (maxHpAfter !== maxHpBefore && maxHpBefore > 0) {
                 const hpPercentage = hpBefore / maxHpBefore;
                 updatedPlayer.currentHp = Math.round(maxHpAfter * hpPercentage);
             }
             
             setRunState(prev => prev ? ({...prev, playerCurrentHpInRun: updatedPlayer.currentHp}) : null);
             return updatedPlayer;
        });
    } else if (action === 'take') {
        if (bagFull) {
            addLog("Inventory is full! Sold item instead.", 'text-red-400');
            const sellValue = Math.floor((lootItem.cost || 10) * 0.2);
            updateCurrentPlayer(player => ({
                ...player,
                eternalShards: player.eternalShards + sellValue,
                totalLifetimeShards: (player.totalLifetimeShards || 0) + sellValue
            }));
            setRunState(prev => prev ? ({...prev, shardsEarned: prev.shardsEarned + sellValue}) : null);
        } else {
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

    setRunState(prev => {
        if (!prev) return null;
        const remainingLoot = prev.pendingLoot.slice(1);
        const isNowLast = remainingLoot.length === 0;
        
        if (isNowLast) {
            const nextFloor = prev.floor + 1;
            const pLvl = activePlayer.level;
            
            let updatedHp = prev.playerCurrentHpInRun;
            if (prev.pendingLevelUpHeal) {
                updatedHp = activePlayer.currentStats.maxHp;
                addLog(`HP Restored!`, 'text-green-400');
            }

            setTimeout(() => advanceToNextFloor(nextFloor, pLvl), 1000);
            return { ...prev, pendingLoot: [], playerCurrentHpInRun: updatedHp, pendingLevelUpHeal: false };
        }
        
        return { ...prev, pendingLoot: remainingLoot };
    });

  }, [runState, advanceToNextFloor, updateCurrentPlayer, activeProfileIndex, profiles]);

  const handleEquipFromBag = useCallback((inventoryIndex: number) => {
      if (activeProfileIndex === null) return;
      
      updateCurrentPlayer(player => {
          const itemToEquip = player.inventory[inventoryIndex];
          if (!itemToEquip) return player;
          const canEquipClass = !itemToEquip.weaponType || player.classInfo.allowedWeaponTypes.includes(itemToEquip.weaponType);
          if (!canEquipClass) return player; 
          
          if (itemToEquip.slot === 'OffHand') {
              const mainHand = player.equipment.MainHand;
              if (!mainHand || mainHand.isTwoHanded) return player;
          }

          let updatedPlayer = { ...player };
          let slot = itemToEquip.slot;

          if (slot === 'MainHand' && !itemToEquip.isTwoHanded) {
              if (updatedPlayer.equipment.MainHand && !updatedPlayer.equipment.OffHand) {
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

    let logs: { message: string, color: CombatLog['color'] }[] = [];
    const POTION_HEAL_AMOUNT = 50;

    updateCurrentPlayer(player => ({ ...player, potionCount: player.potionCount - 1 }));

    const healAmount = POTION_HEAL_AMOUNT;
    setRunState(prev => {
        if (!prev) return null;
        const newRunState = { ...prev };
        newRunState.playerCurrentHpInRun = Math.min(activePlayer.currentStats.maxHp, newRunState.playerCurrentHpInRun + healAmount);
        logs.push({ message: `You used a Health Potion and restored ${healAmount} HP.`, color: 'text-slate-200' });
        setCombatLogs(prevLogs => [...prevLogs, ...logs.map(log => ({...log, id: Date.now() + Math.random() * 100}))]);
        return newRunState;
    });
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

  const handleUnlockSkill = useCallback((skillId: string) => {
    updateCurrentPlayer(player => {
        const tree = SKILL_TREES[player.classInfo.name] || [];
        const skill = tree.find(s => s.id === skillId);
        if (!skill) return player;

        const currentLvl = player.skills[skillId] || 0;
        if (currentLvl >= skill.maxLevel || player.skillPoints < skill.pointsRequired) return player;
        
        // Tier unlock logic
        if (skill.tier === 2) {
            const t1Points = tree.filter(s => s.tier === 1).reduce((sum, s) => sum + (player.skills[s.id] || 0), 0);
            if (t1Points < 5) return player;
        }
        if (skill.tier === 3) {
            const t2Points = tree.filter(s => s.tier === 2).reduce((sum, s) => sum + (player.skills[s.id] || 0), 0);
            if (t2Points < 3) return player;
        }

        let updated = {
            ...player,
            skillPoints: player.skillPoints - skill.pointsRequired,
            skills: { ...player.skills, [skillId]: currentLvl + 1 }
        };
        
        return recalculatePlayerStats(updated);
    });
  }, [updateCurrentPlayer]);

  const handleExitToProfiles = useCallback(() => {
    setActiveProfileIndex(null);
    setRunState(null);
    setCombatLogs([]);
    setGameScreen('profile_selection');
  }, []);

  const handleEnterShop = useCallback(() => setGameScreen('shop'), []);
  const handleEnterAchievements = useCallback(() => setGameScreen('achievements'), []);
  const handleEnterStats = useCallback(() => setGameScreen('stats'), []);
  const handleEnterSkills = useCallback(() => setGameScreen('skills'), []);
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
            onEnterSkills={handleEnterSkills}
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
            onUseSkill={handleUseSkill}
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
      case 'skills':
        if (activePlayer) {
            return <SkillTreeScreen player={activePlayer} onExit={handleExitSubScreen} onUnlockSkill={handleUnlockSkill} />;
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
