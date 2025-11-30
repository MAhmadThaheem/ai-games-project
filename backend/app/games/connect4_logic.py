from typing import List, Optional, Tuple, Dict, Any

class Connect4GameLogic:
    def __init__(self, board: List[List[Optional[str]]]):
        self.board = board
        self.rows = 6
        self.cols = 7

    def drop_piece(self, column: int, player: str) -> Optional[int]:
        """Drop a piece in the specified column. Returns row where piece landed, or None if column is full."""
        for row in range(self.rows - 1, -1, -1):
            if self.board[row][column] is None:
                self.board[row][column] = 'R' if player == 'red' else 'Y'
                return row
        return None

    def get_legal_moves(self) -> List[int]:
        """Get all columns that are not full"""
        return [col for col in range(self.cols) if self.board[0][col] is None]

    def check_winner(self, row: int, col: int) -> Optional[str]:
        """Check if the last move resulted in a win"""
        player = self.board[row][col]
        if player is None:
            return None

        # Check directions: horizontal, vertical, diagonal up, diagonal down
        directions = [
            (0, 1),   # horizontal
            (1, 0),   # vertical
            (1, 1),   # diagonal down-right
            (1, -1)   # diagonal down-left
        ]

        for dr, dc in directions:
            count = 1  # Start with the current piece

            # Check positive direction
            r, c = row + dr, col + dc
            while 0 <= r < self.rows and 0 <= c < self.cols and self.board[r][c] == player:
                count += 1
                r += dr
                c += dc

            # Check negative direction
            r, c = row - dr, col - dc
            while 0 <= r < self.rows and 0 <= c < self.cols and self.board[r][c] == player:
                count += 1
                r -= dr
                c -= dc

            if count >= 4:
                return 'red' if player == 'R' else 'yellow'

        return None

    def is_board_full(self) -> bool:
        """Check if the board is completely full"""
        return all(self.board[0][col] is not None for col in range(self.cols))

    def evaluate_position(self, player: str) -> float:
        """Evaluate the current board position for the given player"""
        opponent = 'yellow' if player == 'red' else 'red'
        player_piece = 'R' if player == 'red' else 'Y'
        opponent_piece = 'Y' if player == 'red' else 'R'
        
        score = 0
        
        # Center column preference
        center_col = self.cols // 2
        for row in range(self.rows):
            if self.board[row][center_col] == player_piece:
                score += 3
            elif self.board[row][center_col] == opponent_piece:
                score -= 3
        
        # Evaluate all possible 4-in-a-row sequences
        score += self.evaluate_sequences(player_piece, opponent_piece)
        
        return score

    def evaluate_sequences(self, player_piece: str, opponent_piece: str) -> float:
        """Evaluate all possible 4-in-a-row sequences"""
        score = 0
        
        # Check horizontal sequences
        for row in range(self.rows):
            for col in range(self.cols - 3):
                sequence = [self.board[row][col + i] for i in range(4)]
                score += self.evaluate_sequence(sequence, player_piece, opponent_piece)
        
        # Check vertical sequences
        for col in range(self.cols):
            for row in range(self.rows - 3):
                sequence = [self.board[row + i][col] for i in range(4)]
                score += self.evaluate_sequence(sequence, player_piece, opponent_piece)
        
        # Check diagonal (down-right) sequences
        for row in range(self.rows - 3):
            for col in range(self.cols - 3):
                sequence = [self.board[row + i][col + i] for i in range(4)]
                score += self.evaluate_sequence(sequence, player_piece, opponent_piece)
        
        # Check diagonal (down-left) sequences
        for row in range(self.rows - 3):
            for col in range(3, self.cols):
                sequence = [self.board[row + i][col - i] for i in range(4)]
                score += self.evaluate_sequence(sequence, player_piece, opponent_piece)
        
        return score

    def evaluate_sequence(self, sequence: List[Optional[str]], player_piece: str, opponent_piece: str) -> float:
        """Evaluate a single 4-piece sequence"""
        player_count = sequence.count(player_piece)
        opponent_count = sequence.count(opponent_piece)
        empty_count = sequence.count(None)
        
        if opponent_count == 0:
            if player_count == 3 and empty_count == 1:
                return 100  # Almost winning
            elif player_count == 2 and empty_count == 2:
                return 10   # Good potential
            elif player_count == 1 and empty_count == 3:
                return 1    # Some potential
        elif player_count == 0:
            if opponent_count == 3 and empty_count == 1:
                return -80  # Block opponent's almost win
            elif opponent_count == 2 and empty_count == 2:
                return -5   # Block opponent's potential
        
        return 0

    def count_winning_moves(self, player: str) -> int:
        """Count how many winning moves are available for the player"""
        winning_moves = 0
        player_piece = 'R' if player == 'red' else 'Y'
        
        for col in self.get_legal_moves():
            test_board = [row[:] for row in self.board]
            test_logic = Connect4GameLogic(test_board)
            row = test_logic.drop_piece(col, player)
            if row is not None and test_logic.check_winner(row, col):
                winning_moves += 1
        
        return winning_moves