
import React, { useRef, useEffect, useState } from 'react';
import type { Player, RunState, CombatLog, Equipment, Stats } from '../../types';
import { RARITY_COLORS } from '../../data/items';

interface CombatScreenProps {
  player: Player;
  runState: RunState;
  logs: CombatLog[];
  onToggleAutoCombat: () => void;
  onFlee: () => void;
  onLootAction: (action: 'take' | 'sell' | 'equip') => void;
  onUsePotion: () => void;
}

// --- Sub Components ---

const HealthBar: React.FC<{ current: number; max: number; label?: string; showLabel?: boolean }> = ({ current, max, label, showLabel = true }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  return (
    <div className="w-full">
      {showLabel && (
          <div className="flex justify-between items-center text-xs text-slate-300 mb-0.5">
            <span className="text-[10px]">{label}</span>
            <span className="text-xs">{current}/{max}</span>
          </div>
      )}
      {/* Increased height to h-4 (16px) */}
      <div className="w-full bg-slate-900 rounded-full h-4 border border-slate-700 overflow-hidden relative shadow-inner">
        <div
          className={`h-full transition-all duration-300 ${percentage > 50 ? 'bg-green-600' : percentage > 25 ? 'bg-[#D6721C]' : 'bg-red-600'}`}
          style={{ width: `${percentage}%` }}
        ></div>
        {!showLabel && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] leading-none mt-[1px]">{current}/{max}</span>
            </div>
        )}
      </div>
    </div>
  );
};

const CombatStatDisplay: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
    <div className="bg-slate-900/50 p-1 rounded text-center border border-slate-600 flex flex-col justify-center items-center">
        <p className="text-[8px] font-bold text-slate-500 uppercase leading-none mb-0.5">{label}</p>
        <p className={`text-xs font-bold leading-none ${color || 'text-slate-200'}`}>{value}</p>
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
                        <div className="w-10 h-10 mr-2 flex-shrink-0">
                             {item.icon.startsWith('http') ? (
                                <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-2xl">{item.icon}</span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-bold text-sm ${rarityColor}`}>{item.name}</span>
                            <div className="flex justify-between w-full pr-1">
                                <span className="text-[10px] text-slate-500">
                                    {item.slot} • {item.rarity || 'Common'}
                                    {item.weaponType ? ` (${item.weaponType})` : ''}
                                    {item.isTwoHanded ? ' (2H)' : ''}
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold">iLvl {item.itemLevel}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        {Object.entries(item.stats).map(([stat, value]) => {
                             if (stat === 'itemLevel') return null;
                             return (
                                <div key={stat} className="flex justify-between text-xs text-slate-300">
                                    <span>{stat.toUpperCase()}</span>
                                    <span>+{value}</span>
                                </div>
                             );
                        })}
                    </div>
                </>
            ) : (
                <p className="text-xs text-slate-500">None</p>
            )}
        </div>
    );
};

const LootDecision: React.FC<{
    player: Player;
    newItem: Equipment;
    oldItem: Equipment | null;
    itemsRemaining: number;
    onLootAction: (action: 'take' | 'sell' | 'equip') => void;
}> = ({ player, newItem, oldItem, itemsRemaining, onLootAction }) => {
    const allStats = Array.from(new Set([...Object.keys(newItem.stats), ...Object.keys(oldItem?.stats ?? {})])) as (keyof Stats)[];
    
    const sellValue = Math.floor((newItem.cost || 10) * 0.2);
    const occupiedCount = player.inventory.length + (player.potionCount > 0 ? 1 : 0);
    const isBagFull = occupiedCount >= 24;
    
    const canEquipClass = !newItem.weaponType || player.classInfo.allowedWeaponTypes.includes(newItem.weaponType);
    let canEquipOffHand = true;
    if (newItem.slot === 'OffHand') {
        const mainHand = player.equipment.MainHand;
        if (!mainHand || mainHand.isTwoHanded) canEquipOffHand = false;
    }
    const canSwap = !oldItem || !isBagFull; 
    const canEquip = canEquipClass && canEquipOffHand && canSwap;

    return (
        <div className="absolute inset-0 bg-slate-900/90 z-50 flex items-center justify-center animate-fadeIn p-4">
            <div className="bg-slate-800 border-2 border-[#D6721C] rounded-xl p-3 max-w-sm w-full shadow-2xl">
                <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-1">
                    <h3 className="text-base font-bold text-[#D6721C]">New Item Dropped!</h3>
                    {itemsRemaining > 1 && (
                        <span className="text-[10px] text-slate-300 font-bold bg-slate-700 px-2 py-0.5 rounded-full">
                            +{itemsRemaining - 1} more
                        </span>
                    )}
                </div>
                
                <div className="flex gap-2 mb-2">
                    <ItemCard title="Equipped" item={oldItem} />
                    <ItemCard title="New Item" item={newItem} />
                </div>
                
                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-2 mb-3">
                     <h4 className="text-xs font-bold text-slate-400 border-b border-slate-700 pb-1 mb-1.5">Comparison</h4>
                     {allStats.length > 0 ? allStats.map(stat => {
                        if (stat === 'itemLevel' as any) return null; 
                        return (
                            <StatComparison 
                                key={stat}
                                label={stat.toUpperCase()}
                                oldValue={oldItem?.stats[stat] ?? 0}
                                newValue={newItem.stats[stat] ?? 0}
                            />
                        );
                     }) : <p className="text-xs text-slate-500">No stat changes.</p>}
                </div>
                
                {isBagFull && canSwap && (
                     !canSwap && <p className="text-[10px] text-red-400 font-bold text-center mb-2">Inventory Full! Cannot swap current item.</p>
                )}
                {isBagFull && !canSwap && (
                     <p className="text-[10px] text-red-400 font-bold text-center mb-2">Inventory Full! You must Sell.</p>
                )}
                 {!canEquipClass && <p className="text-[10px] text-red-400 font-bold text-center mb-2">Class Restricted</p>}
                 {!canEquipOffHand && <p className="text-[10px] text-red-400 font-bold text-center mb-2">Requires 1H Weapon</p>}


                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => onLootAction('equip')}
                        disabled={!canEquip}
                        className="w-full px-2 py-1.5 bg-cyan-700 text-white font-bold text-sm rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >Equip</button>
                    <button 
                        onClick={() => onLootAction('take')}
                        disabled={isBagFull}
                        className="w-full px-2 py-1.5 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-500 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >Take</button>
                    <button 
                        onClick={() => onLootAction('sell')}
                        className="w-full px-2 py-1.5 bg-purple-700 text-white font-bold text-sm rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-1"
                    >
                        <span>Sell</span>
                        <span className="text-[9px] bg-black/30 px-1 rounded text-purple-200">{sellValue}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Floating Text Component ---
interface FloatingTextData {
    id: number;
    text: string;
    color: string;
}

const FloatingText: React.FC<{ data: FloatingTextData | null }> = ({ data }) => {
    if (!data) return null;
    return (
        <div key={data.id} className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 pointer-events-none z-20 animate-bounce`}>
            <span className={`text-sm md:text-base font-extrabold ${data.color} drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] stroke-black`}>
                {data.text}
            </span>
        </div>
    );
};

// --- Main Combat Screen ---

const CombatScreen: React.FC<CombatScreenProps> = ({ player, runState, logs, onToggleAutoCombat, onFlee, onLootAction, onUsePotion }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // Animation States
  const [showFlash, setShowFlash] = useState(false); // Controls impact visual

  const prevLogLengthRef = useRef(0);
  
  // Floating Text States (using object with ID to force re-render on same text)
  const [playerFloatingText, setPlayerFloatingText] = useState<FloatingTextData | null>(null);
  const [enemyFloatingText, setEnemyFloatingText] = useState<FloatingTextData | null>(null);
  
  // Refs to manage timeouts preventing race conditions clearing text too early
  const playerTextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemyTextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playerDead = runState.playerCurrentHpInRun <= 0;
  
  // Derived Loot State for Multiple Items
  const currentLootItem = runState.pendingLoot && runState.pendingLoot.length > 0 ? runState.pendingLoot[0] : null;
  const isLootPending = currentLootItem !== null;
  const itemsRemaining = runState.pendingLoot.length;

  const enemyDefeated = runState.currentEnemy.stats.hp <= 0;
  const isPostCombatPhase = isLootPending || enemyDefeated;
  
  const currentlyEquipped = currentLootItem ? (player.equipment[currentLootItem.slot] ?? null) : null;
  const isAuto = runState.isAutoBattling;

  // Trigger sword animation and floating text on new log entry
  useEffect(() => {
    // Reset ref if logs are cleared (new fight)
    if (logs.length === 0) {
        prevLogLengthRef.current = 0;
        return;
    }

    if (logs.length > prevLogLengthRef.current) {
        const newLogs = logs.slice(prevLogLengthRef.current);
        
        // Only trigger flash if actual combat events occurred
        const isCombatEvent = newLogs.some(log => 
            log.message.includes("hit") || 
            log.message.includes("dodged") || 
            log.message.includes("BLOCKED") ||
            log.message.includes("damage") ||
            log.message.includes("defeated")
        );

        if (isCombatEvent) {
             setShowFlash(true);
             const cleanupTimer = setTimeout(() => {
                setShowFlash(false);
            }, 100); // Shorter duration for impact
        }

        // Analyze new logs for floating text
        newLogs.forEach((log, index) => {
            const id = Date.now() + index; // Unique ID per event
            
            // Player Events (Defensive)
            if (log.message.includes("You dodged")) {
                if (playerTextTimeoutRef.current) clearTimeout(playerTextTimeoutRef.current);
                setPlayerFloatingText({ id, text: "DODGE!", color: "text-blue-400" });
                playerTextTimeoutRef.current = setTimeout(() => setPlayerFloatingText(null), 1000);
            }
            if (log.message.includes("You BLOCKED")) {
                if (playerTextTimeoutRef.current) clearTimeout(playerTextTimeoutRef.current);
                setPlayerFloatingText({ id, text: "BLOCK!", color: "text-cyan-400" });
                playerTextTimeoutRef.current = setTimeout(() => setPlayerFloatingText(null), 1000);
            }

            // Enemy Events (Offensive) - "You hit the [Enemy] ... (CRIT!)"
            if (log.message.includes("(CRIT!)")) {
                if (enemyTextTimeoutRef.current) clearTimeout(enemyTextTimeoutRef.current);
                setEnemyFloatingText({ id, text: "CRIT!", color: "text-red-500 text-xl md:text-2xl" });
                enemyTextTimeoutRef.current = setTimeout(() => setEnemyFloatingText(null), 1000);
            }
            // Enemy Dodge - "The [Enemy] dodged"
            if (log.message.includes("dodged your attack")) {
                if (enemyTextTimeoutRef.current) clearTimeout(enemyTextTimeoutRef.current);
                setEnemyFloatingText({ id, text: "DODGE!", color: "text-blue-400" });
                enemyTextTimeoutRef.current = setTimeout(() => setEnemyFloatingText(null), 1000);
            }
        });

        prevLogLengthRef.current = logs.length;
    }
  }, [logs]); 

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center p-4 z-10 animate-fadeIn h-full overflow-hidden select-none">
      <div className="w-full max-w-3xl h-full flex flex-col gap-2 relative">
        {isLootPending && currentLootItem && (
           <LootDecision 
              player={player}
              newItem={currentLootItem}
              oldItem={currentlyEquipped}
              itemsRemaining={itemsRemaining}
              onLootAction={onLootAction}
           />
        )}
        
        {/* 1. HEADER (Intact) */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-lg text-center flex-shrink-0">
          <h2 className="text-base font-bold text-[#D6721C]">Floor {runState.floor}</h2>
          <div className="flex justify-center gap-3 text-xs text-slate-400">
             <span>Acc Lvl: <span className="text-slate-200 font-bold">{player.level}</span></span>
             <span>Run Lvl: <span className="text-slate-200 font-bold">{runState.runLevel}</span></span>
             <span>Shards: <span className="text-purple-400 font-bold">{runState.shardsEarned}</span></span>
          </div>
        </div>

        {/* 2. PLAYER STATS PANEL */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-lg flex-shrink-0">
            <h3 className="text-xs font-bold text-[#D6721C] border-b border-slate-700 pb-1 mb-2 text-center uppercase tracking-widest">Player Stats</h3>
            <div className="grid grid-cols-4 gap-2">
                <CombatStatDisplay label="STR" value={player.currentStats.str} color="text-red-400" />
                <CombatStatDisplay label="DEX" value={player.currentStats.dex} color="text-green-400" />
                <CombatStatDisplay label="INT" value={player.currentStats.int} color="text-blue-400" />
                <CombatStatDisplay label="DEF" value={player.currentStats.defense} />
                
                <CombatStatDisplay label="CRIT" value={`${player.currentStats.critRate}%`} />
                <CombatStatDisplay label="EVA" value={`${player.currentStats.evasion}%`} />
                <CombatStatDisplay label="BLOCK" value={`${player.currentStats.blockChance}%`} color="text-cyan-400" />
                <CombatStatDisplay label="VAMP" value={`${player.currentStats.lifesteal}%`} color="text-pink-400" />
            </div>
        </div>

        {/* 3. THE ARENA (Player VS Enemy) */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-lg flex-shrink-0">
            <div className="flex items-center justify-between">
                
                {/* Left: PLAYER */}
                <div className="flex flex-col items-center w-24 relative">
                     {/* Floating Text Overlay */}
                     <FloatingText data={playerFloatingText} />
                     
                     <div className="w-14 h-14 bg-slate-900/50 border-2 border-slate-600 rounded-lg p-1 mb-2 shadow-md">
                        {player.classInfo.icon.startsWith('http') ? (
                            <img src={player.classInfo.icon} alt={player.classInfo.name} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-3xl flex items-center justify-center h-full">{player.classInfo.icon}</span>
                        )}
                     </div>
                     <span className="text-xs font-bold text-slate-200 mb-1 truncate w-full text-center">{player.name}</span>
                     <HealthBar current={runState.playerCurrentHpInRun} max={player.currentStats.maxHp} showLabel={false} />
                </div>

                {/* Center: BATTLE ANIMATION */}
                <div className="flex-1 flex items-center justify-center relative h-full w-full">
                     {/* Fixed Crossed Swords Icon */}
                     <div className={`z-10 opacity-80 transition-transform duration-100 ${showFlash ? 'scale-125' : 'scale-100'}`}>
                        <img 
                            src={`https://api.iconify.design/game-icons/crossed-swords.svg?color=%23e2e8f0`} 
                            alt="Combat" 
                            className="w-14 h-14 md:w-20 md:h-20" 
                        /> 
                     </div>
                </div>

                {/* Right: ENEMY */}
                <div className="flex flex-col items-center w-24 relative">
                     {/* Floating Text Overlay */}
                     <FloatingText data={enemyFloatingText} />

                     <div className="relative w-14 h-14 bg-slate-900/50 border-2 border-red-900/50 rounded-lg p-1 mb-2 shadow-md">
                        {runState.currentEnemy.icon.startsWith('http') ? (
                            <img src={runState.currentEnemy.icon} alt={runState.currentEnemy.name} className="w-full h-full object-contain" />
                        ) : (
                             <span className="text-3xl flex items-center justify-center h-full">{runState.currentEnemy.icon}</span>
                        )}
                        {/* Enemy Stats Hover/Tooltip */}
                        <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-slate-600 rounded px-1 z-10">
                             <span className="text-[8px] font-bold text-red-400">ATK {runState.currentEnemy.stats.attack}</span>
                        </div>
                     </div>
                     <span className={`text-xs font-bold mb-1 truncate w-full text-center ${runState.currentEnemy.isElite ? 'text-yellow-400' : 'text-slate-200'}`}>
                         {runState.currentEnemy.name}
                     </span>
                     <HealthBar current={runState.currentEnemy.stats.hp} max={runState.currentEnemy.stats.maxHp} showLabel={false} />
                </div>

            </div>
        </div>

        {/* 4. COMBAT LOG (Intact placement) */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-lg flex-1 min-h-0 flex flex-col md:max-h-[30vh] lg:max-h-[40vh]">
          <h3 className="text-xs font-bold text-slate-300 mb-1 border-b border-slate-700 pb-1 flex-shrink-0">Combat Log</h3>
          <div ref={logContainerRef} className="flex-grow overflow-y-auto pr-2 no-scrollbar">
            {logs.map((log) => (
              <p key={log.id} className={`text-xs mb-0.5 ${log.color}`}>
                &gt; {log.message}
              </p>
            ))}
            {isAuto && !isPostCombatPhase && !playerDead && (
                <p className="text-xs text-slate-500 animate-pulse italic">&gt; Auto-battling...</p>
            )}
          </div>
        </div>

        {/* 5. ACTION BUTTONS (Intact placement) */}
        <div className="grid grid-cols-3 gap-2 flex-shrink-0 mt-auto">
          <button
            onClick={onToggleAutoCombat}
            disabled={playerDead || isPostCombatPhase}
            className={`w-full px-4 py-3 font-bold text-sm rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed ${
                isAuto 
                ? 'bg-red-900/80 text-red-200 hover:bg-red-800 border border-red-700 focus:ring-red-500' 
                : 'bg-green-700 text-white hover:bg-green-600 focus:ring-green-500 animate-pulse'
            }`}
          >
            {isAuto ? 'Stop' : 'FIGHT!'}
          </button>
          <button
            onClick={onUsePotion}
            disabled={playerDead || isPostCombatPhase || player.potionCount <= 0 || runState.playerCurrentHpInRun >= player.currentStats.maxHp}
            className="w-full px-4 py-3 bg-blue-700 text-white font-bold text-sm rounded-lg shadow-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            Potion ({player.potionCount})
          </button>
          <button
            onClick={onFlee}
            disabled={playerDead || isPostCombatPhase}
            className="w-full px-4 py-3 bg-slate-600 text-slate-200 font-bold text-sm rounded-lg shadow-md hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            Flee
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombatScreen;
