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
    let buyButtonText = `Buy (💎 ${POTION_COST})`;
    if (player.potionCount >= 5) {
        buyButtonText = 'Inventory Full';
    } else if (player.eternalShards < POTION_COST) {
        buyButtonText = 'Not Enough Shards';
    }

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg animate-fadeIn w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3 mb-4">
                <h2 className="text-3xl font-bold text-yellow-400">Shop</h2>
                <div className="flex items-center text-lg">
                    <span className="text-purple-400 mr-2">💎</span>
                    <span className="font-bold text-slate-200">{player.eternalShards}</span>
                    <span className="text-sm text-slate-400 ml-2">Eternal Shards</span>
                </div>
            </div>

            <div className="space-y-4 mt-6">
                {/* Potion Item */}
                <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-4xl mr-4">🧪</span>
                        <div>
                            <p className="text-lg font-bold text-slate-200">Health Potion</p>
                            <p className="text-sm text-slate-400">Restores 30% of your Max HP. (Max: 5)</p>
                        </div>
                    </div>
                    <button
                        onClick={onBuyPotion}
                        disabled={!canBuyPotion}
                        className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {buyButtonText}
                    </button>
                </div>

                {/* Equipment Items */}
                {player.shopInventory.length > 0 && (
                    <div className="border-t-2 border-slate-700 pt-4 mt-6">
                        <h3 className="text-xl font-bold text-slate-300 mb-3">Fresh Stock! (Resets every 5 levels)</h3>
                        {player.shopInventory.map((item, index) => (
                            <div key={index} className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <span className="text-4xl mr-4">{item.icon}</span>
                                    <div>
                                        <p className="text-lg font-bold text-yellow-400">{item.name}</p>
                                        <div className="flex gap-x-3 text-xs text-slate-400">
                                            {Object.entries(item.stats).map(([stat, value]) => (
                                                <span key={stat}>{stat.toUpperCase()}: <span className="text-green-400">+{value}</span></span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onBuyShopItem(item)}
                                    disabled={player.eternalShards < (item.cost ?? 0)}
                                    className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                                >
                                    Buy (💎 {item.cost ?? 'N/A'})
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="mt-8 text-center">
                 <button
                    onClick={onExit}
                    className="px-8 py-3 bg-slate-600 text-slate-200 font-bold text-base rounded-lg hover:bg-slate-500 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-slate-400"
                >
                    Return to Hub
                </button>
            </div>
        </div>
    );
};

export default ShopScreen;