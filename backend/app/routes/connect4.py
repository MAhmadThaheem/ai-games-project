from fastapi import APIRouter, HTTPException
from app.models.connect4_models import Connect4Game, Connect4Move, Connect4Player, Connect4GameStatus, Connect4Difficulty
from app.games.connect4_ai import Connect4AI
from app.games.connect4_logic import Connect4GameLogic
from app.database import get_collection
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/connect4", tags=["Connect 4"])

def safe_object_id(id_str: str):
    """Safely handle ObjectId conversion for both real and mock databases"""
    try:
        return ObjectId(id_str)
    except:
        return id_str

@router.post("/new-game")
async def create_new_game(difficulty: Connect4Difficulty = Connect4Difficulty.MEDIUM):
    """Create a new Connect 4 game"""
    collection = get_collection("connect4_games")
    
    new_game = Connect4Game(difficulty=difficulty)
    game_dict = new_game.dict()
    
    result = await collection.insert_one(game_dict)
    
    return {
        "game_id": str(result.inserted_id),
        "board": new_game.board,
        "current_player": new_game.current_player,
        "status": new_game.status,
        "difficulty": new_game.difficulty
    }

@router.post("/{game_id}/move")
async def make_move(game_id: str, move: Connect4Move):
    """Make a move in the Connect 4 game"""
    collection = get_collection("connect4_games")
    
    # Get the game
    game_data = await collection.find_one({"_id": safe_object_id(game_id)})
    if not game_data:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = Connect4Game(**game_data)
    
    # Validate move
    if game.status != Connect4GameStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Game is already over")
    
    if move.player != game.current_player:
        raise HTTPException(status_code=400, detail="Not your turn")
    
    # Validate the move using game logic
    game_logic = Connect4GameLogic(game.board)
    legal_moves = game_logic.get_legal_moves()
    
    if move.column not in legal_moves:
        raise HTTPException(status_code=400, detail="Invalid move - column is full")
    
    # Make the move
    row = game_logic.drop_piece(move.column, move.player.value)
    if row is None:
        raise HTTPException(status_code=400, detail="Invalid move")
    
    # Check for winner
    winner = game_logic.check_winner(row, move.column)
    if winner:
        game.status = Connect4GameStatus.RED_WON if winner == 'red' else Connect4GameStatus.YELLOW_WON
    elif game_logic.is_board_full():
        game.status = Connect4GameStatus.DRAW
    else:
        game.status = Connect4GameStatus.IN_PROGRESS
    
    # Update game state
    game.board = game_logic.board
    game.moves.append(move)
    
    # Switch player if game is still in progress
    if game.status == Connect4GameStatus.IN_PROGRESS:
        game.current_player = Connect4Player.YELLOW if game.current_player == Connect4Player.RED else Connect4Player.RED
    
    # Update game in database
    await collection.update_one(
        {"_id": safe_object_id(game_id)},
        {
            "$set": {
                "board": game.board,
                "current_player": game.current_player,
                "status": game.status,
                "moves": [move.dict() for move in game.moves],
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # If game is still in progress and it's AI's turn, make AI move
    if game.status == Connect4GameStatus.IN_PROGRESS and game.current_player == Connect4Player.YELLOW:
        ai = Connect4AI(game.difficulty.value)
        ai_column = ai.get_best_move(game.board, 'yellow')
        
        # Make AI move
        ai_logic = Connect4GameLogic(game.board)
        ai_row = ai_logic.drop_piece(ai_column, 'yellow')
        
        if ai_row is not None:
            ai_move = Connect4Move(column=ai_column, player=Connect4Player.YELLOW)
            
            # Check for winner after AI move
            winner = ai_logic.check_winner(ai_row, ai_column)
            if winner:
                game.status = Connect4GameStatus.RED_WON if winner == 'red' else Connect4GameStatus.YELLOW_WON
            elif ai_logic.is_board_full():
                game.status = Connect4GameStatus.DRAW
            else:
                game.status = Connect4GameStatus.IN_PROGRESS
            
            # Update game state
            game.board = ai_logic.board
            game.moves.append(ai_move)
            
            # Switch back to human player if game continues
            if game.status == Connect4GameStatus.IN_PROGRESS:
                game.current_player = Connect4Player.RED
            
            # Update with AI move
            await collection.update_one(
                {"_id": safe_object_id(game_id)},
                {
                    "$set": {
                        "board": game.board,
                        "current_player": game.current_player,
                        "status": game.status,
                        "moves": [move.dict() for move in game.moves],
                        "updated_at": datetime.utcnow()
                    }
                }
            )
    
    return {
        "board": game.board,
        "current_player": game.current_player,
        "status": game.status,
        "last_move": move.dict(),
        "difficulty": game.difficulty
    }

@router.get("/{game_id}")
async def get_game_state(game_id: str):
    """Get current game state"""
    collection = get_collection("connect4_games")
    
    game_data = await collection.find_one({"_id": safe_object_id(game_id)})
    if not game_data:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return Connect4Game(**game_data)

@router.get("/{game_id}/legal-moves")
async def get_legal_moves(game_id: str):
    """Get all legal moves for the current player"""
    collection = get_collection("connect4_games")
    
    game_data = await collection.find_one({"_id": safe_object_id(game_id)})
    if not game_data:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = Connect4Game(**game_data)
    game_logic = Connect4GameLogic(game.board)
    
    return {"legal_moves": game_logic.get_legal_moves()}