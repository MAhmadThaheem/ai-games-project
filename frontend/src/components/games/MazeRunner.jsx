import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Footprints, Skull } from 'lucide-react'; // Example icons
import BackButton from '../common/BackButton';
import { gameAPI } from '../../utils/api';
import { useAudio } from '../../context/AudioContext';

const ROWS = 10;
const COLS = 10;

const MazeRunner = () => {
  const [grid, setGrid] = useState([]);
  const [catPos, setCatPos] = useState({ row: 0, col: 0 });
  const [mousePos, setMousePos] = useState({ row: 9, col: 9 });
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [loading, setLoading] = useState(false);
  const { isMusicEnabled } = useAudio();

  // Initialize Grid
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    // Create empty grid
    const newGrid = Array(ROWS).fill(null).map(() => Array(COLS).fill('empty'));
    // Add random walls (simple generation)
    for(let i=0; i<15; i++) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        if((r!==0 || c!==0) && (r!==9 || c!==9)) newGrid[r][c] = 'wall';
    }
    setGrid(newGrid);
    setCatPos({ row: 0, col: 0 });
    setMousePos({ row: 9, col: 9 });
    setGameStatus('playing');
  };

  const handleCellClick = (r, c) => {
    if (gameStatus !== 'playing') return;
    // Toggle Mud
    const newGrid = [...grid];
    if (newGrid[r][c] === 'empty') newGrid[r][c] = 'mud';
    else if (newGrid[r][c] === 'mud') newGrid[r][c] = 'empty';
    setGrid(newGrid);
  };

  const moveMouse = async (dr, dc) => {
    if (gameStatus !== 'playing' || loading) return;
    
    const newR = mousePos.row + dr;
    const newC = mousePos.col + dc;

    if (newR >= 0 && newR < ROWS && newC >= 0 && newC < COLS && grid[newR][newC] !== 'wall') {
        setMousePos({ row: newR, col: newC });
        
        // AI Turn
        setLoading(true);
        try {
            const response = await gameAPI.getMazeMove({
                grid: grid,
                rows: ROWS,
                cols: COLS,
                cat_pos: catPos,
                mouse_pos: { row: newR, col: newC } // Pass updated mouse pos
            });
            
            const aiMove = response.data;
            setCatPos({ row: aiMove.row, col: aiMove.col });

            // Check Win/Loss
            if (aiMove.row === newR && aiMove.col === newC) {
                setGameStatus('lost');
            }
        } catch (error) {
            console.error("AI Error", error);
        }
        setLoading(false);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
        if(e.key === "ArrowUp") moveMouse(-1, 0);
        if(e.key === "ArrowDown") moveMouse(1, 0);
        if(e.key === "ArrowLeft") moveMouse(0, -1);
        if(e.key === "ArrowRight") moveMouse(0, 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mousePos, gameStatus, loading]);

  const getCellColor = (type, r, c) => {
      if (r === catPos.row && c === catPos.col) return 'bg-red-500 animate-pulse'; // Cat
      if (r === mousePos.row && c === mousePos.col) return 'bg-blue-500'; // Mouse
      if (type === 'wall') return 'bg-slate-800';
      if (type === 'mud') return 'bg-amber-700/80';
      return 'bg-white/5';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 relative">
        <BackButton />
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-2 font-game">MAZE RUNNER</h1>
            <p className="text-gray-400 mb-6">A* Search Demo: Click cells to place <span className="text-amber-600 font-bold">Mud (Cost: 5)</span>. Use Arrows to move.</p>
            
            <div className="flex justify-center mb-6">
                <div className="grid grid-cols-10 gap-1 p-2 bg-gray-800 rounded-lg shadow-2xl">
                    {grid.map((row, r) => (
                        row.map((cell, c) => (
                            <div 
                                key={`${r}-${c}`}
                                onClick={() => handleCellClick(r, c)}
                                className={`w-8 h-8 md:w-12 md:h-12 border border-white/5 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${getCellColor(cell, r, c)}`}
                            >
                                {r === catPos.row && c === catPos.col && <Skull size={20} className="text-white" />}
                                {r === mousePos.row && c === mousePos.col && <Zap size={20} className="text-yellow-300" />}
                                {cell === 'mud' && <Footprints size={16} className="text-black/50" />}
                            </div>
                        ))
                    ))}
                </div>
            </div>

            {gameStatus === 'lost' && <div className="text-3xl text-red-500 font-bold animate-bounce">CAUGHT! 💀</div>}
            
            <button onClick={resetGame} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 mx-auto">
                <RefreshCw size={18} /> Reset
            </button>
        </div>
    </div>
  );
};

export default MazeRunner;