from typing import List, Dict, Any, Optional
from pathlib import Path
import random
import pymongo
from .chess_logic import ChessGameLogic
import os
from dotenv import load_dotenv

base_dir = Path(__file__).resolve().parent.parent.parent 
env_path = base_dir / ".env"
print(env_path)
load_dotenv(dotenv_path=env_path) # Load variables from .env file

# Ensure your .env file has keys: MONGO_URL and DB_NAME
MONGO_URI = os.getenv("MONGODB_URL") 
DB_NAME = os.getenv("DATABASE_NAME")

# ==========================================

class ChessMemory:
    def __init__(self):
        try:
            print(MONGO_URI, DB_NAME)
            self.client = pymongo.MongoClient(MONGO_URI)
            self.db = self.client[DB_NAME]
            self.collection = self.db["chess_learning_memory"]
            print(f"✅ AI Brain connected to MongoDB Atlas: {DB_NAME}")
        except Exception as e:
            print(f"⚠️ AI Memory Connection Failed: {e}")
            self.collection = None

    def serialize_board(self, board):
        return str(board)

    def mark_bad_move(self, board, move_str):
        if self.collection is None: return
        state_key = self.serialize_board(board)
        self.collection.update_one(
            {"state": state_key}, 
            {"$addToSet": {"bad_moves": move_str}},
            upsert=True
        )
        print(f"[AI Memory] 🧠 Learned: Avoid {move_str} in this position.")

    def is_bad_move(self, board, move_str):
        if self.collection is None: return False
        state_key = self.serialize_board(board)
        result = self.collection.find_one({
            "state": state_key,
            "bad_moves": move_str
        })
        return result is not None

class ChessAI:
    def __init__(self, difficulty: str):
        self.difficulty = difficulty
        self.depth_limits = {
            'easy': 1,
            'medium': 2, 
            'hard': 3
        }
        self.position_weights = self._initialize_position_weights()
        self.memory = ChessMemory() # MongoDB Brain

    def _initialize_position_weights(self) -> Dict[str, List[List[float]]]:
        """Initialize positional weights for better piece placement"""
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
            'b': knight_weights,  
            'r': [[0.0] * 8 for _ in range(8)],  
            'q': [[0.0] * 8 for _ in range(8)],  
            'k': [  
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

    def learn_from_loss(self, move_history: List[str]):
        """Replay game and mark the fatal mistake in MongoDB"""
        from app.models.chess_models import create_initial_board
        temp_board = create_initial_board()
        temp_logic = ChessGameLogic(temp_board)
        
        if len(move_history) < 2: return

        last_ai_move_str = move_history[-2]
        
        # Replay to state BEFORE AI made the bad move
        for i in range(len(move_history) - 2):
            move_str = move_history[i]
            from_sq, to_sq = move_str[:2], move_str[2:4]
            temp_logic.make_move(from_sq, to_sq)
            
        self.memory.mark_bad_move(temp_logic.board, last_ai_move_str)

    def get_best_move(self, board: List[List[Optional[str]]], player: str) -> Dict[str, Any]:
        game_logic = ChessGameLogic([row[:] for row in board])
        
        if self.difficulty == 'easy':
            return self.get_easy_move(game_logic, player)
        elif self.difficulty == 'medium':
            return self.get_medium_move(game_logic, player)
        else:  # hard
            return self.get_hard_move(game_logic, player)

    def get_easy_move(self, game_logic: ChessGameLogic, player: str) -> Dict[str, Any]:
        moves = game_logic.get_legal_moves(player)
        if not moves: return {}
            
        capturing_moves = []
        for move in moves:
            from_row, from_col = game_logic.from_square(move['from'])
            to_row, to_col = game_logic.from_square(move['to'])
            target = game_logic.board[to_row][to_col]
            
            if target:
                piece_values = {'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100}
                target_value = piece_values.get(target.lower(), 0)
                moving_piece = game_logic.board[from_row][from_col]
                moving_value = piece_values.get(moving_piece.lower(), 0)
                
                if target_value >= moving_value: 
                    capturing_moves.append((move, target_value))
        
        if capturing_moves:
            capturing_moves.sort(key=lambda x: x[1], reverse=True)
            return capturing_moves[0][0]
        
        ranked_moves = []
        for move in moves:
            score = 0
            to_row, to_col = game_logic.from_square(move['to'])
            
            if 2 <= to_row <= 5 and 2 <= to_col <= 5: score += 1
            
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
        depth = self.depth_limits['medium']
        best_move = None
        best_value = float('-inf')
        
        moves = game_logic.get_legal_moves(player)
        random.shuffle(moves)
        
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
        depth = self.depth_limits['hard']
        best_move = None
        best_value = float('-inf')
        
        moves = game_logic.get_legal_moves(player)
        moves = self.order_moves(game_logic, moves, player)
        
        # --- INTELLIGENT FILTERING (MongoDB) ---
        safe_moves = []
        for move in moves:
            move_str = f"{move['from']}{move['to']}"
            if not self.memory.is_bad_move(game_logic.board, move_str):
                safe_moves.append(move)
        
        search_moves = safe_moves if safe_moves else moves

        alpha = float('-inf')
        beta = float('inf')
        
        for move in search_moves:
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
        scored_moves = []
        
        for move in moves:
            score = 0
            from_row, from_col = game_logic.from_square(move['from'])
            to_row, to_col = game_logic.from_square(move['to'])
            
            moving_piece = game_logic.board[from_row][from_col]
            target_piece = game_logic.board[to_row][to_col]
            
            if target_piece:
                piece_values = {'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100}
                victim_value = piece_values.get(target_piece.lower(), 0)
                aggressor_value = piece_values.get(moving_piece.lower(), 0)
                score += 10 + victim_value - aggressor_value
            
            test_logic = ChessGameLogic([row[:] for row in game_logic.board])
            test_logic.make_move(move['from'], move['to'])
            if test_logic.is_check('white' if player == 'black' else 'black'):
                score += 5
                
            scored_moves.append((score, move))
        
        scored_moves.sort(key=lambda x: x[0], reverse=True)
        return [move for _, move in scored_moves]

    def minimax(self, game_logic: ChessGameLogic, depth: int, alpha: float, beta: float, 
                maximizing: bool, player: str) -> float:
        current_player = player if maximizing else ('black' if player == 'white' else 'white')
        
        if game_logic.is_checkmate(current_player):
            return float('-inf') if maximizing else float('inf')
        
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
            if stand_pat >= beta: return beta
            alpha = max(alpha, stand_pat)
        else:
            if stand_pat <= alpha: return alpha
            beta = min(beta, stand_pat)
        
        current_player = player if maximizing else ('black' if player == 'white' else 'white')
        moves = game_logic.get_legal_moves(current_player)
        capture_moves = [move for move in moves if self.is_capture_move(game_logic, move)]
        
        for move in capture_moves:
            test_logic = ChessGameLogic([row[:] for row in game_logic.board])
            test_logic.make_move(move['from'], move['to'])
            
            score = self.quiescence_search(test_logic, alpha, beta, not maximizing, player)
            
            if maximizing:
                if score >= beta: return beta
                alpha = max(alpha, score)
            else:
                if score <= alpha: return alpha
                beta = min(beta, score)
        
        return stand_pat

    def is_capture_move(self, game_logic: ChessGameLogic, move: Dict) -> bool:
        from_row, from_col = game_logic.from_square(move['from'])
        to_row, to_col = game_logic.from_square(move['to'])
        return game_logic.board[to_row][to_col] is not None

    def evaluate_position(self, game_logic: ChessGameLogic, player: str) -> float:
        """Comprehensive position evaluation"""
        score = 0
        score += self.evaluate_material(game_logic)
        score += self.evaluate_positional(game_logic)
        score += self.evaluate_mobility(game_logic)
        score += self.evaluate_pawn_structure(game_logic)
        score += self.evaluate_king_safety(game_logic)
        
        if player == 'black':
            score = -score
            
        return score

    def evaluate_material(self, game_logic: ChessGameLogic) -> float:
        score = 0
        piece_values = {'p': 1, 'n': 3, 'b': 3.25, 'r': 5, 'q': 9, 'k': 100}
        
        for i in range(8):
            for j in range(8):
                piece = game_logic.board[i][j]
                if piece:
                    value = piece_values.get(piece.lower(), 0)
                    if piece.isupper(): score += value
                    else: score -= value
        return score

    def evaluate_positional(self, game_logic: ChessGameLogic) -> float:
        score = 0
        for i in range(8):
            for j in range(8):
                piece = game_logic.board[i][j]
                if piece:
                    piece_type = piece.lower()
                    if piece_type in self.position_weights:
                        weight = self.position_weights[piece_type][i][j]
                        if piece.isupper(): score += weight
                        else: score -= weight
        return score

    def evaluate_mobility(self, game_logic: ChessGameLogic) -> float:
        # Simplified mobility to prevent recursion depth issues in evaluation
        # But we keep the structure so you can enable it if you optimize
        return 0

    def evaluate_pawn_structure(self, game_logic: ChessGameLogic) -> float:
        score = 0
        white_doubled = self.count_doubled_pawns(game_logic, 'white')
        black_doubled = self.count_doubled_pawns(game_logic, 'black')
        score += (black_doubled - white_doubled) * 0.5
        
        white_isolated = self.count_isolated_pawns(game_logic, 'white')
        black_isolated = self.count_isolated_pawns(game_logic, 'black')
        score += (black_isolated - white_isolated) * 0.5
        return score

    def count_doubled_pawns(self, game_logic: ChessGameLogic, player: str) -> int:
        pawns_per_file = [0] * 8
        pawn_piece = 'P' if player == 'white' else 'p'
        for i in range(8):
            for j in range(8):
                if game_logic.board[i][j] == pawn_piece:
                    pawns_per_file[j] += 1
        return sum(1 for count in pawns_per_file if count > 1)

    def count_isolated_pawns(self, game_logic: ChessGameLogic, player: str) -> int:
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
        score = 0
        if game_logic.is_check('white'): score -= 0.5
        if game_logic.is_check('black'): score += 0.5
        return score