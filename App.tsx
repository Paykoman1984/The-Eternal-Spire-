import React, { useState, useCallback } from 'react';
import type { GameScreen, Player, PlayerClass } from './types';
import StartScreen from './components/screens/StartScreen';
import ClassSelectionScreen from './components/screens/ClassSelectionScreen';
import MainGameScreen from './components/screens/MainGameScreen';

const App: React.FC = () => {
  const [gameScreen, setGameScreen] = useState<GameScreen>('start');
  const [player, setPlayer] = useState<Player | null>(null);

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

  const handleReturnToStart = useCallback(() => {
    setGameScreen('start');
    setPlayer(null);
  }, []);

  const renderScreen = () => {
    switch (gameScreen) {
      case 'start':
        return <StartScreen onStart={handleStartGame} />;
      case 'class_selection':
        return <ClassSelectionScreen onClassSelect={handleClassSelect} />;
      case 'main_game':
        if (player) {
          return <MainGameScreen player={player} onReturnToStart={handleReturnToStart} />;
        }
        // Fallback in case player is null
        setGameScreen('start');
        return <StartScreen onStart={handleStartGame} />;
      default:
        return <StartScreen onStart={handleStartGame} />;
    }
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