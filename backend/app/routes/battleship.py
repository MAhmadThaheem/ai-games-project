from fastapi import APIRouter
from app.models.battleship_models import HintRequest
from app.games.battleship_ai import BattleshipLogic

router = APIRouter(prefix="/api/battleship", tags=["Battleship"])
logic = BattleshipLogic()

@router.post("/hint")
async def get_hint(request: HintRequest):
    """Returns a logical hint for the player"""
    return logic.get_logical_hint(request.state.board, request.state.ships_remaining)

@router.get("/ai-move") # Simplified for this example
async def get_move():
    return {"row": 0, "col": 0}