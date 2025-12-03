
import React, { useState, useEffect } from 'react';
import type { Player } from '../../types';

interface ProfileScreenProps {
  profiles: (Player | null)[];
  onLoadProfile: (index: number) => void;
  onStartNewGame: (index: number) => void;
  onDeleteProfile: (index: number) => void;
}

const ProfileSlot: React.FC<{
  profile: Player | null;
  onLoad: () => void;
  onStartNew: () => void;
  onDelete: () => void;
}> = ({ profile, onLoad, onStartNew, onDelete }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isConfirmingDelete) {
        timeout = setTimeout(() => {
            setIsConfirmingDelete(false);
        }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isConfirmingDelete]);

  if (profile) {
    // Existing profile slot
    return (
      <div 
        className="bg-slate-800 border-2 border-slate-700 rounded-xl p-4 flex flex-col text-left transition-all duration-300 shadow-lg h-full"
      >
        <div className="flex items-center mb-2">
            <span className="text-4xl mr-3">{profile.classInfo.icon}</span>
            <div>
                <h3 className="text-lg font-bold text-[#D6721C]">{profile.classInfo.name}</h3>
                <p className="text-sm text-slate-300">Level {profile.level}</p>
            </div>
        </div>
        <div className="text-sm text-slate-400 mt-auto">
          Max Floor: <span className="font-bold text-slate-200">{profile.maxFloorReached}</span>
        </div>
        <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={onLoad}
              className="w-full px-4 py-2 font-semibold text-sm rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 bg-[#D6721C] text-slate-900 hover:bg-[#E1883D] focus:ring-[#D6721C]"
            >
              Load Game
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (isConfirmingDelete) {
                        onDelete();
                        setIsConfirmingDelete(false);
                    } else {
                        setIsConfirmingDelete(true);
                    }
                }}
                type="button"
                className={`w-full px-4 py-1.5 font-semibold text-xs rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                    isConfirmingDelete 
                        ? "bg-red-600 text-white hover:bg-red-500 focus:ring-red-400 shadow-md transform scale-105" 
                        : "bg-red-900/70 text-red-300 hover:bg-red-800 focus:ring-red-600"
                }`}
            >
                {isConfirmingDelete ? "Click to Confirm Delete" : "Delete Profile"}
            </button>
        </div>
      </div>
    );
  }

  // Empty profile slot
  return (
    <div 
        className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl p-4 flex flex-col justify-center items-center text-center h-full cursor-pointer hover:border-[#D6721C] hover:bg-slate-800 transition-all duration-300"
        onClick={onStartNew}
    >
      <p className="text-4xl text-slate-600 mb-2">+</p>
      <p className="text-slate-400 font-bold text-lg">New Game</p>
    </div>
  );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ profiles, onLoadProfile, onStartNewGame, onDeleteProfile }) => {
  
  return (
    <div className="animate-fadeIn w-full max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[#D6721C]">
        Select or Create a Profile
      </h2>
      <p className="text-center text-slate-400 mb-8 text-sm">Click an empty slot to begin a new adventure, or delete a profile to make space.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile, index) => (
            <ProfileSlot
              key={index}
              profile={profile}
              onLoad={() => onLoadProfile(index)}
              onStartNew={() => onStartNewGame(index)}
              onDelete={() => onDeleteProfile(index)}
            />
        ))}
      </div>
    </div>
  );
};

export default ProfileScreen;
