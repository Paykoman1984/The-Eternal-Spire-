
import React from 'react';
import type { Player, Skill } from '../../types';
import { SKILL_TREES } from '../../constants';

interface SkillTreeScreenProps {
    player: Player;
    onExit: () => void;
    onUnlockSkill: (skillId: string) => void;
}

const SkillNode: React.FC<{
    skill: Skill;
    level: number;
    available: boolean;
    canAfford: boolean;
    onUnlock: () => void;
}> = ({ skill, level, available, canAfford, onUnlock }) => {
    
    const isMax = level >= skill.maxLevel;
    
    let nodeClass = "w-full p-2 border-2 rounded-xl transition-all duration-300 flex flex-col items-center relative text-center ";
    
    if (level > 0) {
        nodeClass += "bg-indigo-900/60 border-indigo-400 shadow-lg shadow-indigo-500/20";
    } else if (available && canAfford) {
        nodeClass += "bg-slate-800/80 border-yellow-500/80 cursor-pointer hover:scale-105 hover:bg-slate-700";
    } else if (available) {
        nodeClass += "bg-slate-800/40 border-slate-600 cursor-not-allowed opacity-80";
    } else {
        nodeClass += "bg-slate-900/20 border-slate-800 grayscale opacity-40 cursor-not-allowed";
    }

    const iconUrl = `https://api.iconify.design/game-icons/${skill.icon}.svg?color=${level > 0 ? '%23818cf8' : '%2364748b'}`;

    return (
        <div className={nodeClass} onClick={(!isMax && available && canAfford) ? onUnlock : undefined}>
            <div className="w-10 h-10 mb-1">
                <img src={iconUrl} alt={skill.name} className="w-full h-full object-contain" />
            </div>
            <h4 className={`text-xs font-bold leading-tight mb-1 ${level > 0 ? 'text-indigo-200' : 'text-slate-400'}`}>
                {skill.name}
            </h4>
            <p className="text-[8px] text-slate-500 leading-none mb-1 uppercase tracking-tighter">
                {skill.type}
            </p>
            <p className="text-[9px] text-slate-400 leading-tight flex-grow px-1">
                {skill.description}
            </p>
            
            <div className="mt-2 flex items-center justify-between w-full px-1">
                <span className={`text-[10px] font-bold ${isMax ? 'text-indigo-300' : 'text-slate-500'}`}>
                    {level}/{skill.maxLevel}
                </span>
                {!isMax && (
                    <span className={`text-[10px] font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                        {skill.pointsRequired}P
                    </span>
                )}
            </div>
            
            {isMax && (
                <div className="absolute top-1 right-1">
                    <span className="text-green-400 text-[10px]">MAX</span>
                </div>
            )}
        </div>
    );
};

const SkillTreeScreen: React.FC<SkillTreeScreenProps> = ({ player, onExit, onUnlockSkill }) => {
    const tree = SKILL_TREES[player.classInfo.name] || [];

    const getTierPoints = (tier: number) => {
        return tree.filter(s => s.tier === tier).reduce((sum, s) => sum + (player.skills[s.id] || 0), 0);
    };

    const isTierAvailable = (tier: number) => {
        if (tier === 1) return true;
        if (tier === 2) return getTierPoints(1) >= 5;
        if (tier === 3) return getTierPoints(2) >= 3;
        return false;
    };

    const t1Skills = tree.filter(s => s.tier === 1);
    const t2Skills = tree.filter(s => s.tier === 2);
    const t3Skills = tree.filter(s => s.tier === 3);

    return (
        <div className="animate-fadeIn flex flex-col items-center justify-center h-full p-4 w-full">
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-3 shadow-lg w-full max-w-xl flex flex-col h-full max-h-[95vh]">
                <div className="flex justify-between items-center border-b-2 border-slate-700 pb-1.5 mb-2">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-[#D6721C] leading-none">Class Skills</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{player.classInfo.name} Path</p>
                    </div>
                    <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-600 flex items-center gap-2 shadow-inner">
                        <span className="text-xs font-bold text-slate-400">POINTS:</span>
                        <span className="text-sm font-black text-yellow-400">{player.skillPoints}</span>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-1 no-scrollbar pt-2 flex flex-col relative">
                    
                    {/* Tier 1 Section */}
                    <div className="flex flex-col gap-2 mb-8">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Tier I (Core)</span>
                            <span className="text-[10px] font-bold text-indigo-400">{getTierPoints(1)}/10</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 z-10 relative">
                            {t1Skills.map(skill => (
                                <SkillNode 
                                    key={skill.id}
                                    skill={skill}
                                    level={player.skills[skill.id] || 0}
                                    available={true}
                                    canAfford={player.skillPoints >= skill.pointsRequired}
                                    onUnlock={() => onUnlockSkill(skill.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Tree Branch Visual T1 -> T2 */}
                    <div className="relative h-12 w-full flex items-center justify-center -my-8 z-0 overflow-hidden">
                         <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                             <path d="M100 0 L100 50 L300 50 L300 100 M300 0 L300 50 L100 50 L100 100" 
                                   fill="none" 
                                   stroke={isTierAvailable(2) ? "#818cf8" : "#334155"} 
                                   strokeWidth="4" 
                                   strokeDasharray="8 4" />
                         </svg>
                    </div>

                    {/* Tier 2 Section */}
                    <div className="flex flex-col gap-2 mb-8 mt-4">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Tier II (Specialized)</span>
                            {!isTierAvailable(2) ? (
                                <span className="text-[10px] font-bold text-red-500">Spend {5 - getTierPoints(1)} in T1</span>
                            ) : (
                                <span className="text-[10px] font-bold text-indigo-400">{getTierPoints(2)}/6</span>
                            )}
                        </div>
                        <div className={`grid grid-cols-2 gap-4 z-10 transition-opacity duration-300 ${!isTierAvailable(2) ? 'opacity-40' : 'opacity-100'}`}>
                            {t2Skills.map(skill => (
                                <SkillNode 
                                    key={skill.id}
                                    skill={skill}
                                    level={player.skills[skill.id] || 0}
                                    available={isTierAvailable(2)}
                                    canAfford={player.skillPoints >= skill.pointsRequired}
                                    onUnlock={() => onUnlockSkill(skill.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Tree Branch Visual T2 -> T3 */}
                    <div className="relative h-12 w-full flex items-center justify-center -my-8 z-0 overflow-hidden">
                         <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                             <path d="M100 0 C100 50, 200 50, 200 100 M300 0 C300 50, 200 50, 200 100" 
                                   fill="none" 
                                   stroke={isTierAvailable(3) ? "#818cf8" : "#334155"} 
                                   strokeWidth="4" 
                                   strokeDasharray="8 4" />
                         </svg>
                    </div>

                    {/* Tier 3 Section */}
                    <div className="flex flex-col gap-2 mb-4 mt-4">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Tier III (Ultimate)</span>
                            {!isTierAvailable(3) ? (
                                <span className="text-[10px] font-bold text-red-500">Spend {3 - getTierPoints(2)} in T2</span>
                            ) : (
                                <span className="text-[10px] font-bold text-indigo-400">{getTierPoints(3)}/2</span>
                            )}
                        </div>
                        <div className={`grid grid-cols-2 gap-4 z-10 transition-opacity duration-300 ${!isTierAvailable(3) ? 'opacity-40' : 'opacity-100'}`}>
                            {t3Skills.map(skill => (
                                <SkillNode 
                                    key={skill.id}
                                    skill={skill}
                                    level={player.skills[skill.id] || 0}
                                    available={isTierAvailable(3)}
                                    canAfford={player.skillPoints >= skill.pointsRequired}
                                    onUnlock={() => onUnlockSkill(skill.id)}
                                />
                            ))}
                        </div>
                    </div>

                </div>

                <div className="mt-auto pt-3 text-center flex flex-col gap-2 border-t border-slate-800">
                    <p className="text-[9px] text-slate-500 italic">Account Level increases provide more Skill Points.</p>
                    <button
                        onClick={onExit}
                        className="w-full px-5 py-2 bg-slate-700 text-slate-200 font-bold text-sm rounded-lg hover:bg-slate-600 transition-colors duration-300 shadow-md border border-slate-600"
                    >
                        Return to Hub
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkillTreeScreen;
