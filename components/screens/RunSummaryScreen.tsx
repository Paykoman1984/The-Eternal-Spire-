
import React from 'react';
import type { RunState } from '../../types';

interface RunSummaryScreenProps {
  runState: RunState;
  onClose: () => void;
}

const StatRow: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-slate-200' }) => (
    <div className="flex justify-between items-center bg-slate-900/50 p-1.5 rounded-md border border-slate-700">
        <span className="text-xs text-slate-400 font-semibold">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
);

const RunSummaryScreen: React.FC<RunSummaryScreenProps> = ({ runState, onClose }) => {
  return (
    <div className="animate-fadeIn flex flex-col items-center justify-center h-full p-4">
        <div className="bg-slate-900/80 backdrop-blur-sm border-2 border-slate-600 rounded-xl p-3 shadow-2xl w-full max-w-xs mx-auto text-center">
            <h2 className="text-lg font-bold text-[#D6721C] mb-0.5">Run Complete</h2>
            <p className="text-slate-400 text-xs mb-3">Your ascent has ended... for now.</p>
            
            <div className="space-y-1.5 mb-3">
                <StatRow label="Max Floor Reached" value={runState.floor} color="text-[#D6721C]" />
                <StatRow label="Enemies Defeated" value={runState.enemiesKilled} />
                <StatRow label="XP Earned" value={runState.runXp} color="text-green-400" />
                <StatRow label="Shards Collected" value={runState.shardsEarned} color="text-purple-400" />
                
                {runState.fleePenalty && (
                    <div className="mt-2 pt-2 border-t border-slate-700 w-full animate-fadeIn">
                        <p className="text-xs font-bold text-red-500 mb-1">Flee Penalty (-15%)</p>
                        <div className="space-y-1">
                            <StatRow label="XP Lost" value={`-${runState.fleePenalty.xpLost}`} color="text-red-400" />
                            <StatRow label="Shards Lost" value={`-${runState.fleePenalty.shardsLost}`} color="text-red-400" />
                        </div>
                    </div>
                )}
            </div>

            <button
            onClick={onClose}
            className="w-full px-5 py-1.5 bg-[#D6721C] text-slate-900 font-bold text-sm rounded-lg shadow-md hover:bg-[#E1883D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D6721C]"
            >
            Return to Hub
            </button>
        </div>
    </div>
  );
};

export default RunSummaryScreen;
