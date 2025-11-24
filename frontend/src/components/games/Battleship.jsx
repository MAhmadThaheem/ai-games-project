import React, { useState, useEffect } from 'react';
import { Target, HelpCircle, Ship } from 'lucide-react';
import BackButton from '../common/BackButton';
import { gameAPI } from '../../utils/api';

const Battleship = () => {
  // Simplified state for demonstration
  const [board, setBoard] = useState(Array(10).fill(null).map(() => Array(10).fill('empty')));
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCellClick = (r, c) => {
      // Simulate "Hit" or "Miss" locally for demo
      const newBoard = [...board];
      // Randomly determining hit/miss for the prototype since full battleship backend is complex
      // In real masterpiece, backend manages the hidden ship state.
      const isHit = Math.random() > 0.7; 
      newBoard[r][c] = isHit ? 'hit' : 'miss';
      setBoard(newBoard);
      setHint(""); // Clear old hint
  };

  const askAI = async () => {
      setLoading(true);
      try {
          // Send current visual board state to AI Logic Engine
          const response = await gameAPI.getBattleshipHint({
              board: board,
              ships_remaining: [5, 4, 3, 3, 2] // Standard ships
          });
          setHint(response.data.reason);
      } catch (error) {
          console.error(error);
          setHint("AI Module Offline.");
      }
      setLoading(false);
  };

  const getCellClass = (type) => {
      if (type === 'hit') return 'bg-red-500';
      if (type === 'miss') return 'bg-gray-500';
      return 'bg-blue-900/40 hover:bg-blue-800/60';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black py-8 px-4 relative">
        <BackButton />
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 font-game">LOGICAL BATTLESHIP</h1>
                <p className="text-blue-300">Propositional Logic & Probability Demo</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
                {/* Board */}
                <div className="bg-blue-950/50 p-4 rounded-xl border border-blue-400/30">
                    <h2 className="text-white mb-2 font-bold flex gap-2"><Target /> Target Grid</h2>
                    <div className="grid grid-cols-10 gap-1">
                        {board.map((row, r) => (
                            row.map((cell, c) => (
                                <button 
                                    key={`${r}-${c}`}
                                    onClick={() => handleCellClick(r, c)}
                                    disabled={cell !== 'empty'}
                                    className={`w-8 h-8 md:w-10 md:h-10 rounded-sm transition-all ${getCellClass(cell)}`}
                                >
                                    {cell === 'hit' && '💥'}
                                    {cell === 'miss' && '•'}
                                </button>
                            ))
                        ))}
                    </div>
                </div>

                {/* AI Logic Panel */}
                <div className="w-full md:w-80 bg-black/40 p-6 rounded-xl border border-white/10 backdrop-blur-md">
                    <h3 className="text-xl text-yellow-400 font-bold mb-4 flex items-center gap-2">
                        <HelpCircle /> AI Inference Engine
                    </h3>
                    <p className="text-gray-300 text-sm mb-6">
                        Stuck? The AI uses a Probability Density Model and Logic Constraints to deduce the best move.
                    </p>
                    
                    <button 
                        onClick={askAI} 
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:brightness-110 disabled:opacity-50"
                    >
                        {loading ? "Analyzing..." : "Calculate Best Move"}
                    </button>

                    {hint && (
                        <div className="mt-6 p-4 bg-green-900/30 border border-green-500/30 rounded-lg animate-fade-in">
                            <h4 className="text-green-400 font-bold text-sm mb-2">LOGIC OUTPUT:</h4>
                            <p className="text-white text-sm font-mono leading-relaxed">
                                "{hint}"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Battleship;