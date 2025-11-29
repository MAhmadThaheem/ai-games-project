from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.games.battleship_ai import BattleshipAI

router = APIRouter(prefix="/api/battleship", tags=["Battleship"])
ai_engine = BattleshipAI()

class BattleshipRequest(BaseModel):
    board: List[List[int]] 
    difficulty: str = "hard" # Default

@router.post("/next-move")
async def get_battleship_move(request: BattleshipRequest):
    # Pass difficulty to AI
    row, col = ai_engine.get_best_move(request.board, request.difficulty)
    return {"row": row, "col": col}

@router.post("/hint")
async def get_hint(request: BattleshipRequest):
    row, col = ai_engine.get_best_move(request.board, request.difficulty)
    return {"row": row, "col": col}