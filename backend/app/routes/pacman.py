from fastapi import APIRouter, HTTPException
from app.models.pacman_models import GhostMoveRequest, MoveResponse
from app.games.pacman_ai import PacmanAI

router = APIRouter(prefix="/api/pacman", tags=["Pacman"])
ai_engine = PacmanAI()

@router.post("/ghost-move", response_model=MoveResponse)
async def get_ghost_move(request: GhostMoveRequest):
    """
    Frontend sends the grid and positions.
    Backend calculates the best move using A* Search.
    """
    try:
        game_state = request.game_state
        ghost_type = request.ghost_type
        
        # Extract data from Pydantic models
        grid = game_state.grid
        pacman_pos = (game_state.pacman.x, game_state.pacman.y)
        
        # Get specific ghost data
        if ghost_type not in game_state.ghosts:
            # Fallback if ghost died/not spawned
            return MoveResponse(direction="IDLE", target_pos=(0,0))
            
        ghost_data = game_state.ghosts[ghost_type]
        ghost_pos = (ghost_data.x, ghost_data.y)

        # AI CALCULATION
        next_move = ai_engine.get_next_move(grid, ghost_pos, pacman_pos, ghost_type)
        
        return MoveResponse(
            direction=next_move,
            target_pos=pacman_pos # Just for debug visualization
        )

    except Exception as e:
        print(f"Error in Pacman AI: {e}")
        return MoveResponse(direction="IDLE", target_pos=(0,0))