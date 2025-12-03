import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full animate-fadeIn">
      <h1 className="text-5xl md:text-7xl font-bold text-[#D6721C] mb-8 tracking-wider" style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.9), 0 0 10px #D6721C, 0 0 20px #D6721C' }}>
        The Eternal Spire
      </h1>
      <p className="text-slate-400 text-base md:text-lg mb-12">An infinite text-based tower runner RPG.</p>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-[#D6721C] text-slate-900 font-bold text-lg rounded-lg shadow-lg shadow-[#D6721C]/20 hover:bg-[#E1883D] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#D6721C]"
      >
        Start Your Ascent
      </button>
    </div>
  );
};

export default StartScreen;