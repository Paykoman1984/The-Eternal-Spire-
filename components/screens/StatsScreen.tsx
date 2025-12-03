
import React from 'react';
import type { Player } from '../../types';

interface StatsScreenProps {
    player: Player;
    onExit: () => void;
}

const StatRow: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-slate-200' }) => (
    <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-md border border-slate-700">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</span>
        <span className={`text-base font-bold ${color}`}>{value}</span>
    </div>
);

const StatsScreen: React.FC<StatsScreenProps> = ({ player, onExit }) => {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg animate-fadeIn w-full max-w-md mx-auto">
            <div className="flex justify-between items-center border-b-2 border-slate-700 pb-2 mb-4">
                <h2 className="text-xl font-bold text-[#D6721C]">Account Statistics</h2>
                <div className="text-3xl">{player.classInfo.icon}</div>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-6">
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
                    className="px-6 py-2 bg-slate-600 text-slate-200 font-bold text-sm rounded-lg hover:bg-slate-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                    Return
                </button>
            </div>
        </div>
    );
};

export default StatsScreen;
