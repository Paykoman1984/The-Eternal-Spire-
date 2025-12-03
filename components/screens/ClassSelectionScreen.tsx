
import React from 'react';
import { CLASSES } from '../../constants';
import type { PlayerClass, Stats } from '../../types';

interface ClassSelectionScreenProps {
  onClassSelect: (playerClass: PlayerClass) => void;
}

const StatDisplay: React.FC<{ stats: Stats }> = ({ stats }) => (
    <div className="mt-2 grid grid-cols-3 gap-1 text-center">
        <div>
            <p className="text-xs text-red-400">STR</p>
            <p className="font-bold text-sm">{stats.str}</p>
        </div>
        <div>
            <p className="text-xs text-green-400">DEX</p>
            <p className="font-bold text-sm">{stats.dex}</p>
        </div>
        <div>
            <p className="text-xs text-blue-400">INT</p>
            <p className="font-bold text-sm">{stats.int}</p>
        </div>
    </div>
);

const ClassCard: React.FC<{ playerClass: PlayerClass; onSelect: () => void }> = ({ playerClass, onSelect }) => (
  <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-3 flex flex-col text-center transform hover:scale-105 hover:border-[#D6721C] transition-all duration-300 shadow-lg h-full">
    <div className="flex items-center justify-center mb-2">
      <span className="text-3xl mr-2">{playerClass.icon}</span>
      <h3 className="text-base font-bold text-[#D6721C]">{playerClass.name}</h3>
    </div>
    <p className="text-xs text-slate-400 mb-3 flex-grow">{playerClass.description}</p>
    <StatDisplay stats={playerClass.baseStats} />
    <button
      onClick={onSelect}
      className="mt-3 w-full px-4 py-1.5 bg-slate-700 text-[#D6721C] font-semibold text-xs rounded-lg hover:bg-[#D6721C] hover:text-slate-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#D6721C]"
    >
      Choose
    </button>
  </div>
);

const ClassSelectionScreen: React.FC<ClassSelectionScreenProps> = ({ onClassSelect }) => {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-lg md:text-xl font-bold text-center mb-4 text-[#D6721C]">Choose Your Path</h2>
      <div className="grid grid-cols-2 gap-3">
        {CLASSES.map((playerClass) => (
          <ClassCard key={playerClass.name} playerClass={playerClass} onSelect={() => onClassSelect(playerClass)} />
        ))}
        <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl p-3 flex justify-center items-center text-center h-full">
            <p className="text-slate-500 font-bold text-base">Coming Soon</p>
        </div>
      </div>
    </div>
  );
};

export default ClassSelectionScreen;
