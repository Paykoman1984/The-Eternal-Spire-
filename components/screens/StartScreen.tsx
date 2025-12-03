import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full animate-fadeIn">
      <h1 className="text-5xl md:text-7xl font-bold text-yellow-400 mb-4 tracking-wider" style={{ textShadow: '0 0 10px #facc15, 0 0 20px #facc15' }}>
        The Eternal Spire
      </h1>
      <p className="text-slate-400 text-base md:text-lg mb-10">An infinite text-based tower runner RPG.</p>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-yellow-500 text-slate-900 font-bold text-lg rounded-lg shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
      >
        Start Your Ascent
      </button>
    </div>
  );
};

export default StartScreen;
