import React, { useState, useEffect, useRef } from 'react';
import { Ghost, Play, RotateCcw, ArrowLeft, Trophy, Zap, AlertTriangle } from 'lucide-react';
import { gameAPI } from '../../utils/api';
// Correct imports based on your structure
import { useSound } from '../../hooks/useSound.js';
import { useAudio } from '../../context/AudioContext.jsx';

// --- CONFIGURATION ---
const GRID_WIDTH = 19;
const GRID_HEIGHT = 21;

// Map: 1=Wall, 0=Dot, 2=Empty
const INITIAL_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
  [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
  [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2], // Ghost House
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const Pacman = () => {
  // Game State
  const [grid, setGrid] = useState(JSON.parse(JSON.stringify(INITIAL_MAP)));
  const [pacman, setPacman] = useState({ x: 9, y: 15, direction: 'RIGHT', nextDir: 'RIGHT' });
  const [ghosts, setGhosts] = useState({
    blinky: { x: 9, y: 9, color: 'bg-red-500', shadow: 'shadow-red-500/50', type: 'blinky' },
    pinky: { x: 8, y: 9, color: 'bg-pink-400', shadow: 'shadow-pink-400/50', type: 'pinky' },
    inky: { x: 10, y: 9, color: 'bg-cyan-400', shadow: 'shadow-cyan-400/50', type: 'inky' },
    clyde: { x: 9, y: 8, color: 'bg-orange-400', shadow: 'shadow-orange-400/50', type: 'clyde' },
  });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  
  // Audio
  const { isMusicEnabled } = useAudio();
  const [playWaka] = useSound('/sounds/click.mp3', { volume: 0.1 });
  const [playGameStart] = useSound('/sounds/game-start.mp3', { volume: 0.5 });
  const [playGameOver] = useSound('/sounds/lose.mp3', { volume: 0.5 });

  const gameLoopRef = useRef();

  // Difficulty Speeds (ms per tick)
  const getSpeed = () => {
    switch(difficulty) {
      case 'easy': return 250;
      case 'medium': return 200;
      case 'hard': return 150;
      default: return 200;
    }
  };
  
  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default scrolling for arrow keys
      if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      
      switch(e.key) {
        case 'ArrowUp': setPacman(p => ({ ...p, nextDir: 'UP' })); break;
        case 'ArrowDown': setPacman(p => ({ ...p, nextDir: 'DOWN' })); break;
        case 'ArrowLeft': setPacman(p => ({ ...p, nextDir: 'LEFT' })); break;
        case 'ArrowRight': setPacman(p => ({ ...p, nextDir: 'RIGHT' })); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Game Loop
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(gameTick, getSpeed());
    }
    return () => clearInterval(gameLoopRef.current);
  }, [isPlaying, gameOver, pacman, ghosts, grid, difficulty]);

  // Start new game
  const startNewGame = () => {
    setGrid(JSON.parse(JSON.stringify(INITIAL_MAP)));
    setPacman({ x: 9, y: 15, direction: 'RIGHT', nextDir: 'RIGHT' });
    setGhosts({
      blinky: { x: 9, y: 9, color: 'bg-red-500', shadow: 'shadow-red-500/50', type: 'blinky' },
      pinky: { x: 8, y: 9, color: 'bg-pink-400', shadow: 'shadow-pink-400/50', type: 'pinky' },
      inky: { x: 10, y: 9, color: 'bg-cyan-400', shadow: 'shadow-cyan-400/50', type: 'inky' },
      clyde: { x: 9, y: 8, color: 'bg-orange-400', shadow: 'shadow-orange-400/50', type: 'clyde' },
    });
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    if (isMusicEnabled) playGameStart();
  };

  const gameTick = async () => {
    movePacman();
    await moveGhostsAI();
    checkCollisions();
  };

  const movePacman = () => {
    const { x, y, nextDir } = pacman;
    let nextX = x, nextY = y;
    let dir = pacman.direction;

    // Try Next Direction first
    const testPos = getNextPos(x, y, nextDir);
    if (isValidMove(testPos.x, testPos.y)) {
      nextX = testPos.x;
      nextY = testPos.y;
      dir = nextDir;
    } else {
      // Keep current direction
      const currentPos = getNextPos(x, y, dir);
      if (isValidMove(currentPos.x, currentPos.y)) {
        nextX = currentPos.x;
        nextY = currentPos.y;
      }
    }

    if (nextX !== x || nextY !== y) {
      setPacman(p => ({ ...p, x: nextX, y: nextY, direction: dir }));
      
      // Eat Dot
      if (grid[nextY][nextX] === 0) {
        const newGrid = [...grid];
        newGrid[nextY][nextX] = 2; 
        setGrid(newGrid);
        setScore(s => s + 10);
        if (isMusicEnabled) playWaka();
      }
    }
  };

  const getNextPos = (x, y, dir) => {
    if (dir === 'UP') return { x, y: y - 1 };
    if (dir === 'DOWN') return { x, y: y + 1 };
    if (dir === 'LEFT') return { x: x - 1, y };
    if (dir === 'RIGHT') return { x: x + 1, y };
    return { x, y };
  };

  const isValidMove = (x, y) => {
    if (y < 0 || y >= GRID_HEIGHT || x < 0 || x >= GRID_WIDTH) return false;
    return grid[y][x] !== 1;
  };

  const moveGhostsAI = async () => {
    const newGhosts = { ...ghosts };
    const promises = Object.keys(newGhosts).map(async (key) => {
      const ghost = newGhosts[key];
      try {
        const payload = {
          game_state: {
            grid: grid,
            pacman: { x: pacman.x, y: pacman.y, direction: pacman.direction },
            ghosts: transformGhostsForAPI(ghosts),
            score: score,
            level: 1
          },
          ghost_type: ghost.type
        };
        const res = await gameAPI.getPacmanGhostMove(payload);
        const direction = res.data.direction;
        
        const nextPos = getNextPos(ghost.x, ghost.y, direction);
        if (isValidMove(nextPos.x, nextPos.y)) {
          newGhosts[key] = { ...ghost, x: nextPos.x, y: nextPos.y };
        }
      } catch (err) {
        // Silent fail to keep game running if API hiccups
      }
    });
    await Promise.all(promises);
    setGhosts(newGhosts);
  };

  const transformGhostsForAPI = (ghostsObj) => {
    const formatted = {};
    Object.keys(ghostsObj).forEach(key => {
      formatted[key] = { x: ghostsObj[key].x, y: ghostsObj[key].y, direction: 'IDLE' };
    });
    return formatted;
  };

  const checkCollisions = () => {
    Object.values(ghosts).forEach(ghost => {
      if (ghost.x === pacman.x && ghost.y === pacman.y) {
        setGameOver(true);
        setIsPlaying(false);
        if (isMusicEnabled) playGameOver();
      }
    });
  };

  // --- RENDER HELPERS ---
  const getCellClass = (val) => {
    if (val === 1) return 'bg-blue-900/40 border border-blue-500/30 shadow-[inset_0_0_15px_rgba(30,58,138,0.5)]'; // Wall
    return 'bg-transparent'; // Empty/Dot
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 py-8 px-4 relative">
      {/* Back Button (Inline to avoid import errors) */}
      <button 
        onClick={() => window.history.back()} 
        className="absolute top-6 left-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm border border-white/10 shadow-lg z-50 group"
      >
        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
      </button>

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8 pt-8 md:pt-0">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-game flex items-center justify-center gap-3">
            <Ghost className="text-yellow-400" size={40}/> PAC-AI
          </h1>
          <p className="text-xl text-white/80">
            A* Pathfinding Algorithm in Action
          </p>
        </div>

        {/* Main Game Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-black/20 rounded-lg">
            
            {/* Difficulty Selector */}
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <label className="text-white font-semibold">Difficulty:</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="p-2 border border-white/30 rounded-lg bg-purple-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                disabled={isPlaying}
              >
                <option value="easy">Easy (Slow)</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard (Fast)</option>
              </select>
            </div>

            {/* Status & New Game Button */}
            <div className="flex items-center space-x-4">
              {gameOver && (
                <div className="text-lg font-bold text-white px-4 py-2 bg-red-600/50 rounded-lg flex items-center gap-2">
                  <AlertTriangle size={20}/> Game Over!
                </div>
              )}
              
              <button 
                onClick={startNewGame}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg flex items-center gap-2"
              >
                {gameOver ? <RotateCcw size={18}/> : <Play size={18}/>}
                {gameOver ? 'Try Again' : 'New Game'}
              </button>
            </div>
          </div>

          {/* Score Info */}
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-white mb-2 flex justify-center items-center gap-3">
               <Trophy className="text-yellow-400" /> Score: <span className="text-yellow-300 font-mono">{score}</span>
            </div>
          </div>

          {/* Game Board */}
          <div className="flex justify-center">
            {/* Using inline styles for grid to ensure exact pixel-perfect arcade look */}
            <div className="relative p-1 rounded-xl bg-black/60 border-4 border-blue-900/50 backdrop-blur-sm shadow-2xl">
                <div className="absolute -inset-2 bg-blue-500/10 blur-xl -z-10 rounded-full opacity-50"></div>
                
                <div 
                    className="grid gap-0 bg-black/80 rounded-lg overflow-hidden"
                    style={{ 
                    gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))`,
                    width: 'min(90vw, 500px)',
                    height: 'min(90vw, 550px)' 
                    }}
                >
                    {grid.map((row, y) => (
                    row.map((cell, x) => (
                        <div key={`${x}-${y}`} className={`relative w-full h-full flex items-center justify-center ${getCellClass(cell)}`}>
                        {/* Dots */}
                        {cell === 0 && <div className="w-[20%] h-[20%] bg-pink-200/80 rounded-full shadow-[0_0_8px_rgba(244,114,182,0.6)]" />}
                        
                        {/* Pacman */}
                        {pacman.x === x && pacman.y === y && (
                            <div className="absolute w-[75%] h-[75%] bg-yellow-400 rounded-full z-20 shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse">
                                <div className="absolute top-[20%] right-[20%] w-[15%] h-[15%] bg-black rounded-full opacity-50"></div>
                            </div>
                        )}

                        {/* Ghosts */}
                        {Object.values(ghosts).map(g => (
                            g.x === x && g.y === y && (
                            <div key={g.type} className={`absolute w-[75%] h-[75%] ${g.color} ${g.shadow} rounded-t-full z-10 shadow-lg flex justify-center items-start pt-[20%]`}>
                                <div className="flex gap-[15%] w-full justify-center">
                                    <div className="w-[30%] h-[30%] bg-white rounded-full relative">
                                        <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-blue-900 rounded-full"></div>
                                    </div>
                                    <div className="w-[30%] h-[30%] bg-white rounded-full relative">
                                        <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-blue-900 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            )
                        ))}
                        </div>
                    ))
                    ))}
                </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="mt-6 text-center text-white/50 text-sm">
             Use <span className="text-white font-bold">Arrow Keys</span> to Move • Avoid Ghosts
          </div>

        </div>
      </div>
    </div>
  );
};

export default Pacman;