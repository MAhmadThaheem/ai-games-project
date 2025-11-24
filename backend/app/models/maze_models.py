from pydantic import BaseModel
from typing import List, Tuple, Optional
from enum import Enum

class CellType(str, Enum):
    EMPTY = "empty"
    WALL = "wall"
    MUD = "mud" # High cost terrain
    START = "start"
    END = "end"
    CAT = "cat"
    MOUSE = "mouse"

class Position(BaseModel):
    row: int
    col: int

class MazeState(BaseModel):
    grid: List[List[str]] # "empty", "wall", "mud"
    rows: int
    cols: int
    cat_pos: Position
    mouse_pos: Position

class MazeMoveRequest(BaseModel):
    state: MazeState