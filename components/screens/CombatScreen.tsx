
import React, { useRef, useEffect, useState } from 'react';
import type { Player, RunState, CombatLog, Equipment, Stats } from '../../types';

interface CombatScreenProps {
  player: Player;
  runState: RunState;
  logs: CombatLog[];
  onAttack: () => void;
  onFlee: () => void;
  onLootDecision: (equip: boolean) => void;
  onUsePotion: () => void;
}

const HealthBar: React.FC<{ current: number; max: number; label: string }> = ({ current, max, label }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
        <span>{label}</span>
        <span>{current} / {max}</span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-5 border-2 border-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${percentage > 50 ? 'bg-green-600' : percentage > 25 ? 'bg-[#D6721C]' : 'bg-red-600'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const CombatStatDisplay: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
        <p className="text-xs font-bold text-slate-200">{value}</p>
    </div>
);

const StatComparison: React.FC<{ label: string, oldValue: number, newValue: number }> = ({ label, oldValue, newValue }) => {
    const diff = newValue - oldValue;
    let color = 'text-slate-400';
    if (diff > 0) color = 'text-green-400';
    if (diff < 0) color = 'text-red-400';

    return (
        <div className={`flex justify-between items-center text-sm ${color}`}>
            <span>{label}</span>
            <span>{diff > 0 ? '+' : ''}{diff}</span>
        </div>
    );
};


const ItemCard: React.FC<{ title: string, item: Equipment | null }> = ({ title, item }) => (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 w-full">
        <h4 className="text-sm font-bold text-slate-400 border-b border-slate-700 pb-1 mb-2">{title}</h4>
        {item ? (
            <>
                <div className="flex items-center mb-2">
                    <span className="text-3xl mr-2">{item.icon}</span>
                    <span className="font-bold text-[#D6721C] text-base">{item.name}</span>
                </div>
                <div className="space-y-1">
                    {Object.entries(item.stats).map(([stat, value]) => (
                        <div key={stat} className="flex justify-between text-xs text-slate-300">
                            <span>{stat.toUpperCase()}</span>
                            <span>+{value}</span>
                        </div>
                    ))}
                </div>
            </>
        ) : (
            <p className="text-sm text-slate-500">None Equipped</p>
        )}
    </div>
);


const LootDecision: React.FC<{
    newItem: Equipment;
    oldItem: Equipment | null;
    onLootDecision: (equip: boolean) => void;
}> = ({ newItem, oldItem, onLootDecision }) => {
    const allStats = Array.from(new Set([...Object.keys(newItem.stats), ...Object.keys(oldItem?.stats ?? {})])) as (keyof Stats)[];

    return (
        <div className="absolute inset-0 bg-slate-900/80 z-20 flex items-start justify-center animate-fadeIn p-4 pt-20">
            <div className="bg-slate-800 border-2 border-[#D6721C] rounded-xl p-4 max-w-lg w-full shadow-2xl shadow-[#D6721C]/10">
                <h3 className="text-xl text-center font-bold text-[#D6721C] mb-4">New Item Dropped!</h3>
                <div className="flex gap-4 mb-4">
                    <ItemCard title="Currently Equipped" item={oldItem} />
                    <ItemCard title="New Item" item={newItem} />
                </div>
                
                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 mb-4">
                     <h4 className="text-sm font-bold text-slate-400 border-b border-slate-700 pb-1 mb-2">Stat Comparison</h4>
                     {allStats.length > 0 ? allStats.map(stat => (
                        <StatComparison 
                            key={stat}
                            label={stat.toUpperCase()}
                            oldValue={oldItem?.stats[stat] ?? 0}
                            newValue={newItem.stats[stat] ?? 0}
                        />
                     )) : <p className="text-sm text-slate-500">No stat changes.</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => onLootDecision(true)}
                        className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors"
                    >Equip</button>
                    <button 
                        onClick={() => onLootDecision(false)}
                        className="w-full px-4 py-3 bg-slate-600 text-slate-200 font-bold rounded-lg hover:bg-slate-500 transition-colors"
                    >Discard</button>
                </div>
            </div>
        </div>
    );
};


const CombatScreen: React.FC<CombatScreenProps> = ({ player, runState, logs, onAttack, onFlee, onLootDecision, onUsePotion }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [attackCooldown, setAttackCooldown] = useState(false);

  const playerDead = runState.playerCurrentHpInRun <= 0;
  const isLootPending = runState.pendingLoot !== null;
  const enemyDefeated = runState.currentEnemy.stats.hp <= 0;
  const isPostCombatPhase = isLootPending || enemyDefeated;
  
  const currentlyEquipped = runState.pendingLoot ? (player.equipment[runState.pendingLoot.slot] ?? null) : null;

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleAttackClick = () => {
      if (attackCooldown || isPostCombatPhase) return;
      setAttackCooldown(true);
      onAttack();
      setTimeout(() => {
          setAttackCooldown(false);
      }, 300);
  };

  return (
    <div className="relative flex flex-col gap-4 animate-fadeIn w-full">
      {isLootPending && runState.pendingLoot && (
         <LootDecision 
            newItem={runState.pendingLoot}
            oldItem={currentlyEquipped}
            onLootDecision={onLootDecision}
         />
      )}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg text-center">
        <h2 className="text-xl font-bold text-[#D6721C]">Floor {runState.floor}</h2>
        <p className="text-sm text-slate-400 mb-2">Run Level: {runState.runLevel}</p>
        <div className="flex items-center justify-center text-xs mt-2 border-t border-slate-700 pt-2">
            <span className="text-purple-400 mr-1.5">💎</span>
            <span className="font-bold text-slate-200">{player.eternalShards}</span>
            <span className="text-xs text-slate-400 ml-1.5">Shards</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-center mb-3">
            <span className="text-3xl mr-3">{player.classInfo.icon}</span>
            <h3 className="text-lg font-bold text-slate-200">{player.classInfo.name}</h3>
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

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-center mb-3">
            <span className="text-3xl mr-3">{runState.currentEnemy.icon}</span>
            <h3 className="text-lg font-bold text-slate-200">{runState.currentEnemy.name}</h3>
          </div>
          <HealthBar current={runState.currentEnemy.stats.hp} max={runState.currentEnemy.stats.maxHp} label="Enemy HP" />
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg h-48 flex flex-col">
        <h3 className="text-base font-bold text-slate-300 mb-2 border-b border-slate-700 pb-1">Combat Log</h3>
        <div ref={logContainerRef} className="flex-grow overflow-y-auto pr-2">
          {logs.map((log) => (
            <p key={log.id} className={`text-xs mb-1 ${log.color}`}>
              &gt; {log.message}
            </p>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={handleAttackClick}
          disabled={playerDead || isPostCombatPhase}
          className="w-full px-4 py-3 bg-red-700 text-white font-bold text-sm rounded-lg shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none"
        >
          Attack
        </button>
        <button
          onClick={onUsePotion}
          disabled={playerDead || isPostCombatPhase || player.potionCount <= 0 || runState.playerCurrentHpInRun >= player.currentStats.maxHp}
          className="w-full px-4 py-3 bg-blue-700 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none"
        >
          Potion ({player.potionCount})
        </button>
        <button
          onClick={onFlee}
          disabled={playerDead || isPostCombatPhase}
          className="w-full px-4 py-3 bg-slate-600 text-slate-200 font-bold text-sm rounded-lg hover:bg-slate-500 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-slate-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          Flee
        </button>
      </div>
    </div>
  );
};

export default CombatScreen;
