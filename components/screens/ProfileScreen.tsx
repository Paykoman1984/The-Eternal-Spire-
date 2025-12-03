import React from 'react';
import type { Player } from '../../types';

interface ProfileScreenProps {
  profiles: (Player | null)[];
  onSelectProfile: (index: number) => void;
  onDeleteProfile: (index: number) => void;
}

const ProfileSlot: React.FC<{
  profile: Player | null;
  index: number;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ profile, index, onSelect, onDelete }) => {
  if (profile) {
    return (
      <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-4 flex flex-col text-left transform hover:scale-105 hover:border-yellow-400 transition-all duration-300 shadow-lg h-full">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
                <span className="text-4xl mr-3">{profile.classInfo.icon}</span>
                <div>
                    <h3 className="text-lg font-bold text-yellow-400">{profile.classInfo.name}</h3>
                    <p className="text-sm text-slate-300">Level {profile.level}</p>
                </div>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-slate-500 hover:text-red-400 text-xl font-bold transition-colors"
                aria-label="Delete Profile"
            >
                &times;
            </button>
        </div>
        <div className="text-sm text-slate-400 mb-4 mt-auto">
          Max Floor: <span className="font-bold text-slate-200">{profile.maxFloorReached}</span>
        </div>
        <button
          onClick={onSelect}
          className="w-full px-4 py-2 bg-yellow-500 text-slate-900 font-semibold text-sm rounded-lg hover:bg-yellow-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-300"
        >
          Load Game
        </button>
      </div>
    );
  }

  return (
    <div 
        className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl p-4 flex flex-col justify-center items-center text-center h-full cursor-pointer hover:border-yellow-400 hover:bg-slate-800 transition-all duration-300"
        onClick={onSelect}
    >
      <p className="text-4xl text-slate-600 mb-2">+</p>
      <p className="text-slate-400 font-bold text-lg">New Game</p>
    </div>
  );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ profiles, onSelectProfile, onDeleteProfile }) => {
  return (
    <div className="animate-fadeIn w-full max-w-lg mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-slate-300">Select a Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile, index) => (
          <ProfileSlot
            key={index}
            profile={profile}
            index={index}
            onSelect={() => onSelectProfile(index)}
            onDelete={() => onDeleteProfile(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProfileScreen;
