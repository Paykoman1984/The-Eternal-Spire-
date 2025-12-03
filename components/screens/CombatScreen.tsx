import React, { useRef, useEffect } from 'react';
import type { Player, RunState, CombatLog } from '../../types';

interface CombatScreenProps {
  player: Player;
  runState: RunState;
  logs: CombatLog[];
  onAttack: () => void;
  onFlee: () => void;
}

const HealthBar: React.FC<{ current: number; max: number; label: string }> = ({ current, max, label }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center text-sm text-slate-300 mb-1">
        <span>{label}</span>
        <span>{current} / {max}</span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-5 border-2 border-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${percentage > 50 ? 'bg-green-600' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-600'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const CombatStatDisplay: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
        <p className="text-sm font-bold text-slate-200">{value}</p>
    </div>
);

const CombatScreen: React.FC<CombatScreenProps> = ({ player, runState, logs, onAttack, onFlee }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const playerDead = runState.playerCurrentHpInRun <= 0;

  useEffect(() => {
    // Auto-scroll logs to the bottom
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col gap-4 animate-fadeIn w-full">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg text-center">
        <h2 className="text-2xl font-bold text-yellow-400">Floor {runState.floor}</h2>
        <p className="text-slate-400">Run Level: {runState.runLevel}</p>
      </div>

      {/* Combatants Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">{player.classInfo.icon}</span>
            <h3 className="text-xl font-bold text-slate-200">{player.classInfo.name}</h3>
          </div>
          <HealthBar current={runState.playerCurrentHpInRun} max={player.currentStats.maxHp} label="Your HP" />
          <div className="grid grid-cols-5 gap-1 mt-3 pt-2 border-t border-slate-700">
            <CombatStatDisplay label="STR" value={player.currentStats.str} />
            <CombatStatDisplay label="DEX" value={player.currentStats.dex} />
            <CombatStatDisplay label="INT" value={player.currentStats.int} />
            <CombatStatDisplay label="DEF" value={player.currentStats.defense} />
            <CombatStatDisplay label="CRIT" value={`${player.currentStats.critRate}%`} />
          </div>
        </div>

        {/* Enemy Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">{runState.currentEnemy.icon}</span>
            <h3 className="text-xl font-bold text-slate-200">{runState.currentEnemy.name}</h3>
          </div>
          <HealthBar current={runState.currentEnemy.stats.hp} max={runState.currentEnemy.stats.maxHp} label="Enemy HP" />
        </div>
      </div>

      {/* Combat Logs */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg h-48 flex flex-col">
        <h3 className="text-lg font-bold text-slate-300 mb-2 border-b border-slate-700 pb-1">Combat Log</h3>
        <div ref={logContainerRef} className="flex-grow overflow-y-auto pr-2">
          {logs.map((log) => (
            <p key={log.id} className={`text-sm mb-1 ${log.color}`}>
              &gt; {log.message}
            </p>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onAttack}
          disabled={playerDead}
          className="w-full px-6 py-4 bg-red-700 text-white font-bold text-lg rounded-lg shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none"
        >
          Attack
        </button>
        <button
          onClick={onFlee}
          disabled={playerDead}
          className="w-full px-6 py-4 bg-slate-600 text-slate-200 font-bold text-lg rounded-lg hover:bg-slate-500 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-slate-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          Flee
        </button>
      </div>
    </div>
  );
};

export default CombatScreen;