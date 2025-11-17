from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ChessDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class ChessPiece(str, Enum):
    WHITE_PAWN = "P"
    WHITE_ROOK = "R"
    WHITE_KNIGHT = "N"
    WHITE_BISHOP = "B"
    WHITE_QUEEN = "Q"
    WHITE_KING = "K"
    BLACK_PAWN = "p"
    BLACK_ROOK = "r"
    BLACK_KNIGHT = "n"
    BLACK_BISHOP = "b"
    BLACK_QUEEN = "q"
    BLACK_KING = "k"

class ChessPlayer(str, Enum):
    WHITE = "white"
    BLACK = "black"

class GameStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    WHITE_WON = "white_won"
    BLACK_WON = "black_won"
    DRAW = "draw"
    STALEMATE = "stalemate"
    CHECK = "check"
    CHECKMATE = "checkmate"

class ChessMove(BaseModel):
    from_square: str
    to_square: str
    promotion: Optional[str] = None
    player: ChessPlayer

    @field_validator('from_square', 'to_square')
    @classmethod
    def validate_square(cls, v):
        if not (len(v) == 2 and v[0] in 'abcdefgh' and v[1] in '12345678'):
            raise ValueError('Square must be in format like "e4", "a1", etc.')
        return v

class ChessGame(BaseModel):
    id: Optional[str] = None
    board: List[List[Optional[str]]] = Field(default_factory=lambda: create_initial_board())
    current_player: ChessPlayer = ChessPlayer.WHITE
    status: GameStatus = GameStatus.IN_PROGRESS
    difficulty: ChessDifficulty = ChessDifficulty.MEDIUM
    moves: List[ChessMove] = []
    move_history: List[str] = []
    captured_pieces: Dict[str, List[str]] = {"white": [], "black": []}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

def create_initial_board() -> List[List[Optional[str]]]:
    """Create initial chess board setup"""
    return [
        ["r", "n", "b", "q", "k", "b", "n", "r"],
        ["p", "p", "p", "p", "p", "p", "p", "p"],
        [None, None, None, None, None, None, None, None],
        [None, None, None, None, None, None, None, None],
        [None, None, None, None, None, None, None, None],
        [None, None, None, None, None, None, None, None],
        ["P", "P", "P", "P", "P", "P", "P", "P"],
        ["R", "N", "B", "Q", "K", "B", "N", "R"]
    ]