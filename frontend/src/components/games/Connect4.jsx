import React, { useState, useEffect } from 'react';
import { RefreshCw, Cpu, Circle, Settings, Trophy, Zap, Crown } from 'lucide-react';
import { gameAPI } from '../../utils/api';

const Connect4 = () => {
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [status, setStatus] = useState('in_progress');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [winningCells, setWinningCells] = useState([]);

  // Initialize new game
  const startNewGame = async () => {
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

  // Handle column click
  const handleColumnClick = async (col) => {
    if (loading || currentPlayer !== 'red' || status !== 'in_progress') {
      return;
    }

    setLoading(true);
    try {
      const response = await gameAPI.makeConnect4Move(gameId, {
        column: col,
        player: 'red'
      });

      setBoard(response.data.board);
      setCurrentPlayer(response.data.current_player);
      setStatus(response.data.status);
      
      updateGameMessage(response.data.status);
      
    } catch (error) {
      setMessage('Invalid move! Please try a different column.');
    } finally {
      setLoading(false);
    }
  };

  const updateGameMessage = (gameStatus) => {
    switch (gameStatus) {
      case 'red_won':
        setMessage('🎉 You won! Connect Four!');
        findWinningCells();
        break;
      case 'yellow_won':
        setMessage('🤖 AI wins! Connect Four!');
        findWinningCells();
        break;
      case 'draw':
        setMessage('🤝 It\'s a draw! Board is full.');
        break;
      case 'in_progress':
        setMessage('AI is thinking...');
        setTimeout(() => {
          setMessage('Your turn! Drop a red piece.');
        }, 1000);
        break;
      default:
        setMessage('Game in progress');
    }
  };

  const findWinningCells = () => {
    // This is a simplified version - in a real implementation, 
    // you'd want to get the winning cells from the backend
    setWinningCells([]); // Reset for now
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
    return 'bg-gray-800 border-gray-700';
  };

  const getPieceShadow = (piece) => {
    if (piece === 'R') return 'shadow-lg shadow-red-500/30';
    if (piece === 'Y') return 'shadow-lg shadow-yellow-500/30';
    return '';
  };

  const isWinningCell = (row, col) => {
    return winningCells.some(cell => cell.row === row && cell.col === col);
  };

  const getDifficultyIcon = (level) => {
    switch (level) {
      case 'easy': return <Zap className="text-green-400" size={20} />;
      case 'medium': return <Cpu className="text-yellow-400" size={20} />;
      case 'hard': return <Crown className="text-red-400" size={20} />;
      default: return <Cpu size={20} />;
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'easy': return 'from-green-500 to-emerald-600';
      case 'medium': return 'from-yellow-500 to-orange-600';
      case 'hard': return 'from-red-500 to-pink-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-game">
            CONNECT 4 AI
          </h1>
          <p className="text-xl text-white/80">
            Connect four pieces in a row to win!
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              {/* Game Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <div className="text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Cpu size={20} />
                    <span className="font-semibold">Current Player:</span>
                    <span className={`font-bold ${currentPlayer === 'red' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {currentPlayer === 'red' ? 'You (Red)' : 'AI (Yellow)'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getDifficultyIcon(difficulty)}
                    <span className="font-semibold">Difficulty:</span>
                    <span className="font-bold capitalize">{difficulty}</span>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={startNewGame}
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <RefreshCw size={18} />
                    <span>New Game</span>
                  </button>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div className="bg-white/10 rounded-lg p-4 mb-6 text-center">
                  <p className="text-white font-medium">{message}</p>
                </div>
              )}

              {/* Connect 4 Board */}
              <div className="bg-blue-600 rounded-xl p-4 border-4 border-blue-700">
                {/* Column headers */}
                <div className="flex justify-center mb-2">
                  {[...Array(7)].map((_, col) => (
                    <div key={col} className="w-12 md:w-16 text-center">
                      <button
                        onClick={() => handleColumnClick(col)}
                        disabled={loading || currentPlayer !== 'red' || status !== 'in_progress'}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-200
                          ${currentPlayer === 'red' && status === 'in_progress' 
                            ? 'bg-red-500/20 hover:bg-red-500/40 cursor-pointer border-2 border-red-400/50' 
                            : 'bg-gray-500/20 cursor-default'}
                          flex items-center justify-center`}
                      >
                        <Circle className="text-white/60" size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Game board */}
                <div className="bg-blue-800 rounded-lg p-4 border-2 border-blue-900">
                  {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center">
                      {row.map((piece, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className="w-12 h-12 md:w-16 md:h-16 p-1"
                        >
                          <div className={`w-full h-full rounded-full border-4 transition-all duration-300
                            ${getPieceColor(piece)} ${getPieceShadow(piece)}
                            ${isWinningCell(rowIndex, colIndex) ? 'ring-4 ring-white ring-opacity-80 animate-pulse' : ''}
                            flex items-center justify-center`}>
                            {!piece && (
                              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-blue-700/30 border-2 border-blue-600/50"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Status */}
              <div className="mt-6 text-center">
                <div className={`text-2xl font-bold ${
                  status === 'red_won' ? 'text-green-400' :
                  status === 'yellow_won' ? 'text-red-400' :
                  status === 'draw' ? 'text-yellow-400' :
                  'text-white'
                }`}>
                  {status === 'in_progress' ? 'Game in Progress' :
                   status === 'red_won' ? 'You Win! Connect Four! 🎉' :
                   status === 'yellow_won' ? 'AI Wins! Connect Four! 🤖' :
                   status === 'draw' ? 'Draw! Board Full 🤝' :
                   'Game Over'}
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Difficulty Selection */}
            <div className="game-card">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Settings className="text-game-purple" />
                <span>Difficulty Level</span>
              </h3>
              
              <div className="space-y-3">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    disabled={loading}
                    className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                      difficulty === level 
                        ? `bg-gradient-to-r ${getDifficultyColor(level)} text-white shadow-lg` 
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getDifficultyIcon(level)}
                      <div>
                        <div className="font-semibold capitalize">{level}</div>
                        <div className="text-sm opacity-80">
                          {level === 'easy' && 'Basic strategy, good for beginners'}
                          {level === 'medium' && 'Strategic play, looks 3 moves ahead'}
                          {level === 'hard' && 'Advanced AI, looks 5 moves ahead'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Game Information */}
            <div className="game-card">
              <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
              <div className="space-y-2 text-white/80 text-sm">
                <p>• <strong className="text-red-400">You play as Red</strong></p>
                <p>• <strong className="text-yellow-400">AI plays as Yellow</strong></p>
                <p>• Click on a column to drop your piece</p>
                <p>• Connect <strong>4 pieces in a row</strong> to win</p>
                <p>• Can be horizontal, vertical, or diagonal</p>
                <p>• Pieces fall to the lowest available space</p>
              </div>
            </div>

            {/* AI Information */}
            <div className="game-card">
              <h3 className="text-xl font-bold text-white mb-4">AI Algorithms</h3>
              <div className="space-y-3 text-white/80 text-sm">
                <div>
                  <strong className="text-green-400">Easy:</strong> Basic strategy, immediate threats
                </div>
                <div>
                  <strong className="text-yellow-400">Medium:</strong> Minimax algorithm (3-ply depth)
                </div>
                <div>
                  <strong className="text-red-400">Hard:</strong> Advanced minimax with alpha-beta pruning (5-ply depth)
                </div>
                <div className="mt-2 text-xs opacity-70">
                  The AI evaluates thousands of possible moves to choose the optimal one.
                </div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="game-card">
              <h3 className="text-xl font-bold text-white mb-4">Connect 4 Facts</h3>
              <div className="space-y-2 text-white/80 text-sm">
                <p>• Solved game since 1988</p>
                <p>• First player can always force a win</p>
                <p>• 4,531,985,219,092 possible positions</p>
                <p>• Perfect play leads to first player win</p>
                <p>• Originally called "Captain's Mistress"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect4;