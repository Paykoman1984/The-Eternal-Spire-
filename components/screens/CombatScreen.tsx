
import React, { useRef, useEffect, useState } from 'react';
import type { Player, RunState, CombatLog, Equipment, Stats, GearSlot, Skill } from '../../types';
import { RARITY_COLORS } from '../../data/items';
import { SKILL_TREES } from '../../constants';

interface CombatScreenProps {
  player: Player;
  runState: RunState;
  logs: CombatLog[];
  onToggleAutoCombat: () => void;
  onFlee: () => void;
  onLootAction: (action: 'take' | 'sell' | 'equip', targetSlot?: GearSlot) => void;
  onUsePotion: () => void;
  onUseSkill: (skillId: string) => void;
}

// --- Sub Components ---

const HealthBar: React.FC<{ current: number; max: number; label?: string; showLabel?: boolean; colorClass?: string }> = ({ current, max, label, showLabel = true, colorClass }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  
  const defaultColor = percentage > 50 ? 'bg-green-600' : percentage > 25 ? 'bg-[#D6721C]' : 'bg-red-600';
  const finalColor = colorClass || defaultColor;

  return (
    <div className="w-full">
      {showLabel && (
          <div className="flex justify-between items-center text-xs text-slate-300 mb-0.5">
            <span className="text-[10px]">{label}</span>
            <span className="text-xs">{current}/{max}</span>
          </div>
      )}
      <div className="w-full bg-slate-900 rounded-full h-4 border border-slate-700 overflow-hidden relative shadow-inner">
        <div
          className={`h-full transition-all duration-300 ${finalColor}`}
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
        <div className={`flex justify-between items-center text-xs ${color} px-2 py-1 bg-slate-900/40 rounded border border-slate-800`}>
            <span className="font-semibold text-slate-300">{label}</span>
            <span className="font-bold">{diff > 0 ? '+' : ''}{diff}</span>
        </div>
    );
};

const ItemCard: React.FC<{ title: string, item: Equipment | null, compact?: boolean, showStats?: boolean }> = ({ title, item, compact = false, showStats = true }) => {
    const rarityColor = item ? (RARITY_COLORS[item.rarity || 'Common'] || 'text-[#D6721C]') : 'text-[#D6721C]';

    return (
        <div className={`bg-slate-900/80 border border-slate-700 rounded-lg p-2 w-full h-full flex flex-col ${compact ? 'text-[10px]' : ''}`}>
            <h4 className="text-xs font-bold text-slate-400 border-b border-slate-700 pb-1 mb-1.5 text-center">{title}</h4>
            {item ? (
                <>
                    <div className="flex items-center mb-1.5 flex-1">
                        <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} mr-2 flex-shrink-0`}>
                             {item.icon.startsWith('http') ? (
                                <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-2xl">{item.icon}</span>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className={`font-bold ${compact ? 'text-xs' : 'text-sm'} ${rarityColor} truncate leading-tight`}>{item.name}</span>
                            <div className="flex flex-col w-full mt-0.5">
                                <span className="text-[9px] text-slate-500 truncate">
                                    {item.slot} • {item.rarity || 'Common'}
                                </span>
                                <span className="text-[9px] text-slate-400 font-semibold whitespace-nowrap">iLvl {item.itemLevel}</span>
                            </div>
                        </div>
                    </div>
                    {showStats && (
                        <div className="space-y-0.5 border-t border-slate-700/50 pt-1 mt-auto">
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
                    )}
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-slate-500 italic">Empty</p>
                </div>
            )}
        </div>
    );
};

const LootDecision: React.FC<{
    player: Player;
    newItem: Equipment;
    oldItem: Equipment | null; 
    itemsRemaining: number;
    onLootAction: (action: 'take' | 'sell' | 'equip', targetSlot?: GearSlot) => void;
}> = ({ player, newItem, oldItem, itemsRemaining, onLootAction }) => {
    
    const weaponType = newItem.weaponType || 'None';
    const isClassAllowed = weaponType === 'None' || player.classInfo.allowedWeaponTypes.some(t => t === weaponType);

    const isShieldOrTome = ['Shield', 'Tome'].includes(weaponType);
    const isWeapon = !isShieldOrTome && weaponType !== 'None';
    const isTwoHanded = !!newItem.isTwoHanded;

    const canMain = isClassAllowed && isWeapon;
    const canOff = isClassAllowed && ((isWeapon && !isTwoHanded) || isShieldOrTome);

    const showDualChoice = canMain && canOff;

    const mainHandItem = player.equipment.MainHand ?? null;
    const offHandItem = player.equipment.OffHand ?? null;

    const sellValue = Math.floor((newItem.cost || 10) * 0.2);
    const occupiedCount = player.inventory.length + (player.potionCount > 0 ? 1 : 0);
    const isBagFull = occupiedCount >= 24;
    
    const canSwapDefault = !oldItem || !isBagFull; 
    let canEquipDefault = isClassAllowed && canSwapDefault;
    
    if (!showDualChoice && canOff && !canMain) {
        if (mainHandItem && mainHandItem.isTwoHanded) {
             canEquipDefault = false; 
        }
    }

    const renderComparison = (baseItem: Equipment | null, targetItem: Equipment) => {
        const allStats = Array.from(new Set([...Object.keys(targetItem.stats), ...Object.keys(baseItem?.stats ?? {})])) as (keyof Stats)[];
        if (allStats.length === 0) return <p className="text-xs text-slate-500 text-center py-1">No stat changes.</p>;
        
        return (
            <div className="flex flex-col gap-1">
                {allStats.map(stat => {
                    if (stat === 'itemLevel' as any) return null; 
                    return (
                        <StatComparison 
                            key={stat}
                            label={stat.toUpperCase()}
                            oldValue={baseItem?.stats[stat] ?? 0}
                            newValue={targetItem.stats[stat] ?? 0}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="absolute inset-0 bg-slate-900/95 z-50 flex items-center justify-center animate-fadeIn p-4 overflow-y-auto backdrop-blur-md">
            <div className="bg-slate-900/90 border-2 border-[#D6721C] rounded-xl p-3 w-auto min-w-[340px] max-w-md shadow-2xl flex flex-col max-h-[90vh] backdrop-blur-md">
                <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-1 flex-shrink-0">
                    <h3 className="text-base font-bold text-[#D6721C]">New Item Dropped!</h3>
                    {itemsRemaining > 1 && (
                        <span className="text-[10px] text-slate-300 font-bold bg-slate-700 px-2 py-0.5 rounded-full">
                            +{itemsRemaining - 1} more
                        </span>
                    )}
                </div>
                
                <div className="flex-grow overflow-y-auto no-scrollbar">
                    {showDualChoice ? (
                        <div className="flex flex-col gap-3">
                             <div className="text-center text-xs text-slate-400 font-bold uppercase tracking-wider my-0.5">- Choose Slot -</div>
                             <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-2">
                                <div className="flex gap-2 mb-2">
                                    <div className="flex-1"><ItemCard title="New Item" item={newItem} compact showStats={false} /></div>
                                    <div className="flex-1"><ItemCard title="Main Hand" item={mainHandItem} compact showStats={false} /></div>
                                </div>
                                <div className="mt-1 border-t border-slate-700 pt-2">
                                     <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 text-center">Stat Changes</p>
                                     {renderComparison(mainHandItem, newItem)}
                                </div>
                                <button 
                                   onClick={() => onLootAction('equip', 'MainHand')}
                                   disabled={!canSwapDefault && !!mainHandItem} 
                                   className="w-full mt-2 px-2 py-1.5 bg-cyan-700 text-white font-bold text-xs rounded hover:bg-cyan-600 transition-colors disabled:bg-slate-700 disabled:text-slate-500"
                                >
                                    Replace Main Hand
                                </button>
                             </div>

                             <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-2">
                                <div className="flex gap-2 mb-2">
                                    <div className="flex-1"><ItemCard title="New Item" item={newItem} compact showStats={false} /></div>
                                    <div className="flex-1"><ItemCard title="Off Hand" item={offHandItem} compact showStats={false} /></div>
                                </div>
                                <div className="mt-1 border-t border-slate-700 pt-2">
                                     <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 text-center">Stat Changes</p>
                                     {renderComparison(offHandItem, newItem)}
                                </div>
                                <button 
                                   onClick={() => onLootAction('equip', 'OffHand')}
                                   disabled={!canSwapDefault && !!offHandItem}
                                   className="w-full mt-2 px-2 py-1.5 bg-cyan-700 text-white font-bold text-xs rounded hover:bg-cyan-600 transition-colors disabled:bg-slate-700 disabled:text-slate-500"
                                >
                                    {offHandItem ? 'Replace Off Hand' : 'Equip to Off Hand'}
                                </button>
                             </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 mb-1">
                            <div className="flex gap-2 h-full">
                                <div className="flex-1"><ItemCard title="New Item" item={newItem} compact showStats={false} /></div>
                                <div className="flex-1"><ItemCard title="Equipped" item={oldItem} compact showStats={false} /></div>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-2 w-full mt-1">
                                <h4 className="text-xs font-bold text-slate-400 border-b border-slate-700 pb-1 mb-2 text-center uppercase tracking-widest">Stat Changes</h4>
                                {renderComparison(oldItem, newItem)}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="mt-3 flex-shrink-0 pt-2 border-t border-slate-700/50">
                    {isBagFull && canSwapDefault && (
                        !canSwapDefault && <p className="text-[10px] text-red-400 font-bold text-center mb-2">Inventory Full! Cannot swap current item.</p>
                    )}
                    {isBagFull && !canSwapDefault && (
                        <p className="text-[10px] text-red-400 font-bold text-center mb-2">Inventory Full! You must Sell.</p>
                    )}
                    {!isClassAllowed && <p className="text-[10px] text-red-400 font-bold text-center mb-2">Class Restricted</p>}
                    {!showDualChoice && !canEquipDefault && isClassAllowed && !isBagFull && <p className="text-[10px] text-red-400 font-bold text-center mb-2">Cannot Equip (2H conflict?)</p>}

                    <div className="grid grid-cols-3 gap-2">
                        {!showDualChoice && (
                            <button 
                                onClick={() => onLootAction('equip')}
                                disabled={!canEquipDefault}
                                className="w-full px-2 py-2 bg-cyan-700 text-white font-bold text-sm rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-md"
                            >Equip</button>
                        )}
                        {showDualChoice && <div className="hidden"></div>}
                        
                        <button 
                            onClick={() => onLootAction('take')}
                            disabled={isBagFull}
                            className={`w-full px-2 py-2 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-500 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-md ${showDualChoice ? 'col-span-1' : ''}`}
                        >Take</button>
                        <button 
                            onClick={() => onLootAction('sell')}
                            className={`w-full px-2 py-2 bg-purple-700 text-white font-bold text-sm rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-1 shadow-md ${showDualChoice ? 'col-span-1' : ''}`}
                        >
                            <span>Sell</span>
                            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-purple-200">{sellValue}</span>
                        </button>
                    </div>
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

// --- Hotbar Skill Button ---
const SkillHotbarButton: React.FC<{ 
    skill: Skill; 
    level: number; 
    cooldown: number; 
    playerResource: number; 
    onUse: () => void 
}> = ({ skill, level, cooldown, playerResource, onUse }) => {
    const isReady = cooldown === 0;
    const canAfford = playerResource >= skill.cost;
    const isUsable = isReady && canAfford && level > 0;
    const cooldownPercent = skill.cooldown ? (cooldown / skill.cooldown) * 100 : 0;

    const iconUrl = `https://api.iconify.design/game-icons/${skill.icon}.svg?color=${isUsable ? '%23facc15' : '%23475569'}`;

    return (
        <button 
            onClick={onUse}
            disabled={!isUsable}
            className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg border-2 transition-all duration-200 overflow-hidden flex items-center justify-center bg-slate-900 group ${
                isUsable 
                ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95' 
                : 'border-slate-700 opacity-80 cursor-not-allowed'
            }`}
        >
            <img src={iconUrl} alt={skill.name} className={`w-3/4 h-3/4 object-contain ${!isUsable && 'grayscale'}`} />
            
            {/* Cooldown Radial Sweep Overlay */}
            {!isReady && (
                <div 
                    className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none"
                    style={{ 
                        clipPath: `inset(${100 - cooldownPercent}% 0 0 0)` 
                    }}
                ></div>
            )}

            {/* Cooldown Number Overlay */}
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{cooldown}</span>
                </div>
            )}

            {/* Resource Cost Indicator */}
            <div className="absolute top-0 right-0 bg-slate-950/80 px-1 rounded-bl-md border-l border-b border-slate-700 pointer-events-none">
                 <span className={`text-[8px] font-bold ${canAfford ? 'text-cyan-300' : 'text-red-400'}`}>{skill.cost}</span>
            </div>

            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 invisible group-hover:visible bg-slate-900 border border-slate-700 rounded-md p-2 w-32 shadow-2xl z-[100] text-left">
                <p className="text-[10px] font-bold text-yellow-400">{skill.name} <span className="text-slate-500">Lv.{level}</span></p>
                <p className="text-[9px] text-slate-300 leading-tight mt-1">{skill.description}</p>
                <p className="text-[8px] text-slate-500 mt-1">Cost: {skill.cost} CD: {skill.cooldown}s</p>
            </div>
        </button>
    );
};

// --- Main Combat Screen ---

const CombatScreen: React.FC<CombatScreenProps> = ({ player, runState, logs, onToggleAutoCombat, onFlee, onLootAction, onUsePotion, onUseSkill }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [showFlash, setShowFlash] = useState(false); 
  const prevLogLengthRef = useRef(0);
  const [playerFloatingText, setPlayerFloatingText] = useState<FloatingTextData | null>(null);
  const [enemyFloatingText, setEnemyFloatingText] = useState<FloatingTextData | null>(null);
  const playerTextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemyTextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playerDead = runState.playerCurrentHpInRun <= 0;
  const currentLootItem = runState.pendingLoot && runState.pendingLoot.length > 0 ? runState.pendingLoot[0] : null;
  const isLootPending = currentLootItem !== null;
  const itemsRemaining = runState.pendingLoot.length;

  const enemyDefeated = runState.currentEnemy.stats.hp <= 0;
  const isPostCombatPhase = isLootPending || enemyDefeated;
  const currentlyEquipped = currentLootItem ? (player.equipment[currentLootItem.slot] ?? null) : null;
  const isAuto = runState.isAutoBattling;

  const isMage = player.classInfo.name === 'Mage';
  const resourceCurrent = isMage ? runState.playerCurrentManaInRun : runState.playerCurrentEnergyInRun;
  const resourceMax = isMage ? player.currentStats.maxMana : player.currentStats.maxEnergy;
  const resourceLabel = isMage ? 'Mana' : 'Energy';
  const resourceColor = isMage ? 'bg-blue-600' : 'bg-yellow-500';

  const activeSkills = (SKILL_TREES[player.classInfo.name] || []).filter(s => s.type === 'active');

  useEffect(() => {
    if (logs.length === 0) {
        prevLogLengthRef.current = 0;
        return;
    }

    if (logs.length > prevLogLengthRef.current) {
        const newLogs = logs.slice(prevLogLengthRef.current);
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
            }, 100); 
        }

        newLogs.forEach((log, index) => {
            const id = Date.now() + index; 
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
            if (log.message.includes("(CRIT!)")) {
                if (enemyTextTimeoutRef.current) clearTimeout(enemyTextTimeoutRef.current);
                setEnemyFloatingText({ id, text: "CRIT!", color: "text-red-500 text-xl md:text-2xl" });
                enemyTextTimeoutRef.current = setTimeout(() => setEnemyFloatingText(null), 1000);
            }
            if (log.message.includes("dodged your attack")) {
                if (enemyTextTimeoutRef.current) clearTimeout(enemyTextTimeoutRef.current);
                setEnemyFloatingText({ id, text: "DODGE!", color: "text-blue-400" });
                enemyTextTimeoutRef.current = setTimeout(() => setEnemyFloatingText(null), 1000);
            }
            if (log.message.includes("[SKILL]")) {
                 if (enemyTextTimeoutRef.current) clearTimeout(enemyTextTimeoutRef.current);
                 setEnemyFloatingText({ id, text: "SKILL!", color: "text-yellow-400 animate-pulse" });
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
        
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-2 shadow-lg text-center flex-shrink-0">
          <h2 className="text-base font-bold text-[#D6721C]">Floor {runState.floor}</h2>
          <div className="flex justify-center gap-3 text-xs text-slate-400">
             <span>Acc Lvl: <span className="text-slate-200 font-bold">{player.level}</span></span>
             <span>Run Lvl: <span className="text-slate-200 font-bold">{runState.runLevel}</span></span>
             <span>Shards: <span className="text-purple-400 font-bold">{runState.shardsEarned}</span></span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-2 shadow-lg flex-shrink-0">
            <h3 className="text-xs font-bold text-[#D6721C] border-b border-slate-700 pb-1 mb-2 text-center uppercase tracking-widest">Player Stats</h3>
            <div className="grid grid-cols-4 gap-2">
                <CombatStatDisplay label="STR" value={player.currentStats.str} color="text-red-400" />
                <CombatStatDisplay label="DEX" value={player.currentStats.dex} color="text-green-400" />
                <CombatStatDisplay label="INT" value={player.currentStats.int} color="text-blue-400" />
                <CombatStatDisplay label="DEF" value={player.currentStats.defense} />
                <CombatStatDisplay label="CRIT" value={`${player.currentStats.critRate}%`} />
                <CombatStatDisplay label="EVA" value={`${player.currentStats.evasion}%`} />
                {isMage ? (
                    <>
                        <CombatStatDisplay label="CSPD" value={`${player.currentStats.castSpeed}%`} color="text-indigo-400" />
                        <CombatStatDisplay label="LS" value={`${player.currentStats.lifesteal}%`} color="text-pink-400" />
                    </>
                ) : (
                    <>
                        <CombatStatDisplay label="ASPD" value={`${player.currentStats.attackSpeed}%`} color="text-yellow-400" />
                        <CombatStatDisplay label="LS" value={`${player.currentStats.lifesteal}%`} color="text-pink-400" />
                    </>
                )}
            </div>
        </div>

        {/* Combat Visualization */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-3 shadow-lg flex-shrink-0">
            <div className="flex items-center justify-between">
                
                <div className="flex flex-col items-center w-24 relative gap-1">
                     <FloatingText data={playerFloatingText} />
                     <div className="w-14 h-14 bg-slate-900/50 border-2 border-slate-600 rounded-lg p-1 shadow-md">
                        {player.classInfo.icon.startsWith('http') ? (
                            <img src={player.classInfo.icon} alt={player.classInfo.name} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-3xl flex items-center justify-center h-full">{player.classInfo.icon}</span>
                        )}
                     </div>
                     <span className="text-xs font-bold text-slate-200 truncate w-full text-center leading-none">{player.name}</span>
                     
                     <div className="w-full space-y-1 mt-1">
                        <HealthBar current={runState.playerCurrentHpInRun} max={player.currentStats.maxHp} showLabel={false} />
                        <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-700 overflow-hidden relative shadow-inner">
                            <div
                                className={`h-full transition-all duration-300 ${resourceColor}`}
                                style={{ width: `${(resourceCurrent / (resourceMax || 1)) * 100}%` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-[7px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] leading-none">{resourceCurrent}/{resourceMax}</span>
                            </div>
                        </div>
                     </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative h-full w-full">
                     <div className={`z-10 opacity-80 transition-transform duration-100 ${showFlash ? 'scale-125' : 'scale-100'}`}>
                        <img 
                            src={`https://api.iconify.design/game-icons/crossed-swords.svg?color=%23e2e8f0`} 
                            alt="Combat" 
                            className="w-14 h-14 md:w-20 md:h-20" 
                        /> 
                     </div>
                </div>

                <div className="flex flex-col items-center w-24 relative">
                     <FloatingText data={enemyFloatingText} />
                     <div className="relative w-14 h-14 bg-slate-900/50 border-2 border-red-900/50 rounded-lg p-1 mb-2 shadow-md">
                        {runState.currentEnemy.icon.startsWith('http') ? (
                            <img src={runState.currentEnemy.icon} alt={runState.currentEnemy.name} className="w-full h-full object-contain" />
                        ) : (
                             <span className="text-3xl flex items-center justify-center h-full">{runState.currentEnemy.icon}</span>
                        )}
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

        {/* Manual Skill Hotbar */}
        <div className="bg-slate-900/90 backdrop-blur-md border-2 border-slate-700/80 rounded-xl p-2 shadow-2xl flex-shrink-0 z-20">
            <div className="flex justify-center items-center gap-4">
                {activeSkills.map(skill => {
                    const level = player.skills[skill.id] || 0;
                    if (level <= 0) return null; // Only show unlocked skills
                    return (
                        <SkillHotbarButton 
                            key={skill.id}
                            skill={skill}
                            level={level}
                            cooldown={runState.skillCooldowns[skill.id] || 0}
                            playerResource={resourceCurrent}
                            onUse={() => onUseSkill(skill.id)}
                        />
                    );
                })}
                {activeSkills.every(s => (player.skills[s.id] || 0) === 0) && (
                    <p className="text-[10px] text-slate-500 italic py-2">Unlock Active Skills in the Skill Tree to use them here.</p>
                )}
            </div>
        </div>

        {/* Combat Log */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-2 shadow-lg flex-1 min-h-0 flex flex-col md:max-h-[30vh] lg:max-h-[40vh]">
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

        {/* Controls */}
        <div className="grid grid-cols-3 gap-2 flex-shrink-0 mt-auto">
          <button
            onClick={onToggleAutoCombat}
            disabled={playerDead || isPostCombatPhase}
            className={`w-full px-4 py-3 font-bold text-sm rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed ${
                isAuto 
                ? 'bg-red-900/80 text-red-200 hover:bg-red-800 border border-red-700 focus:ring-red-500' 
                : 'bg-green-700/90 text-white hover:bg-green-600 focus:ring-green-500 animate-pulse backdrop-blur-sm'
            }`}
          >
            {isAuto ? 'Stop' : 'AUTO-FIGHT'}
          </button>
          <button
            onClick={onUsePotion}
            disabled={playerDead || isPostCombatPhase || player.potionCount <= 0 || runState.playerCurrentHpInRun >= player.currentStats.maxHp}
            className="w-full px-4 py-3 bg-blue-700/90 text-white font-bold text-sm rounded-lg shadow-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            Potion ({player.potionCount})
          </button>
          <button
            onClick={onFlee}
            disabled={playerDead || isPostCombatPhase}
            className="w-full px-4 py-3 bg-slate-600/90 text-slate-200 font-bold text-sm rounded-lg shadow-md hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            Flee
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombatScreen;
