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
        self.position_weights = self._initialize_position_weights()

    def _initialize_position_weights(self) -> Dict[str, List[List[float]]]:
        """Initialize positional weights for better piece placement"""
        # Pawn structure
        pawn_weights = [
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
            [0.1, 0.1, 0.2, 0.3, 0.3, 0.2, 0.1, 0.1],
            [0.05, 0.05, 0.1, 0.25, 0.25, 0.1, 0.05, 0.05],
            [0.0, 0.0, 0.0, 0.2, 0.2, 0.0, 0.0, 0.0],
            [0.05, -0.05, -0.1, 0.0, 0.0, -0.1, -0.05, 0.05],
            [0.05, 0.1, 0.1, -0.2, -0.2, 0.1, 0.1, 0.05],
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        ]
        
        # Knight positioning
        knight_weights = [
            [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5],
            [-0.4, -0.2, 0.0, 0.0, 0.0, 0.0, -0.2, -0.4],
            [-0.3, 0.0, 0.1, 0.15, 0.15, 0.1, 0.0, -0.3],
            [-0.3, 0.05, 0.15, 0.2, 0.2, 0.15, 0.05, -0.3],
            [-0.3, 0.0, 0.15, 0.2, 0.2, 0.15, 0.0, -0.3],
            [-0.3, 0.05, 0.1, 0.15, 0.15, 0.1, 0.05, -0.3],
            [-0.4, -0.2, 0.0, 0.05, 0.05, 0.0, -0.2, -0.4],
            [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5]
        ]
        
        return {
            'p': pawn_weights,
            'n': knight_weights,
            'b': knight_weights,  # Similar to knights
            'r': [[0.0] * 8 for _ in range(8)],  # Rooks prefer open files
            'q': [[0.0] * 8 for _ in range(8)],  # Queens flexible
            'k': [  # King safety
                [-0.3, -0.4, -0.4, -0.5, -0.5, -0.4, -0.4, -0.3],
                [-0.3, -0.4, -0.4, -0.5, -0.5, -0.4, -0.4, -0.3],
                [-0.3, -0.4, -0.4, -0.5, -0.5, -0.4, -0.4, -0.3],
                [-0.3, -0.4, -0.4, -0.5, -0.5, -0.4, -0.4, -0.3],
                [-0.2, -0.3, -0.3, -0.4, -0.4, -0.3, -0.3, -0.2],
                [-0.1, -0.2, -0.2, -0.2, -0.2, -0.2, -0.2, -0.1],
                [0.2, 0.2, 0.0, 0.0, 0.0, 0.0, 0.2, 0.2],
                [0.2, 0.3, 0.1, 0.0, 0.0, 0.1, 0.3, 0.2]
            ]
        }

    def get_best_move(self, board: List[List[Optional[str]]], player: str) -> Dict[str, Any]:
        """Get the best move based on difficulty level"""
        game_logic = ChessGameLogic([row[:] for row in board])
        
        if self.difficulty == 'easy':
            return self.get_easy_move(game_logic, player)
        elif self.difficulty == 'medium':
            return self.get_medium_move(game_logic, player)
        else:  # hard
            return self.get_hard_move(game_logic, player)

    def get_easy_move(self, game_logic: ChessGameLogic, player: str) -> Dict[str, Any]:
        """Easy AI: Aggressive but simple"""
        moves = game_logic.get_legal_moves(player)
        if not moves:
            return {}
            
        # Prefer captures, especially high-value pieces
        capturing_moves = []
        for move in moves:
            from_row, from_col = game_logic.from_square(move['from'])
            to_row, to_col = game_logic.from_square(move['to'])
            target = game_logic.board[to_row][to_col]
            
            if target:
                piece_values = {'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100}
                target_value = piece_values.get(target.lower(), 0)
                
                # Check if we're not losing a more valuable piece
                moving_piece = game_logic.board[from_row][from_col]
                moving_value = piece_values.get(moving_piece.lower(), 0)
                
                if target_value >= moving_value:  # Only good exchanges
                    capturing_moves.append((move, target_value))
        
        if capturing_moves:
            capturing_moves.sort(key=lambda x: x[1], reverse=True)
            return capturing_moves[0][0]
        
        # Otherwise, prefer central squares and checks
        ranked_moves = []
        for move in moves:
            score = 0
            to_row, to_col = game_logic.from_square(move['to'])
            
            # Center control bonus
            if 2 <= to_row <= 5 and 2 <= to_col <= 5:
                score += 1
            
            # Check if move gives check
            test_logic = ChessGameLogic([row[:] for row in game_logic.board])
            test_logic.make_move(move['from'], move['to'])
            if test_logic.is_check('white' if player == 'black' else 'black'):
                score += 3
                
            ranked_moves.append((move, score))
        
        if ranked_moves:
            ranked_moves.sort(key=lambda x: x[1], reverse=True)
            return ranked_moves[0][0]
        
        return random.choice(moves)

    def get_medium_move(self, game_logic: ChessGameLogic, player: str) -> Dict[str, Any]:
        """Medium AI: Minimax with basic evaluation"""
        depth = self.depth_limits['medium']
        best_move = None
        best_value = float('-inf')
        
        moves = game_logic.get_legal_moves(player)
        random.shuffle(moves)  # Add some randomness
        
        alpha = float('-inf')
        beta = float('inf')
        
        for move in moves:
            test_logic = ChessGameLogic([row[:] for row in game_logic.board])
            test_logic.make_move(move['from'], move['to'])
            
            value = self.minimax(test_logic, depth - 1, alpha, beta, False, player)
            
            if value > best_value:
                best_value = value
                best_move = move
                alpha = max(alpha, best_value)
        
        return best_move or (moves[0] if moves else {})

    def get_hard_move(self, game_logic: ChessGameLogic, player: str) -> Dict[str, Any]:
        """Hard AI: Advanced minimax with alpha-beta pruning and quiescence search"""
        depth = self.depth_limits['hard']
        best_move = None
        best_value = float('-inf')
        
        moves = game_logic.get_legal_moves(player)
        
        # Sort moves for better alpha-beta performance
        moves = self.order_moves(game_logic, moves, player)
        
        alpha = float('-inf')
        beta = float('inf')
        
        for move in moves:
            test_logic = ChessGameLogic([row[:] for row in game_logic.board])
            test_logic.make_move(move['from'], move['to'])
            
            value = self.minimax(test_logic, depth - 1, alpha, beta, False, player)
            
            if value > best_value:
                best_value = value
                best_move = move
            
            alpha = max(alpha, best_value)
            if beta <= alpha:
                break
        
        return best_move or (moves[0] if moves else {})

    def order_moves(self, game_logic: ChessGameLogic, moves: List[Dict], player: str) -> List[Dict]:
        """Order moves for better alpha-beta performance"""
        scored_moves = []
        
        for move in moves:
            score = 0
            
            # Capture moves first
            from_row, from_col = game_logic.from_square(move['from'])
            to_row, to_col = game_logic.from_square(move['to'])
            
            moving_piece = game_logic.board[from_row][from_col]
            target_piece = game_logic.board[to_row][to_col]
            
            if target_piece:
                # MVV-LVA (Most Valuable Victim - Least Valuable Aggressor)
                piece_values = {'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100}
                victim_value = piece_values.get(target_piece.lower(), 0)
                aggressor_value = piece_values.get(moving_piece.lower(), 0)
                score += 10 + victim_value - aggressor_value
            
            # Checks
            test_logic = ChessGameLogic([row[:] for row in game_logic.board])
            test_logic.make_move(move['from'], move['to'])
            if test_logic.is_check('white' if player == 'black' else 'black'):
                score += 5
                
            scored_moves.append((score, move))
        
        scored_moves.sort(key=lambda x: x[0], reverse=True)
        return [move for _, move in scored_moves]

    def minimax(self, game_logic: ChessGameLogic, depth: int, alpha: float, beta: float, 
                maximizing: bool, player: str) -> float:
        """Minimax algorithm with alpha-beta pruning"""
        # Check terminal conditions
        current_player = player if maximizing else ('black' if player == 'white' else 'white')
        
        # Check for checkmate
        if game_logic.is_checkmate(current_player):
            return float('-inf') if maximizing else float('inf')
        
        # Check for stalemate
        if game_logic.is_stalemate(current_player):
            return 0
        
        if depth == 0:
            return self.quiescence_search(game_logic, alpha, beta, maximizing, player)
        
        moves = game_logic.get_legal_moves(current_player)
        
        if maximizing:
            max_eval = float('-inf')
            for move in moves:
                test_logic = ChessGameLogic([row[:] for row in game_logic.board])
                test_logic.make_move(move['from'], move['to'])
                
                eval = self.minimax(test_logic, depth - 1, alpha, beta, False, player)
                max_eval = max(max_eval, eval)
                alpha = max(alpha, eval)
                
                if beta <= alpha:
                    break
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
                    break
            return min_eval

    def quiescence_search(self, game_logic: ChessGameLogic, alpha: float, beta: float, 
                         maximizing: bool, player: str) -> float:
        """Quiescence search to avoid horizon effect"""
        stand_pat = self.evaluate_position(game_logic, player)
        
        if maximizing:
            if stand_pat >= beta:
                return beta
            alpha = max(alpha, stand_pat)
        else:
            if stand_pat <= alpha:
                return alpha
            beta = min(beta, stand_pat)
        
        # Only consider capture moves
        current_player = player if maximizing else ('black' if player == 'white' else 'white')
        moves = game_logic.get_legal_moves(current_player)
        capture_moves = [move for move in moves if self.is_capture_move(game_logic, move)]
        
        for move in capture_moves:
            test_logic = ChessGameLogic([row[:] for row in game_logic.board])
            test_logic.make_move(move['from'], move['to'])
            
            score = self.quiescence_search(test_logic, alpha, beta, not maximizing, player)
            
            if maximizing:
                if score >= beta:
                    return beta
                alpha = max(alpha, score)
            else:
                if score <= alpha:
                    return alpha
                beta = min(beta, score)
        
        return stand_pat

    def is_capture_move(self, game_logic: ChessGameLogic, move: Dict) -> bool:
        """Check if a move is a capture"""
        from_row, from_col = game_logic.from_square(move['from'])
        to_row, to_col = game_logic.from_square(move['to'])
        return game_logic.board[to_row][to_col] is not None

    def evaluate_position(self, game_logic: ChessGameLogic, player: str) -> float:
        """Comprehensive position evaluation"""
        score = 0
        
        # Material score
        score += self.evaluate_material(game_logic)
        
        # Positional score
        score += self.evaluate_positional(game_logic)
        
        # Mobility score
        score += self.evaluate_mobility(game_logic)
        
        # Pawn structure
        score += self.evaluate_pawn_structure(game_logic)
        
        # King safety
        score += self.evaluate_king_safety(game_logic)
        
        # Adjust for player perspective
        if player == 'black':
            score = -score
            
        return score

    def evaluate_material(self, game_logic: ChessGameLogic) -> float:
        """Evaluate material advantage"""
        score = 0
        piece_values = {'p': 1, 'n': 3, 'b': 3.25, 'r': 5, 'q': 9, 'k': 100}
        
        for i in range(8):
            for j in range(8):
                piece = game_logic.board[i][j]
                if piece:
                    value = piece_values.get(piece.lower(), 0)
                    if piece.isupper():  # White
                        score += value
                    else:  # Black
                        score -= value
        return score

    def evaluate_positional(self, game_logic: ChessGameLogic) -> float:
        """Evaluate piece positioning"""
        score = 0
        
        for i in range(8):
            for j in range(8):
                piece = game_logic.board[i][j]
                if piece:
                    piece_type = piece.lower()
                    if piece_type in self.position_weights:
                        weight = self.position_weights[piece_type][i][j]
                        if piece.isupper():  # White
                            score += weight
                        else:  # Black
                            score -= weight
        return score

    def evaluate_mobility(self, game_logic: ChessGameLogic) -> float:
        """Evaluate piece mobility"""
        white_moves = len(game_logic.get_legal_moves('white'))
        black_moves = len(game_logic.get_legal_moves('black'))
        return (white_moves - black_moves) * 0.1

    def evaluate_pawn_structure(self, game_logic: ChessGameLogic) -> float:
        """Evaluate pawn structure"""
        score = 0
        
        # Count doubled pawns
        white_doubled = self.count_doubled_pawns(game_logic, 'white')
        black_doubled = self.count_doubled_pawns(game_logic, 'black')
        score += (black_doubled - white_doubled) * 0.5
        
        # Count isolated pawns
        white_isolated = self.count_isolated_pawns(game_logic, 'white')
        black_isolated = self.count_isolated_pawns(game_logic, 'black')
        score += (black_isolated - white_isolated) * 0.5
        
        return score

    def count_doubled_pawns(self, game_logic: ChessGameLogic, player: str) -> int:
        """Count doubled pawns"""
        pawns_per_file = [0] * 8
        pawn_piece = 'P' if player == 'white' else 'p'
        
        for i in range(8):
            for j in range(8):
                if game_logic.board[i][j] == pawn_piece:
                    pawns_per_file[j] += 1
        
        return sum(1 for count in pawns_per_file if count > 1)

    def count_isolated_pawns(self, game_logic: ChessGameLogic, player: str) -> int:
        """Count isolated pawns"""
        pawn_files = set()
        pawn_piece = 'P' if player == 'white' else 'p'
        
        for i in range(8):
            for j in range(8):
                if game_logic.board[i][j] == pawn_piece:
                    pawn_files.add(j)
        
        isolated = 0
        for file in pawn_files:
            if (file - 1 not in pawn_files) and (file + 1 not in pawn_files):
                isolated += 1
        
        return isolated

    def evaluate_king_safety(self, game_logic: ChessGameLogic) -> float:
        """Evaluate king safety"""
        score = 0
        
        # Penalize exposed kings
        if game_logic.is_check('white'):
            score -= 0.5
        if game_logic.is_check('black'):
            score += 0.5
            
        return score