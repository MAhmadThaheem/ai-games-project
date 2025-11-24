from pydantic import BaseModel
from typing import List, Optional

class BattleshipState(BaseModel):
    board: List[List[str]]  # "empty", "miss", "hit", "sunk"
    ships_remaining: List[int] # Lengths of ships left to find

class HintRequest(BaseModel):
    state: BattleshipState