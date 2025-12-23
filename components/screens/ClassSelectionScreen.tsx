
import React from 'react';
import { CLASSES } from '../../constants';
import type { PlayerClass, Stats } from '../../types';

interface ClassSelectionScreenProps {
  onClassSelect: (playerClass: PlayerClass) => void;
}

const StatDisplay: React.FC<{ stats: Stats }> = ({ stats }) => (
    <div className="mt-2 grid grid-cols-3 gap-1 text-center">
        <div>
            <p className="text-[10px] text-red-400">STR</p>
            <p className="font-bold text-xs">{stats.str}</p>
        </div>
        <div>
            <p className="text-[10px] text-green-400">DEX</p>
            <p className="font-bold text-xs">{stats.dex}</p>
        </div>
        <div>
            <p className="text-[10px] text-blue-400">INT</p>
            <p className="font-bold text-xs">{stats.int}</p>
        </div>
    </div>
);

const ClassCard: React.FC<{ playerClass: PlayerClass; onSelect: () => void }> = ({ playerClass, onSelect }) => (
  <div className="bg-slate-900/80 backdrop-blur-sm border-2 border-slate-700 rounded-xl p-2 flex flex-col text-center transform hover:scale-105 hover:border-[#D6721C] transition-all duration-300 shadow-lg h-full">
    <div className="flex items-center justify-center mb-1">
      <div className="w-12 h-12 mr-2">
         {playerClass.icon.startsWith('http') ? (
            <img src={playerClass.icon} alt={playerClass.name} className="w-full h-full object-contain" />
        ) : (
             <span className="text-2xl">{playerClass.icon}</span>
        )}
      </div>
      <h3 className="text-sm font-bold text-[#D6721C]">{playerClass.name}</h3>
    </div>
    <p className="text-xs text-slate-400 mb-2 flex-grow">{playerClass.description}</p>
    <StatDisplay stats={playerClass.baseStats} />
    <button
      onClick={onSelect}
      className="mt-2 w-full px-4 py-1.5 bg-slate-700 text-[#D6721C] font-semibold text-xs rounded-lg hover:bg-[#D6721C] hover:text-slate-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#D6721C]"
    >
      Choose
    </button>
  </div>
);

const ClassSelectionScreen: React.FC<ClassSelectionScreenProps> = ({ onClassSelect }) => {
  return (
    <div className="animate-fadeIn flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-md">
        <h2 className="text-base font-bold text-center mb-3 text-[#D6721C]">Choose Your Path</h2>
        <div className="grid grid-cols-2 gap-2">
          {CLASSES.map((playerClass) => (
            <ClassCard key={playerClass.name} playerClass={playerClass} onSelect={() => onClassSelect(playerClass)} />
          ))}
          <div className="bg-slate-900/40 backdrop-blur-sm border-2 border-dashed border-slate-700 rounded-xl p-3 flex justify-center items-center text-center h-full">
              <p className="text-slate-500 font-bold text-sm">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSelectionScreen;
