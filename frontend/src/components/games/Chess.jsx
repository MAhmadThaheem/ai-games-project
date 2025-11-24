import React, { useState, useEffect } from 'react';
import { RefreshCw, Crown, Shield, Sword, Cpu } from 'lucide-react';
import { gameAPI } from '../../utils/api';
import { useSound } from '../../hooks/useSound.js';
import { useAudio } from '../../context/AudioContext.jsx';
import BackButton from '../common/BackButton';

const Chess = () => {
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [status, setStatus] = useState('in_progress');
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Sound Setup
  const { isMusicEnabled } = useAudio();
  const [playMove] = useSound('chess-move', { volume: 0.5 });
  const [playCheck] = useSound('chess-check', { volume: 0.6 });
  const [playWin] = useSound('win', { volume: 0.7 });
  const [playLose] = useSound('lose', { volume: 0.7 });
  const [playClick] = useSound('click', { volume: 0.5 });
  const [playGameStart] = useSound('game-start', { volume: 0.6 });

  // Helper to convert algebraic notation (e.g., "a8") to indices
  const parseSquare = (square) => {
    const col = square.charCodeAt(0) - 97;
    const row = 8 - parseInt(square[1]);
    return { row, col };
  };

  // Initialize new game
  const startNewGame = async () => {
    if (isMusicEnabled) playGameStart();
    setLoading(true);
    try {
      const response = await gameAPI.createChessGame(difficulty);
      setGameId(response.data.game_id);
      setBoard(response.data.board);
      setCurrentPlayer(response.data.current_player);
      setStatus(response.data.status);
      setSelectedSquare(null);
      setLegalMoves([]);
      setMessage(`New ${difficulty} game started! You are White.`);
    } catch (error) {
      setMessage('Error starting game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle square click
  const handleSquareClick = async (row, col) => {
    if (loading || currentPlayer !== 'white' || status !== 'in_progress') {
      return;
    }

    if (isMusicEnabled) playClick();

    const square = `${String.fromCharCode(97 + col)}${8 - row}`;
    const piece = board[row][col];

    // If a piece is already selected
    if (selectedSquare) {
      // If clicking on a legal move square
      if (legalMoves.includes(square)) {
        await makeMove(selectedSquare, square);
        setSelectedSquare(null);
        setLegalMoves([]);
      } 
      // If clicking on another piece of the same color
      else if (piece && piece === piece.toUpperCase()) {
        await getLegalMoves(square);
      }
      // Deselect
      else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
    // If no piece selected yet, select this piece if it's white
    else if (piece && piece === piece.toUpperCase()) {
      await getLegalMoves(square);
    }
  };

  // Get legal moves for a piece
  const getLegalMoves = async (square) => {
    try {
      const response = await gameAPI.getChessLegalMoves(gameId, square);
      setSelectedSquare(square);
      setLegalMoves(response.data.legal_moves);
    } catch (error) {
      console.error('Error getting legal moves:', error);
    }
  };

  // Make a move with Optimistic UI Update
  const makeMove = async (fromSquare, toSquare) => {
    setLoading(true); // Lock board immediately
    setMessage('AI is thinking...');

    // 1. OPTIMISTIC UPDATE: Move user piece immediately visually
    const from = parseSquare(fromSquare);
    const to = parseSquare(toSquare);
    
    // Create deep copy of board to modify locally
    const newBoard = board.map(row => [...row]);
    newBoard[to.row][to.col] = newBoard[from.row][from.col]; // Move piece
    newBoard[from.row][from.col] = null; // Clear old spot
    setBoard(newBoard); // Update UI instantly
    
    if (isMusicEnabled) playMove(); // Play sound for user move

    try {
      // 2. Send move to backend
      const response = await gameAPI.makeChessMove(gameId, {
        from_square: fromSquare,
        to_square: toSquare,
        player: 'white'
      });

      // 3. Artificial Delay for AI "Thinking"
      setTimeout(() => {
        setBoard(response.data.board);
        setCurrentPlayer(response.data.current_player);
        setStatus(response.data.status);
        
        // Play appropriate sound for result/AI move
        if (isMusicEnabled) {
          if (response.data.status === 'check') playCheck();
          else if (response.data.status === 'white_won') playWin();
          else if (response.data.status === 'black_won') playLose();
          else {
             playMove(); 
          }
        }

        updateGameMessage(response.data.status);
        setLoading(false); // Unlock board only after delay
      }, 1000);
      
    } catch (error) {
      setMessage('Error making move. Please try again.');
      setLoading(false);
    }
  };

  const updateGameMessage = (gameStatus) => {
    switch (gameStatus) {
      case 'white_won': setMessage('🎉 Checkmate! You won! Congratulations!'); break;
      case 'black_won': setMessage('🤖 Checkmate! AI wins! Better luck next time!'); break;
      case 'stalemate': setMessage('🤝 Stalemate! The game is a draw.'); break;
      case 'check': setMessage('⚡ You are in check! Protect your king!'); break;
      case 'checkmate': setMessage('♔ Checkmate! Game over.'); break;
      case 'in_progress': setMessage('Your turn! Make your move.'); break;
      default: setMessage('Game in progress');
    }
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

  const getPieceSymbol = (piece) => {
    const symbols = {
      'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
      'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
    };
    return symbols[piece] || '';
  };

  const getPieceColor = (piece) => {
    if (!piece) return '';
    return piece === piece.toUpperCase() ? 'text-white drop-shadow-lg' : 'text-black drop-shadow-lg';
  };

  const isLegalMove = (row, col) => {
    const square = `${String.fromCharCode(97 + col)}${8 - row}`;
    return legalMoves.includes(square);
  };

  const isSelectedSquare = (row, col) => {
    if (!selectedSquare) return false;
    const square = `${String.fromCharCode(97 + col)}${8 - row}`;
    return square === selectedSquare;
  };

  const getSquareColor = (row, col) => {
    const isLight = (row + col) % 2 === 0;
    return isLight ? 'bg-amber-200' : 'bg-amber-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 py-8 px-4 relative">
      <BackButton />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 pt-8 md:pt-0">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-game">
            CHESS AI
          </h1>
          <p className="text-xl text-white/80">
            Grandmaster level chess with intelligent AI
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-black/20 rounded-lg">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <label className="text-white font-semibold flex items-center gap-2">
                <Cpu size={18} /> Difficulty:
              </label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="p-2 border border-white/30 rounded-lg bg-purple-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                disabled={loading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              {status !== 'in_progress' && status !== 'check' && (
                <div className={`text-lg font-bold px-4 py-2 rounded-lg ${
                  status.includes('won') ? 'bg-green-600/50 text-white' : 'bg-yellow-600/50 text-white'
                }`}>
                   {status === 'white_won' ? 'Checkmate! You Win! 🎉' : 
                    status === 'black_won' ? 'Checkmate! AI Wins! 🤖' : 
                    'Draw 🤝'}
                </div>
              )}
              
              <button 
                onClick={startNewGame}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
              >
                <RefreshCw size={18} />
                New Game
              </button>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-white mb-2 h-8">
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-400 border-t-transparent"></div>
                  <span>AI Thinking...</span>
                </div>
              ) : (
                <span className={status === 'check' ? 'text-red-400 animate-pulse' : 'text-white'}>
                  {status === 'check' ? '⚠️ Check!' : `Current Turn: ${currentPlayer === 'white' ? 'Your Turn (White)' : 'AI Turn (Black)'}`}
                </span>
              )}
            </div>
            {message && !loading && status !== 'in_progress' && (
              <p className="text-white/70">{message}</p>
            )}
          </div>

          {/* Chess Board Container */}
          <div className="flex justify-center">
            <div className="bg-amber-900/50 p-4 rounded-xl shadow-2xl border-4 border-amber-800/50 relative">
              
              {/* Files labels (top) */}
              <div className="flex justify-center mb-2">
                <div className="w-12 md:w-16"></div>
                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((file) => (
                  <div key={file} className="w-12 md:w-16 text-center text-white/70 font-bold uppercase text-sm">
                    {file}
                  </div>
                ))}
              </div>

              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center items-center">
                  {/* Rank label (left) */}
                  <div className="w-6 md:w-8 text-center text-white/70 font-bold text-sm mr-2">
                    {8 - rowIndex}
                  </div>
                  
                  {/* Board squares */}
                  {row.map((piece, colIndex) => {
                    const squareColor = getSquareColor(rowIndex, colIndex);
                    const isLegal = isLegalMove(rowIndex, colIndex);
                    const isSelected = isSelectedSquare(rowIndex, colIndex);
                    
                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                        disabled={loading || (currentPlayer !== 'white' && !loading) || (status !== 'in_progress' && status !== 'check')}
                        className={`
                          w-12 h-12 md:w-16 md:h-16 relative
                          ${squareColor}
                          ${isSelected ? 'ring-4 ring-yellow-400 z-10' : ''}
                          ${isLegal ? 'ring-4 ring-blue-400 ring-opacity-80 z-10 animate-pulse' : ''}
                          transition-all duration-200
                          flex items-center justify-center
                          ${(!piece && status === 'in_progress' && currentPlayer === 'white' && !loading) 
                            ? 'cursor-pointer hover:brightness-110' 
                            : 'cursor-default'}
                        `}
                      >
                        {piece && (
                          <span className={`text-3xl md:text-4xl font-bold ${getPieceColor(piece)} select-none`}>
                            {getPieceSymbol(piece)}
                          </span>
                        )}
                        
                        {/* Legal move dot indicator for empty squares */}
                        {isLegal && !piece && (
                          <div className="absolute w-3 h-3 bg-blue-500/50 rounded-full"></div>
                        )}
                        
                        {/* Capture indicator */}
                        {isLegal && piece && (
                          <div className="absolute inset-0 ring-4 ring-red-500/70 z-20"></div>
                        )}
                      </button>
                    );
                  })}
                  
                  {/* Rank label (right) */}
                  <div className="w-6 md:w-8 text-center text-white/70 font-bold text-sm ml-2">
                    {8 - rowIndex}
                  </div>
                </div>
              ))}
              
              {/* Files labels (bottom) */}
              <div className="flex justify-center mt-2">
                <div className="w-12 md:w-16"></div>
                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((file) => (
                  <div key={file} className="w-12 md:w-16 text-center text-white/70 font-bold uppercase text-sm">
                    {file}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Game Instructions */}
          <div className="mt-8 p-6 bg-black/20 rounded-lg border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 text-center">How to Play</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80 text-sm">
              <div className="space-y-2">
                <p className="flex items-center gap-2"><div className="w-3 h-3 bg-white rounded-full"></div> <strong>You play as White</strong> (Capital pieces)</p>
                <p className="flex items-center gap-2"><div className="w-3 h-3 bg-black border border-white rounded-full"></div> <strong>AI plays as Black</strong> (Small pieces)</p>
                <p>• Click on your piece to see legal moves (highlighted in blue)</p>
              </div>
              <div className="space-y-2">
                <p>• <span className="text-yellow-400">Easy:</span> Random moves, good for learning</p>
                <p>• <span className="text-cyan-400">Medium:</span> Basic strategy (Minimax)</p>
                <p>• <span className="text-red-400">Hard:</span> Advanced tactics (Alpha-Beta Pruning)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chess;