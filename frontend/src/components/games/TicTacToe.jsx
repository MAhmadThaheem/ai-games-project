import React, { useState, useEffect } from 'react';
import { RefreshCw, Home, Trophy, Cpu } from 'lucide-react';
import { gameAPI } from '../../utils/api';
import { useSound } from '../../hooks/useSound.js';
import { useAudio } from '../../context/AudioContext.jsx';

const TicTacToe = () => {
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(Array(3).fill(null).map(() => Array(3).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [status, setStatus] = useState('in_progress');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Sound Hooks
  const { isMusicEnabled } = useAudio();
  const [playMark] = useSound('ttt-mark', { volume: 0.5 });
  const [playWin] = useSound('win', { volume: 0.7 });
  const [playLose] = useSound('lose', { volume: 0.7 });
  const [playClick] = useSound('click', { volume: 0.5 });

  // Initialize new game
  const startNewGame = async () => {
    if (isMusicEnabled) playClick();
    setLoading(true);
    try {
      const response = await gameAPI.getAIMove({ action: 'new_game' });
      setGameId(response.data.game_id);
      setBoard(response.data.board);
      setCurrentPlayer(response.data.current_player);
      setStatus(response.data.status);
      setMessage('New game started! You are X. Make your move!');
    } catch (error) {
      setMessage('Error starting game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Make a move
  const makeMove = async (row, col) => {
    if (loading || board[row][col] || status !== 'in_progress' || currentPlayer !== 'X') {
      return;
    }

    setLoading(true);
    try {
      const response = await gameAPI.getAIMove({
        game_id: gameId,
        row,
        col,
        player: 'X'
      });

      setBoard(response.data.board);
      setCurrentPlayer(response.data.current_player);
      setStatus(response.data.status);
      
      if (isMusicEnabled) {
        playMark();
        if (response.data.status === 'x_won') playWin();
        if (response.data.status === 'o_won') playLose();
      }

      // Update message based on game state
      if (response.data.status === 'x_won') {
        setMessage('🎉 You won! Congratulations!');
      } else if (response.data.status === 'o_won') {
        setMessage('🤖 AI wins! Better luck next time!');
      } else if (response.data.status === 'draw') {
        setMessage('🤝 It\'s a draw! Well played!');
      } else {
        setMessage('AI is thinking...');
        // AI move will be made automatically by the backend
        setTimeout(() => {
          setMessage('Your turn!');
        }, 1000);
      }
    } catch (error) {
      setMessage('Error making move. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize game on component mount
  useEffect(() => {
    startNewGame();
  }, []);

  const getCellColor = (cell) => {
    if (cell === 'X') return 'text-blue-400';
    if (cell === 'O') return 'text-red-400';
    return 'text-gray-300';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'x_won': return 'text-green-400';
      case 'o_won': return 'text-red-400';
      case 'draw': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-game">
            TIC TAC TOE AI
          </h1>
          <p className="text-xl text-white/80">
            Challenge our unbeatable AI using the Minimax algorithm
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              {/* Game Info */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Cpu size={20} />
                    <span className="font-semibold">Current Player:</span>
                    <span className={`font-bold ${currentPlayer === 'X' ? 'text-blue-400' : 'text-red-400'}`}>
                      {currentPlayer}
                    </span>
                  </div>
                  <div className={`text-lg font-semibold ${getStatusColor()}`}>
                    {status === 'in_progress' ? 'Game in Progress' :
                     status === 'x_won' ? 'You Win! 🎉' :
                     status === 'o_won' ? 'AI Wins! 🤖' : 'Draw! 🤝'}
                  </div>
                </div>
                
                <button
                  onClick={startNewGame}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <RefreshCw size={18} />
                  <span>New Game</span>
                </button>
              </div>

              {/* Message */}
              {message && (
                <div className="bg-white/10 rounded-lg p-4 mb-6 text-center">
                  <p className="text-white font-medium">{message}</p>
                </div>
              )}

              {/* Tic Tac Toe Board */}
              <div className="bg-white/5 rounded-xl p-4">
                {board.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center">
                    {row.map((cell, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => makeMove(rowIndex, colIndex)}
                        disabled={cell || loading || status !== 'in_progress' || currentPlayer !== 'X'}
                        className={`w-20 h-20 md:w-24 md:h-24 m-2 rounded-xl border-2 transition-all duration-200
                          ${cell ? 'border-transparent' : 'border-white/20 hover:border-white/40'}
                          ${!cell && status === 'in_progress' && currentPlayer === 'X' 
                            ? 'hover:bg-white/10 cursor-pointer' 
                            : 'cursor-not-allowed'}
                          bg-white/5 flex items-center justify-center`}
                      >
                        <span className={`text-3xl md:text-4xl font-bold ${getCellColor(cell)}`}>
                          {cell}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Game Information */}
          <div className="space-y-6">
            {/* AI Info Card */}
            <div className="game-card">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Cpu className="text-game-purple" />
                <span>AI Information</span>
              </h3>
              <div className="space-y-3 text-white/80">
                <p><strong>Algorithm:</strong> Minimax</p>
                <p><strong>Difficulty:</strong> Unbeatable</p>
                <p><strong>Depth:</strong> Full game tree</p>
                <p className="text-sm">
                  Our AI evaluates all possible moves to choose the optimal one.
                  It's impossible to win against perfect play!
                </p>
              </div>
            </div>

            {/* How to Play */}
            <div className="game-card">
              <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
              <div className="space-y-2 text-white/80">
                <p>• You play as <strong className="text-blue-400">X</strong></p>
                <p>• AI plays as <strong className="text-red-400">O</strong></p>
                <p>• Click any empty cell to make your move</p>
                <p>• Get three in a row to win</p>
                <p>• AI responds instantly with optimal moves</p>
              </div>
            </div>

            {/* Game Stats */}
            <div className="game-card">
              <h3 className="text-xl font-bold text-white mb-4">Game Stats</h3>
              <div className="space-y-2 text-white/80">
                <p>• Perfect play always results in draw</p>
                <p>• 255,168 possible games</p>
                <p>• 9! possible move sequences</p>
                <p>• First move advantage exists</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;