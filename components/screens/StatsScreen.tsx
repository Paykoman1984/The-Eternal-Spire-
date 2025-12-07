
import React from 'react';
import type { Player } from '../../types';

interface StatsScreenProps {
    player: Player;
    onExit: () => void;
}

const StatRow: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-slate-200' }) => (
    <div className="flex justify-between items-center bg-slate-900/50 p-1.5 rounded-md border border-slate-700">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
);

const StatsScreen: React.FC<StatsScreenProps> = ({ player, onExit }) => {
    return (
        <div className="animate-fadeIn flex flex-col items-center justify-center h-full p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center border-b-2 border-slate-700 pb-1.5 mb-3">
                    <h2 className="text-lg font-bold text-[#D6721C]">Account Statistics</h2>
                    <div className="w-8 h-8">
                         {player.classInfo.icon.startsWith('http') ? (
                            <img src={player.classInfo.icon} alt={player.classInfo.name} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-2xl">{player.classInfo.icon}</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-1.5 mb-4">
                    <StatRow label="Max Floor Reached" value={player.maxFloorReached} color="text-[#D6721C]" />
                    <StatRow label="Enemies Slain" value={player.totalEnemiesKilled || 0} />
                    <StatRow label="Total Deaths" value={player.totalDeaths || 0} color="text-red-400" />
                    <StatRow label="Battles Fled" value={player.totalFlees || 0} color="text-slate-400" />
                    <StatRow label="Total XP Earned" value={player.totalAccumulatedXp || 0} color="text-green-400" />
                    <StatRow label="Total Shards Found" value={player.totalLifetimeShards || 0} color="text-purple-400" />
                </div>

                <div className="text-center">
                     <button
                        onClick={onExit}
                        className="px-6 py-1.5 bg-slate-600 text-slate-200 font-bold text-sm rounded-lg hover:bg-slate-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                        Return
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsScreen;
