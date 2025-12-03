import React from 'react';
import type { Player, EquipmentSlot, Equipment } from '../../types';
import { EQUIPMENT_SLOTS } from '../../constants';

interface MainGameScreenProps {
  player: Player;
  onReturnToStart: () => void;
  onEnterSpire: () => void;
  onEnterShop: () => void;
  onEnterAchievements: () => void;
}

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="bg-slate-900/70 p-1 rounded-md text-center border border-slate-700">
        <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
        <p className="text-base font-bold text-slate-200">{value}</p>
    </div>
);

const EquipmentSlotDisplay: React.FC<{ slot: EquipmentSlot; item: Equipment | undefined; potionCount: number }> = ({ slot, item, potionCount }) => {
    
    const renderTooltip = () => {
        if (slot === 'Potions' && potionCount > 0) {
            return (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-yellow-500 rounded-md shadow-lg p-2 text-xs z-10">
                    <p className="font-bold text-yellow-400">Health Potion</p>
                    <p className="text-slate-300">Restores 30% of Max HP.</p>
                </div>
            );
        }
        if (item) {
            return (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-yellow-500 rounded-md shadow-lg p-2 text-xs z-10">
                    <p className="font-bold text-yellow-400">{item.name}</p>
                    {Object.keys(item.stats).length > 0 && (
                        <div className="mt-1 border-t border-slate-600 pt-1 space-y-0.5">
                            {Object.entries(item.stats).map(([stat, value]) => (
                                <div key={stat} className="flex justify-between gap-4">
                                    <span className="text-slate-300">{stat.toUpperCase()}</span>
                                    <span className="font-semibold text-green-400">+{value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="relative group">
            {slot === 'Potions' ? (
                 <div className="w-16 h-16 bg-slate-800/50 border-2 border-slate-600 rounded-md flex flex-col items-center justify-center p-1 text-center">
                    <p className="text-2xl">🧪</p>
                    <p className="text-xs font-bold text-slate-300">x{potionCount}</p>
                </div>
            ) : item ? (
                <div className="w-16 h-16 bg-slate-800 border-2 border-slate-600 rounded-md flex flex-col items-center justify-center p-1 text-center">
                    <p className="text-2xl">{item.icon}</p>
                    <p className="text-[10px] text-yellow-400 truncate w-full px-1">{item.name}</p>
                </div>
            ) : (
                <div className="w-16 h-16 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-md flex flex-col items-center justify-center p-1 text-center hover:border-yellow-400 hover:bg-slate-800 transition-colors duration-300">
                    <p className="text-[10px] text-slate-500">{slot}</p>
                    <p className="text-xl text-slate-600">+</p>
                </div>
            )}
            {renderTooltip()}
        </div>
    );
};


const MainGameScreen: React.FC<MainGameScreenProps> = ({ player, onReturnToStart, onEnterSpire, onEnterShop, onEnterAchievements }) => {
  const xpPercentage = (player.xp / player.xpToNextLevel) * 100;
  const hasAccountBuffs = Object.keys(player.accountBuffs).length > 0;

  return (
    <div className="relative flex flex-col lg:flex-row gap-6 animate-fadeIn h-full">
      
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
        
        <div className="mt-auto space-y-4">
            {/* Account Bonuses Section */}
            <div>
                <h4 className="text-sm font-bold text-slate-400 border-b border-slate-700 pb-1 mb-2">Account Bonuses</h4>
                {hasAccountBuffs ? (
                    <div className="grid grid-cols-3 gap-1 text-xs">
                        {Object.entries(player.accountBuffs).map(([stat, value]) => (
                            <div key={stat} className="text-center bg-slate-900/50 p-1 rounded">
                               <p className="font-semibold text-green-400">+{value}%</p>
                               <p className="text-slate-400">{stat.toUpperCase()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 text-center italic py-2">Reach level milestones for permanent buffs.</p>
                )}
            </div>

            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-700">
                <StatBox label="HP" value={player.currentStats.maxHp} />
                <StatBox label="STR" value={player.currentStats.str} />
                <StatBox label="DEX" value={player.currentStats.dex} />
                <StatBox label="INT" value={player.currentStats.int} />
                <StatBox label="DEF" value={player.currentStats.defense} />
                <StatBox label="CRIT" value={`${player.currentStats.critRate}%`} />
            </div>
        </div>
      </div>

      <div className="lg:w-2/3 flex flex-col">
        <div className="flex-grow bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
          <h3 className="text-xl font-bold text-slate-300 mb-3 border-b-2 border-slate-700 pb-2">Equipment</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {EQUIPMENT_SLOTS.map((slot) => (
              <EquipmentSlotDisplay 
                key={slot} 
                slot={slot}
                item={slot !== 'Potions' ? player.equipment[slot] : undefined}
                potionCount={player.potionCount}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <button
            onClick={onEnterShop}
            className="w-full px-6 py-3 bg-purple-700 text-white font-bold text-sm rounded-lg shadow-lg shadow-purple-500/20 hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 flex items-center justify-center"
          >
            Shop
          </button>
           <button
            onClick={onEnterAchievements}
            className="w-full px-6 py-3 bg-cyan-700 text-white font-bold text-sm rounded-lg shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500 flex items-center justify-center"
          >
            Achievements
          </button>
          <button
            onClick={onEnterSpire}
            className="w-full px-6 py-3 bg-yellow-500 text-slate-900 font-bold text-sm rounded-lg shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300 flex items-center justify-center"
          >
            Enter Spire
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainGameScreen;