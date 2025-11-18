from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime
from enum import Enum

class Connect4Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class Connect4Player(str, Enum):
    RED = "red"
    YELLOW = "yellow"

class Connect4GameStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    RED_WON = "red_won"
    YELLOW_WON = "yellow_won"
    DRAW = "draw"

class Connect4Move(BaseModel):
    column: int
    player: Connect4Player

    @field_validator('column')
    @classmethod
    def validate_column(cls, v):
        if not (0 <= v <= 6):
            raise ValueError('Column must be between 0 and 6')
        return v

class Connect4Game(BaseModel):
    id: Optional[str] = None
    board: List[List[Optional[str]]] = Field(default_factory=lambda: create_initial_board())
    current_player: Connect4Player = Connect4Player.RED
    status: Connect4GameStatus = Connect4GameStatus.IN_PROGRESS
    difficulty: Connect4Difficulty = Connect4Difficulty.MEDIUM
    moves: List[Connect4Move] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

def create_initial_board() -> List[List[Optional[str]]]:
    """Create empty Connect 4 board (6 rows x 7 columns)"""
    return [[None for _ in range(7)] for _ in range(6)]