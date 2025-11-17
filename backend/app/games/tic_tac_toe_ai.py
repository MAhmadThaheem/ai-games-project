from typing import List, Optional, Tuple
from app.models.game_models import Player, GameStatus

class TicTacToeAI:
    def __init__(self, player: Player):
        self.player = player
        self.opponent = Player.O if player == Player.X else Player.X

    def get_best_move(self, board: List[List[Optional[str]]]) -> Tuple[int, int]:
        """Get the best move using Minimax algorithm"""
        best_score = float('-inf')
        best_move = (-1, -1)
        
        for i in range(3):
            for j in range(3):
                if board[i][j] is None:
                    board[i][j] = self.player
                    score = self.minimax(board, 0, False)
                    board[i][j] = None
                    
                    if score > best_score:
                        best_score = score
                        best_move = (i, j)
        
        return best_move

    def minimax(self, board: List[List[Optional[str]]], depth: int, is_maximizing: bool) -> int:
        """Minimax algorithm with alpha-beta pruning"""
        result = self.check_winner(board)
        
        if result == self.player:
            return 10 - depth
        elif result == self.opponent:
            return depth - 10
        elif self.is_board_full(board):
            return 0

        if is_maximizing:
            best_score = float('-inf')
            for i in range(3):
                for j in range(3):
                    if board[i][j] is None:
                        board[i][j] = self.player
                        score = self.minimax(board, depth + 1, False)
                        board[i][j] = None
                        best_score = max(score, best_score)
            return best_score
        else:
            best_score = float('inf')
            for i in range(3):
                for j in range(3):
                    if board[i][j] is None:
                        board[i][j] = self.opponent
                        score = self.minimax(board, depth + 1, True)
                        board[i][j] = None
                        best_score = min(score, best_score)
            return best_score

    def check_winner(self, board: List[List[Optional[str]]]) -> Optional[str]:
        """Check if there's a winner"""
        # Check rows
        for i in range(3):
            if board[i][0] == board[i][1] == board[i][2] and board[i][0] is not None:
                return board[i][0]

        # Check columns
        for j in range(3):
            if board[0][j] == board[1][j] == board[2][j] and board[0][j] is not None:
                return board[0][j]

        # Check diagonals
        if board[0][0] == board[1][1] == board[2][2] and board[0][0] is not None:
            return board[0][0]
        if board[0][2] == board[1][1] == board[2][0] and board[0][2] is not None:
            return board[0][2]

        return None

    def is_board_full(self, board: List[List[Optional[str]]]) -> bool:
        """Check if the board is full"""
        for i in range(3):
            for j in range(3):
                if board[i][j] is None:
                    return False
        return True