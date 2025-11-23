from typing import List, Dict, Any, Optional
import random
from .checkers_logic import CheckersGameLogic

class CheckersAI:
    def __init__(self, difficulty: str = 'medium'):
        self.difficulty = difficulty
        self.depth_limits = {
            'easy': 1,
            'medium': 2,
            'hard': 3
        }
    
    def get_best_move(self, board: List[List[Optional[str]]], player: str) -> Dict[str, Any]:
        """Get the best move based on difficulty level"""
        game_logic = CheckersGameLogic()
        game_logic.board = [row[:] for row in board]
        game_logic.current_player = player
        
        if self.difficulty == 'easy':
            return self.get_easy_move(game_logic, player)
        elif self.difficulty == 'medium':
            return self.get_medium_move(game_logic, player)
        else:  # hard
            return self.get_hard_move(game_logic, player)
    
    def get_easy_move(self, game_logic: CheckersGameLogic, player: str) -> Dict[str, Any]:
        """Easy AI: Prefer captures and random moves"""
        moves = game_logic.get_legal_moves(player)
        if not moves:
            return {}
        
        # Prefer capture moves
        capture_moves = [move for move in moves if move.get('capture')]
        if capture_moves:
            return random.choice(capture_moves)
        
        # Otherwise random move
        return random.choice(moves)
    
    def get_medium_move(self, game_logic: CheckersGameLogic, player: str) -> Dict[str, Any]:
        """Medium AI: Basic evaluation function"""
        moves = game_logic.get_legal_moves(player)
        if not moves:
            return {}
        
        best_move = None
        best_score = float('-inf')
        
        for move in moves:
            # Create test board
            test_logic = CheckersGameLogic()
            test_logic.board = [row[:] for row in game_logic.board]
            test_logic.current_player = player
            
            # Make the move
            test_logic.make_move(move['from_row'], move['from_col'], 
                               move['to_row'], move['to_col'])
            
            # Evaluate the position
            score = self.evaluate_position(test_logic, player)
            
            if score > best_score:
                best_score = score
                best_move = move
        
        return best_move or moves[0]
    
    def get_hard_move(self, game_logic: CheckersGameLogic, player: str) -> Dict[str, Any]:
        """Hard AI: Minimax with alpha-beta pruning"""
        depth = self.depth_limits['hard']
        best_move = None
        best_score = float('-inf')
        
        moves = game_logic.get_legal_moves(player)
        if not moves:
            return {}
        
        for move in moves:
            test_logic = CheckersGameLogic()
            test_logic.board = [row[:] for row in game_logic.board]
            test_logic.current_player = player
            
            test_logic.make_move(move['from_row'], move['from_col'],
                               move['to_row'], move['to_col'])
            
            score = self.minimax(test_logic, depth - 1, float('-inf'), float('inf'), False, player)
            
            if score > best_score:
                best_score = score
                best_move = move
        
        return best_move or moves[0]
    
    def minimax(self, game_logic: CheckersGameLogic, depth: int, alpha: float, beta: float, 
                maximizing: bool, player: str) -> float:
        """Minimax algorithm with alpha-beta pruning"""
        if depth == 0 or game_logic.is_game_over():
            return self.evaluate_position(game_logic, player)
        
        current_player = player if maximizing else ('white' if player == 'red' else 'red')
        moves = game_logic.get_legal_moves(current_player)
        
        if maximizing:
            max_eval = float('-inf')
            for move in moves:
                test_logic = CheckersGameLogic()
                test_logic.board = [row[:] for row in game_logic.board]
                test_logic.current_player = current_player
                
                test_logic.make_move(move['from_row'], move['from_col'],
                                   move['to_row'], move['to_col'])
                
                eval_score = self.minimax(test_logic, depth - 1, alpha, beta, False, player)
                max_eval = max(max_eval, eval_score)
                alpha = max(alpha, eval_score)
                
                if beta <= alpha:
                    break
            return max_eval
        else:
            min_eval = float('inf')
            for move in moves:
                test_logic = CheckersGameLogic()
                test_logic.board = [row[:] for row in game_logic.board]
                test_logic.current_player = current_player
                
                test_logic.make_move(move['from_row'], move['from_col'],
                                   move['to_row'], move['to_col'])
                
                eval_score = self.minimax(test_logic, depth - 1, alpha, beta, True, player)
                min_eval = min(min_eval, eval_score)
                beta = min(beta, eval_score)
                
                if beta <= alpha:
                    break
            return min_eval
    
    def evaluate_position(self, game_logic: CheckersGameLogic, player: str) -> float:
        """Evaluate the board position"""
        score = 0
        
        # Material score
        for row in range(8):
            for col in range(8):
                piece = game_logic.board[row][col]
                if piece:
                    piece_value = self.get_piece_value(piece)
                    if game_logic.get_piece_color(piece) == player:
                        score += piece_value
                    else:
                        score -= piece_value
        
        # Position bonuses
        score += self.evaluate_positional(game_logic, player)
        
        return score
    
    def get_piece_value(self, piece: str) -> int:
        """Get the value of a piece"""
        if piece.islower():  # Regular piece
            return 1
        else:  # King (uppercase)
            return 3
    
    def evaluate_positional(self, game_logic: CheckersGameLogic, player: str) -> float:
        """Evaluate positional advantages"""
        score = 0
        
        # Encourage center control and advancement
        for row in range(8):
            for col in range(8):
                piece = game_logic.board[row][col]
                if piece and game_logic.get_piece_color(piece) == player:
                    # Advancement bonus
                    if player == 'red':
                        score += row * 0.1  # Red wants to go down (rows 0-7)
                    else:
                        score += (7 - row) * 0.1  # White wants to go up (rows 7-0)
                    
                    # Center control bonus
                    if 2 <= col <= 5:
                        score += 0.05
                    
                    # King safety bonus (keep kings in back rows)
                    if piece.isupper():  # King piece
                        if player == 'red' and row <= 2:
                            score += 0.1
                        elif player == 'white' and row >= 5:
                            score += 0.1
        
        return score