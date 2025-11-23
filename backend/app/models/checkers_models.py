# app/models/checkers_models.py
from pydantic import BaseModel, Field
from typing import List, Optional, Tuple
from datetime import datetime
from enum import Enum

class CheckersPlayer(str, Enum):
    WHITE = "white"
    BLACK = "black"

class CheckersPiece(BaseModel):
    player: CheckersPlayer
    is_king: bool = False

class GameState(BaseModel):
    board: List[List[Optional[CheckersPiece]]]
    current_player: CheckersPlayer = CheckersPlayer.WHITE
    game_over: bool = False
    winner: Optional[CheckersPlayer] = None
    move_count: int = 0

class CheckersMove(BaseModel):
    from_pos: Tuple[int, int]
    to_pos: Tuple[int, int]
    player: CheckersPlayer

class CheckersGame(BaseModel):
    id: Optional[str] = None
    state: GameState
    moves: List[CheckersMove] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)