from typing import List, Optional, Tuple, Dict, Any
import random

class ChessGameLogic:
    def __init__(self, board: List[List[Optional[str]]]):
        self.board = board
        self.piece_values = {
            'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100,
            'P': -1, 'N': -3, 'B': -3, 'R': -5, 'Q': -9, 'K': -100
        }

    def get_legal_moves(self, player: str) -> List[Dict[str, Any]]:
        """Get all legal moves for a player (considering check)"""
        all_moves = []
        for i in range(8):
            for j in range(8):
                piece = self.board[i][j]
                if piece and ((player == 'white' and piece.isupper()) or (player == 'black' and piece.islower())):
                    piece_moves = self.get_piece_moves(i, j, piece)
                    # Filter moves that would leave king in check
                    for move in piece_moves:
                        # Create a temporary logic instance to test the move
                        test_board = [row[:] for row in self.board]  # Deep copy of the board
                        test_logic = ChessGameLogic(test_board)
                        test_logic.make_move(move['from'], move['to'])
                        
                        # Only add move if it doesn't result in self-check
                        if not test_logic.is_check(player):
                            all_moves.append(move)
        return all_moves

    def get_piece_moves(self, row: int, col: int, piece: str) -> List[Dict[str, Any]]:
        """Get possible moves for a specific piece (pseudo-legal)"""
        moves = []
        piece_type = piece.lower()
        
        if piece_type == 'p':  # Pawn
            moves.extend(self.get_pawn_moves(row, col, piece))
        elif piece_type == 'r':  # Rook
            moves.extend(self.get_rook_moves(row, col, piece))
        elif piece_type == 'n':  # Knight
            moves.extend(self.get_knight_moves(row, col, piece))
        elif piece_type == 'b':  # Bishop
            moves.extend(self.get_bishop_moves(row, col, piece))
        elif piece_type == 'q':  # Queen
            moves.extend(self.get_queen_moves(row, col, piece))
        elif piece_type == 'k':  # King
            moves.extend(self.get_king_moves(row, col, piece))
            
        return moves

    def get_pawn_moves(self, row: int, col: int, piece: str) -> List[Dict[str, Any]]:
        moves = []
        direction = -1 if piece.isupper() else 1  # White pawns move up (-1), black down (+1)
        
        # Forward move
        if 0 <= row + direction < 8 and self.board[row + direction][col] is None:
            moves.append({"from": self.to_square(row, col), "to": self.to_square(row + direction, col)})
            
            # Double move from starting position
            if ((piece.isupper() and row == 6) or (piece.islower() and row == 1)) and \
               self.board[row + 2 * direction][col] is None:
                moves.append({"from": self.to_square(row, col), "to": self.to_square(row + 2 * direction, col)})
        
        # Captures
        for dc in [-1, 1]:
            if 0 <= col + dc < 8 and 0 <= row + direction < 8:
                target = self.board[row + direction][col + dc]
                if target and ((piece.isupper() and target.islower()) or (piece.islower() and target.isupper())):
                    moves.append({"from": self.to_square(row, col), "to": self.to_square(row + direction, col + dc)})
        
        return moves

    def get_knight_moves(self, row: int, col: int, piece: str) -> List[Dict[str, Any]]:
        moves = []
        knight_moves = [
            (-2, -1), (-2, 1), (-1, -2), (-1, 2),
            (1, -2), (1, 2), (2, -1), (2, 1)
        ]
        
        for dr, dc in knight_moves:
            new_row, new_col = row + dr, col + dc
            if 0 <= new_row < 8 and 0 <= new_col < 8:
                target = self.board[new_row][new_col]
                if target is None or ((piece.isupper() and target.islower()) or (piece.islower() and target.isupper())):
                    moves.append({"from": self.to_square(row, col), "to": self.to_square(new_row, new_col)})
        
        return moves

    def get_rook_moves(self, row: int, col: int, piece: str) -> List[Dict[str, Any]]:
        return self.get_sliding_moves(row, col, piece, [(1, 0), (-1, 0), (0, 1), (0, -1)])

    def get_bishop_moves(self, row: int, col: int, piece: str) -> List[Dict[str, Any]]:
        return self.get_sliding_moves(row, col, piece, [(1, 1), (1, -1), (-1, 1), (-1, -1)])

    def get_queen_moves(self, row: int, col: int, piece: str) -> List[Dict[str, Any]]:
        return self.get_sliding_moves(row, col, piece, 
                                    [(1, 0), (-1, 0), (0, 1), (0, -1),
                                     (1, 1), (1, -1), (-1, 1), (-1, -1)])

    def get_king_moves(self, row: int, col: int, piece: str) -> List[Dict[str, Any]]:
        moves = []
        king_moves = [(1, 0), (-1, 0), (0, 1), (0, -1),
                     (1, 1), (1, -1), (-1, 1), (-1, -1)]
        
        for dr, dc in king_moves:
            new_row, new_col = row + dr, col + dc
            if 0 <= new_row < 8 and 0 <= new_col < 8:
                target = self.board[new_row][new_col]
                if target is None or ((piece.isupper() and target.islower()) or (piece.islower() and target.isupper())):
                    moves.append({"from": self.to_square(row, col), "to": self.to_square(new_row, new_col)})
        
        return moves

    def get_sliding_moves(self, row: int, col: int, piece: str, directions: List[Tuple[int, int]]) -> List[Dict[str, Any]]:
        moves = []
        for dr, dc in directions:
            for i in range(1, 8):
                new_row, new_col = row + i * dr, col + i * dc
                if not (0 <= new_row < 8 and 0 <= new_col < 8):
                    break
                    
                target = self.board[new_row][new_col]
                if target is None:
                    moves.append({"from": self.to_square(row, col), "to": self.to_square(new_row, new_col)})
                else:
                    if (piece.isupper() and target.islower()) or (piece.islower() and target.isupper()):
                        moves.append({"from": self.to_square(row, col), "to": self.to_square(new_row, new_col)})
                    break
        return moves

    def to_square(self, row: int, col: int) -> str:
        """Convert row, col to chess notation (e.g., 0,0 -> 'a8')"""
        return f"{chr(97 + col)}{8 - row}"

    def from_square(self, square: str) -> Tuple[int, int]:
        """Convert chess notation to row, col (e.g., 'a8' -> 0,0)"""
        col = ord(square[0]) - 97
        row = 8 - int(square[1])
        return row, col

    def make_move(self, from_square: str, to_square: str, promotion: Optional[str] = None) -> bool:
        """Make a move on the board"""
        from_row, from_col = self.from_square(from_square)
        to_row, to_col = self.from_square(to_square)
        
        piece = self.board[from_row][from_col]
        if not piece:
            return False
            
        # Move the piece
        self.board[to_row][to_col] = piece
        self.board[from_row][from_col] = None
        
        # Handle pawn promotion
        if piece.lower() == 'p':
            if (piece.isupper() and to_row == 0) or (piece.islower() and to_row == 7):
                # Default to Queen if no promotion specified, otherwise use specified
                promoted_piece = promotion if promotion else 'q'
                self.board[to_row][to_col] = promoted_piece.upper() if piece.isupper() else promoted_piece.lower()
        
        return True

    def evaluate_board(self) -> float:
        """Evaluate the board position (positive favors white, negative favors black)"""
        score = 0
        
        # Material score
        for i in range(8):
            for j in range(8):
                piece = self.board[i][j]
                if piece:
                    score += self.piece_values.get(piece, 0)
        
        return score

    def is_check(self, player: str) -> bool:
        """Check if player is in check"""
        king_pos = self.find_king(player)
        if not king_pos:
            return True # If king is missing, consider it check/loss
            
        king_square = self.to_square(king_pos[0], king_pos[1])
        opponent = 'black' if player == 'white' else 'white'
        
        # We need to check pseudo-legal moves of opponent to see if they attack king
        # Using pseudo-legal here prevents infinite recursion
        for i in range(8):
            for j in range(8):
                piece = self.board[i][j]
                if piece and ((opponent == 'white' and piece.isupper()) or (opponent == 'black' and piece.islower())):
                    moves = self.get_piece_moves(i, j, piece)
                    if any(move['to'] == king_square for move in moves):
                        return True
        return False

    def find_king(self, player: str) -> Optional[Tuple[int, int]]:
        """Find the king's position for a player"""
        king_piece = 'K' if player == 'white' else 'k'
        for i in range(8):
            for j in range(8):
                if self.board[i][j] == king_piece:
                    return (i, j)
        return None

    def is_checkmate(self, player: str) -> bool:
        """Check if player is in checkmate"""
        if not self.is_check(player):
            return False
    
        # If in check and no legal moves, it's checkmate
        legal_moves = self.get_legal_moves(player)
        return len(legal_moves) == 0

    def is_stalemate(self, player: str) -> bool:
        """Check if player is in stalemate"""
        if self.is_check(player):
            return False
        
        # If not in check but no legal moves, it's stalemate
        legal_moves = self.get_legal_moves(player)
        return len(legal_moves) == 0