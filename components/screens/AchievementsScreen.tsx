
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
                 <div className="px-3 py-1.5 text-xs text-center bg-slate-700 text-slate-400 font-bold rounded-lg">
                    {isComplete ? 'Unlocked' : 'Locked'}
                </div>
            );
        }
        if (isClaimed) {
             return (
                 <div className="px-3 py-1.5 text-xs text-center bg-green-900 text-green-300 font-bold rounded-lg">
                    Completed
                </div>
            );
        }
        return (
            <button
                onClick={() => onClaim(achievement.id)}
                disabled={!isComplete}
                className="px-3 py-1.5 text-xs bg-[#D6721C] text-slate-900 font-bold rounded-lg shadow-md hover:bg-[#E1883D] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#D6721C] disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
                Claim
            </button>
        );
    };

    return (
        <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3 flex flex-col">
            <div>
                <h4 className="font-bold text-base text-[#D6721C]">{achievement.title}</h4>
                <p className="text-xs text-slate-400 mt-1 mb-3">{achievement.description}</p>
            </div>
            <div className="mt-auto">
                <div className="w-full bg-slate-900 rounded-full h-2.5 mb-2 border border-slate-600">
                    <div 
                        className="bg-[#D6721C] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-300">
                       <p>Progress: {Math.min(currentProgress, achievement.goal)} / {achievement.goal}</p>
                       {!achievement.isBuff && (
                            <p className="mt-1">Reward: 
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
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg animate-fadeIn w-full max-w-3xl mx-auto">
            <div className="flex justify-between items-center border-b-2 border-slate-700 pb-2 mb-3">
                <h2 className="text-2xl font-bold text-[#D6721C]">Achievements</h2>
                <div className="flex items-center text-base">
                    <span className="text-purple-400 mr-2">💎</span>
                    <span className="font-bold text-slate-200">{player.eternalShards}</span>
                </div>
            </div>

            <div className="space-y-4 mt-4 max-h-[65vh] overflow-y-auto pr-2">
                <div>
                    <h3 className="text-lg font-bold text-[#D6721C] mb-2">Permanent Buffs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {buffAchievements.map(ach => <AchievementCard key={ach.id} player={player} achievement={ach} onClaim={onClaim} />)}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-bold text-[#D6721C] mb-2">Quests</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {questAchievements.map(ach => <AchievementCard key={ach.id} player={player} achievement={ach} onClaim={onClaim} />)}
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                 <button
                    onClick={onExit}
                    className="px-6 py-2 bg-slate-600 text-slate-200 font-bold text-base rounded-lg hover:bg-slate-500 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-slate-400"
                >
                    Return to Hub
                </button>
            </div>
        </div>
    );
};

export default AchievementsScreen;
