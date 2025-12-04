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
    let timeout: ReturnType<typeof setTimeout>;
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
        className="bg-slate-800 border-2 border-slate-700 rounded-xl p-3 flex flex-col text-left transition-all duration-300 shadow-lg h-full"
      >
        <div className="flex items-center mb-1">
            <span className="text-2xl mr-2">{profile.classInfo.icon}</span>
            <div>
                <h3 className="text-base font-bold text-[#D6721C]">{profile.classInfo.name}</h3>
                <p className="text-sm text-slate-300">Level {profile.level}</p>
            </div>
        </div>
        <div className="text-xs text-slate-400 mt-auto">
          Max Floor: <span className="font-bold text-slate-200">{profile.maxFloorReached}</span>
        </div>
        <div className="flex flex-col gap-1.5 mt-2">
            <button
              onClick={onLoad}
              className="w-full px-4 py-1.5 font-semibold text-sm rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 bg-[#D6721C] text-slate-900 hover:bg-[#E1883D] focus:ring-[#D6721C]"
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
                className={`w-full px-4 py-1 font-semibold text-xs rounded-md transition-all duration-200 focus:outline-none focus:ring-2 ${
                    isConfirmingDelete 
                        ? "bg-red-600 text-white hover:bg-red-500 focus:ring-red-400" 
                        : "bg-red-900/70 text-red-300 hover:bg-red-800 focus:ring-red-600"
                }`}
            >
                {isConfirmingDelete ? "Confirm" : "Delete"}
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
      <p className="text-3xl text-slate-600 mb-1">+</p>
      <p className="text-slate-400 font-bold text-sm">New Game</p>
    </div>
  );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ profiles, onLoadProfile, onStartNewGame, onDeleteProfile }) => {
  
  return (
    <div className="animate-fadeIn flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-xl">
        <h2 className="text-lg md:text-xl font-bold text-center mb-2 text-[#D6721C]">
          Select Profile
        </h2>
        <p className="text-center text-slate-400 mb-4 text-xs">Click an empty slot to begin, or delete a profile to make space.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
    </div>
  );
};

export default ProfileScreen;