from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class Player(str, Enum):
    X = "X"
    O = "O"

class GameStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    X_WON = "x_won"
    O_WON = "o_won"
    DRAW = "draw"

class TicTacToeMove(BaseModel):
    row: int = Field(ge=0, le=2)
    col: int = Field(ge=0, le=2)
    player: Player

class TicTacToeGame(BaseModel):
    id: Optional[str] = None
    board: List[List[Optional[str]]] = Field(default=[
        [None, None, None],
        [None, None, None],
        [None, None, None]
    ])
    current_player: Player = Player.X
    status: GameStatus = GameStatus.IN_PROGRESS
    moves: List[TicTacToeMove] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class LeaderboardEntry(BaseModel):
    id: Optional[str] = None
    game_type: str
    player_name: str
    score: int
    duration: float  # in seconds
    created_at: datetime = Field(default_factory=datetime.utcnow)