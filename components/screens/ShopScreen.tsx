
import React from 'react';
import type { Player, Equipment } from '../../types';
import { RARITY_COLORS } from '../../data/items';

interface ShopScreenProps {
    player: Player;
    onExit: () => void;
    onBuyPotion: () => void;
    onBuyShopItem: (item: Equipment) => void;
    onRefresh: () => void;
}

const POTION_COST = 50;
const REFRESH_COST = 1000;
const MAX_REFRESHES = 3;

const ShopScreen: React.FC<ShopScreenProps> = ({ player, onExit, onBuyPotion, onBuyShopItem, onRefresh }) => {
    const canBuyPotion = player.eternalShards >= POTION_COST && player.potionCount < 5;
    
    const levelRequirementMet = player.level >= 5;
    const canAffordRefresh = player.eternalShards >= REFRESH_COST;
    
    // New, more robust refresh logic
    const refreshesUsedThisLevel = (player.shopRefreshes && player.shopRefreshes.level === player.level) ? player.shopRefreshes.count : 0;
    const hasRefreshesLeft = refreshesUsedThisLevel < MAX_REFRESHES;
    const canRefresh = levelRequirementMet && canAffordRefresh && hasRefreshesLeft;

    let potionButtonContent: React.ReactNode;
    if (player.potionCount >= 5) {
        potionButtonContent = 'Full';
    } else {
        potionButtonContent = (
            <div className="flex items-center justify-center">
                <span className="text-purple-300 mr-1">💎</span>
                <span>{POTION_COST}</span>
            </div>
        );
    }


    return (
        <div className="animate-fadeIn flex flex-col items-center justify-center min-h-screen p-4 w-full h-full">
            {/* Header Section - Outside the main box */}
            <div className="w-full max-w-lg flex flex-col items-center mb-2 px-1 relative">
                <h2 className="text-xl font-bold text-[#D6721C] drop-shadow-md mb-1">Shop</h2>
                <div className="absolute right-0 top-0 flex items-center text-sm bg-slate-800/80 px-3 py-1 rounded-full border border-slate-600">
                    <span className="text-purple-400 mr-1.5">💎</span>
                    <span className="font-bold text-slate-200">{player.eternalShards}</span>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-lg w-full max-w-lg flex flex-col flex-1 max-h-[75vh] mb-3">
                
                <div className="space-y-1.5 no-scrollbar flex-grow overflow-y-auto pr-1">
                    {/* Potion Item */}
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-1.5 flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-2xl mr-2">🧪</span>
                            <div>
                                <p className="text-sm font-bold text-slate-200">Health Potion</p>
                                <p className="text-xs text-slate-400">Restores 50 HP (Max: 5)</p>
                            </div>
                        </div>
                        <button
                            onClick={onBuyPotion}
                            disabled={!canBuyPotion}
                            className="px-2.5 py-1 text-xs bg-green-600 text-white font-bold rounded-md shadow-md hover:bg-green-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                        >
                            {potionButtonContent}
                        </button>
                    </div>

                    {/* Equipment Items */}
                    {player.shopInventory.length > 0 && (
                        <div className="border-t-2 border-slate-700 pt-2 mt-2">
                            <div className="flex justify-between items-center mb-1 pl-1 pr-1">
                                <h3 className="text-sm font-bold text-[#D6721C]">Fresh Stock!</h3>
                            </div>
                            
                            {player.shopInventory.map((item, index) => {
                                const rarityColor = RARITY_COLORS[item.rarity || 'Common'];
                                const canEquip = !item.weaponType || player.classInfo.allowedWeaponTypes.includes(item.weaponType);
                                
                                return (
                                    <div key={index} className="bg-slate-900/70 border border-slate-700 rounded-lg p-1.5 flex items-center justify-between mb-1.5">
                                        <div className="flex items-center overflow-hidden">
                                            <span className="text-2xl mr-2">{item.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate ${rarityColor}`}>{item.name}</p>
                                                <p className="text-[9px] text-slate-500 mb-0.5">{item.slot} • {item.rarity || 'Common'}{item.weaponType ? ` (${item.weaponType})` : ''}</p>
                                                <div className="flex flex-wrap gap-x-2 text-xs text-slate-400">
                                                    {Object.entries(item.stats).map(([stat, value]) => (
                                                        <span key={stat}>{stat.toUpperCase()}: <span className="text-green-400">+{value}</span></span>
                                                    ))}
                                                </div>
                                                {!canEquip && <p className="text-[9px] text-red-400 mt-0.5">Cannot Equip</p>}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onBuyShopItem(item)}
                                            disabled={player.eternalShards < (item.cost ?? 0) || !canEquip}
                                            className="px-2.5 py-1 text-xs bg-green-600 text-white font-bold rounded-md shadow-md hover:bg-green-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                                        >
                                            <div className="flex items-center justify-center">
                                                <span className="text-purple-300 mr-1">💎</span>
                                                <span>{item.cost ?? 'N/A'}</span>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Footer Buttons - Return and Refresh */}
            <div className="mt-auto w-full max-w-lg flex justify-between gap-3">
                 <button
                    onClick={onExit}
                    className="flex-1 px-4 py-2 bg-slate-600 text-slate-200 font-bold text-sm rounded hover:bg-slate-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-lg"
                >
                    Return
                </button>
                
                <div className="relative group flex-1">
                    <button
                        onClick={onRefresh}
                        disabled={!canRefresh}
                        className="w-full h-full px-4 py-2 bg-blue-700 text-white font-bold text-sm rounded shadow-lg hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <span>🔄</span> Refresh
                    </button>
                    {/* Refresh Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 w-48 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-blue-500 rounded-md shadow-xl p-2 text-xs z-50 text-center pointer-events-none">
                        <p className="font-bold text-blue-300 mb-1">Restock Items</p>
                        <p className="text-slate-300 mb-1">Cost: <span className={canAffordRefresh ? "text-purple-400 font-bold" : "text-red-400 font-bold"}>{REFRESH_COST}</span> Shards</p>
                        <p className="text-slate-400">Refreshes: <span className={hasRefreshesLeft ? "text-green-400" : "text-red-400"}>{MAX_REFRESHES - refreshesUsedThisLevel}/{MAX_REFRESHES}</span> left</p>
                        {!levelRequirementMet && <p className="text-red-500 mt-1 italic">Unlocks at Level 5</p>}
                        {levelRequirementMet && !hasRefreshesLeft && <p className="text-red-400 mt-1 italic">Limit for this level reached</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopScreen;
