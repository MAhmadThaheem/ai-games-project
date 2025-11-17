import React, { useState, useEffect } from 'react';
import { RefreshCw, Home, Trophy, Cpu, Settings, Crown, Shield, Sword } from 'lucide-react';
import { gameAPI } from '../../utils/api';

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

  // Initialize new game
  const startNewGame = async () => {
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

  // Make a move
  const makeMove = async (fromSquare, toSquare) => {
    setLoading(true);
    try {
      const response = await gameAPI.makeChessMove(gameId, {
        from_square: fromSquare,
        to_square: toSquare,
        player: 'white'
      });

      setBoard(response.data.board);
      setCurrentPlayer(response.data.current_player);
      setStatus(response.data.status);
      
      updateGameMessage(response.data.status);
      
    } catch (error) {
      setMessage('Error making move. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateGameMessage = (gameStatus) => {
    switch (gameStatus) {
      case 'white_won':
        setMessage('🎉 Checkmate! You won! Congratulations!');
        break;
      case 'black_won':
        setMessage('🤖 Checkmate! AI wins! Better luck next time!');
        break;
      case 'stalemate':
        setMessage('🤝 Stalemate! The game is a draw.');
        break;
      case 'check':
        setMessage('⚡ You are in check! Protect your king!');
        break;
      case 'in_progress':
        setMessage('AI is thinking...');
        setTimeout(() => {
          setMessage('Your turn! Make your move.');
        }, 1000);
        break;
      default:
        setMessage('Game in progress');
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
    return piece === piece.toUpperCase() ? 'text-white' : 'text-black';
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
    return isLight ? 'bg-amber-100' : 'bg-amber-800';
  };

  const getDifficultyIcon = (level) => {
    switch (level) {
      case 'easy': return <Shield className="text-green-400" size={20} />;
      case 'medium': return <Sword className="text-yellow-400" size={20} />;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-game">
            CHESS AI
          </h1>
          <p className="text-xl text-white/80">
            Challenge our AI at different difficulty levels
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chess Board */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              {/* Game Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <div className="text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Cpu size={20} />
                    <span className="font-semibold">Current Player:</span>
                    <span className={`font-bold ${currentPlayer === 'white' ? 'text-blue-400' : 'text-red-400'}`}>
                      {currentPlayer === 'white' ? 'You (White)' : 'AI (Black)'}
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

              {/* Chess Board */}
              <div className="bg-amber-900/50 rounded-xl p-4 border-2 border-amber-700/50">
                {/* Files labels (a-h) */}
                <div className="flex justify-center mb-2">
                  <div className="w-12 md:w-16"></div>
                  {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((file) => (
                    <div key={file} className="w-12 md:w-16 text-center text-white/70 font-semibold">
                      {file}
                    </div>
                  ))}
                </div>

                {/* Board and ranks */}
                {board.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center items-center">
                    {/* Rank label (8-1) */}
                    <div className="w-12 md:w-16 text-center text-white/70 font-semibold mr-2">
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
                          disabled={loading || currentPlayer !== 'white' || status !== 'in_progress'}
                          className={`
                            w-12 h-12 md:w-16 md:h-16 relative
                            ${squareColor}
                            ${isSelected ? 'ring-4 ring-blue-400 ring-opacity-80' : ''}
                            ${isLegal ? 'ring-4 ring-green-400 ring-opacity-60' : ''}
                            transition-all duration-200
                            hover:brightness-110
                            flex items-center justify-center
                            ${(!piece && status === 'in_progress' && currentPlayer === 'white') 
                              ? 'cursor-pointer' 
                              : 'cursor-default'}
                          `}
                        >
                          {piece && (
                            <span className={`text-3xl md:text-4xl font-bold ${getPieceColor(piece)}`}>
                              {getPieceSymbol(piece)}
                            </span>
                          )}
                          
                          {/* Legal move indicator */}
                          {isLegal && !piece && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-4 h-4 bg-green-400 rounded-full opacity-60"></div>
                            </div>
                          )}
                          
                          {/* Legal capture indicator */}
                          {isLegal && piece && (
                            <div className="absolute inset-0 ring-4 ring-red-400 ring-opacity-60 rounded"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Game Status */}
              <div className="mt-6 text-center">
                <div className={`text-2xl font-bold ${
                  status === 'white_won' ? 'text-green-400' :
                  status === 'black_won' ? 'text-red-400' :
                  status === 'stalemate' ? 'text-yellow-400' :
                  status === 'check' ? 'text-orange-400' :
                  'text-white'
                }`}>
                  {status === 'in_progress' ? 'Game in Progress' :
                   status === 'white_won' ? 'Checkmate! You Win! 🎉' :
                   status === 'black_won' ? 'Checkmate! AI Wins! 🤖' :
                   status === 'stalemate' ? 'Stalemate! Draw! 🤝' :
                   status === 'check' ? 'Check! ⚡' :
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
                          {level === 'easy' && 'Basic moves, good for beginners'}
                          {level === 'medium' && 'Strategic play, intermediate level'}
                          {level === 'hard' && 'Advanced AI, challenging gameplay'}
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
                <p>• <strong>You play as White</strong> (uppercase pieces)</p>
                <p>• <strong>AI plays as Black</strong> (lowercase pieces)</p>
                <p>• Click on your piece to see legal moves</p>
                <p>• Click on highlighted square to move</p>
                <p>• Capture opponent's king to win</p>
                <p>• Watch out for checks and checkmates!</p>
              </div>
            </div>

            {/* AI Information */}
            <div className="game-card">
              <h3 className="text-xl font-bold text-white mb-4">AI Algorithms</h3>
              <div className="space-y-3 text-white/80 text-sm">
                <div>
                  <strong className="text-green-400">Easy:</strong> Random moves with basic strategy
                </div>
                <div>
                  <strong className="text-yellow-400">Medium:</strong> Minimax algorithm (2-ply depth)
                </div>
                <div>
                  <strong className="text-red-400">Hard:</strong> Advanced minimax with alpha-beta pruning (3-ply depth)
                </div>
                <div className="mt-2 text-xs opacity-70">
                  Higher difficulty levels use more computational power and deeper analysis.
                </div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="game-card">
              <h3 className="text-xl font-bold text-white mb-4">Chess Facts</h3>
              <div className="space-y-2 text-white/80 text-sm">
                <p>• ~10¹²⁰ possible chess games</p>
                <p>• Longest game: 5,949 moves</p>
                <p>• Shortest checkmate: 2 moves</p>
                <p>• First computer chess: 1950s</p>
                <p>• Deep Blue vs Kasparov: 1997</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chess;