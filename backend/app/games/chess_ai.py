from typing import List, Dict, Any, Optional, Tuple
import random
import math
from .chess_logic import ChessGameLogic

class ChessAI:
    def __init__(self, difficulty: str):
        self.difficulty = difficulty
        self.depth_limits = {
            'easy': 1,
            'medium': 2,
            'hard': 3
        }

    def get_best_move(self, board: List[List[Optional[str]]], player: str) -> Dict[str, Any]:
        """Get the best move based on difficulty level"""
        game_logic = ChessGameLogic([row[:] for row in board])  # Create a copy
        
        if self.difficulty == 'easy':
            return self.get_easy_move(game_logic, player)
        elif self.difficulty == 'medium':
            return self.get_medium_move(game_logic, player)
        else:  # hard
            return self.get_hard_move(game_logic, player)

    def get_easy_move(self, game_logic: ChessGameLogic, player: str) -> Dict[str, Any]:
        """Easy AI: Random moves with basic piece preservation"""
        moves = game_logic.get_legal_moves(player)
        
        if not moves:
            return {}
            
        # Prefer moves that capture pieces
        capturing_moves = []
        for move in moves:
            from_row, from_col = game_logic.from_square(move['from'])
            to_row, to_col = game_logic.from_square(move['to'])
            piece = game_logic.board[from_row][from_col]
            target = game_logic.board[to_row][to_col]
            
            if target:  # This is a capture
                # Prefer higher value captures
                piece_values = {'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9}
                target_value = piece_values.get(target.lower(), 0)
                capturing_moves.append((move, target_value))
        
        if capturing_moves:
            # Choose the best capture
            capturing_moves.sort(key=lambda x: x[1], reverse=True)
            return capturing_moves[0][0]
        
        # Otherwise random move
        return random.choice(moves)

    def get_medium_move(self, game_logic: ChessGameLogic, player: str) -> Dict[str, Any]:
        """Medium AI: Minimax with limited depth and basic evaluation"""
        depth = self.depth_limits['medium']
        best_move = None
        best_value = float('-inf')
        
        moves = game_logic.get_legal_moves(player)
        random.shuffle(moves)  # Add some randomness
        
        for move in moves:
            # Make the move on a copy
            test_logic = ChessGameLogic([row[:] for row in game_logic.board])
            test_logic.make_move(move['from'], move['to'])
            
            # Evaluate the position
            value = self.minimax(test_logic, depth - 1, float('-inf'), float('inf'), False, player)
            
            if value > best_value:
                best_value = value
                best_move = move
        
        return best_move or (moves[0] if moves else {})

    def get_hard_move(self, game_logic: ChessGameLogic, player: str) -> Dict[str, Any]:
        """Hard AI: Advanced minimax with alpha-beta pruning and better evaluation"""
        depth = self.depth_limits['hard']
        best_move = None
        best_value = float('-inf')
        
        moves = game_logic.get_legal_moves(player)
        
        for move in moves:
            # Make the move on a copy
            test_logic = ChessGameLogic([row[:] for row in game_logic.board])
            test_logic.make_move(move['from'], move['to'])
            
            # Evaluate with alpha-beta pruning
            value = self.minimax(test_logic, depth - 1, float('-inf'), float('inf'), False, player)
            
            if value > best_value:
                best_value = value
                best_move = move
        
        return best_move or (moves[0] if moves else {})

    def minimax(self, game_logic: ChessGameLogic, depth: int, alpha: float, beta: float, 
                maximizing: bool, player: str) -> float:
        """Minimax algorithm with alpha-beta pruning"""
        if depth == 0:
            return self.evaluate_position(game_logic, player)
        
        current_player = player if maximizing else ('black' if player == 'white' else 'white')
        moves = game_logic.get_legal_moves(current_player)
        
        if not moves:
            # Checkmate or stalemate
            if game_logic.is_check(current_player):
                return float('-inf') if maximizing else float('inf')
            else:
                return 0  # Stalemate
        
        if maximizing:
            max_eval = float('-inf')
            for move in moves:
                test_logic = ChessGameLogic([row[:] for row in game_logic.board])
                test_logic.make_move(move['from'], move['to'])
                
                eval = self.minimax(test_logic, depth - 1, alpha, beta, False, player)
                max_eval = max(max_eval, eval)
                alpha = max(alpha, eval)
                
                if beta <= alpha:
                    break  # Beta cutoff
                    
            return max_eval
        else:
            min_eval = float('inf')
            for move in moves:
                test_logic = ChessGameLogic([row[:] for row in game_logic.board])
                test_logic.make_move(move['from'], move['to'])
                
                eval = self.minimax(test_logic, depth - 1, alpha, beta, True, player)
                min_eval = min(min_eval, eval)
                beta = min(beta, eval)
                
                if beta <= alpha:
                    break  # Alpha cutoff
                    
            return min_eval

    def evaluate_position(self, game_logic: ChessGameLogic, player: str) -> float:
        """Enhanced position evaluation"""
        score = game_logic.evaluate_board()
        
        # Adjust score based on player perspective
        if player == 'black':
            score = -score
            
        # Add positional bonuses
        score += self.evaluate_piece_activity(game_logic, player)
        score += self.evaluate_king_safety(game_logic, player)
        score += self.evaluate_pawn_structure(game_logic, player)
        
        return score

    def evaluate_piece_activity(self, game_logic: ChessGameLogic, player: str) -> float:
        """Evaluate piece activity and mobility"""
        activity = 0
        moves = game_logic.get_legal_moves(player)
        activity += len(moves) * 0.1  # Mobility bonus
        
        # Center control bonus
        center_squares = ['d4', 'd5', 'e4', 'e5']
        for move in moves:
            if move['to'] in center_squares:
                activity += 0.3
                
        return activity

    def evaluate_king_safety(self, game_logic: ChessGameLogic, player: str) -> float:
        """Evaluate king safety"""
        safety = 0
        
        # Penalize if king is in check
        if game_logic.is_check(player):
            safety -= 2.0
            
        # TODO: Add castling rights, pawn shield evaluation
        
        return safety

    def evaluate_pawn_structure(self, game_logic: ChessGameLogic, player: str) -> float:
        """Evaluate pawn structure"""
        structure = 0
        
        # Bonus for connected pawns
        # Penalty for isolated pawns
        # Bonus for passed pawns
        
        # Simplified version
        pawn_positions = []
        for i in range(8):
            for j in range(8):
                piece = game_logic.board[i][j]
                if piece and piece.lower() == 'p':
                    if (player == 'white' and piece.isupper()) or (player == 'black' and piece.islower()):
                        pawn_positions.append((i, j))
        
        # Bonus for pawns in center
        for row, col in pawn_positions:
            if 3 <= row <= 4 and 2 <= col <= 5:
                structure += 0.5
                
        return structure