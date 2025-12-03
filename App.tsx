import React, { useState, useCallback } from 'react';
import type { GameScreen, Player, PlayerClass, RunState, CombatLog, Equipment, GearSlot, Stats } from './types';
import { generateEnemy } from './utils/combat';
import { generateLoot } from './utils/loot';
import { generateShopInventory } from './utils/shop';
import StartScreen from './components/screens/StartScreen';
import ClassSelectionScreen from './components/screens/ClassSelectionScreen';
import MainGameScreen from './components/screens/MainGameScreen';
import CombatScreen from './components/screens/CombatScreen';
import ShopScreen from './components/screens/ShopScreen';

const App: React.FC = () => {
  const [gameScreen, setGameScreen] = useState<GameScreen>('start');
  const [player, setPlayer] = useState<Player | null>(null);
  const [runState, setRunState] = useState<RunState | null>(null);
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([]);

  const addLog = (message: string, color: CombatLog['color']) => {
    setCombatLogs(prev => [...prev, { id: Date.now() + Math.random(), message, color }]);
  };

  const handleStartGame = useCallback(() => {
    setGameScreen('class_selection');
  }, []);

  const handleClassSelect = useCallback((selectedClass: PlayerClass) => {
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
        // Apply starting weapon stats to base stats
        Object.keys(startingWeapon.stats).forEach(stat => {
            const key = stat as keyof Stats;
            baseStats[key] += startingWeapon!.stats[key] ?? 0;
        });
    }

    setPlayer({
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      classInfo: selectedClass,
      currentStats: baseStats,
      currentHp: baseStats.maxHp,
      eternalShards: 0,
      potionCount: 1,
      equipment: startingEquipment,
      shopInventory: [],
      lastShopRefreshLevel: 1,
    });
    setGameScreen('main_game');
  }, []);
  
  const handleAccountLevelUp = (currentPlayer: Player): Player => {
      let updatedPlayer = { ...currentPlayer };
      const levelBeforeUpdate = updatedPlayer.level;

      while (updatedPlayer.xp >= updatedPlayer.xpToNextLevel) {
          updatedPlayer.xp -= updatedPlayer.xpToNextLevel;
          updatedPlayer.level += 1;
          updatedPlayer.xpToNextLevel = Math.floor(updatedPlayer.xpToNextLevel * 1.5);
          updatedPlayer.currentStats.maxHp += 10;
          updatedPlayer.currentStats.str += 1;
          updatedPlayer.currentStats.dex += 1;
          updatedPlayer.currentStats.int += 1;
          updatedPlayer.currentStats.defense += 1;
          updatedPlayer.currentHp = updatedPlayer.currentStats.maxHp;
      }

      const crossedLevelThreshold = Math.floor(updatedPlayer.level / 5) > Math.floor(levelBeforeUpdate / 5);
      if (crossedLevelThreshold) {
          updatedPlayer.shopInventory = generateShopInventory(updatedPlayer);
          updatedPlayer.lastShopRefreshLevel = updatedPlayer.level;
      }

      return updatedPlayer;
  };

  const endRun = useCallback(() => {
    if (!runState || !player) return;

    const totalRunXp = runState.runXp;
    let updatedPlayer = { ...player, xp: player.xp + totalRunXp };
    
    updatedPlayer = handleAccountLevelUp(updatedPlayer);

    updatedPlayer.currentHp = updatedPlayer.currentStats.maxHp;

    setPlayer(updatedPlayer);
    setRunState(null);
    setCombatLogs([]);
    setGameScreen('main_game');
  }, [runState, player]);


  const handleEnterSpire = useCallback(() => {
    if (!player) return;

    const initialEnemy = generateEnemy(1);
    setRunState({
      floor: 1,
      runLevel: 1,
      runXp: 0,
      runXpToNextLevel: 50,
      playerCurrentHpInRun: player.currentStats.maxHp,
      currentEnemy: initialEnemy,
      pendingLoot: null,
    });
    setCombatLogs([]);
    addLog(`You enter the Spire. A ${initialEnemy.name} appears!`, 'text-slate-400');
    setGameScreen('combat');
  }, [player]);

  const advanceToNextFloor = useCallback(() => {
    setRunState(prev => {
        if (!prev) return null;
        const nextFloor = prev.floor + 1;
        const nextEnemy = generateEnemy(nextFloor);
        addLog(`You advance to Floor ${nextFloor}. A ${nextEnemy.name} appears!`, 'text-slate-400');
        return {
            ...prev,
            floor: nextFloor,
            currentEnemy: nextEnemy,
            pendingLoot: null,
        };
    });
  }, []);

  const handleAttack = useCallback(() => {
    if (!player || !runState || runState.pendingLoot) return;
  
    let newRunState = { ...runState };
    let playerAfterUpdate = JSON.parse(JSON.stringify(player)) as Player;
    let didLevelUp = false;

    let logs: { message: string, color: CombatLog['color'] }[] = [];
    let playerDefeated = false;
  
    const playerCrit = Math.random() * 100 < player.currentStats.critRate;
    const playerAttackStat = Math.max(player.currentStats.str, player.currentStats.dex, player.currentStats.int);
    let playerDamage = Math.max(1, playerAttackStat - newRunState.currentEnemy.stats.defense);
    if(playerCrit) playerDamage *= 2;
    playerDamage = Math.floor(playerDamage);
    newRunState.currentEnemy.stats.hp = Math.max(0, newRunState.currentEnemy.stats.hp - playerDamage);
    logs.push({ message: `You hit the ${newRunState.currentEnemy.name} for ${playerDamage} damage${playerCrit ? ' (CRIT!)' : ''}.`, color: 'text-green-400' });
  
    if (newRunState.currentEnemy.stats.hp <= 0) {
      logs.push({ message: `You have defeated the ${newRunState.currentEnemy.name}!`, color: 'text-yellow-400' });
      
      const xpGained = newRunState.currentEnemy.xpReward;
      newRunState.runXp += xpGained;
      logs.push({ message: `You gained ${xpGained} XP.`, color: 'text-yellow-400' });

      if (newRunState.runXp >= newRunState.runXpToNextLevel) {
          didLevelUp = true;
          newRunState.runXp -= newRunState.runXpToNextLevel;
          newRunState.runLevel += 1;
          newRunState.runXpToNextLevel = Math.floor(newRunState.runXpToNextLevel * 1.8);
          
          playerAfterUpdate.currentStats.maxHp += 5;
          playerAfterUpdate.currentStats.str += 1;
          playerAfterUpdate.currentStats.dex += 1;
          playerAfterUpdate.currentStats.int += 1;

          newRunState.playerCurrentHpInRun = playerAfterUpdate.currentStats.maxHp; 
          logs.push({ message: `You leveled up to Run Level ${newRunState.runLevel}! Your stats permanently increase and HP is restored.`, color: 'text-yellow-400' });
      }

      const loot = generateLoot(newRunState.floor);
      if (loot.shards > 0) {
          playerAfterUpdate.eternalShards += loot.shards;
          logs.push({ message: `The enemy dropped ${loot.shards} Eternal Shards.`, color: 'text-purple-400' });
      }
      if (loot.potions > 0) {
          const potionsGained = Math.min(loot.potions, 5 - playerAfterUpdate.potionCount);
          if (potionsGained > 0) {
              playerAfterUpdate.potionCount += potionsGained;
              logs.push({ message: `You found a Health Potion! You now have ${playerAfterUpdate.potionCount}.`, color: 'text-purple-400' });
          }
      }

      if (loot.equipment) {
          newRunState.pendingLoot = loot.equipment;
          logs.push({ message: `The enemy dropped a piece of equipment: ${loot.equipment.name}!`, color: 'text-purple-400' });
      } else {
          setCombatLogs(prev => [...prev, ...logs.map(log => ({...log, id: Date.now() + Math.random() * logs.indexOf(log)}))]);
          setPlayer(playerAfterUpdate);
          setRunState(newRunState);
          setTimeout(advanceToNextFloor, 1000); // Wait a moment before advancing
          return;
      }
      
    } else {
      const currentDefense = didLevelUp ? playerAfterUpdate.currentStats.defense : player.currentStats.defense;
      let enemyDamage = Math.max(1, newRunState.currentEnemy.stats.attack - currentDefense);
      enemyDamage = Math.floor(enemyDamage);
      newRunState.playerCurrentHpInRun = Math.max(0, newRunState.playerCurrentHpInRun - enemyDamage);
      logs.push({ message: `${newRunState.currentEnemy.name} hits you for ${enemyDamage} damage.`, color: 'text-red-400' });
  
      if (newRunState.playerCurrentHpInRun <= 0) {
        playerDefeated = true;
        logs.push({ message: `You have been defeated...`, color: 'text-red-400' });
      }
    }

    setCombatLogs(prev => [...prev, ...logs.map(log => ({...log, id: Date.now() + Math.random() * logs.indexOf(log)}))]);
    setPlayer(playerAfterUpdate);
    setRunState(newRunState);

    if (playerDefeated) {
      setTimeout(endRun, 2000);
    }
  
  }, [player, runState, endRun, advanceToNextFloor]);

  const handleLootDecision = useCallback((equip: boolean) => {
    if (!player || !runState || !runState.pendingLoot) return;

    const lootItem = runState.pendingLoot;
    if (equip) {
        let updatedPlayer = { ...player };
        const slot = lootItem.slot;
        const oldItem = updatedPlayer.equipment[slot];

        // Remove old item stats
        if (oldItem) {
            Object.keys(oldItem.stats).forEach(stat => {
                const key = stat as keyof typeof oldItem.stats;
                updatedPlayer.currentStats[key] -= oldItem.stats[key] ?? 0;
            });
        }
        
        // Add new item stats
        Object.keys(lootItem.stats).forEach(stat => {
            const key = stat as keyof typeof lootItem.stats;
            updatedPlayer.currentStats[key] += lootItem.stats[key] ?? 0;
        });

        updatedPlayer.equipment[slot] = lootItem;
        
        // Adjust HP if maxHp changed
        if(lootItem.stats.maxHp){
            updatedPlayer.currentStats.maxHp = Math.max(1, updatedPlayer.currentStats.maxHp);
            updatedPlayer.currentHp = Math.min(updatedPlayer.currentHp + lootItem.stats.maxHp, updatedPlayer.currentStats.maxHp);
            runState.playerCurrentHpInRun = Math.min(runState.playerCurrentHpInRun + lootItem.stats.maxHp, updatedPlayer.currentStats.maxHp)
        }


        setPlayer(updatedPlayer);
        addLog(`You equipped ${lootItem.name}.`, 'text-purple-400');
    } else {
        addLog(`You discarded ${lootItem.name}.`, 'text-slate-400');
    }

    advanceToNextFloor();
  }, [player, runState, advanceToNextFloor]);

  const handleUsePotion = useCallback(() => {
    if (!player || !runState || runState.pendingLoot || player.potionCount <= 0 || runState.playerCurrentHpInRun >= player.currentStats.maxHp) return;

    let newRunState = { ...runState };
    let playerAfterUpdate = { ...player };
    let logs: { message: string, color: CombatLog['color'] }[] = [];
    let playerDefeated = false;
    const POTION_HEAL_PERCENT = 0.3;

    playerAfterUpdate.potionCount -= 1;
    const healAmount = Math.floor(player.currentStats.maxHp * POTION_HEAL_PERCENT);
    const oldHp = newRunState.playerCurrentHpInRun;
    newRunState.playerCurrentHpInRun = Math.min(player.currentStats.maxHp, newRunState.playerCurrentHpInRun + healAmount);
    const actualHeal = newRunState.playerCurrentHpInRun - oldHp;
    logs.push({ message: `You used a Health Potion and restored ${actualHeal} HP.`, color: 'text-green-400' });

    if (newRunState.currentEnemy.stats.hp > 0) {
        let enemyDamage = Math.max(1, newRunState.currentEnemy.stats.attack - player.currentStats.defense);
        enemyDamage = Math.floor(enemyDamage);
        newRunState.playerCurrentHpInRun = Math.max(0, newRunState.playerCurrentHpInRun - enemyDamage);
        logs.push({ message: `${newRunState.currentEnemy.name} hits you for ${enemyDamage} damage.`, color: 'text-red-400' });
    
        if (newRunState.playerCurrentHpInRun <= 0) {
          playerDefeated = true;
          logs.push({ message: `You have been defeated...`, color: 'text-red-400' });
        }
    }

    setCombatLogs(prev => [...prev, ...logs.map(log => ({...log, id: Date.now() + Math.random() * logs.indexOf(log)}))]);
    setPlayer(playerAfterUpdate);
    setRunState(newRunState);

    if (playerDefeated) {
      setTimeout(endRun, 2000);
    }
  }, [player, runState, endRun]);
  
  const handleReturnToStart = useCallback(() => {
    setGameScreen('start');
    setPlayer(null);
    setRunState(null);
    setCombatLogs([]);
  }, []);

  const handleEnterShop = useCallback(() => {
    setGameScreen('shop');
  }, []);
  
  const handleExitShop = useCallback(() => {
    setGameScreen('main_game');
  }, []);

  const handleBuyPotion = useCallback(() => {
    if (!player) return;

    const POTION_COST = 50;
    if (player.eternalShards >= POTION_COST && player.potionCount < 5) {
        setPlayer(prev => {
            if (!prev) return null;
            return {
                ...prev,
                eternalShards: prev.eternalShards - POTION_COST,
                potionCount: prev.potionCount + 1,
            };
        });
    }
  }, [player]);

  const handleBuyShopItem = useCallback((itemToBuy: Equipment) => {
    if (!player || !itemToBuy.cost || player.eternalShards < itemToBuy.cost) return;

    let updatedPlayer = { ...player };

    updatedPlayer.eternalShards -= itemToBuy.cost;

    const slot = itemToBuy.slot;
    const oldItem = updatedPlayer.equipment[slot];
    if (oldItem) {
        Object.keys(oldItem.stats).forEach(stat => {
            const key = stat as keyof typeof oldItem.stats;
            updatedPlayer.currentStats[key] -= oldItem.stats[key] ?? 0;
        });
    }
    Object.keys(itemToBuy.stats).forEach(stat => {
        const key = stat as keyof typeof itemToBuy.stats;
        updatedPlayer.currentStats[key] += itemToBuy.stats[key] ?? 0;
    });
    updatedPlayer.equipment[slot] = { ...itemToBuy }; // Create a copy

    if(itemToBuy.stats.maxHp || oldItem?.stats.maxHp){
        const maxHpChange = (itemToBuy.stats.maxHp ?? 0) - (oldItem?.stats.maxHp ?? 0);
        updatedPlayer.currentStats.maxHp = Math.max(1, updatedPlayer.currentStats.maxHp);
        updatedPlayer.currentHp = Math.min(updatedPlayer.currentHp + maxHpChange, updatedPlayer.currentStats.maxHp);
         if (updatedPlayer.currentHp <= 0) updatedPlayer.currentHp = 1;
    }
    
    updatedPlayer.shopInventory = updatedPlayer.shopInventory.filter(item => item.name !== itemToBuy.name);

    setPlayer(updatedPlayer);

}, [player]);

  const renderScreen = () => {
    switch (gameScreen) {
      case 'start':
        return <StartScreen onStart={handleStartGame} />;
      case 'class_selection':
        return <ClassSelectionScreen onClassSelect={handleClassSelect} />;
      case 'main_game':
        if (player) {
          return <MainGameScreen 
            player={player} 
            onReturnToStart={handleReturnToStart} 
            onEnterSpire={handleEnterSpire}
            onEnterShop={handleEnterShop}
          />;
        }
        break;
      case 'combat':
        if (player && runState) {
          return <CombatScreen 
            player={player} 
            runState={runState} 
            logs={combatLogs} 
            onAttack={handleAttack} 
            onFlee={endRun} 
            onLootDecision={handleLootDecision}
            onUsePotion={handleUsePotion}
          />;
        }
        break;
      case 'shop':
        if (player) {
          return <ShopScreen
            player={player}
            onExit={handleExitShop}
            onBuyPotion={handleBuyPotion}
            onBuyShopItem={handleBuyShopItem}
          />;
        }
        break;
    }
    setGameScreen('start');
    return <StartScreen onStart={handleStartGame} />;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-4 font-serif">
      <div className="w-full max-w-4xl mx-auto">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
