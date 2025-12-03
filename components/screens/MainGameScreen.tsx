
import React from 'react';
import type { Player, EquipmentSlot, Equipment } from '../../types';
import { EQUIPMENT_SLOTS } from '../../constants';

interface MainGameScreenProps {
  player: Player;
  onExitToProfiles: () => void;
  onEnterSpire: () => void;
  onEnterShop: () => void;
  onEnterAchievements: () => void;
  onEnterStats: () => void;
}

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="bg-slate-900/70 p-0.5 rounded text-center border border-slate-700">
        <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
        <p className="text-xs font-bold text-slate-200">{value}</p>
    </div>
);

const EquipmentSlotDisplay: React.FC<{ slot: EquipmentSlot; item: Equipment | undefined; potionCount: number }> = ({ slot, item, potionCount }) => {
    
    const renderTooltip = () => {
        if (slot === 'Potions' && potionCount > 0) {
            return (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-[#D6721C] rounded-md shadow-lg p-2 text-xs z-10">
                    <p className="font-bold text-[#D6721C]">Health Potion</p>
                    <p className="text-slate-300">Restores 30% of Max HP.</p>
                </div>
            );
        }
        if (item) {
            return (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-[#D6721C] rounded-md shadow-lg p-2 text-xs z-10">
                    <p className="font-bold text-[#D6721C]">{item.name}</p>
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
                 <div className="w-14 h-14 bg-slate-800/50 border-2 border-slate-600 rounded-md flex flex-col items-center justify-center p-1 text-center">
                    <p className="text-xl">🧪</p>
                    <p className="text-xs font-bold text-slate-300">x{potionCount}</p>
                </div>
            ) : item ? (
                <div className="w-14 h-14 bg-slate-800 border-2 border-slate-600 rounded-md flex flex-col items-center justify-center p-1 text-center">
                    <p className="text-xl">{item.icon}</p>
                    <p className="text-[10px] text-[#D6721C] truncate w-full px-1">{item.name}</p>
                </div>
            ) : (
                <div className="w-14 h-14 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-md flex flex-col items-center justify-center p-1 text-center hover:border-[#D6721C] hover:bg-slate-800 transition-colors duration-300">
                    <p className="text-[10px] text-slate-500">{slot}</p>
                    <p className="text-lg text-slate-600">+</p>
                </div>
            )}
            {renderTooltip()}
        </div>
    );
};


const MainGameScreen: React.FC<MainGameScreenProps> = ({ player, onExitToProfiles, onEnterSpire, onEnterShop, onEnterAchievements, onEnterStats }) => {
  const xpPercentage = (player.xp / player.xpToNextLevel) * 100;
  const hasAccountBuffs = Object.keys(player.accountBuffs).length > 0;

  return (
    <div className="relative flex flex-col lg:flex-row gap-4 animate-fadeIn h-full">
      
      <button
        onClick={onExitToProfiles}
        className="absolute top-0 right-0 z-10 px-3 py-1 bg-slate-700 text-slate-300 text-xs font-semibold rounded-bl-lg rounded-tr-xl hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
        aria-label="Exit to profile selection"
      >
        Exit
      </button>

      {/* Left Panel: Character Info */}
      <div className="lg:w-1/3 bg-slate-800 border border-slate-700 rounded-xl p-3 flex flex-col shadow-lg">
        <div className="flex items-center mb-2">
            <div className="text-3xl mr-3">{player.classInfo.icon}</div>
            <div>
                <h2 className="text-xl font-bold text-[#D6721C]">{player.classInfo.name}</h2>
                <p className="text-sm text-slate-300">Level {player.level}</p>
                <div className="flex items-center text-xs mt-1.5">
                    <span className="text-purple-400 mr-1.5">💎</span>
                    <span className="font-bold text-slate-200">{player.eternalShards}</span>
                    <span className="text-xs text-slate-400 ml-1">Shards</span>
                </div>
            </div>
        </div>

        <div className="mb-3">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>XP</span>
                <span>{player.xp}/{player.xpToNextLevel}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2">
                <div 
                    className="bg-[#D6721C] h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${xpPercentage}%` }}
                ></div>
            </div>
        </div>
        
        <div className="mt-auto space-y-3">
            <div>
                <h4 className="text-xs font-bold text-[#D6721C] border-b border-slate-700 pb-1 mb-1.5">Account Bonuses</h4>
                {hasAccountBuffs ? (
                    <div className="grid grid-cols-3 gap-1 text-xs">
                        {Object.entries(player.accountBuffs).map(([stat, value]) => (
                            <div key={stat} className="text-center bg-slate-900/50 p-0.5 rounded">
                               <p className="font-semibold text-green-400">+{value}%</p>
                               <p className="text-slate-400 text-[10px]">{stat.toUpperCase()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 text-center italic py-1">Reach level milestones for permanent buffs.</p>
                )}
            </div>

            <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-700">
                <StatBox label="HP" value={player.currentStats.maxHp} />
                <StatBox label="STR" value={player.currentStats.str} />
                <StatBox label="DEX" value={player.currentStats.dex} />
                <StatBox label="INT" value={player.currentStats.int} />
                <StatBox label="DEF" value={player.currentStats.defense} />
                <StatBox label="CRIT" value={`${player.currentStats.critRate}%`} />
                <StatBox label="EVADE" value={`${player.currentStats.evasion}%`} />
            </div>
        </div>
      </div>

      <div className="lg:w-2/3 flex flex-col">
        <div className="flex-grow bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-lg">
          <h3 className="text-base font-bold text-[#D6721C] mb-2 border-b-2 border-slate-700 pb-1.5">Equipment</h3>
          <div className="flex flex-wrap gap-2 justify-center">
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

        <div className="grid grid-cols-4 gap-3 mt-3">
          <button
            onClick={onEnterShop}
            className="flex flex-col items-center justify-center w-full px-2 py-2 bg-purple-700 text-white font-bold text-xs rounded-lg shadow-lg shadow-purple-500/20 hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Shop
          </button>
           <button
            onClick={onEnterAchievements}
             className="flex flex-col items-center justify-center w-full px-2 py-2 bg-cyan-700 text-white font-bold text-xs rounded-lg shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Achieve
          </button>
          <button
            onClick={onEnterStats}
             className="flex flex-col items-center justify-center w-full px-2 py-2 bg-slate-600 text-white font-bold text-xs rounded-lg shadow-lg shadow-slate-500/20 hover:bg-slate-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            All Time Stats
          </button>
          <button
            onClick={onEnterSpire}
             className="flex flex-col items-center justify-center w-full px-2 py-2 bg-[#D6721C] text-slate-900 font-bold text-xs rounded-lg shadow-lg shadow-[#D6721C]/20 hover:bg-[#E1883D] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#D6721C]"
          >
            Enter Spire
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainGameScreen;
