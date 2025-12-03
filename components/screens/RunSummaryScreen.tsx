
import React from 'react';
import type { RunState } from '../../types';

interface RunSummaryScreenProps {
  runState: RunState;
  onClose: () => void;
}

const StatRow: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-slate-200' }) => (
    <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-700">
        <span className="text-sm text-slate-400 font-semibold">{label}</span>
        <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
);

const RunSummaryScreen: React.FC<RunSummaryScreenProps> = ({ runState, onClose }) => {
  return (
    <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-4 shadow-2xl animate-fadeIn w-full max-w-sm mx-auto text-center">
      <h2 className="text-2xl font-bold text-[#D6721C] mb-1">Run Complete</h2>
      <p className="text-slate-400 text-sm mb-4">Your ascent has ended... for now.</p>
      
      <div className="space-y-2 mb-6">
        <StatRow label="Max Floor Reached" value={runState.floor} color="text-[#D6721C]" />
        <StatRow label="Enemies Defeated" value={runState.enemiesKilled} />
        <StatRow label="XP Earned" value={runState.runXp} color="text-green-400" />
        <StatRow label="Shards Collected" value={runState.shardsEarned} color="text-purple-400" />
      </div>

      <button
        onClick={onClose}
        className="w-full px-5 py-2 bg-[#D6721C] text-slate-900 font-bold text-base rounded-lg shadow-lg shadow-[#D6721C]/20 hover:bg-[#E1883D] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#D6721C]"
      >
        Return to Hub
      </button>
    </div>
  );
};

export default RunSummaryScreen;
