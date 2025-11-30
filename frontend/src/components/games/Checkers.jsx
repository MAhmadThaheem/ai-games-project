import React, { useState, useEffect } from 'react';
import { useSound } from '../../hooks/useSound.js';
import { useAudio } from '../../context/AudioContext.jsx';
import BackButton from '../common/BackButton';
import { checkersAPI } from '../../utils/api'; // Import the API client

const Checkers = () => {
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [gameId, setGameId] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  // Sound Hooks
  const { isMusicEnabled } = useAudio();
  const [playMove] = useSound('checkers-move', { volume: 0.5 });
  const [playKing] = useSound('checkers-king', { volume: 0.6 });
  const [playWin] = useSound('win', { volume: 0.7 });
  const [playLose] = useSound('lose', { volume: 0.7 });
  const [playClick] = useSound('click', { volume: 0.4 });
  const [playGameStart] = useSound('game-start', { volume: 0.6 });

  // Initialize board by calling Backend
  const startNewGame = async () => {
    setLoading(true);
    try {
      // Pass the current difficulty state to the backend
      const response = await checkersAPI.newGame(difficulty);
      
      // Ensure we have valid data before setting state
      if (response && response.data) {
        setGameId(response.data.game_id);
        setBoard(response.data.board);
        setCurrentPlayer(response.data.current_player);
        setSelectedPiece(null);
        setValidMoves([]);
        setGameOver(false);
        setWinner(null);
        
        if (isMusicEnabled) playGameStart();
      } else {
        console.error("Invalid response from server:", response);
      }
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Failed to start new game. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const getPieceColor = (piece) => {
    if (!piece) return null;
    return piece.toLowerCase() === 'r' ? 'red' : 'white';
  };

  // Local helper to highlight valid moves for UI feedback only
  const getValidMoves = (row, col) => {
    const piece = board[row][col];
    if (!piece) return [];

    const color = getPieceColor(piece);
    const isKing = piece === piece.toUpperCase();
    const moves = [];

    // Check normal moves
    const directions = [];
    if (color === 'red' || isKing) directions.push(1); // down
    if (color === 'white' || isKing) directions.push(-1); // up

    directions.forEach(rowDir => {
      [-1, 1].forEach(colDir => {
        const newRow = row + rowDir;
        const newCol = col + colDir;
        
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          if (!board[newRow][newCol]) {
            moves.push({ 
              row: newRow, 
              col: newCol, 
              type: 'move',
              capture: false 
            });
          }
        }
      });
    });

    // Check capture moves
    directions.forEach(rowDir => {
      [-2, 2].forEach(colDir => {
        const newRow = row + rowDir * 2;
        const newCol = col + colDir;
        const captureRow = row + rowDir;
        const captureCol = col + colDir / 2;
        
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const capturedPiece = board[captureRow][captureCol];
          if (capturedPiece && getPieceColor(capturedPiece) !== color && !board[newRow][newCol]) {
            moves.push({ 
              row: newRow, 
              col: newCol, 
              type: 'capture',
              capture: true,
              capturedRow: captureRow,
              capturedCol: captureCol
            });
          }
        }
      });
    });

    return moves;
  };

  const handleSquareClick = async (row, col) => {
    if (gameOver || currentPlayer !== 'red' || loading) return;

    if (isMusicEnabled) playClick();

    const piece = board[row][col];
    const pieceColor = getPieceColor(piece);

    // If clicking on own piece, select it
    if (piece && pieceColor === 'red') {
      setSelectedPiece({ row, col });
      const moves = getValidMoves(row, col);
      setValidMoves(moves);
      return;
    }

    // If a piece is selected and clicking on valid move square
    if (selectedPiece && validMoves.some(move => move.row === row && move.col === col)) {
      await makeMove(selectedPiece.row, selectedPiece.col, row, col);
    } else {
      // Deselect if clicking elsewhere
      setSelectedPiece(null);
      setValidMoves([]);
    }
  };

  const makeMove = async (fromRow, fromCol, toRow, toCol) => {
    setLoading(true);
    
    // Optimistic UI Update
    setSelectedPiece(null);
    setValidMoves([]);

    try {
      // Call Backend
      const response = await checkersAPI.makeMove(gameId, fromRow, fromCol, toRow, toCol);
      const data = response.data;

      // Update Board with Backend State
      setBoard(data.board);
      setCurrentPlayer(data.current_player);
      setGameOver(data.game_over);
      setWinner(data.winner);

      // Play Sound Effects
      if (isMusicEnabled) playMove();
      
      // Check for Game Over sounds
      if (data.game_over) {
        if (data.winner === 'red') {
          if (isMusicEnabled) playWin();
        } else {
          if (isMusicEnabled) playLose();
        }
      }

    } catch (error) {
      console.error("Error making move:", error);
      alert("Invalid move or server error!");
    } finally {
      setLoading(false);
    }
  };

  const renderPiece = (piece) => {
    if (!piece) return null;

    const color = getPieceColor(piece);
    const isKing = piece === piece.toUpperCase();

    return (
      <div className={`w-8 h-8 rounded-full border-2 ${
        color === 'red' 
          ? 'bg-red-500 border-red-700 hover:bg-red-600' 
          : 'bg-gray-200 border-gray-400 hover:bg-gray-300'
      } flex items-center justify-center transition-colors duration-200 shadow-md`}>
        {isKing && (
          <div className={`w-4 h-4 rounded-full ${
            color === 'red' ? 'bg-yellow-300' : 'bg-yellow-500'
          } shadow-inner`} />
        )}
      </div>
    );
  };

  const isMoveValid = (row, col) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isSelected = (row, col) => {
    return selectedPiece && selectedPiece.row === row && selectedPiece.col === col;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 py-8 px-4 relative">
      <BackButton />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 pt-8 md:pt-0">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-game">
            CHECKERS AI
          </h1>
          <p className="text-xl text-white/80">
            Classic checkers with intelligent AI opponent
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-black/20 rounded-lg">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <label className="text-white font-semibold">Difficulty:</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="p-2 border border-white/30 rounded-lg bg-purple-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                disabled={loading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              {gameOver && (
                <div className="text-xl font-bold text-white px-4 py-2 bg-green-600/50 rounded-lg">
                  Game Over! {winner === 'red' ? 'You Win! 🎉' : 'AI Wins! 🤖'}
                </div>
              )}
              
              <button 
                onClick={startNewGame}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                New Game
              </button>
            </div>
          </div>

          {/* Game Info */}
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-white mb-2">
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-400 border-t-transparent"></div>
                  <span>AI Thinking...</span>
                </div>
              ) : (
                `Current Turn: ${currentPlayer === 'red' ? 'Your Turn 🔴' : 'AI Turn ⚪'}`
              )}
            </div>
          </div>

          {/* Checkers Board */}
          <div className="flex justify-center">
            <div className="bg-green-800 p-4 rounded-xl shadow-2xl border-4 border-amber-800">
              {/* Ensure board exists before mapping */}
              {board && board.length > 0 && board.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((piece, colIndex) => {
                    const isBlack = (rowIndex + colIndex) % 2 === 1;
                    const isValidMove = isMoveValid(rowIndex, colIndex);
                    const isPieceSelected = isSelected(rowIndex, colIndex);
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                          isBlack 
                            ? 'bg-green-700 hover:bg-green-600' 
                            : 'bg-amber-200 hover:bg-amber-300'
                        } ${
                          isPieceSelected ? 'ring-4 ring-yellow-400 shadow-lg' : ''
                        } ${
                          isValidMove ? 'ring-4 ring-blue-400 animate-pulse' : ''
                        } ${
                          !isBlack && !isValidMove && !isPieceSelected ? 'hover:bg-amber-300' : ''
                        }`}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                      >
                        {renderPiece(piece)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Game Instructions */}
          <div className="mt-8 p-6 bg-black/20 rounded-lg border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 text-center">How to Play</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80 text-sm">
              <div className="space-y-2">
                <p>• <span className="text-red-400">Red pieces</span> are yours (move downward)</p>
                <p>• <span className="text-gray-300">White pieces</span> are AI (move upward)</p>
                <p>• Click on your piece to select it</p>
              </div>
              <div className="space-y-2">
                <p>• Move diagonally to empty squares</p>
                <p>• Jump over opponent pieces to capture them</p>
                <p>• Reach the opposite end to become a <span className="text-yellow-400">King</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkers;