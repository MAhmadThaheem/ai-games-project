from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import tictactoe, connect4, chess
from app.database import connect_to_mongo, close_mongo_connection

app = FastAPI(
    title="AI Games API",
    description="Backend for AI-powered games collection",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Include routers
app.include_router(tictactoe.router)
app.include_router(chess.router)
app.include_router(connect4.router)
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
@app.get("/")
async def root():
    return {"message": "AI Games API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Games API"}

@app.get("/api/games")
async def get_games():
    return {
        "games": [
            {
                "id": 1,
                "name": "Maze Solver",
                "description": "AI pathfinding algorithms",
                "difficulty": "Easy",
                "players": 1200
            },
            {
                "id": 2,
                "name": "Tic-Tac-Toe AI",
                "description": "Minimax algorithm challenge",
                "difficulty": "Medium",
                "players": 2500
            },
            {
                "id": 3,
                "name": "Sudoku Solver",
                "description": "Backtracking algorithm",
                "difficulty": "Hard",
                "players": 1800
            },
            {
                "id": 4,
                "name": "Chess AI",
                "description": "Advanced chess engine",
                "difficulty": "Expert",
                "players": 3100
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)