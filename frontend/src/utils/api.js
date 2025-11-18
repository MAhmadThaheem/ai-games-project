import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API calls for different games
export const gameAPI = {
  // Tic Tac Toe
  getAIMove: (data) => {
    if (data.action === 'new_game') {
      return api.post('/api/tictactoe/new-game');
    } else {
      return api.post(`/api/tictactoe/${data.game_id}/move`, {
        row: data.row,
        col: data.col,
        player: data.player
      });
    }
  },
  // Chess
  createChessGame: (difficulty = 'medium') => 
    api.post('/api/chess/new-game', null, { params: { difficulty } }),
  
  makeChessMove: (gameId, move) => 
    api.post(`/api/chess/${gameId}/move`, move),
  
  getChessLegalMoves: (gameId, square) => 
    api.get(`/api/chess/${gameId}/legal-moves`, { params: { square } }),
  
  getChessGameState: (gameId) => 
    api.get(`/api/chess/${gameId}`),

  // Connect 4
  createConnect4Game: (difficulty = 'medium') => 
    api.post('/api/connect4/new-game', null, { params: { difficulty } }),
  
  makeConnect4Move: (gameId, move) => 
    api.post(`/api/connect4/${gameId}/move`, move),
  
  getConnect4GameState: (gameId) => 
    api.get(`/api/connect4/${gameId}`),
  
  getConnect4LegalMoves: (gameId) => 
    api.get(`/api/connect4/${gameId}/legal-moves`),
  // Maze Solver (to be implemented)
  solveMaze: (mazeData) => api.post('/api/maze/solve', mazeData),
};

export default api;