import React, { useState, useCallback } from 'react';
import type { GameScreen, Player, PlayerClass, RunState, CombatLog } from './types';
import { generateEnemy } from './utils/combat';
import StartScreen from './components/screens/StartScreen';
import ClassSelectionScreen from './components/screens/ClassSelectionScreen';
import MainGameScreen from './components/screens/MainGameScreen';
import CombatScreen from './components/screens/CombatScreen';

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
    setPlayer({
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      classInfo: selectedClass,
      currentStats: baseStats,
      currentHp: baseStats.maxHp,
      eternalShards: 0,
    });
    setGameScreen('main_game');
  }, []);
  
  const handleAccountLevelUp = (currentPlayer: Player): Player => {
      let updatedPlayer = { ...currentPlayer };
      while (updatedPlayer.xp >= updatedPlayer.xpToNextLevel) {
          updatedPlayer.xp -= updatedPlayer.xpToNextLevel;
          updatedPlayer.level += 1;
          updatedPlayer.xpToNextLevel = Math.floor(updatedPlayer.xpToNextLevel * 1.5);
          // Persistently upgrade stats on account level up
          updatedPlayer.currentStats.maxHp += 10;
          updatedPlayer.currentStats.str += 1;
          updatedPlayer.currentStats.dex += 1;
          updatedPlayer.currentStats.int += 1;
          updatedPlayer.currentStats.defense += 1;
          updatedPlayer.currentHp = updatedPlayer.currentStats.maxHp; // Heal on level up
      }
      return updatedPlayer;
  };

  const endRun = useCallback(() => {
    if (!runState || !player) return;

    const totalRunXp = runState.runXp;
    let updatedPlayer = { ...player, xp: player.xp + totalRunXp };
    
    updatedPlayer = handleAccountLevelUp(updatedPlayer);

    // After all updates, restore HP for the main screen
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
    });
    setCombatLogs([]);
    addLog(`You enter the Spire. A ${initialEnemy.name} appears!`, 'text-slate-400');
    setGameScreen('combat');
  }, [player]);

  const handleAttack = useCallback(() => {
    if (!player || !runState) return;
  
    const newRunState = { ...runState };
    // Create a mutable player copy to stage changes from a potential level up.
    const playerAfterLevelUp = JSON.parse(JSON.stringify(player)) as Player;
    let didLevelUp = false;

    let logs: { message: string, color: CombatLog['color'] }[] = [];
    let playerDefeated = false;
  
    // 1. Player attacks
    const playerCrit = Math.random() * 100 < player.currentStats.critRate;
    const playerAttackStat = Math.max(player.currentStats.str, player.currentStats.dex, player.currentStats.int);
    let playerDamage = Math.max(1, playerAttackStat - newRunState.currentEnemy.stats.defense);
    if(playerCrit) playerDamage *= 2;
    playerDamage = Math.floor(playerDamage);
    newRunState.currentEnemy.stats.hp = Math.max(0, newRunState.currentEnemy.stats.hp - playerDamage);
    logs.push({ message: `You hit the ${newRunState.currentEnemy.name} for ${playerDamage} damage${playerCrit ? ' (CRIT!)' : ''}.`, color: 'text-green-400' });
  
    // 2. Check if enemy is defeated
    if (newRunState.currentEnemy.stats.hp <= 0) {
      logs.push({ message: `You have defeated the ${newRunState.currentEnemy.name}!`, color: 'text-yellow-400' });
      
      const xpGained = newRunState.currentEnemy.xpReward;
      newRunState.runXp += xpGained;
      logs.push({ message: `You gained ${xpGained} XP.`, color: 'text-yellow-400' });

      // 3. Check for Run Level Up
      if (newRunState.runXp >= newRunState.runXpToNextLevel) {
          didLevelUp = true;
          newRunState.runXp -= newRunState.runXpToNextLevel;
          newRunState.runLevel += 1;
          newRunState.runXpToNextLevel = Math.floor(newRunState.runXpToNextLevel * 1.8);
          
          // Apply persistent stat upgrades
          playerAfterLevelUp.currentStats.maxHp += 5;
          playerAfterLevelUp.currentStats.str += 1;
          playerAfterLevelUp.currentStats.dex += 1;
          playerAfterLevelUp.currentStats.int += 1;

          // Heal on run level up
          newRunState.playerCurrentHpInRun = playerAfterLevelUp.currentStats.maxHp; 
          logs.push({ message: `You leveled up to Run Level ${newRunState.runLevel}! Your stats permanently increase and HP is restored.`, color: 'text-yellow-400' });
      }

      // 4. Advance to next floor
      newRunState.floor += 1;
      const nextEnemy = generateEnemy(newRunState.floor);
      newRunState.currentEnemy = nextEnemy;
      logs.push({ message: `You advance to Floor ${newRunState.floor}. A ${nextEnemy.name} appears!`, color: 'text-slate-400' });
      
    } else {
      // 5. Enemy attacks if not defeated
      const currentDefense = didLevelUp ? playerAfterLevelUp.currentStats.defense : player.currentStats.defense;
      let enemyDamage = Math.max(1, newRunState.currentEnemy.stats.attack - currentDefense);
      enemyDamage = Math.floor(enemyDamage);
      newRunState.playerCurrentHpInRun = Math.max(0, newRunState.playerCurrentHpInRun - enemyDamage);
      logs.push({ message: `${newRunState.currentEnemy.name} hits you for ${enemyDamage} damage.`, color: 'text-red-400' });
  
      if (newRunState.playerCurrentHpInRun <= 0) {
        playerDefeated = true;
        logs.push({ message: `You have been defeated...`, color: 'text-red-400' });
      }
    }

    // 6. Commit state changes
    setCombatLogs(prev => [...prev, ...logs.map(log => ({...log, id: Date.now() + Math.random() * logs.indexOf(log)}))]);
    
    if(didLevelUp) {
        setPlayer(playerAfterLevelUp);
    }
    setRunState(newRunState);

    // 7. Handle defeat after a delay
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

  const renderScreen = () => {
    switch (gameScreen) {
      case 'start':
        return <StartScreen onStart={handleStartGame} />;
      case 'class_selection':
        return <ClassSelectionScreen onClassSelect={handleClassSelect} />;
      case 'main_game':
        if (player) {
          return <MainGameScreen player={player} onReturnToStart={handleReturnToStart} onEnterSpire={handleEnterSpire} />;
        }
        break;
      case 'combat':
        if (player && runState) {
          return <CombatScreen player={player} runState={runState} logs={combatLogs} onAttack={handleAttack} onFlee={endRun} />;
        }
        break;
    }
    // Fallback
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