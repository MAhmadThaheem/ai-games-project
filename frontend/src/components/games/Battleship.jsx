import { useState, useEffect } from 'react';
import { Anchor, RefreshCw, Crosshair, RotateCw, Play, ShieldAlert } from 'lucide-react';
import { gameAPI } from '../../utils/api';
import { useSound } from '../../hooks/useSound';
import { useAudio } from '../../context/AudioContext';
import BackButton from '../common/BackButton';

const SHIPS = [
  { name: 'Carrier', length: 5 },
  { name: 'Battleship', length: 4 },
  { name: 'Cruiser', length: 3 },
  { name: 'Submarine', length: 3 },
  { name: 'Destroyer', length: 2 },
];

const Battleship = () => {
  // --- STATE ---
  const [playerBoard, setPlayerBoard] = useState(createEmptyBoard());
  const [aiBoard, setAiBoard] = useState(createEmptyBoard());
  const [gameState, setGameState] = useState('setup'); // setup, playing, gameOver
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState('hard');
  const [turn, setTurn] = useState('player');
  const [winner, setWinner] = useState(null);
  
  // Setup State
  const [setupShips, setSetupShips] = useState([...SHIPS]); 
  const [isVertical, setIsVertical] = useState(false);
  const [hoverCoords, setHoverCoords] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);

  // Audio
  const { isMusicEnabled } = useAudio();
  const [playSplash] = useSound('/sounds/splash.mp3', { volume: 0.5 });
  const [playBoom] = useSound('/sounds/explosion.mp3', { volume: 0.6 });
  const [playWin] = useSound('/sounds/win.mp3', { volume: 0.6 });
  const [playLose] = useSound('/sounds/lose.mp3', { volume: 0.6 });
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.4 });

  // --- HELPERS ---
  function createEmptyBoard() {
    return Array(10).fill(null).map(() => Array(10).fill(0));
  }

  // --- SETUP LOGIC ---
  const handleSetupHover = (r, c) => {
    if (gameState !== 'setup' || setupShips.length === 0) return;
    const ship = setupShips[0];
    setHoverCoords(getShipCoords(r, c, ship.length, isVertical));
  };

  const handleSetupClick = (r, c) => {
    if (gameState !== 'setup' || setupShips.length === 0) return;
    
    const ship = setupShips[0];
    const coords = getShipCoords(r, c, ship.length, isVertical);
    
    if (coords && isValidPlacement(playerBoard, coords)) {
      if (isMusicEnabled) playClick();
      const newBoard = [...playerBoard];
      coords.forEach(([row, col]) => newBoard[row][col] = 4); // 4 = Ship
      setPlayerBoard(newBoard);
      
      const remaining = setupShips.slice(1);
      setSetupShips(remaining);
      setHoverCoords(null);
    }
  };

  const randomPlacement = () => {
    const { board } = placeShipsRandomly();
    setPlayerBoard(board);
    setSetupShips([]); // All placed
  };

  const startGame = () => {
    if (isMusicEnabled) playClick();
    const { board: aiB } = placeShipsRandomly();
    setAiBoard(aiB);
    setGameState('playing');
    setTurn('player');
  };

  // --- GAME LOGIC ---
  const handleFire = async (r, c) => {
    if (gameState !== 'playing' || turn !== 'player' || aiBoard[r][c] === 1 || aiBoard[r][c] === 2) return;

    const newAiBoard = [...aiBoard];
    if (newAiBoard[r][c] === 4) {
      newAiBoard[r][c] = 2; // Hit
      if (isMusicEnabled) playBoom();
    } else {
      newAiBoard[r][c] = 1; // Miss
      if (isMusicEnabled) playSplash();
    }
    setAiBoard(newAiBoard);

    if (checkWin(newAiBoard)) {
      setWinner('player');
      setGameState('gameOver');
      if (isMusicEnabled) playWin();
      return;
    }

    // AI Turn
    setTurn('ai');
    setAiThinking(true);
    setTimeout(makeAiMove, 800);
  };

  const makeAiMove = async () => {
    try {
      const cleanBoard = playerBoard.map(row => row.map(c => c === 4 ? 0 : c));
      
      // Fixed API Call: Using getBattleshipHint but treating it as a move generator
      const res = await gameAPI.getBattleshipHint({ 
        board: cleanBoard, 
        difficulty: difficulty 
      });
      
      const { row, col } = res.data;
      const newPlayerBoard = [...playerBoard];

      if (newPlayerBoard[row][col] === 4) {
        newPlayerBoard[row][col] = 2; // Hit
        if (isMusicEnabled) playBoom();
      } else {
        newPlayerBoard[row][col] = 1; // Miss
        if (isMusicEnabled) playSplash();
      }
      setPlayerBoard(newPlayerBoard);

      if (checkWin(newPlayerBoard)) {
        setWinner('ai');
        setGameState('gameOver');
        if (isMusicEnabled) playLose();
      } else {
        setTurn('player');
      }
    } catch (err) {
      console.error(err);
      setTurn('player'); // Fail-safe
    } finally {
      setAiThinking(false);
    }
  };

  // --- UTILS ---
  const getShipCoords = (r, c, len, vert) => {
    const coords = [];
    for (let i = 0; i < len; i++) {
      const nr = vert ? r + i : r;
      const nc = vert ? c : c + i;
      if (nr >= 10 || nc >= 10) return null;
      coords.push([nr, nc]);
    }
    return coords;
  };

  const isValidPlacement = (board, coords) => {
    if (!coords) return false;
    return coords.every(([r, c]) => board[r][c] === 0);
  };

  const checkWin = (board) => {
    let hits = 0;
    board.forEach(row => row.forEach(c => { if (c === 2) hits++; }));
    return hits === 17; // Total ship segments
  };

  const placeShipsRandomly = () => {
    let board = createEmptyBoard();
    SHIPS.forEach(ship => {
      let placed = false;
      while (!placed) {
        const vert = Math.random() < 0.5;
        const r = Math.floor(Math.random() * 10);
        const c = Math.floor(Math.random() * 10);
        const coords = getShipCoords(r, c, ship.length, vert);
        if (isValidPlacement(board, coords)) {
          coords.forEach(([nr, nc]) => board[nr][nc] = 4);
          placed = true;
        }
      }
    });
    return { board };
  };

  // --- VISUALS ---
  // RENAMED THIS FUNCTION TO MATCH USAGE
  const getCellColor = (val, isPlayer) => {
    if (val === 2) return 'bg-orange-500 animate-bounce'; // Hit
    if (val === 1) return 'bg-white/20 animate-pulse'; // Miss
    if (val === 4 && isPlayer) return 'bg-gray-400 border-gray-500'; // Ship
    return 'bg-blue-900/40 border-blue-800/30'; // Water
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 flex flex-col items-center font-mono">
      <BackButton />
      
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2 flex items-center justify-center gap-4">
            <Anchor className="text-cyan-400" size={40} /> BATTLESHIP
          </h1>
          <p className="text-blue-300">
            {gameState === 'setup' ? 'DEPLOY YOUR FLEET' : `DIFFICULTY: ${difficulty.toUpperCase()}`}
          </p>
        </div>

        {/* CONTROLS */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-8 flex flex-wrap justify-between items-center gap-4 backdrop-blur-md">
          {gameState === 'setup' ? (
            <>
              <div className="flex items-center gap-4">
                <span className="text-white font-bold">Place: {setupShips[0]?.name || "Ready!"}</span>
                <button 
                  onClick={() => setIsVertical(!isVertical)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                >
                  <RotateCw size={18} /> {isVertical ? 'Vertical' : 'Horizontal'}
                </button>
                <button 
                  onClick={randomPlacement}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
                >
                  Randomize
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="bg-slate-900 text-white p-2 rounded border border-slate-600"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <button 
                  onClick={startGame}
                  disabled={setupShips.length > 0}
                  className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 ${
                    setupShips.length === 0 ? 'bg-green-500 hover:bg-green-400 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Play size={18} /> START WAR
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-4">
                <span className={`px-4 py-2 rounded font-bold ${turn === 'player' ? 'bg-green-500/20 text-green-400' : 'text-slate-500'}`}>YOUR TURN</span>
                <span className={`px-4 py-2 rounded font-bold ${turn === 'ai' ? 'bg-red-500/20 text-red-400' : 'text-slate-500'}`}>
                  {aiThinking ? 'AI THINKING...' : 'ENEMY TURN'}
                </span>
              </div>
              {gameOver && (
                <span className={`text-xl font-black ${winner === 'player' ? 'text-green-400' : 'text-red-500'}`}>
                  {winner === 'player' ? 'MISSION ACCOMPLISHED' : 'FLEET DESTROYED'}
                </span>
              )}
              <button onClick={() => {
                setPlayerBoard(createEmptyBoard());
                setSetupShips([...SHIPS]);
                setGameState('setup');
                setWinner(null);
              }} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2">
                <RefreshCw size={18}/> Reset
              </button>
            </>
          )}
        </div>

        {/* BOARDS */}
        <div className="flex flex-col lg:flex-row gap-12 justify-center items-start">
          
          {/* PLAYER BOARD */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="text-blue-400" /> FRIENDLY WATERS
            </h3>
            <div 
              className="relative p-2 bg-blue-950/50 rounded-xl border-4 border-blue-900/50 shadow-2xl"
              onMouseLeave={() => setHoverCoords(null)}
            >
              <div className="grid grid-cols-10 gap-1">
                {playerBoard.map((row, r) => row.map((cell, c) => {
                  // Setup Hover Effect
                  let isHover = false;
                  let isValidHover = true;
                  if (gameState === 'setup' && hoverCoords) {
                    const found = hoverCoords.find(([hr, hc]) => hr === r && hc === c);
                    if (found) {
                      isHover = true;
                      if (!isValidPlacement(playerBoard, hoverCoords)) isValidHover = false;
                    }
                  }

                  return (
                    <div 
                      key={`p-${r}-${c}`}
                      onMouseEnter={() => handleSetupHover(r, c)}
                      onClick={() => handleSetupClick(r, c)}
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-sm border transition-all duration-150
                        ${getCellColor(cell, true)}
                        ${isHover ? (isValidHover ? 'bg-green-500/50' : 'bg-red-500/50') : ''}
                        ${gameState === 'setup' ? 'cursor-pointer' : ''}
                      `}
                    />
                  );
                }))}
              </div>
            </div>
          </div>

          {/* AI BOARD */}
          {gameState !== 'setup' && (
            <div className="flex flex-col items-center animate-fade-in">
              <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
                <Crosshair className="text-red-400" /> ENEMY RADAR
              </h3>
              <div className={`relative p-2 bg-red-950/20 rounded-xl border-4 ${turn === 'player' ? 'border-red-500/50 shadow-red-500/20 shadow-lg' : 'border-red-900/30'}`}>
                <div className="grid grid-cols-10 gap-1 cursor-crosshair">
                  {aiBoard.map((row, r) => row.map((cell, c) => (
                    <div 
                      key={`a-${r}-${c}`}
                      onClick={() => handleFire(r, c)}
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-sm border 
                        ${getCellColor(cell, false)}
                        ${cell === 0 && turn === 'player' ? 'hover:bg-red-500/30' : ''}
                      `}
                    >
                      {cell === 2 && <div className="absolute w-full h-full bg-red-500 animate-ping opacity-20 rounded-full"></div>}
                    </div>
                  )))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Battleship;