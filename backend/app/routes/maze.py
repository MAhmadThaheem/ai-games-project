from fastapi import APIRouter
from app.models.maze_models import MazeMoveRequest
from app.games.maze_ai import MazeAI

router = APIRouter(prefix="/api/maze", tags=["Maze"])
ai = MazeAI()

@router.post("/next-move")
async def get_cat_move(request: MazeMoveRequest):
    """Calculates the next move for the AI Cat using A*"""
    result = ai.get_next_move(request.state.grid, request.state.cat_pos, request.state.mouse_pos)
    return result