
import React from 'react';
import type { Player, EquipmentSlot, Equipment } from '../../types';
import { EQUIPMENT_SLOTS } from '../../constants';
import { RARITY_COLORS } from '../../data/items';

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
            const rarityColor = RARITY_COLORS[item.rarity || 'Common'];
            return (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-[#D6721C] rounded-md shadow-lg p-2 text-xs z-10">
                    <p className={`font-bold ${rarityColor}`}>{item.name}</p>
                    <p className="text-[10px] text-slate-400 mb-1">{item.rarity || 'Common'}</p>
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

    const nameColor = item ? (RARITY_COLORS[item.rarity || 'Common'] || 'text-[#D6721C]') : 'text-[#D6721C]';

    return (
        <div className="relative group">
            {slot === 'Potions' ? (
                 <div className="w-12 h-12 bg-slate-800/50 border-2 border-slate-600 rounded-md flex flex-col items-center justify-center p-1 text-center">
                    <p className="text-lg">🧪</p>
                    <p className="text-xs font-bold text-slate-300">x{potionCount}</p>
                </div>
            ) : item ? (
                <div className="w-12 h-12 bg-slate-800 border-2 border-slate-600 rounded-md flex flex-col items-center justify-center p-1 text-center">
                    <p className="text-lg">{item.icon}</p>
                    <p className={`text-[9px] truncate w-full px-0.5 ${nameColor}`}>{item.name}</p>
                </div>
            ) : (
                <div className="w-12 h-12 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-md flex flex-col items-center justify-center p-1 text-center hover:border-[#D6721C] hover:bg-slate-800 transition-colors duration-300">
                    <p className="text-[10px] text-slate-500">{slot}</p>
                    <p className="text-base text-slate-600">+</p>
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
    <div className="relative flex flex-col gap-3 animate-fadeIn h-full w-full p-4">
      
      <button
        onClick={onExitToProfiles}
        className="absolute top-0 right-0 z-10 px-3 py-1 bg-slate-700 text-slate-300 text-xs font-semibold rounded-bl-lg hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
        aria-label="Exit to profile selection"
      >
        Exit
      </button>

      {/* Left Panel: Character Info */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 flex flex-col shadow-lg flex-shrink-0">
        <div className="flex items-center mb-2">
            <div className="text-3xl mr-2">{player.classInfo.icon}</div>
            <div>
                <h2 className="text-lg font-bold text-[#D6721C]">{player.name}</h2>
                <p className="text-sm text-slate-300">Level {player.level} {player.classInfo.name}</p>
                <div className="flex items-center text-xs mt-1">
                    <span className="text-purple-400 mr-1">💎</span>
                    <span className="font-bold text-slate-200">{player.eternalShards}</span>
                    <span className="text-xs text-slate-400 ml-1">Shards</span>
                </div>
            </div>
        </div>

        <div className="mb-2">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-0.5">
                <span>XP</span>
                <span>{player.xp}/{player.xpToNextLevel}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5">
                <div 
                    className="bg-[#D6721C] h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${xpPercentage}%` }}
                ></div>
            </div>
        </div>
        
        <div className="mt-auto space-y-2">
            <div>
                <h4 className="text-xs font-bold text-[#D6721C] border-b border-slate-700 pb-1 mb-1">Account Bonuses</h4>
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

            <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-slate-700">
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

      <div className="flex flex-col flex-1 min-h-0">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 shadow-lg mb-auto">
          <h3 className="text-sm font-bold text-[#D6721C] mb-2 border-b-2 border-slate-700 pb-1">Inventory</h3>
          <div className="flex flex-wrap gap-1.5 justify-center">
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

        <div className="grid grid-cols-4 gap-2 mt-auto">
          <button
            onClick={onEnterShop}
            className="flex items-center justify-center w-full px-2 py-1.5 bg-purple-700 text-white font-bold text-xs rounded-lg shadow-md hover:bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Shop
          </button>
           <button
            onClick={onEnterAchievements}
             className="flex items-center justify-center w-full px-2 py-1.5 bg-cyan-700 text-white font-bold text-xs rounded-lg shadow-md hover:bg-cyan-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Achieve
          </button>
          <button
            onClick={onEnterStats}
             className="flex items-center justify-center w-full px-2 py-1.5 bg-slate-600 text-white font-bold text-xs rounded-lg shadow-md hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            All Time Stats
          </button>
          <button
            onClick={onEnterSpire}
             className="flex items-center justify-center w-full px-2 py-1.5 bg-[#D6721C] text-slate-900 font-bold text-xs rounded-lg shadow-md hover:bg-[#E1883D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D6721C]"
          >
            Enter Spire
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainGameScreen;
