import React, { useState, useEffect } from 'react';
import { RefreshCw, Cpu, Circle, Settings, Trophy } from 'lucide-react';
import { gameAPI } from '../../utils/api';
import { useSound } from '../../hooks/useSound.js';
import { useAudio } from '../../context/AudioContext.jsx';
import BackButton from '../common/BackButton.jsx';

const Connect4 = () => {
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [status, setStatus] = useState('in_progress');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [winningCells, setWinningCells] = useState([]);

  // Sound Hooks
  const { isMusicEnabled } = useAudio();
  const [playDrop] = useSound('connect4-drop', { volume: 0.6 });
  const [playWin] = useSound('win', { volume: 0.7 });
  const [playLose] = useSound('lose', { volume: 0.7 });
  const [playClick] = useSound('click', { volume: 0.5 });
  const [playGameStart] = useSound('game-start', { volume: 0.6 });

  // Initialize new game
  const startNewGame = async () => {
    if (isMusicEnabled) playGameStart();
    setLoading(true);
    try {
      const response = await gameAPI.createConnect4Game(difficulty);
      setGameId(response.data.game_id);
      setBoard(response.data.board);
      setCurrentPlayer(response.data.current_player);
      setStatus(response.data.status);
      setWinningCells([]);
      setMessage(`New ${difficulty} game started! You are Red.`);
    } catch (error) {
      setMessage('Error starting game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle column click with Optimistic UI
  const handleColumnClick = async (col) => {
    if (loading || currentPlayer !== 'red' || status !== 'in_progress') {
      return;
    }

    setLoading(true);
    setMessage('AI is thinking...');

    // 1. Optimistic Update: Calculate where piece falls locally
    const newBoard = board.map(row => [...row]);
    let droppedRow = -1;
    // Find the first empty cell from bottom up
    for (let r = 5; r >= 0; r--) {
        if (!newBoard[r][col]) {
            newBoard[r][col] = 'R'; // Place Red piece
            droppedRow = r;
            break;
        }
    }

    if (droppedRow !== -1) {
        setBoard(newBoard);
        if (isMusicEnabled) playDrop();
    } else {
        // Column full
        setLoading(false);
        setMessage('Column is full!');
        return;
    }

    try {
      // 2. Send move to backend
      const response = await gameAPI.makeConnect4Move(gameId, {
        column: col,
        player: 'red'
      });

      // 3. Artificial Delay for AI Response
      setTimeout(() => {
          setBoard(response.data.board);
          setCurrentPlayer(response.data.current_player);
          setStatus(response.data.status);
          
          if (isMusicEnabled) {
            // Play drop sound for AI move (unless game over)
            if (response.data.status === 'in_progress') playDrop();

            if (response.data.status === 'red_won') playWin();
            if (response.data.status === 'yellow_won') playLose();
          }

          updateGameMessage(response.data.status);
          setLoading(false);
      }, 1000);
      
    } catch (error) {
      setMessage('Invalid move! Please try a different column.');
      setLoading(false);
    }
  };

  const updateGameMessage = (gameStatus) => {
    switch (gameStatus) {
      case 'red_won':
        setMessage('🎉 You won! Connect Four!');
        findWinningCells(); // Note: Ideally backend should return winning coordinates
        break;
      case 'yellow_won':
        setMessage('🤖 AI wins! Connect Four!');
        findWinningCells();
        break;
      case 'draw':
        setMessage('🤝 It\'s a draw! Board is full.');
        break;
      case 'in_progress':
        setMessage('Your turn! Drop a red piece.');
        break;
      default:
        setMessage('Game in progress');
    }
  };

  const findWinningCells = () => {
    // Simplified placeholder. In production, backend should return winning indices.
    setWinningCells([]); 
  };

  // Initialize game on component mount
  useEffect(() => {
    startNewGame();
  }, []);

  // Effect for difficulty changes
  useEffect(() => {
    if (gameId) {
      startNewGame();
    }
  }, [difficulty]);

  const getPieceColor = (piece) => {
    if (piece === 'R') return 'bg-red-500 border-red-600';
    if (piece === 'Y') return 'bg-yellow-400 border-yellow-500';
    return 'bg-gray-800 border-gray-700'; // Empty slot background
  };

  const getPieceShadow = (piece) => {
    if (piece === 'R') return 'shadow-lg shadow-red-500/30';
    if (piece === 'Y') return 'shadow-lg shadow-yellow-500/30';
    return '';
  };

  const isWinningCell = (row, col) => {
    return winningCells.some(cell => cell.row === row && cell.col === col);
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4 relative">
      <BackButton />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8 md:pt-0">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-game">
            CONNECT 4 AI
          </h1>
          <p className="text-xl text-white/80">
            Connect four pieces in a row to win!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-black/20 rounded-lg">
             <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <label className="text-white font-semibold flex items-center gap-2">
                <Settings size={18} /> Difficulty:
              </label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={`p-2 border border-white/30 rounded-lg bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold capitalize ${getDifficultyColor(difficulty)}`}
                disabled={loading}
              >
                <option value="easy" className="text-green-400">Easy</option>
                <option value="medium" className="text-yellow-400">Medium</option>
                <option value="hard" className="text-red-400">Hard</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              {status !== 'in_progress' && (
                <div className={`text-lg font-bold px-4 py-2 rounded-lg ${
                  status === 'red_won' ? 'bg-green-600/50 text-white' : 
                  status === 'yellow_won' ? 'bg-red-600/50 text-white' : 
                  'bg-yellow-600/50 text-white'
                }`}>
                   {status === 'red_won' ? 'You Win! 🎉' : 
                    status === 'yellow_won' ? 'AI Wins! 🤖' : 
                    'Draw 🤝'}
                </div>
              )}

              <button
                onClick={startNewGame}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
              >
                <RefreshCw size={18} />
                <span>New Game</span>
              </button>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-white mb-2 h-8">
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent"></div>
                  <span>AI Thinking...</span>
                </div>
              ) : (
                <span className={currentPlayer === 'red' ? 'text-red-400' : 'text-yellow-400'}>
                   {currentPlayer === 'red' ? 'Your Turn (Red) 🔴' : 'AI Turn (Yellow) 🟡'}
                </span>
              )}
            </div>
            {message && !loading && status !== 'in_progress' && (
              <p className="text-white/70">{message}</p>
            )}
          </div>

          {/* Connect 4 Board */}
          <div className="flex justify-center">
            <div className="bg-blue-600 rounded-xl p-4 border-4 border-blue-700 shadow-2xl">
              
              {/* Column Selectors (Hover Arrows/Buttons) */}
              <div className="flex justify-center mb-2">
                {[...Array(7)].map((_, col) => (
                  <div key={col} className="w-12 md:w-16 text-center">
                    <button
                      onClick={() => handleColumnClick(col)}
                      disabled={loading || currentPlayer !== 'red' || status !== 'in_progress'}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-200
                        ${currentPlayer === 'red' && status === 'in_progress' && !loading
                          ? 'bg-red-500/20 hover:bg-red-500/50 cursor-pointer border-2 border-red-400/50 animate-bounce' 
                          : 'bg-transparent cursor-default opacity-0'}
                        flex items-center justify-center mx-auto`}
                    >
                      <Circle className="text-white" size={20} fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="bg-blue-800 rounded-lg p-3 border-2 border-blue-900 inline-block">
                {board.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center">
                    {row.map((piece, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="w-12 h-12 md:w-16 md:h-16 p-1.5"
                      >
                        <div className={`w-full h-full rounded-full border-4 transition-all duration-500 transform
                          ${getPieceColor(piece)} ${getPieceShadow(piece)}
                          ${isWinningCell(rowIndex, colIndex) ? 'ring-4 ring-white ring-opacity-80 animate-pulse scale-105' : ''}
                          ${!piece ? 'inner-shadow' : 'scale-100'} 
                          flex items-center justify-center`}>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

           {/* Game Instructions & Stats */}
           <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-black/20 rounded-lg border border-white/10">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400"/> How to Play
              </h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>• You play as <strong className="text-red-400">Red</strong>, AI is <strong className="text-yellow-400">Yellow</strong>.</li>
                <li>• Click the arrows above columns to drop pieces.</li>
                <li>• Connect <strong>4 pieces</strong> horizontally, vertically, or diagonally.</li>
              </ul>
            </div>
            
            <div className="p-5 bg-black/20 rounded-lg border border-white/10">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Cpu size={18} className="text-cyan-400"/> AI Level
              </h3>
              <div className="space-y-2 text-white/80 text-sm">
                <p><span className="text-green-400 font-bold">Easy:</span> Basic blocks.</p>
                <p><span className="text-yellow-400 font-bold">Medium:</span> 3-ply Minimax.</p>
                <p><span className="text-red-400 font-bold">Hard:</span> 5-ply Alpha-Beta Pruning.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Connect4;