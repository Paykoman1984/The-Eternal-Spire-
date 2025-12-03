import React from 'react';
import type { Player, EquipmentSlot } from '../../types';
import { EQUIPMENT_SLOTS } from '../../constants';

interface MainGameScreenProps {
  player: Player;
  onReturnToStart: () => void;
  onEnterSpire: () => void;
}

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="bg-slate-900/70 p-2 rounded-lg text-center border border-slate-700">
        <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
        <p className="text-lg font-bold text-slate-200 mt-1">{value}</p>
    </div>
);

const EquipmentSlotDisplay: React.FC<{ slot: EquipmentSlot }> = ({ slot }) => (
    <div className="w-16 h-16 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-md flex flex-col items-center justify-center p-1 text-center hover:border-yellow-400 hover:bg-slate-800 transition-colors duration-300">
        <p className="text-[10px] text-slate-500">{slot}</p>
        <p className="text-xl text-slate-600">+</p>
    </div>
);

const MainGameScreen: React.FC<MainGameScreenProps> = ({ player, onReturnToStart, onEnterSpire }) => {
  const xpPercentage = (player.xp / player.xpToNextLevel) * 100;
  const hpPercentage = (player.currentHp / player.currentStats.maxHp) * 100;

  return (
    <div className="relative flex flex-col lg:flex-row gap-6 animate-fadeIn h-full">
      
      {/* Temporary Test Button */}
      <button
        onClick={onReturnToStart}
        className="absolute top-0 right-0 z-10 px-4 py-1 bg-red-800 text-red-200 text-xs font-semibold rounded-bl-lg rounded-tr-xl hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label="Return to start screen for testing"
      >
        Return to Start
      </button>

      {/* Left Panel: Character Info */}
      <div className="lg:w-1/3 bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col shadow-lg">
        <div className="flex items-center mb-2">
            <div className="text-4xl mr-4">{player.classInfo.icon}</div>
            <div>
                <h2 className="text-2xl font-bold text-yellow-400">{player.classInfo.name}</h2>
                <p className="text-base text-slate-300">Level {player.level}</p>
                <div className="flex items-center text-sm mt-2">
                    <span className="text-purple-400 mr-1.5">💎</span>
                    <span className="font-bold text-slate-200">{player.eternalShards}</span>
                    <span className="text-xs text-slate-400 ml-1.5">Eternal Shards</span>
                </div>
            </div>
        </div>

        <div className="mb-4">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>Account XP</span>
                <span>{player.xp} / {player.xpToNextLevel}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5">
                <div 
                    className="bg-yellow-400 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${xpPercentage}%` }}
                ></div>
            </div>
        </div>
        
        {/* HP Bar */}
        <div className="mb-4">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>HP</span>
                <span>{player.currentHp} / {player.currentStats.maxHp}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-4 border-2 border-slate-700">
                <div 
                    className="bg-red-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${hpPercentage}%` }}
                ></div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-2 mt-auto pt-4">
            <StatBox label="STR" value={player.currentStats.str} />
            <StatBox label="DEX" value={player.currentStats.dex} />
            <StatBox label="INT" value={player.currentStats.int} />
            <StatBox label="DEF" value={player.currentStats.defense} />
            <StatBox label="CRIT" value={`${player.currentStats.critRate}%`} />
        </div>
      </div>

      {/* Right Panel: Equipment & Actions */}
      <div className="lg:w-2/3 flex flex-col">
        <div className="flex-grow bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
          <h3 className="text-xl font-bold text-slate-300 mb-3 border-b-2 border-slate-700 pb-2">Equipment</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {EQUIPMENT_SLOTS.map((slot) => (
              <EquipmentSlotDisplay key={slot} slot={slot} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <button
            disabled
            className="w-full px-6 py-3 bg-slate-700 text-slate-500 font-bold text-base rounded-lg cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Shop (Coming Soon)
          </button>
          <button
            onClick={onEnterSpire}
            className="w-full px-6 py-3 bg-yellow-500 text-slate-900 font-bold text-base rounded-lg shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
          >
            Enter Spire
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainGameScreen;
