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
                <span className="text-purple-300 mr-1.5">💎</span>
                <span>{POTION_COST}</span>
            </div>
        );
    }


    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg animate-fadeIn w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center border-b-2 border-slate-700 pb-2 mb-3">
                <h2 className="text-xl font-bold text-[#D6721C]">Shop</h2>
                <div className="flex items-center text-base">
                    <span className="text-purple-400 mr-2">💎</span>
                    <span className="font-bold text-slate-200">{player.eternalShards}</span>
                    <span className="text-xs text-slate-400 ml-2">Shards</span>
                </div>
            </div>

            <div className="space-y-2 mt-3 max-h-[60vh] overflow-y-auto pr-2">
                {/* Potion Item */}
                <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-2 flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-2xl mr-3">🧪</span>
                        <div>
                            <p className="text-sm font-bold text-slate-200">Health Potion</p>
                            <p className="text-xs text-slate-400">Restores 30% of Max HP (Max: 5)</p>
                        </div>
                    </div>
                    <button
                        onClick={onBuyPotion}
                        disabled={!canBuyPotion}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {potionButtonContent}
                    </button>
                </div>

                {/* Equipment Items */}
                {player.shopInventory.length > 0 && (
                    <div className="border-t-2 border-slate-700 pt-3 mt-3">
                        <h3 className="text-base font-bold text-[#D6721C] mb-2">Fresh Stock! (Resets every 5 levels)</h3>
                        {player.shopInventory.map((item, index) => (
                            <div key={index} className="bg-slate-900/70 border border-slate-700 rounded-lg p-2 flex items-center justify-between mb-2">
                                <div className="flex items-center overflow-hidden">
                                    <span className="text-2xl mr-3">{item.icon}</span>
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
                                    className="px-3 py-1.5 text-xs bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-center">
                                        <span className="text-purple-300 mr-1.5">💎</span>
                                        <span>{item.cost ?? 'N/A'}</span>
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="mt-4 text-center">
                 <button
                    onClick={onExit}
                    className="px-6 py-2 bg-slate-600 text-slate-200 font-bold text-sm rounded-lg hover:bg-slate-500 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-slate-400"
                >
                    Return to Hub
                </button>
            </div>
        </div>
    );
};

export default ShopScreen;