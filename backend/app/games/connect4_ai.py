from typing import List, Dict, Any, Optional
import random
from .connect4_logic import Connect4GameLogic

class Connect4AI:
    def __init__(self, difficulty: str):
        self.difficulty = difficulty
        self.depth_limits = {
            'easy': 1,
            'medium': 3,
            'hard': 5
        }

    def get_best_move(self, board: List[List[Optional[str]]], player: str) -> int:
        """Get the best move based on difficulty level"""
        game_logic = Connect4GameLogic([row[:] for row in board])
        
        if self.difficulty == 'easy':
            return self.get_easy_move(game_logic, player)
        elif self.difficulty == 'medium':
            return self.get_medium_move(game_logic, player)
        else:  # hard
            return self.get_hard_move(game_logic, player)

    def get_easy_move(self, game_logic: Connect4GameLogic, player: str) -> int:
        """Easy AI: Random moves with basic strategy"""
        legal_moves = game_logic.get_legal_moves()
        
        # First, check for immediate wins
        for col in legal_moves:
            test_logic = Connect4GameLogic([row[:] for row in game_logic.board])
            row = test_logic.drop_piece(col, player)
            if row is not None and test_logic.check_winner(row, col):
                return col
        
        # Then, block opponent's immediate wins
        opponent = 'yellow' if player == 'red' else 'red'
        for col in legal_moves:
            test_logic = Connect4GameLogic([row[:] for row in game_logic.board])
            row = test_logic.drop_piece(col, opponent)
            if row is not None and test_logic.check_winner(row, col):
                return col
        
        # Prefer center columns
        center_cols = [3, 2, 4, 1, 5, 0, 6]
        for col in center_cols:
            if col in legal_moves:
                return col
        
        return random.choice(legal_moves)

    def get_medium_move(self, game_logic: Connect4GameLogic, player: str) -> int:
        """Medium AI: Minimax with limited depth"""
        depth = self.depth_limits['medium']
        best_move = None
        best_value = float('-inf')
        
        legal_moves = game_logic.get_legal_moves()
        random.shuffle(legal_moves)  # Add some randomness
        
        alpha = float('-inf')
        beta = float('inf')
        
        for col in legal_moves:
            test_logic = Connect4GameLogic([row[:] for row in game_logic.board])
            test_logic.drop_piece(col, player)
            
            value = self.minimax(test_logic, depth - 1, alpha, beta, False, player)
            
            if value > best_value:
                best_value = value
                best_move = col
            
            alpha = max(alpha, best_value)
        
        return best_move or legal_moves[0]

    def get_hard_move(self, game_logic: Connect4GameLogic, player: str) -> int:
        """Hard AI: Advanced minimax with alpha-beta pruning"""
        depth = self.depth_limits['hard']
        best_move = None
        best_value = float('-inf')
        
        legal_moves = game_logic.get_legal_moves()
        
        # Order moves for better alpha-beta performance
        legal_moves = self.order_moves(game_logic, legal_moves, player)
        
        alpha = float('-inf')
        beta = float('inf')
        
        for col in legal_moves:
            test_logic = Connect4GameLogic([row[:] for row in game_logic.board])
            test_logic.drop_piece(col, player)
            
            value = self.minimax(test_logic, depth - 1, alpha, beta, False, player)
            
            if value > best_value:
                best_value = value
                best_move = col
            
            alpha = max(alpha, best_value)
            if beta <= alpha:
                break
        
        return best_move or legal_moves[0]

    def order_moves(self, game_logic: Connect4GameLogic, moves: List[int], player: str) -> List[int]:
        """Order moves for better alpha-beta performance"""
        scored_moves = []
        
        for col in moves:
            score = 0
            
            # Center preference
            if col == 3:  # Center column
                score += 3
            elif col in [2, 4]:  # Near center
                score += 2
            elif col in [1, 5]:  # Outer center
                score += 1
            
            # Check for immediate wins
            test_logic = Connect4GameLogic([row[:] for row in game_logic.board])
            row_pos = test_logic.drop_piece(col, player)
            if row_pos is not None and test_logic.check_winner(row_pos, col):
                score += 100
            
            # Check for opponent's immediate wins to block
            opponent = 'yellow' if player == 'red' else 'red'
            test_logic = Connect4GameLogic([row[:] for row in game_logic.board])
            row_pos = test_logic.drop_piece(col, opponent)
            if row_pos is not None and test_logic.check_winner(row_pos, col):
                score += 50
            
            scored_moves.append((score, col))
        
        scored_moves.sort(key=lambda x: x[0], reverse=True)
        return [col for _, col in scored_moves]

    def minimax(self, game_logic: Connect4GameLogic, depth: int, alpha: float, beta: float, 
                maximizing: bool, player: str) -> float:
        """Minimax algorithm with alpha-beta pruning"""
        # Check terminal conditions
        legal_moves = game_logic.get_legal_moves()
        current_player = player if maximizing else ('yellow' if player == 'red' else 'red')
        
        # Check for win
        for col in legal_moves:
            test_logic = Connect4GameLogic([row[:] for row in game_logic.board])
            row_pos = test_logic.drop_piece(col, current_player)
            if row_pos is not None and test_logic.check_winner(row_pos, col):
                if maximizing:
                    return float('inf')
                else:
                    return float('-inf')
        
        # Check for draw
        if not legal_moves:
            return 0
        
        if depth == 0:
            return game_logic.evaluate_position(player)
        
        if maximizing:
            max_eval = float('-inf')
            for col in legal_moves:
                test_logic = Connect4GameLogic([row[:] for row in game_logic.board])
                test_logic.drop_piece(col, player)
                
                eval = self.minimax(test_logic, depth - 1, alpha, beta, False, player)
                max_eval = max(max_eval, eval)
                alpha = max(alpha, eval)
                
                if beta <= alpha:
                    break
            return max_eval
        else:
            min_eval = float('inf')
            opponent = 'yellow' if player == 'red' else 'red'
            for col in legal_moves:
                test_logic = Connect4GameLogic([row[:] for row in game_logic.board])
                test_logic.drop_piece(col, opponent)
                
                eval = self.minimax(test_logic, depth - 1, alpha, beta, True, player)
                min_eval = min(min_eval, eval)
                beta = min(beta, eval)
                
                if beta <= alpha:
                    break
            return min_eval