import React from 'react';
import type { Player, Equipment } from '../../types';

interface ShopScreenProps {
    player: Player;
    onExit: () => void;
    onBuyPotion: () => void;
    onBuyShopItem: (item: Equipment) => void;
}

const POTION_COST = 50;

const ShopScreen: React.FC<ShopScreenProps> = ({ player, onExit, onBuyPotion, onBuyShopItem }) => {
    const canBuyPotion = player.eternalShards >= POTION_COST && player.potionCount < 5;
    
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
        <div className="animate-fadeIn flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-lg w-full max-w-lg flex flex-col h-full max-h-[90vh]">
                <div className="flex justify-between items-center border-b-2 border-slate-700 pb-1.5 mb-2">
                    <h2 className="text-base font-bold text-[#D6721C]">Shop</h2>
                    <div className="flex items-center text-sm">
                        <span className="text-purple-400 mr-1">💎</span>
                        <span className="font-bold text-slate-200">{player.eternalShards}</span>
                        <span className="text-xs text-slate-400 ml-1">Shards</span>
                    </div>
                </div>

                <div className="space-y-1.5 no-scrollbar flex-grow overflow-y-auto pr-1">
                    {/* Potion Item */}
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-1.5 flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-2xl mr-2">🧪</span>
                            <div>
                                <p className="text-sm font-bold text-slate-200">Health Potion</p>
                                <p className="text-xs text-slate-400">Restores 30% HP (Max: 5)</p>
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
                            <h3 className="text-sm font-bold text-[#D6721C] mb-1">Fresh Stock!</h3>
                            {player.shopInventory.map((item, index) => (
                                <div key={index} className="bg-slate-900/70 border border-slate-700 rounded-lg p-1.5 flex items-center justify-between mb-1.5">
                                    <div className="flex items-center overflow-hidden">
                                        <span className="text-2xl mr-2">{item.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-[#D6721C] truncate">{item.name}</p>
                                            <div className="flex flex-wrap gap-x-2 text-xs text-slate-400">
                                                {Object.entries(item.stats).map(([stat, value]) => (
                                                    <span key={stat}>{stat.toUpperCase()}: <span className="text-green-400">+{value}</span></span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onBuyShopItem(item)}
                                        disabled={player.eternalShards < (item.cost ?? 0)}
                                        className="px-2.5 py-1 text-xs bg-green-600 text-white font-bold rounded-md shadow-md hover:bg-green-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center justify-center">
                                            <span className="text-purple-300 mr-1">💎</span>
                                            <span>{item.cost ?? 'N/A'}</span>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="mt-3 text-center">
                     <button
                        onClick={onExit}
                        className="px-5 py-1.5 bg-slate-600 text-slate-200 font-bold text-sm rounded-lg hover:bg-slate-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                        Return
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShopScreen;