from pydantic import BaseModel
from typing import List, Optional, Tuple, Dict
from enum import Enum

class GhostType(str, Enum):
    BLINKY = "blinky" # Red (Aggressive)
    PINKY = "pinky"   # Pink (Ambush)
    INKY = "inky"     # Cyan (Random/Complex)
    CLYDE = "clyde"   # Orange (Coward)

class EntityState(BaseModel):
    x: int
    y: int
    direction: str # "UP", "DOWN", "LEFT", "RIGHT"

class GameState(BaseModel):
    grid: List[List[int]] # 0=Empty, 1=Wall, 2=Dot, 3=Pacman, 4=Ghost
    pacman: EntityState
    ghosts: Dict[str, EntityState] # {"blinky": {...}, "pinky": {...}}
    score: int
    level: int

class GhostMoveRequest(BaseModel):
    game_state: GameState
    ghost_type: GhostType

class MoveResponse(BaseModel):
    direction: str
    target_pos: Tuple[int, int]