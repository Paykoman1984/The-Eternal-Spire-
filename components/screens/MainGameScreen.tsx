
import React, { useState, useEffect } from 'react';
import type { Player, EquipmentSlot, Equipment, Stats } from '../../types';
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

const StatRow: React.FC<{ label: string; value: string | number; color?: string; buff?: number }> = ({ label, value, color, buff }) => (
    <div className="flex justify-between items-center w-full">
        <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
        <div className="flex items-center justify-end gap-1.5">
            <span className={`text-xs font-bold ${color || 'text-slate-200'}`}>{value}</span>
            {buff !== undefined && buff > 0 && (
                <span className="text-[8px] font-bold text-[#D6721C] bg-[#D6721C]/10 px-1 rounded border border-[#D6721C]/30" title={`Account Bonus: +${buff}%`}>
                    +{buff}%
                </span>
            )}
        </div>
    </div>
);

const EquipmentSlotDisplay: React.FC<{ 
    slot: EquipmentSlot; 
    item: Equipment | undefined; 
    isGhost?: boolean;
}> = ({ slot, item, isGhost }) => {
    
    let tooltipPositionClass = "bottom-full left-1/2 -translate-x-1/2 mb-2"; 
    
    // Adjust tooltips based on slot position in the vertical paper doll
    if (['Helmet', 'Armor', 'Gloves', 'Boots'].includes(slot)) {
        tooltipPositionClass = "left-full top-1/2 -translate-y-1/2 ml-2";
    }
    if (['Necklace', 'Earring', 'Ring', 'Belt'].includes(slot)) {
        tooltipPositionClass = "right-full top-1/2 -translate-y-1/2 mr-2";
    }

    const renderTooltip = () => {
        if (item) {
            const rarityColor = RARITY_COLORS[item.rarity || 'Common'];
            return (
                <div className={`absolute ${tooltipPositionClass} w-max max-w-[10rem] md:max-w-[14rem] whitespace-normal break-words invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-[#D6721C] rounded-md shadow-lg p-2 text-xs z-[9999] pointer-events-none`}>
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <p className={`font-bold ${rarityColor} leading-tight text-left`}>{item.name}</p>
                        <p className="text-slate-500 text-[9px] flex-shrink-0 pt-0.5">iLvl {item.itemLevel}</p>
                    </div>
                    <p className="text-[9px] text-slate-400 mb-1 leading-tight text-left">{item.slot} • {item.rarity || 'Common'}</p>
                    {isGhost && <p className="text-[9px] text-slate-500 italic text-left">(Two-Handed)</p>}
                    {!isGhost && Object.keys(item.stats).length > 0 && (
                        <div className="mt-1 border-t border-slate-600 pt-1 space-y-0.5">
                            {Object.entries(item.stats).map(([stat, value]) => {
                                if (stat === 'itemLevel') return null;
                                return (
                                    <div key={stat} className="flex justify-between gap-4">
                                        <span className="text-slate-300 capitalize">{stat}</span>
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

    const slotSizeClass = "w-10 h-10 md:w-11 md:h-11"; 
    const containerClass = isGhost 
        ? `${slotSizeClass} bg-slate-800/40 border-2 border-slate-600/50 rounded-lg flex flex-col items-center justify-center p-1 text-center shadow-md grayscale opacity-50`
        : item 
            ? `${slotSizeClass} bg-slate-800 border-2 border-slate-600 rounded-lg flex flex-col items-center justify-center p-1 text-center shadow-md cursor-help`
            : `${slotSizeClass} bg-slate-900/40 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center p-0.5 text-center hover:border-[#D6721C] hover:bg-slate-800/50 transition-colors duration-300`;

    return (
        <div className="relative group w-full h-full flex items-center justify-center hover:z-[100]">
            <div className={containerClass}>
                    {item ? (
                        item.icon.startsWith('http') ? (
                            <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                            <p className="text-2xl drop-shadow-md">{item.icon}</p>
                        )
                    ) : (
                        <p className="text-[5px] md:text-[6px] leading-tight text-slate-600 uppercase font-bold tracking-wider break-words w-full">{slot}</p>
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
    // Dynamic Tooltip: Left side columns tooltip to right, Right side columns tooltip to left
    const col = index % 8;
    const tooltipPosition = col < 4 
        ? "left-full top-1/2 -translate-y-1/2 ml-2" 
        : "right-full top-1/2 -translate-y-1/2 mr-2";

    return (
        <div className={`aspect-square rounded-md border flex items-center justify-center relative group transition-colors duration-200 hover:z-[100] ${item ? 'bg-slate-800 border-slate-600 hover:border-[#D6721C] cursor-help' : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'}`}>
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
                    <div className={`absolute ${tooltipPosition} w-max max-w-[10rem] md:max-w-[14rem] whitespace-normal break-words invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-[#D6721C] rounded-md shadow-lg p-2 text-xs z-[9999] pointer-events-none`}>
                        <p className={`font-bold ${item.rarityColor || 'text-[#D6721C]'} leading-tight text-left`}>{item.name}</p>
                        <p className="text-slate-400 text-[10px] mt-1 leading-tight text-left">{item.description}</p>
                    </div>
                </>
            )}
        </div>
    );
};


const MainGameScreen: React.FC<MainGameScreenProps> = ({ player, onExitToProfiles, onEnterSpire, onEnterShop, onEnterAchievements, onEnterStats }) => {
  const [showOptions, setShowOptions] = useState(false);
  const xpPercentage = (player.xp / player.xpToNextLevel) * 100;
  
  const mainHandItem = player.equipment.MainHand;
  const isTwoHandedEquipped = mainHandItem?.isTwoHanded;
  const buffs = player.accountBuffs || {};

  const bagItems: BagItem[] = [];
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
    <div className="h-full w-full overflow-hidden flex flex-col items-center p-3 max-w-md md:max-w-2xl mx-auto relative animate-fadeIn gap-2 select-none">
      
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

      {/* TOP: Header (Identity & Resources) */}
      <div className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-lg flex flex-col gap-1 relative overflow-hidden flex-shrink-0">
        <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-slate-900/50 rounded-lg p-1 border border-slate-700 flex items-center justify-center">
                    {player.classInfo.icon.startsWith('http') ? (
                        <img src={player.classInfo.icon} alt={player.classInfo.name} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-2xl">{player.classInfo.icon}</span>
                    )}
                </div>
                <div>
                    <h2 className="text-base font-bold text-[#D6721C] leading-tight">{player.name}</h2>
                    <p className="text-[10px] text-slate-400 font-medium">Lvl {player.level} {player.classInfo.name}</p>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-600">
                    <span className="text-xs">💎</span>
                    <span className="font-bold text-slate-200 text-xs">{player.eternalShards}</span>
                </div>
            </div>
        </div>
        
        {/* XP Bar */}
        <div className="relative w-full h-2.5 bg-slate-900 rounded-full border border-slate-700 overflow-hidden mt-1">
            <div 
                className="bg-gradient-to-r from-[#D6721C] to-yellow-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${xpPercentage}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white drop-shadow-md">XP: {player.xp} / {player.xpToNextLevel}</span>
            </div>
        </div>
      </div>

      {/* MIDDLE: Inventory & Stats - Force height constraints for tablet */}
      <div className="flex-1 w-full min-h-0 flex gap-2">
        {/* Left Pane: Inventory (Paper Doll) */}
        <div className="flex-[1.5] relative bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 to-slate-900 overflow-hidden">
             
             <div className="absolute top-2 left-2 z-0">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inventory</h3>
             </div>

             {/* Centered container to prevent drift on tablet screens */}
             <div className="relative w-full max-w-[280px] h-full mx-auto">
                {/* Detailed Silhouette Background - Scaled down slightly */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-8">
                    <svg viewBox="0 0 100 100" className="w-40 h-40 md:w-44 md:h-44 text-slate-900 drop-shadow-xl opacity-40">
                        <path d="M50 15 C56 15 60 20 60 26 C60 32 56 35 50 35 C44 35 40 32 40 26 C40 20 44 15 50 15 Z" fill="currentColor" />
                        <path d="M46 34 L54 34 L56 38 L44 38 Z" fill="currentColor" />
                        <path d="M38 38 L62 38 L65 55 L58 70 L42 70 L35 55 Z" fill="currentColor" />
                        <path d="M62 38 L75 45 L72 55 L65 50 Z" fill="currentColor" />
                        <path d="M38 38 L25 45 L28 55 L35 50 Z" fill="currentColor" />
                        <path d="M72 55 L78 65 L72 68 L68 60 Z" fill="currentColor" />
                        <path d="M28 55 L22 65 L28 68 L32 60 Z" fill="currentColor" />
                        <path d="M42 70 L50 70 L50 90 L44 92 L40 90 Z" fill="currentColor" />
                        <path d="M58 70 L50 70 L50 90 L56 92 L60 90 Z" fill="currentColor" />
                    </svg>
                </div>

                {/* Left Column: Armor Stack */}
                <div className="absolute top-16 left-1 z-10 hover:z-[100] flex flex-col gap-1.5">
                    <EquipmentSlotDisplay slot="Helmet" item={player.equipment.Helmet} />
                    <EquipmentSlotDisplay slot="Armor" item={player.equipment.Armor} />
                    <EquipmentSlotDisplay slot="Gloves" item={player.equipment.Gloves} />
                    <EquipmentSlotDisplay slot="Boots" item={player.equipment.Boots} />
                </div>

                {/* Right Column: Accessories Stack */}
                <div className="absolute top-16 right-1 z-10 hover:z-[100] flex flex-col gap-1.5">
                    <EquipmentSlotDisplay slot="Necklace" item={player.equipment.Necklace} />
                    <EquipmentSlotDisplay slot="Earring" item={player.equipment.Earring} />
                    <EquipmentSlotDisplay slot="Ring" item={player.equipment.Ring} />
                    <EquipmentSlotDisplay slot="Belt" item={player.equipment.Belt} />
                </div>

                {/* Bottom Row (Weapons) - Moved up by ~5px (bottom-6 is 24px, now bottom-[29px]) */}
                <div className="absolute bottom-[29px] right-[52%] z-10 hover:z-[100]">
                    <EquipmentSlotDisplay slot="MainHand" item={player.equipment.MainHand} />
                </div>
                <div className="absolute bottom-[29px] left-[52%] z-10 hover:z-[100]">
                    <EquipmentSlotDisplay 
                        slot="OffHand" 
                        item={isTwoHandedEquipped ? mainHandItem : player.equipment.OffHand} 
                        isGhost={isTwoHandedEquipped} 
                    />
                </div>
            </div>
        </div>

        {/* Right Pane: Stats */}
        <div className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl p-2 flex flex-col gap-1 justify-center min-w-[120px]">
            <div>
                <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-0.5 mb-1">Attributes</h3>
                <div className="space-y-1">
                    <StatRow label="STR" value={player.currentStats.str} color="text-red-400" buff={buffs.str} />
                    <StatRow label="DEX" value={player.currentStats.dex} color="text-green-400" buff={buffs.dex} />
                    <StatRow label="INT" value={player.currentStats.int} color="text-blue-400" buff={buffs.int} />
                </div>
            </div>
            
            <div className="mt-1">
                <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-0.5 mb-1">Defense</h3>
                <div className="space-y-1">
                    <StatRow label="HP" value={player.currentStats.maxHp} buff={buffs.maxHp} />
                    <StatRow label="DEF" value={player.currentStats.defense} buff={buffs.defense} />
                    <StatRow label="Block" value={`${player.currentStats.blockChance}%`} color="text-cyan-400" buff={buffs.blockChance} />
                </div>
            </div>

            <div className="mt-1">
                <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-0.5 mb-1">Offense</h3>
                <div className="space-y-1">
                    <StatRow label="Crit" value={`${player.currentStats.critRate}%`} buff={buffs.critRate} />
                    <StatRow label="Vamp" value={`${player.currentStats.lifesteal}%`} color="text-pink-400" buff={buffs.lifesteal} />
                    <StatRow label="Eva" value={`${player.currentStats.evasion}%`} buff={buffs.evasion} />
                </div>
            </div>
        </div>
      </div>

      {/* BOTTOM: Bag & Actions */}
      <div className="w-full flex flex-col gap-2 flex-shrink-0">
          {/* Bag */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-xl">
              <div className="flex justify-between items-center mb-1 px-1">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bag</h3>
                  <span className="text-[10px] text-slate-600">{bagItems.length}/24</span>
              </div>
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 24 }).map((_, i) => (
                    <BagSlot key={i} index={i} item={bagItems[i]} />
                ))}
              </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 w-full">
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
    </div>
  );
};

export default MainGameScreen;
