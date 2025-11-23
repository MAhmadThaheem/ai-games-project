from fastapi import APIRouter, HTTPException
from app.games.checkers_logic import CheckersGameLogic
from app.games.checkers_ai import CheckersAI
# app/routes/checkers.py
from app.models.checkers_models import GameState, CheckersMove, CheckersGame

router = APIRouter()

# Store active games (in production, use database)
active_games = {}

@router.post("/checkers/new")
async def new_checkers_game(difficulty: str = "medium"):
    """Start a new checkers game"""
    game_id = str(len(active_games) + 1)
    game_logic = CheckersGameLogic()
    ai = CheckersAI(difficulty)
    
    active_games[game_id] = {
        'logic': game_logic,
        'ai': ai,
        'difficulty': difficulty
    }
    
    return {
        "game_id": game_id,
        "board": game_logic.board,
        "current_player": game_logic.current_player,
        "message": "New checkers game started"
    }

@router.post("/checkers/{game_id}/move")
async def make_checkers_move(game_id: str, from_row: int, from_col: int, to_row: int, to_col: int):
    """Make a move in checkers"""
    if game_id not in active_games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game_data = active_games[game_id]
    game_logic = game_data['logic']
    
    # Validate move
    if game_logic.current_player != 'red':  # Only human (red) can move directly
        raise HTTPException(status_code=400, detail="Not your turn")
    
    # Make the move
    success = game_logic.make_move(from_row, from_col, to_row, to_col)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid move")
    
    response = {
        "move_made": True,
        "board": game_logic.board,
        "current_player": game_logic.current_player,
        "game_over": game_logic.is_game_over(),
        "winner": game_logic.get_winner()
    }
    
    # If game continues and it's AI's turn, make AI move
    if not game_logic.is_game_over() and game_logic.current_player == 'white':
        ai_move = await make_ai_move(game_id)
        response['ai_move'] = ai_move
    
    return response

async def make_ai_move(game_id: str):
    """Make AI move"""
    game_data = active_games[game_id]
    game_logic = game_data['logic']
    ai = game_data['ai']
    
    # Get AI move
    ai_move = ai.get_best_move(game_logic.board, 'white')
    
    if ai_move:
        # Make the AI move
        game_logic.make_move(
            ai_move['from_row'], ai_move['from_col'],
            ai_move['to_row'], ai_move['to_col']
        )
    
    return {
        "from_row": ai_move['from_row'],
        "from_col": ai_move['from_col'],
        "to_row": ai_move['to_row'],
        "to_col": ai_move['to_col'],
        "capture": ai_move.get('capture', False),
        "board": game_logic.board,
        "current_player": game_logic.current_player,
        "game_over": game_logic.is_game_over(),
        "winner": game_logic.get_winner()
    }

@router.get("/checkers/{game_id}")
async def get_checkers_game_state(game_id: str):
    """Get current game state"""
    if game_id not in active_games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game_logic = active_games[game_id]['logic']
    
    return {
        "board": game_logic.board,
        "current_player": game_logic.current_player,
        "game_over": game_logic.is_game_over(),
        "winner": game_logic.get_winner()
    }

@router.delete("/checkers/{game_id}")
async def delete_checkers_game(game_id: str):
    """Delete a checkers game"""
    if game_id in active_games:
        del active_games[game_id]
        return {"message": "Game deleted"}
    
    raise HTTPException(status_code=404, detail="Game not found")