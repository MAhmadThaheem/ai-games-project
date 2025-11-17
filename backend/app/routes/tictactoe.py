from fastapi import APIRouter, HTTPException
from app.models.game_models import TicTacToeGame, TicTacToeMove, Player, GameStatus
from app.games.tic_tac_toe_ai import TicTacToeAI
from app.database import get_collection
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/tictactoe", tags=["Tic Tac Toe"])

@router.post("/new-game")
async def create_new_game():
    """Create a new Tic Tac Toe game"""
    collection = get_collection("tictactoe_games")
    
    new_game = TicTacToeGame()
    game_dict = new_game.dict()
    game_dict["_id"] = ObjectId()
    
    result = await collection.insert_one(game_dict)
    
    return {
        "game_id": str(result.inserted_id),
        "board": new_game.board,
        "current_player": new_game.current_player,
        "status": new_game.status
    }

@router.post("/{game_id}/move")
async def make_move(game_id: str, move: TicTacToeMove):
    """Make a move in the Tic Tac Toe game"""
    collection = get_collection("tictactoe_games")
    
    # Get the game
    game_data = await collection.find_one({"_id": ObjectId(game_id)})
    if not game_data:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = TicTacToeGame(**game_data)
    
    # Validate move
    if game.status != GameStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Game is already over")
    
    if game.board[move.row][move.col] is not None:
        raise HTTPException(status_code=400, detail="Cell already occupied")
    
    if move.player != game.current_player:
        raise HTTPException(status_code=400, detail="Not your turn")
    
    # Make player move
    game.board[move.row][move.col] = move.player
    game.moves.append(move)
    
    # Check game status
    winner = check_winner(game.board)
    if winner:
        game.status = GameStatus.X_WON if winner == Player.X else GameStatus.O_WON
    elif is_board_full(game.board):
        game.status = GameStatus.DRAW
    else:
        game.current_player = Player.O if game.current_player == Player.X else Player.X
    
    # Update game in database
    await collection.update_one(
        {"_id": ObjectId(game_id)},
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
    if game.status == GameStatus.IN_PROGRESS and game.current_player == Player.O:
        ai = TicTacToeAI(Player.O)
        ai_row, ai_col = ai.get_best_move(game.board)
        
        ai_move = TicTacToeMove(row=ai_row, col=ai_col, player=Player.O)
        game.board[ai_row][ai_col] = Player.O
        game.moves.append(ai_move)
        
        # Check game status after AI move
        winner = check_winner(game.board)
        if winner:
            game.status = GameStatus.X_WON if winner == Player.X else GameStatus.O_WON
        elif is_board_full(game.board):
            game.status = GameStatus.DRAW
        else:
            game.current_player = Player.X
        
        # Update with AI move
        await collection.update_one(
            {"_id": ObjectId(game_id)},
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
        "last_move": move.dict()
    }

@router.get("/{game_id}")
async def get_game_state(game_id: str):
    """Get current game state"""
    collection = get_collection("tictactoe_games")
    
    game_data = await collection.find_one({"_id": ObjectId(game_id)})
    if not game_data:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return TicTacToeGame(**game_data)

def check_winner(board):
    """Check for winner"""
    # Check rows and columns
    for i in range(3):
        if board[i][0] == board[i][1] == board[i][2] and board[i][0] is not None:
            return board[i][0]
        if board[0][i] == board[1][i] == board[2][i] and board[0][i] is not None:
            return board[0][i]
    
    # Check diagonals
    if board[0][0] == board[1][1] == board[2][2] and board[0][0] is not None:
        return board[0][0]
    if board[0][2] == board[1][1] == board[2][0] and board[0][2] is not None:
        return board[0][2]
    
    return None

def is_board_full(board):
    """Check if board is full"""
    for row in board:
        for cell in row:
            if cell is None:
                return False
    return True