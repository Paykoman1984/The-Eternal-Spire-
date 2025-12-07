
import React from 'react';
import type { Player, Achievement } from '../../types';

interface AchievementsScreenProps {
    player: Player;
    achievements: Achievement[];
    onExit: () => void;
    onClaim: (achievementId: string) => void;
}

const AchievementCard: React.FC<{
    player: Player;
    achievement: Achievement;
    onClaim: (achievementId: string) => void;
}> = ({ player, achievement, onClaim }) => {
    
    let currentProgress = 0;
    if (achievement.type === 'account_level') {
        currentProgress = player.level;
    } else {
        currentProgress = player.achievementProgress[achievement.id] || 0;
    }

    const isComplete = currentProgress >= achievement.goal;
    const isClaimed = player.claimedAchievements.includes(achievement.id);
    const progressPercentage = Math.min((currentProgress / achievement.goal) * 100, 100);

    const renderButton = () => {
        if (achievement.isBuff) {
            return (
                 <div className="px-2.5 py-1 text-xs text-center bg-slate-700 text-slate-400 font-bold rounded-md">
                    {isComplete ? 'Unlocked' : 'Locked'}
                </div>
            );
        }
        if (isClaimed) {
             return (
                 <div className="px-2.5 py-1 text-xs text-center bg-green-900 text-green-300 font-bold rounded-md">
                    Completed
                </div>
            );
        }
        return (
            <button
                onClick={() => onClaim(achievement.id)}
                disabled={!isComplete}
                className="px-2.5 py-1 text-xs bg-[#D6721C] text-slate-900 font-bold rounded-md shadow-md hover:bg-[#E1883D] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D6721C] disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
                Claim
            </button>
        );
    };

    return (
        <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-2 flex flex-col">
            <div>
                <h4 className="font-bold text-sm text-[#D6721C]">{achievement.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5 mb-1.5">{achievement.description}</p>
            </div>
            <div className="mt-auto">
                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1 border border-slate-600">
                    <div 
                        className="bg-[#D6721C] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-300">
                       <p>{Math.min(currentProgress, achievement.goal)}/{achievement.goal}</p>
                       {!achievement.isBuff && (
                            <p className="mt-0.5 text-[10px]">Reward: 
                                {achievement.rewards.shards && <span className="text-purple-400"> 💎{achievement.rewards.shards}</span>}
                                {achievement.rewards.potions && <span className="text-blue-400"> 🧪x{achievement.rewards.potions}</span>}
                            </p>
                       )}
                    </div>
                    {renderButton()}
                </div>
            </div>
        </div>
    );
};

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ player, achievements, onExit, onClaim }) => {
    const buffAchievements = achievements.filter(a => a.isBuff);
    const questAchievements = achievements.filter(a => !a.isBuff);

    return (
        <div className="animate-fadeIn flex flex-col items-center justify-center h-full p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-lg w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center border-b-2 border-slate-700 pb-1.5 mb-2">
                    <h2 className="text-lg font-bold text-[#D6721C]">Achievements</h2>
                </div>

                <div className="space-y-3 mt-2 flex-grow overflow-y-auto pr-1 no-scrollbar">
                    <div>
                        <h3 className="text-sm font-bold text-[#D6721C] mb-1.5">Permanent Buffs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {buffAchievements.map(ach => <AchievementCard key={ach.id} player={player} achievement={ach} onClaim={onClaim} />)}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-sm font-bold text-[#D6721C] mb-1.5">Quests</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {questAchievements.map(ach => <AchievementCard key={ach.id} player={player} achievement={ach} onClaim={onClaim} />)}
                        </div>
                    </div>
                </div>

                <div className="mt-3 text-center">
                     <button
                        onClick={onExit}
                        className="px-5 py-1.5 bg-slate-600 text-slate-200 font-bold text-sm rounded-lg hover:bg-slate-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                        Return
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AchievementsScreen;
