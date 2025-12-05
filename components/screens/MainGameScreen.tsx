
import React from 'react';
import type { Player, EquipmentSlot, Equipment } from '../../types';
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
    
    // Determine tooltip position classes based on the slot
    let tooltipPositionClass = "bottom-full left-1/2 -translate-x-1/2 mb-2"; // Default: Top Center
    
    if (slot === 'Helmet') {
        tooltipPositionClass = "left-full top-1/2 -translate-y-1/2 ml-2"; // Right Center for Helmet to avoid top overlap
    }

    const renderTooltip = () => {
        if (slot === 'Potions' && potionCount > 0) {
            return (
                <div className={`absolute ${tooltipPositionClass} w-max invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-[#D6721C] rounded-md shadow-lg p-2 text-xs z-50 pointer-events-none`}>
                    <p className="font-bold text-[#D6721C]">Health Potion</p>
                    <p className="text-slate-300">Restores 50 HP.</p>
                </div>
            );
        }
        if (item) {
            const rarityColor = RARITY_COLORS[item.rarity || 'Common'];
            return (
                <div className={`absolute ${tooltipPositionClass} w-max invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-[#D6721C] rounded-md shadow-lg p-2 text-xs z-50 pointer-events-none`}>
                    <p className={`font-bold ${rarityColor}`}>{item.name}</p>
                    <p className="text-[10px] text-slate-400 mb-1">{item.slot} • {item.rarity || 'Common'}</p>
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
                 <div className="w-16 h-16 bg-slate-800/80 border-2 border-slate-600 rounded-lg flex flex-col items-center justify-center p-1 text-center shadow-md">
                    <p className="text-2xl">🧪</p>
                    <p className="text-xs font-bold text-slate-300 absolute bottom-0.5 right-1">x{potionCount}</p>
                </div>
            ) : item ? (
                <div className="w-16 h-16 bg-slate-800 border-2 border-slate-600 rounded-lg flex flex-col items-center justify-center p-1 text-center shadow-md cursor-help">
                    <p className="text-3xl drop-shadow-md">{item.icon}</p>
                </div>
            ) : (
                <div className="w-16 h-16 bg-slate-900/40 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center p-1 text-center hover:border-[#D6721C] hover:bg-slate-800/50 transition-colors duration-300">
                    <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">{slot}</p>
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
    <div className="relative flex flex-col gap-3 animate-fadeIn flex-1 w-full p-4 h-full">
      
      <button
        onClick={onExitToProfiles}
        className="absolute top-0 right-0 z-10 px-3 py-1 bg-slate-700 text-slate-300 text-xs font-semibold rounded-bl-lg hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
        aria-label="Exit to profile selection"
      >
        Exit
      </button>

      {/* Left Panel: Character Info - Compact Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 flex flex-col shadow-lg flex-shrink-0">
        <div className="flex items-center mb-2">
            <div className="text-3xl mr-2">{player.classInfo.icon}</div>
            <div>
                <h2 className="text-lg font-bold text-[#D6721C]">{player.name}</h2>
                <div className="flex items-center text-xs space-x-2">
                    <span className="text-slate-300">Lvl {player.level} {player.classInfo.name}</span>
                    <span className="text-slate-500">|</span>
                    <div className="flex items-center">
                        <span className="text-purple-400 mr-0.5">💎</span>
                        <span className="font-bold text-slate-200">{player.eternalShards}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="mb-2">
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
                <span>XP</span>
                <span>{player.xp}/{player.xpToNextLevel}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1">
                <div 
                    className="bg-[#D6721C] h-1 rounded-full transition-all duration-500" 
                    style={{ width: `${xpPercentage}%` }}
                ></div>
            </div>
        </div>
        
        <div className="mt-auto space-y-2">
            <div>
                <h4 className="text-sm font-bold text-[#D6721C] border-b border-slate-700 pb-1 mb-1">Account Bonuses</h4>
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
                <StatBox label="EVA" value={`${player.currentStats.evasion}%`} />
            </div>
        </div>
      </div>

      {/* Main Content Area - Expands to fill space */}
      <div className="flex flex-col flex-1 min-h-0">
        
        {/* Inventory Paper Doll Layout */}
        <div className="bg-slate-800 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 to-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg mb-auto relative flex justify-center items-center h-[290px] w-full max-w-md mx-auto">
            <h3 className="absolute top-2 left-3 text-sm font-bold text-[#D6721C] border-b border-slate-700 pb-0.5 z-10">Inventory</h3>
            
            {/* Detailed Silhouette Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-4">
                <svg viewBox="0 0 100 100" className="w-64 h-64 text-slate-900 drop-shadow-xl opacity-40">
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    {/* Head */}
                    <path d="M50 15 C56 15 60 20 60 26 C60 32 56 35 50 35 C44 35 40 32 40 26 C40 20 44 15 50 15 Z" fill="currentColor" />
                    {/* Neck */}
                    <path d="M46 34 L54 34 L56 38 L44 38 Z" fill="currentColor" />
                    {/* Torso */}
                    <path d="M38 38 L62 38 L65 55 L58 70 L42 70 L35 55 Z" fill="currentColor" />
                    {/* Shoulders/Arms */}
                    <path d="M62 38 L75 45 L72 55 L65 50 Z" fill="currentColor" />
                    <path d="M38 38 L25 45 L28 55 L35 50 Z" fill="currentColor" />
                    {/* Forearms */}
                    <path d="M72 55 L78 65 L72 68 L68 60 Z" fill="currentColor" />
                    <path d="M28 55 L22 65 L28 68 L32 60 Z" fill="currentColor" />
                    {/* Legs */}
                    <path d="M42 70 L50 70 L50 90 L44 92 L40 90 Z" fill="currentColor" />
                    <path d="M58 70 L50 70 L50 90 L56 92 L60 90 Z" fill="currentColor" />
                    {/* Pedestal */}
                    <ellipse cx="50" cy="94" rx="25" ry="4" fill="currentColor" opacity="0.5" />
                </svg>
            </div>

            {/* Equipment Slots - Positioned Absolute */}
            
            {/* Helmet: Top Center - Moved to top-11 */}
            <div className="absolute top-11 left-1/2 -translate-x-1/2 z-10">
                <EquipmentSlotDisplay slot="Helmet" item={player.equipment.Helmet} potionCount={0} />
            </div>

            {/* Armor: Center Body - Moved to top-[48%] */}
            <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <EquipmentSlotDisplay slot="Armor" item={player.equipment.Armor} potionCount={0} />
            </div>

            {/* Boots: Bottom Center - Remains at bottom-8 */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
                <EquipmentSlotDisplay slot="Boots" item={player.equipment.Boots} potionCount={0} />
            </div>

            {/* Weapon: Left of Body - Moved to top-[51%] */}
            <div className="absolute top-[51%] -translate-y-1/2 left-[10%] sm:left-[18%] z-10">
                <EquipmentSlotDisplay slot="Weapon" item={player.equipment.Weapon} potionCount={0} />
            </div>

            {/* Gloves: Right of Body - Moved to top-[51%] */}
            <div className="absolute top-[51%] -translate-y-1/2 right-[10%] sm:right-[18%] z-10">
                <EquipmentSlotDisplay slot="Gloves" item={player.equipment.Gloves} potionCount={0} />
            </div>

            {/* Potions: Bottom Right Corner */}
            <div className="absolute bottom-3 right-3 z-10">
                <EquipmentSlotDisplay slot="Potions" item={undefined} potionCount={player.potionCount} />
            </div>

        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-auto pt-2">
          <button
            onClick={onEnterShop}
            className="flex items-center justify-center w-full px-1 py-2 bg-purple-700 text-white font-bold text-xs rounded shadow-md hover:bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Shop
          </button>
           <button
            onClick={onEnterAchievements}
             className="flex items-center justify-center w-full px-1 py-2 bg-cyan-700 text-white font-bold text-xs rounded shadow-md hover:bg-cyan-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Quests
          </button>
          <button
            onClick={onEnterStats}
             className="flex items-center justify-center w-full px-1 py-2 bg-slate-600 text-white font-bold text-xs rounded shadow-md hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            All Time Stats
          </button>
          <button
            onClick={onEnterSpire}
             className="flex items-center justify-center w-full px-1 py-2 bg-[#D6721C] text-slate-900 font-bold text-xs rounded shadow-md hover:bg-[#E1883D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D6721C]"
          >
            Spire
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainGameScreen;
