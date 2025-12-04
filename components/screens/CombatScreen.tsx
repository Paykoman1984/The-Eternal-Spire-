
import React, { useRef, useEffect } from 'react';
import type { Player, RunState, CombatLog, Equipment, Stats } from '../../types';
import { RARITY_COLORS } from '../../data/items';

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
      <div className="flex justify-between items-center text-xs text-slate-300 mb-0.5">
        <span className="text-[10px]">{label}</span>
        <span className="text-xs">{current}/{max}</span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${percentage > 50 ? 'bg-green-600' : percentage > 25 ? 'bg-[#D6721C]' : 'bg-red-600'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const CombatStatDisplay: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="bg-slate-900/50 p-0.5 rounded text-center border border-slate-600">
        <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
        <p className="text-xs font-bold text-slate-200">{value}</p>
    </div>
);

const StatComparison: React.FC<{ label: string, oldValue: number, newValue: number }> = ({ label, oldValue, newValue }) => {
    const diff = newValue - oldValue;
    let color = 'text-slate-400';
    if (diff > 0) color = 'text-green-400';
    if (diff < 0) color = 'text-red-400';

    return (
        <div className={`flex justify-between items-center text-xs ${color}`}>
            <span>{label}</span>
            <span>{diff > 0 ? '+' : ''}{diff}</span>
        </div>
    );
};


const ItemCard: React.FC<{ title: string, item: Equipment | null }> = ({ title, item }) => {
    const rarityColor = item ? (RARITY_COLORS[item.rarity || 'Common'] || 'text-[#D6721C]') : 'text-[#D6721C]';

    return (
        <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-2 w-full">
            <h4 className="text-xs font-bold text-slate-400 border-b border-slate-700 pb-1 mb-1.5">{title}</h4>
            {item ? (
                <>
                    <div className="flex items-center mb-1.5">
                        <span className="text-2xl mr-2">{item.icon}</span>
                        <div className="flex flex-col">
                            <span className={`font-bold text-sm ${rarityColor}`}>{item.name}</span>
                            <span className="text-[10px] text-slate-500">{item.rarity || 'Common'}</span>
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        {Object.entries(item.stats).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between text-xs text-slate-300">
                                <span>{stat.toUpperCase()}</span>
                                <span>+{value}</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <p className="text-xs text-slate-500">None</p>
            )}
        </div>
    );
};


const LootDecision: React.FC<{
    newItem: Equipment;
    oldItem: Equipment | null;
    onLootDecision: (equip: boolean) => void;
}> = ({ newItem, oldItem, onLootDecision }) => {
    const allStats = Array.from(new Set([...Object.keys(newItem.stats), ...Object.keys(oldItem?.stats ?? {})])) as (keyof Stats)[];

    return (
        <div className="absolute inset-0 bg-slate-900/90 z-50 flex items-center justify-center animate-fadeIn p-4">
            <div className="bg-slate-800 border-2 border-[#D6721C] rounded-xl p-3 max-w-sm w-full shadow-2xl">
                <h3 className="text-base text-center font-bold text-[#D6721C] mb-2">New Item Dropped!</h3>
                <div className="flex gap-2 mb-2">
                    <ItemCard title="Equipped" item={oldItem} />
                    <ItemCard title="New Item" item={newItem} />
                </div>
                
                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-2 mb-3">
                     <h4 className="text-xs font-bold text-slate-400 border-b border-slate-700 pb-1 mb-1.5">Comparison</h4>
                     {allStats.length > 0 ? allStats.map(stat => (
                        <StatComparison 
                            key={stat}
                            label={stat.toUpperCase()}
                            oldValue={oldItem?.stats[stat] ?? 0}
                            newValue={newItem.stats[stat] ?? 0}
                        />
                     )) : <p className="text-xs text-slate-500">No stat changes.</p>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => onLootDecision(true)}
                        className="w-full px-4 py-1.5 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-500 transition-colors"
                    >Equip</button>
                    <button 
                        onClick={() => onLootDecision(false)}
                        className="w-full px-4 py-1.5 bg-slate-600 text-slate-200 font-bold text-sm rounded-lg hover:bg-slate-500 transition-colors"
                    >Discard</button>
                </div>
            </div>
        </div>
    );
};


const CombatScreen: React.FC<CombatScreenProps> = ({ player, runState, logs, onAttack, onFlee, onLootDecision, onUsePotion }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const lastAttackTime = useRef(0);

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
    const now = Date.now();
    if (now - lastAttackTime.current < 300 || isPostCombatPhase) return;
    lastAttackTime.current = now;
    onAttack();
  };

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center p-4 z-10 animate-fadeIn">
      <div className="w-full max-w-3xl h-full flex flex-col gap-2 relative">
        {isLootPending && runState.pendingLoot && (
           <LootDecision 
              newItem={runState.pendingLoot}
              oldItem={currentlyEquipped}
              onLootDecision={onLootDecision}
           />
        )}
        
        {/* Header Information */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-lg text-center flex-shrink-0">
          <h2 className="text-base font-bold text-[#D6721C]">Floor {runState.floor}</h2>
          <div className="flex justify-center gap-3 text-xs text-slate-400">
             <span>Acc Lvl: <span className="text-slate-200 font-bold">{player.level}</span></span>
             <span>Run Lvl: <span className="text-slate-200 font-bold">{runState.runLevel}</span></span>
             <span>Shards: <span className="text-purple-400 font-bold">{runState.shardsEarned}</span></span>
          </div>
        </div>

        {/* Combat Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-shrink-0">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-lg">
            <div className="flex items-center mb-1.5">
              <span className="text-2xl mr-2">{player.classInfo.icon}</span>
              <h3 className="text-sm font-bold text-slate-200">{player.name}</h3>
            </div>
            <HealthBar current={runState.playerCurrentHpInRun} max={player.currentStats.maxHp} label="HP" />
            <div className="grid grid-cols-4 gap-1 mt-1.5 pt-1.5 border-t border-slate-700">
              <CombatStatDisplay label="STR" value={player.currentStats.str} />
              <CombatStatDisplay label="DEX" value={player.currentStats.dex} />
              <CombatStatDisplay label="INT" value={player.currentStats.int} />
              <CombatStatDisplay label="DEF" value={player.currentStats.defense} />
              <CombatStatDisplay label="CRIT" value={`${player.currentStats.critRate}%`} />
              <CombatStatDisplay label="EVADE" value={`${player.currentStats.evasion}%`} />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-lg">
            <div className="relative group w-max mx-auto md:mx-0">
              <div className="flex items-center mb-1.5 cursor-help">
                  <span className="text-2xl mr-2">{runState.currentEnemy.icon}</span>
                  <h3 className="text-sm font-bold text-slate-200">{runState.currentEnemy.name}</h3>
              </div>
              
              {/* Enemy Stats Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-[#D6721C] rounded-md shadow-lg p-1.5 text-xs z-30 pointer-events-none">
                  <p className="font-bold text-[#D6721C] mb-1 text-center text-xs">Stats</p>
                  <div className="space-y-0.5">
                      <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">ATK</span>
                          <span className="text-slate-200 font-bold text-xs">{runState.currentEnemy.stats.attack}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">DEF</span>
                          <span className="text-slate-200 font-bold text-xs">{runState.currentEnemy.stats.defense}</span>
                      </div>
                       <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">EVA</span>
                          <span className="text-slate-200 font-bold text-xs">{runState.currentEnemy.stats.evasion}%</span>
                      </div>
                  </div>
              </div>
            </div>
            
            <HealthBar current={runState.currentEnemy.stats.hp} max={runState.currentEnemy.stats.maxHp} label="Enemy HP" />
          </div>
        </div>

        {/* Combat Log - Flexible Height */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-lg flex-1 min-h-0 flex flex-col">
          <h3 className="text-xs font-bold text-slate-300 mb-1 border-b border-slate-700 pb-1 flex-shrink-0">Combat Log</h3>
          <div ref={logContainerRef} className="flex-grow overflow-y-auto pr-2 no-scrollbar">
            {logs.map((log) => (
              <p key={log.id} className={`text-xs mb-0.5 ${log.color}`}>
                &gt; {log.message}
              </p>
            ))}
          </div>
        </div>

        {/* Action Buttons - Fixed at Bottom */}
        <div className="grid grid-cols-3 gap-2 flex-shrink-0">
          <button
            onClick={handleAttackClick}
            disabled={playerDead || isPostCombatPhase}
            className="w-full px-4 py-2.5 bg-red-700 text-white font-bold text-sm rounded shadow-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            Attack
          </button>
          <button
            onClick={onUsePotion}
            disabled={playerDead || isPostCombatPhase || player.potionCount <= 0 || runState.playerCurrentHpInRun >= player.currentStats.maxHp}
            className="w-full px-4 py-2.5 bg-blue-700 text-white font-bold text-sm rounded shadow-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            Potion ({player.potionCount})
          </button>
          <button
            onClick={onFlee}
            disabled={playerDead || isPostCombatPhase}
            className="w-full px-4 py-2.5 bg-slate-600 text-slate-200 font-bold text-sm rounded shadow-md hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            Flee
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombatScreen;
