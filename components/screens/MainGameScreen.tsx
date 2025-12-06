
import React, { useState, useEffect } from 'react';
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

const ICON_BASE = "https://api.iconify.design/game-icons";
const COLOR_PARAM = "?color=%23e2e8f0";

// Compact Stat Row for the side panel
const StatRow: React.FC<{ label: string; value: string | number; color?: string; subLabel?: string }> = ({ label, value, color, subLabel }) => (
    <div className="flex justify-between items-baseline w-full">
        <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
        </div>
        <span className={`text-xs font-bold ${color || 'text-slate-200'}`}>{value}</span>
    </div>
);

const EquipmentSlotDisplay: React.FC<{ 
    slot: EquipmentSlot; 
    item: Equipment | undefined; 
    isGhost?: boolean; // For 2H weapon visual in offhand
}> = ({ slot, item, isGhost }) => {
    
    // Default tooltip position (Top center)
    let tooltipPositionClass = "bottom-full left-1/2 -translate-x-1/2 mb-2"; 
    
    // Left Column slots -> Tooltip to the Right
    if (['Helmet', 'Armor'].includes(slot)) {
        tooltipPositionClass = "left-full top-1/2 -translate-y-1/2 ml-2";
    }
    // Right Column slots -> Tooltip to the Left
    if (['Gloves', 'Boots'].includes(slot)) {
        tooltipPositionClass = "right-full top-1/2 -translate-y-1/2 mr-2";
    }

    const renderTooltip = () => {
        if (item) {
            const rarityColor = RARITY_COLORS[item.rarity || 'Common'];
            return (
                <div className={`absolute ${tooltipPositionClass} w-max invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-[#D6721C] rounded-md shadow-lg p-2 text-xs z-50 pointer-events-none`}>
                    <div className="flex justify-between items-center gap-2">
                        <p className={`font-bold ${rarityColor}`}>{item.name}</p>
                        <p className="text-slate-500 text-[10px]">iLvl {item.itemLevel}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-1">{item.slot} • {item.rarity || 'Common'}</p>
                    {isGhost && <p className="text-[9px] text-slate-500 italic">(Two-Handed)</p>}
                    {!isGhost && Object.keys(item.stats).length > 0 && (
                        <div className="mt-1 border-t border-slate-600 pt-1 space-y-0.5">
                            {Object.entries(item.stats).map(([stat, value]) => {
                                if (stat === 'itemLevel') return null;
                                return (
                                    <div key={stat} className="flex justify-between gap-4">
                                        <span className="text-slate-300">{stat.toUpperCase()}</span>
                                        <span className="font-semibold text-green-400">+{value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    const slotSizeClass = "w-12 h-12 md:w-14 md:h-14"; 

    // Visual styles for Ghost mode (2H weapon in offhand)
    const containerClass = isGhost 
        ? `${slotSizeClass} bg-slate-800/40 border-2 border-slate-600/50 rounded-lg flex flex-col items-center justify-center p-1 text-center shadow-md grayscale opacity-50`
        : item 
            ? `${slotSizeClass} bg-slate-800 border-2 border-slate-600 rounded-lg flex flex-col items-center justify-center p-1 text-center shadow-md cursor-help`
            : `${slotSizeClass} bg-slate-900/40 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center p-1 text-center hover:border-[#D6721C] hover:bg-slate-800/50 transition-colors duration-300`;

    return (
        <div className="relative group">
            <div className={containerClass}>
                    {item ? (
                        item.icon.startsWith('http') ? (
                            <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                            <p className="text-2xl drop-shadow-md">{item.icon}</p>
                        )
                    ) : (
                        <p className="text-[9px] text-slate-600 uppercase font-bold tracking-wider">{slot}</p>
                    )}
            </div>
            {renderTooltip()}
        </div>
    );
};

interface BagItem {
    id: string;
    icon: string;
    name: string;
    count: number;
    description: string;
    rarityColor?: string;
}

const BagSlot: React.FC<{ item?: BagItem; index: number }> = ({ item, index }) => {
    // Dynamic Tooltip Positioning
    // Columns 0-3 (Left Side) -> Tooltip to the Right
    // Columns 4-7 (Right Side) -> Tooltip to the Left
    const col = index % 8;
    const tooltipPosition = col < 4 
        ? "left-full top-1/2 -translate-y-1/2 ml-2" 
        : "right-full top-1/2 -translate-y-1/2 mr-2";

    return (
        <div className={`aspect-square rounded-md border flex items-center justify-center relative group transition-colors duration-200 ${item ? 'bg-slate-800 border-slate-600 hover:border-[#D6721C] cursor-help' : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'}`}>
            {item && (
                <>
                    {item.icon.startsWith('http') ? (
                         <img src={item.icon} alt={item.name} className="w-3/4 h-3/4 object-contain" />
                    ) : (
                        <span className="text-xl drop-shadow-sm">{item.icon}</span>
                    )}
                    {item.count > 1 && (
                        <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-slate-200 bg-slate-900/80 px-1 rounded">
                            x{item.count}
                        </span>
                    )}
                    
                    {/* Tooltip */}
                    <div className={`absolute ${tooltipPosition} w-max invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-[#D6721C] rounded-md shadow-lg p-2 text-xs z-50 pointer-events-none`}>
                        <p className={`font-bold ${item.rarityColor || 'text-[#D6721C]'}`}>{item.name}</p>
                        <p className="text-slate-400 text-[10px]">{item.description}</p>
                    </div>
                </>
            )}
        </div>
    );
};


const MainGameScreen: React.FC<MainGameScreenProps> = ({ player, onExitToProfiles, onEnterSpire, onEnterShop, onEnterAchievements, onEnterStats }) => {
  const [showOptions, setShowOptions] = useState(false);
  const xpPercentage = (player.xp / player.xpToNextLevel) * 100;
  
  // Logic for Ghost Weapon
  const mainHandItem = player.equipment.MainHand;
  const isTwoHandedEquipped = mainHandItem?.isTwoHanded;

  // Bag Logic
  const bagItems: BagItem[] = [];
  
  // Add Potions to Bag if they exist
  if (player.potionCount > 0) {
      bagItems.push({
          id: 'potion',
          icon: `${ICON_BASE}/health-potion.svg${COLOR_PARAM}`,
          name: 'Health Potion',
          count: player.potionCount,
          description: 'Restores 50 HP.',
          rarityColor: 'text-green-400'
      });
  }

  // Key Listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setShowOptions(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col items-center p-4 w-full max-w-md mx-auto relative animate-fadeIn">
      
      {/* Options Menu Modal */}
      {showOptions && (
          <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm animate-fadeIn">
              <div className="bg-slate-800 border-2 border-[#D6721C] rounded-xl p-6 w-64 shadow-2xl flex flex-col gap-3 text-center">
                  <h2 className="text-xl font-bold text-[#D6721C] mb-2">Options</h2>
                  
                  <button 
                    onClick={onExitToProfiles}
                    className="w-full px-4 py-2 bg-red-900/80 text-red-200 font-bold text-sm rounded-lg hover:bg-red-800 border border-red-700 transition-colors"
                  >
                    Return Character Selection
                  </button>
                  
                  <button 
                    onClick={() => setShowOptions(false)}
                    className="w-full px-4 py-2 bg-slate-600 text-slate-200 font-bold text-sm rounded-lg hover:bg-slate-500 transition-colors mt-2"
                  >
                    Resume Game
                  </button>
              </div>
          </div>
      )}

      {/* Header: Identity & Resources */}
      <div className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-lg flex-shrink-0 flex flex-col gap-2 relative overflow-hidden mb-3">
        <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-slate-900/50 rounded-lg p-1 border border-slate-700 flex items-center justify-center">
                    {player.classInfo.icon.startsWith('http') ? (
                         <img src={player.classInfo.icon} alt={player.classInfo.name} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-3xl">{player.classInfo.icon}</span>
                    )}
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-[#D6721C] leading-tight">{player.name}</h2>
                    <p className="text-xs text-slate-400 font-medium">Lvl {player.level} {player.classInfo.name}</p>
                 </div>
            </div>
            <div className="flex flex-col items-end pr-8 md:pr-0">
                 <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-600">
                    <span className="text-sm">💎</span>
                    <span className="font-bold text-slate-200 text-sm">{player.eternalShards}</span>
                 </div>
            </div>
        </div>
        
        {/* XP Bar */}
        <div className="relative w-full h-3 bg-slate-900 rounded-full border border-slate-700 overflow-hidden">
             <div 
                className="bg-gradient-to-r from-[#D6721C] to-yellow-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${xpPercentage}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-[9px] font-bold text-white drop-shadow-md">XP: {player.xp} / {player.xpToNextLevel}</span>
            </div>
        </div>
      </div>

      {/* Main Window: Unified Inventory & Stats - Flexible Height */}
      <div className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-xl flex relative overflow-hidden mb-3 min-h-[20rem]">
        
        {/* Left Pane: Inventory (Paper Doll) */}
        <div className="flex-[2] relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 to-slate-900 flex items-center justify-center p-2">
             
             <div className="absolute top-2 left-2 z-10">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inventory</h3>
             </div>

             {/* Detailed Silhouette Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-12">
                <svg viewBox="0 0 100 100" className="w-56 h-56 text-slate-900 drop-shadow-xl opacity-40">
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    <path d="M50 15 C56 15 60 20 60 26 C60 32 56 35 50 35 C44 35 40 32 40 26 C40 20 44 15 50 15 Z" fill="currentColor" />
                    <path d="M46 34 L54 34 L56 38 L44 38 Z" fill="currentColor" />
                    <path d="M38 38 L62 38 L65 55 L58 70 L42 70 L35 55 Z" fill="currentColor" />
                    <path d="M62 38 L75 45 L72 55 L65 50 Z" fill="currentColor" />
                    <path d="M38 38 L25 45 L28 55 L35 50 Z" fill="currentColor" />
                    <path d="M72 55 L78 65 L72 68 L68 60 Z" fill="currentColor" />
                    <path d="M28 55 L22 65 L28 68 L32 60 Z" fill="currentColor" />
                    <path d="M42 70 L50 70 L50 90 L44 92 L40 90 Z" fill="currentColor" />
                    <path d="M58 70 L50 70 L50 90 L56 92 L60 90 Z" fill="currentColor" />
                    <ellipse cx="50" cy="94" rx="25" ry="4" fill="currentColor" opacity="0.5" />
                </svg>
            </div>

            {/* Equipment Slots - Re-arranged Layout */}
            
            {/* Left Column (Head, Body) - Pushed down to sides */}
            <div className="absolute top-16 left-4 md:left-6 z-10">
                <EquipmentSlotDisplay slot="Helmet" item={player.equipment.Helmet} />
            </div>
            <div className="absolute top-36 left-4 md:left-6 z-10">
                <EquipmentSlotDisplay slot="Armor" item={player.equipment.Armor} />
            </div>

            {/* Right Column (Hands, Feet) - Pushed down to sides */}
            <div className="absolute top-16 right-4 md:right-6 z-10">
                <EquipmentSlotDisplay slot="Gloves" item={player.equipment.Gloves} />
            </div>
            <div className="absolute top-36 right-4 md:right-6 z-10">
                <EquipmentSlotDisplay slot="Boots" item={player.equipment.Boots} />
            </div>

            {/* Bottom Row (Weapons) - Centered under silhouette, moved up */}
            <div className="absolute bottom-16 right-[52%] z-10">
                <EquipmentSlotDisplay slot="MainHand" item={player.equipment.MainHand} />
            </div>
            <div className="absolute bottom-16 left-[52%] z-10">
                <EquipmentSlotDisplay 
                    slot="OffHand" 
                    item={isTwoHandedEquipped ? mainHandItem : player.equipment.OffHand} 
                    isGhost={isTwoHandedEquipped} 
                />
            </div>
            {/* Potions Removed from Inventory View */}

        </div>

        {/* Right Pane: Stats */}
        <div className="w-[35%] bg-slate-900/60 border-l border-slate-700 p-3 flex flex-col gap-3 justify-center">
            <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-1 mb-2">Attributes</h3>
                <div className="space-y-2">
                    <StatRow label="STR" value={player.currentStats.str} color="text-red-400" />
                    <StatRow label="DEX" value={player.currentStats.dex} color="text-green-400" />
                    <StatRow label="INT" value={player.currentStats.int} color="text-blue-400" />
                </div>
            </div>
            
            <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-1 mb-2">Defense</h3>
                <div className="space-y-2">
                    <StatRow label="HP" value={player.currentStats.maxHp} />
                    <StatRow label="DEF" value={player.currentStats.defense} />
                    <StatRow label="Block" value={`${player.currentStats.blockChance}%`} color="text-cyan-400" />
                </div>
            </div>

            <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-1 mb-2">Offense</h3>
                <div className="space-y-2">
                    <StatRow label="Crit" value={`${player.currentStats.critRate}%`} />
                    <StatRow label="Vamp" value={`${player.currentStats.lifesteal}%`} color="text-pink-400" />
                </div>
            </div>
        </div>
      </div>

      {/* Bag / Storage - Fixed Content Size */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-xl shrink-0 w-full mb-3">
          <div className="flex justify-between items-center mb-1.5 px-1">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bag</h3>
              <span className="text-[10px] text-slate-600">{bagItems.length}/24</span>
          </div>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 24 }).map((_, i) => (
                <BagSlot key={i} index={i} item={bagItems[i]} />
            ))}
          </div>
      </div>

      {/* Footer: Action Buttons - Fixed Size */}
      <div className="grid grid-cols-4 gap-2 flex-shrink-0 w-full">
          <button
            onClick={onEnterShop}
            className="flex items-center justify-center w-full px-1 py-3 bg-purple-700 text-white font-bold text-xs rounded shadow-md hover:bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Shop
          </button>
           <button
            onClick={onEnterAchievements}
             className="flex items-center justify-center w-full px-1 py-3 bg-cyan-700 text-white font-bold text-xs rounded shadow-md hover:bg-cyan-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Quests
          </button>
          <button
            onClick={onEnterStats}
             className="flex items-center justify-center w-full px-1 py-3 bg-slate-600 text-white font-bold text-xs rounded shadow-md hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Stats
          </button>
          <button
            onClick={onEnterSpire}
             className="flex items-center justify-center w-full px-1 py-3 bg-[#D6721C] text-slate-900 font-bold text-xs rounded shadow-md hover:bg-[#D6721C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D6721C]"
          >
            Spire
          </button>
        </div>
    </div>
  );
};

export default MainGameScreen;
