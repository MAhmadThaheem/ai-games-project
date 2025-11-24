import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Trophy, AlertCircle } from 'lucide-react';
import { gameAPI } from '../../utils/api';
import { useSound } from '../../hooks/useSound.js';
import { useAudio } from '../../context/AudioContext.jsx';
import BackButton from '../common/BackButton';

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
  const [playGameStart] = useSound('game-start', { volume: 0.6 });

  // Initialize new game
  const startNewGame = async () => {
    if (isMusicEnabled) playGameStart();
    setLoading(true);
    try {
      const response = await gameAPI.getAIMove({ action: 'new_game' });
      setGameId(response.data.game_id);
      setBoard(response.data.board);
      setCurrentPlayer(response.data.current_player);
      setStatus(response.data.status);
      setMessage('New game started! You are X.');
    } catch (error) {
      setMessage('Error starting game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Make a move with Optimistic UI
  const makeMove = async (row, col) => {
    if (loading || board[row][col] || status !== 'in_progress' || currentPlayer !== 'X') {
      return;
    }

    setLoading(true);
    setMessage('AI is thinking...');

    // 1. Optimistic Update
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = 'X';
    setBoard(newBoard);
    if (isMusicEnabled) playMark();

    try {
      // 2. Send move to backend
      const response = await gameAPI.getAIMove({
        game_id: gameId,
        row,
        col,
        player: 'X'
      });

      // 3. Artificial Delay for AI
      setTimeout(() => {
          setBoard(response.data.board);
          setCurrentPlayer(response.data.current_player);
          setStatus(response.data.status);
          
          if (isMusicEnabled) {
            // Play sound for AI move (if not game over immediately)
            if (response.data.status === 'in_progress' && response.data.current_player === 'X') {
                playMark();
            }

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
            setMessage('Your turn!');
          }
          
          setLoading(false);
      }, 800); // Slightly shorter delay for TTT as it's a fast game
    } catch (error) {
      setMessage('Error making move. Please try again.');
      setLoading(false);
    }
  };

  // Initialize game on component mount
  useEffect(() => {
    startNewGame();
  }, []);

  const getCellColor = (cell) => {
    if (cell === 'X') return 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]';
    if (cell === 'O') return 'text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]';
    return 'text-transparent';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 relative">
      <BackButton />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8 md:pt-0">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-game">
            TIC TAC TOE
          </h1>
          <p className="text-xl text-white/80">
            Unbeatable Minimax AI
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-black/20 rounded-lg">
             <div className="flex items-center space-x-4 mb-4 md:mb-0">
               <div className="flex items-center gap-2 text-white">
                 <Zap className="text-yellow-400" size={20} />
                 <span className="font-semibold">Difficulty:</span> 
                 <span className="font-bold text-red-400 uppercase">Impossible</span>
               </div>
            </div>

            <div className="flex items-center space-x-4">
              {status !== 'in_progress' && (
                <div className={`text-lg font-bold px-4 py-2 rounded-lg ${
                  status === 'x_won' ? 'bg-green-600/50' : 
                  status === 'o_won' ? 'bg-red-600/50' : 
                  'bg-yellow-600/50'
                } text-white`}>
                   {status === 'x_won' ? 'You Win! 🎉' : 
                    status === 'o_won' ? 'AI Wins! 🤖' : 
                    'Draw 🤝'}
                </div>
              )}

              <button
                onClick={startNewGame}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
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
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-400 border-t-transparent"></div>
                  <span>AI Thinking...</span>
                </div>
              ) : (
                <span className={currentPlayer === 'X' ? 'text-cyan-400' : 'text-pink-500'}>
                   {currentPlayer === 'X' ? 'Your Turn (X)' : 'AI Turn (O)'}
                </span>
              )}
            </div>
            {message && !loading && status !== 'in_progress' && (
              <p className="text-white/70">{message}</p>
            )}
          </div>

          {/* Tic Tac Toe Board */}
          <div className="flex justify-center">
             <div className="bg-white/5 rounded-2xl p-4 shadow-2xl border border-white/10">
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center">
                  {row.map((cell, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => makeMove(rowIndex, colIndex)}
                      disabled={cell || loading || status !== 'in_progress' || currentPlayer !== 'X'}
                      className={`
                        w-24 h-24 md:w-32 md:h-32 m-2 rounded-xl 
                        bg-black/30 backdrop-blur-sm
                        border-2 transition-all duration-200
                        ${cell ? 'border-transparent' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}
                        ${!cell && status === 'in_progress' && currentPlayer === 'X' && !loading
                          ? 'cursor-pointer' 
                          : 'cursor-default'}
                        flex items-center justify-center
                        group
                      `}
                    >
                      <span className={`text-5xl md:text-6xl font-bold transform transition-transform duration-300 ${cell ? 'scale-100' : 'scale-0'} ${getCellColor(cell)}`}>
                        {cell}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

           {/* Stats / Info */}
           <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-black/20 rounded-lg border border-white/10">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400"/> Game Stats
              </h3>
              <ul className="space-y-2 text-white/80 text-sm">
                 <li>• <strong>Algorithm:</strong> Minimax (Recursive)</li>
                 <li>• <strong>Depth:</strong> Full Game Tree Search</li>
                 <li>• <strong>Possibilities:</strong> 255,168 games</li>
              </ul>
            </div>
            
            <div className="p-5 bg-black/20 rounded-lg border border-white/10">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <AlertCircle size={18} className="text-cyan-400"/> Fun Fact
              </h3>
              <p className="text-white/80 text-sm italic">
                "Ideally played, Tic-Tac-Toe is a futile game. If both players play perfectly, the game will always end in a draw."
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TicTacToe;