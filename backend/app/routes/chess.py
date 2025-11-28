from fastapi import APIRouter, HTTPException
from app.models.chess_models import ChessGame, ChessMove, ChessPlayer, GameStatus, ChessDifficulty
from app.games.chess_ai import ChessAI
from app.games.chess_logic import ChessGameLogic
from app.database import get_collection
from bson import ObjectId
from datetime import datetime
import json

router = APIRouter(prefix="/api/chess", tags=["Chess"])

@router.post("/new-game")
async def create_new_game(difficulty: ChessDifficulty = ChessDifficulty.MEDIUM):
    """Create a new chess game"""
    collection = get_collection("chess_games")
    
    new_game = ChessGame(difficulty=difficulty)
    game_dict = new_game.dict()
    game_dict["_id"] = ObjectId()
    
    result = await collection.insert_one(game_dict)
    
    return {
        "game_id": str(result.inserted_id),
        "board": new_game.board,
        "current_player": new_game.current_player,
        "status": new_game.status,
        "difficulty": new_game.difficulty
    }

@router.post("/{game_id}/move")
async def make_move(game_id: str, move: ChessMove):
    """Make a move in the chess game"""
    collection = get_collection("chess_games")
    
    # Get the game
    game_data = await collection.find_one({"_id": ObjectId(game_id)})
    if not game_data:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = ChessGame(**game_data)
    
    # Validate move
    if game.status != GameStatus.IN_PROGRESS and game.status != GameStatus.CHECK:
        raise HTTPException(status_code=400, detail="Game is already over")
    
    if move.player != game.current_player:
        raise HTTPException(status_code=400, detail="Not your turn")
    
    # Validate the move using chess logic
    game_logic = ChessGameLogic(game.board)
    legal_moves = game_logic.get_legal_moves(move.player.value)
    
    move_valid = any(
        legal_move['from'] == move.from_square and legal_move['to'] == move.to_square
        for legal_move in legal_moves
    )
    
    if not move_valid:
        raise HTTPException(status_code=400, detail="Invalid move")
    
    # Make the move
    game_logic.make_move(move.from_square, move.to_square, move.promotion)
    game.board = game_logic.board
    
    # Update game state
    game.moves.append(move)
    game.move_history.append(f"{move.from_square}{move.to_square}")
    
    # Check game status for the OPPONENT
    opponent = ChessPlayer.BLACK if move.player == ChessPlayer.WHITE else ChessPlayer.WHITE
    
    if game_logic.is_checkmate(opponent.value):
        game.status = GameStatus.WHITE_WON if move.player == ChessPlayer.WHITE else GameStatus.BLACK_WON
        
        # ======================================================
        # 🔥 CRITICAL CHANGE: THIS TRIGGERS THE LEARNING 🔥
        # ======================================================
        if game.status == GameStatus.WHITE_WON:
            print("AI Lost! Triggering reinforcement learning...")
            ai = ChessAI(game.difficulty.value)
            ai.learn_from_loss(game.move_history)
        # ======================================================
            
    elif game_logic.is_stalemate(opponent.value):
        game.status = GameStatus.STALEMATE
    elif game_logic.is_check(opponent.value):
        game.status = GameStatus.CHECK
    else:
        game.status = GameStatus.IN_PROGRESS
        
    # Update game in database (Human move)
    await collection.update_one(
        {"_id": ObjectId(game_id)},
        {
            "$set": {
                "board": game.board,
                "current_player": opponent, 
                "status": game.status,
                "moves": [move.dict() for move in game.moves],
                "move_history": game.move_history,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Update local game object for AI processing
    game.current_player = opponent

    # If game is still in progress and it's AI's turn (Black), make AI move
    if (game.status == GameStatus.IN_PROGRESS or game.status == GameStatus.CHECK) and \
       game.current_player == ChessPlayer.BLACK:
        
        ai = ChessAI(game.difficulty.value)
        ai_move_data = ai.get_best_move(game.board, 'black')
        
        # 1. SAFETY CHECK: Did AI actually find a move?
        if ai_move_data and 'from' in ai_move_data and 'to' in ai_move_data:
            
            # 2. REFEREE CHECK: Is this move ACTUALLY legal?
            # We explicitly check if this move is in the list of legal moves
            ai_logic = ChessGameLogic(game.board)
            legal_ai_moves = ai_logic.get_legal_moves('black')
            
            is_legal = any(
                m['from'] == ai_move_data['from'] and m['to'] == ai_move_data['to'] 
                for m in legal_ai_moves
            )
            
            if is_legal:
                ai_move = ChessMove(
                    from_square=ai_move_data['from'],
                    to_square=ai_move_data['to'],
                    player=ChessPlayer.BLACK
                )
                
                # Make AI move
                ai_logic.make_move(ai_move.from_square, ai_move.to_square)
                game.board = ai_logic.board
                game.moves.append(ai_move)
                game.move_history.append(f"{ai_move.from_square}{ai_move.to_square}")
                
                # Check game status after AI move
                if ai_logic.is_checkmate('white'):
                    game.status = GameStatus.BLACK_WON
                elif ai_logic.is_stalemate('white'):
                    game.status = GameStatus.STALEMATE
                elif ai_logic.is_check('white'):
                    game.status = GameStatus.CHECK
                else:
                    game.status = GameStatus.IN_PROGRESS
                
                game.current_player = ChessPlayer.WHITE
            else:
                # AI returned a move, but it was ILLEGAL (The "Glitch")
                print("🚨 AI tried to play an illegal move! Forcing Loss.")
                game.status = GameStatus.WHITE_WON
                # Trigger learning for this crash
                ai.learn_from_loss(game.move_history)
        else:
            # AI returned NO move (It gave up/Checkmate)
            print("🏳️ AI has no moves left. You win!")
            game.status = GameStatus.WHITE_WON
            ai.learn_from_loss(game.move_history)

        # Update with AI move (or Game Over status)
        await collection.update_one(
            {"_id": ObjectId(game_id)},
            {
                "$set": {
                    "board": game.board,
                    "current_player": game.current_player,
                    "status": game.status,
                    "moves": [move.dict() for move in game.moves],
                    "move_history": game.move_history,
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
    collection = get_collection("chess_games")
    
    game_data = await collection.find_one({"_id": ObjectId(game_id)})
    if not game_data:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return ChessGame(**game_data)

@router.get("/{game_id}/legal-moves")
async def get_legal_moves(game_id: str, square: str):
    """Get legal moves for a piece at the given square"""
    collection = get_collection("chess_games")
    
    game_data = await collection.find_one({"_id": ObjectId(game_id)})
    if not game_data:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = ChessGame(**game_data)
    game_logic = ChessGameLogic(game.board)
    
    # Get the piece at the square
    row, col = game_logic.from_square(square)
    piece = game.board[row][col]
    
    if not piece:
        return {"legal_moves": []}
    
    # Check if it's the player's piece
    current_player_piece = (game.current_player == ChessPlayer.WHITE and piece.isupper()) or \
                          (game.current_player == ChessPlayer.BLACK and piece.islower())
    
    if not current_player_piece:
        return {"legal_moves": []}
    
    all_legal_moves = game_logic.get_legal_moves(game.current_player.value)
    
    moves_for_square = [
        move['to'] for move in all_legal_moves 
        if move['from'] == square
    ]
    
    return {"legal_moves": moves_for_square}