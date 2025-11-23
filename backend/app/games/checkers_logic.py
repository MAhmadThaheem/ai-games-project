from typing import List, Optional, Tuple, Dict, Any
import random

class CheckersGameLogic:
    def __init__(self):
        self.board = self.initialize_board()
        self.current_player = 'red'  # red starts first
        self.selected_piece = None
        self.must_capture = False
        
    def initialize_board(self) -> List[List[Optional[str]]]:
        """Initialize the checkers board with pieces"""
        board = [[None for _ in range(8)] for _ in range(8)]
        
        # Place red pieces (top)
        for row in range(3):
            for col in range(8):
                if (row + col) % 2 == 1:
                    board[row][col] = 'r'  # red piece
        
        # Place white pieces (bottom)
        for row in range(5, 8):
            for col in range(8):
                if (row + col) % 2 == 1:
                    board[row][col] = 'w'  # white piece
                    
        return board
    
    def get_legal_moves(self, player: str) -> List[Dict[str, Any]]:
        """Get all legal moves for a player"""
        moves = []
        capture_moves = []
        
        for row in range(8):
            for col in range(8):
                piece = self.board[row][col]
                if piece and self.get_piece_color(piece) == player:
                    piece_moves = self.get_piece_moves(row, col, piece)
                    
                    # Separate capture and regular moves
                    for move in piece_moves:
                        if move.get('capture'):
                            capture_moves.append(move)
                        else:
                            moves.append(move)
        
        # If captures are available, only capture moves are legal
        if capture_moves:
            return capture_moves
        return moves
    
    def get_piece_color(self, piece: str) -> str:
        """Get the color of a piece"""
        return 'red' if piece.lower() == 'r' else 'white'
    
    def get_piece_moves(self, row: int, col: int, piece: str) -> List[Dict[str, Any]]:
        """Get possible moves for a specific piece"""
        moves = []
        color = self.get_piece_color(piece)
        is_king = piece.isupper()
        
        # Directions: (row_delta, col_delta)
        if color == 'red' or is_king:
            # Red moves down or king moves both directions
            moves.extend(self.get_moves_in_direction(row, col, piece, 1))
        if color == 'white' or is_king:
            # White moves up or king moves both directions
            moves.extend(self.get_moves_in_direction(row, col, piece, -1))
            
        return moves
    
    def get_moves_in_direction(self, row: int, col: int, piece: str, row_delta: int) -> List[Dict[str, Any]]:
        """Get moves in a specific direction"""
        moves = []
        color = self.get_piece_color(piece)
        
        # Check normal moves (1 square)
        for col_delta in [-1, 1]:
            new_row, new_col = row + row_delta, col + col_delta
            if self.is_valid_position(new_row, new_col) and self.board[new_row][new_col] is None:
                moves.append({
                    'from_row': row,
                    'from_col': col,
                    'to_row': new_row,
                    'to_col': new_col,
                    'capture': False,
                    'piece': piece
                })
        
        # Check capture moves (2 squares)
        for col_delta in [-2, 2]:
            new_row, new_col = row + (2 * row_delta), col + col_delta
            capture_row, capture_col = row + row_delta, col + (col_delta // 2)
            
            if (self.is_valid_position(new_row, new_col) and 
                self.board[new_row][new_col] is None and
                self.is_valid_position(capture_row, capture_col)):
                
                captured_piece = self.board[capture_row][capture_col]
                if (captured_piece and 
                    self.get_piece_color(captured_piece) != color and
                    self.board[new_row][new_col] is None):
                    
                    moves.append({
                        'from_row': row,
                        'from_col': col,
                        'to_row': new_row,
                        'to_col': new_col,
                        'capture': True,
                        'captured_row': capture_row,
                        'captured_col': capture_col,
                        'piece': piece
                    })
        
        return moves
    
    def is_valid_position(self, row: int, col: int) -> bool:
        """Check if position is within board bounds"""
        return 0 <= row < 8 and 0 <= col < 8
    
    def make_move(self, from_row: int, from_col: int, to_row: int, to_col: int) -> bool:
        """Make a move on the board"""
        piece = self.board[from_row][from_col]
        if not piece:
            return False
        
        # Get all legal moves for this piece
        legal_moves = self.get_piece_moves(from_row, from_col, piece)
        move_made = None
        
        for move in legal_moves:
            if (move['to_row'] == to_row and move['to_col'] == to_col):
                move_made = move
                break
        
        if not move_made:
            return False
        
        # Perform the move
        self.board[to_row][to_col] = piece
        self.board[from_row][from_col] = None
        
        # Handle captures
        if move_made['capture']:
            self.board[move_made['captured_row']][move_made['captured_col']] = None
        
        # Check for promotion to king
        if self.should_promote(to_row, piece):
            self.board[to_row][to_col] = piece.upper()  # Make it a king
        
        # Switch player
        self.current_player = 'white' if self.current_player == 'red' else 'red'
        
        return True
    
    def should_promote(self, row: int, piece: str) -> bool:
        """Check if a piece should be promoted to king"""
        color = self.get_piece_color(piece)
        if color == 'red' and row == 7:  # Red reaches bottom
            return True
        if color == 'white' and row == 0:  # White reaches top
            return True
        return False
    
    def is_game_over(self) -> bool:
        """Check if the game is over"""
        red_moves = self.get_legal_moves('red')
        white_moves = self.get_legal_moves('white')
        
        return len(red_moves) == 0 or len(white_moves) == 0
    
    def get_winner(self) -> Optional[str]:
        """Get the winner if game is over"""
        if not self.is_game_over():
            return None
        
        red_moves = self.get_legal_moves('red')
        white_moves = self.get_legal_moves('white')
        
        if len(red_moves) == 0:
            return 'white'
        elif len(white_moves) == 0:
            return 'red'
        return None
    
    def get_board_state(self) -> Dict[str, Any]:
        """Get the current board state for API response"""
        return {
            'board': self.board,
            'current_player': self.current_player,
            'game_over': self.is_game_over(),
            'winner': self.get_winner()
        }