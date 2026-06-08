<div align="center">


<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.121-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5--Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

<br/>

> **A full-stack AI-powered gaming platform** where every opponent is a real artificial intelligence — running Minimax, Alpha-Beta Pruning, A\* Pathfinding, FSMs, and Probability Density Search algorithms on a live FastAPI + MongoDB backend.

<br/>

[🚀 Live Demo](https://ai-games-project.vercel.app/)

</div>

---

## 📌 Table of Contents

- [✨ Overview](#-overview)
- [🎮 Games Collection](#-games-collection)
- [🧠 AI Algorithms Deep Dive](#-ai-algorithms-deep-dive)
- [🏗️ Architecture](#-architecture)
- [📁 Project Structure](#-project-structure)
- [🛠️ Tech Stack](#-tech-stack)
- [⚙️ Setup & Installation](#-setup--installation)
- [🌐 API Reference](#-api-reference)
- [🔐 Authentication System](#-authentication-system)
- [🤖 Nexus — The AI Chatbot](#-nexus--the-ai-chatbot)
- [🗄️ Database Design](#-database-design)
- [📦 Environment Variables](#-environment-variables)

---

## ✨ Overview

**AI Games Hub** is not your ordinary browser games site. It's a learning platform disguised as a gaming arcade. Every game you play pits you against a purpose-built artificial intelligence engine — the same kinds of algorithms used in research, robotics, and competitive AI.

The project is built with a **clean separation of concerns**:

- 🐍 **Backend** — FastAPI + Python handles all AI computation, game logic validation, user management, and database operations.
- ⚛️ **Frontend** — React + Vite delivers a rich, responsive, animated UI with real-time board state management.
- 🍃 **Database** — MongoDB Atlas persists user accounts, game histories, and the Chess AI's learning memory.
- 🤖 **AI Chatbot** — Google Gemini 2.5 Flash powers "Nexus", the platform's context-aware assistant.

---

## 🎮 Games Collection

| Game | Difficulty Levels | AI Algorithm | Players |
|------|------------------|--------------|---------|
| ♟️ **Chess** | Easy / Medium / Hard | Minimax + Alpha-Beta Pruning + Quiescence Search + MongoDB Memory | 1 vs AI |
| ⭕ **Tic-Tac-Toe** | Standard | Perfect Minimax (Unbeatable) | 1 vs AI |
| 🔴 **Connect 4** | Easy / Medium / Hard | Minimax + Alpha-Beta Pruning + Move Ordering | 1 vs AI |
| 👑 **Checkers** | Easy / Medium / Hard | Minimax + Alpha-Beta Pruning + Positional Evaluation | 1 vs AI |
| 💣 **Battleship** | Easy / Medium / Hard | Probability Density Heatmap + Target Mode | 1 vs AI |
| 👻 **Pacman** | Dynamic | A\* Pathfinding + Ghost Personality FSM | 1 Player |
| 🐭 **Maze Runner** | Dynamic | A\* Pathfinding + Weighted Terrain Costs | 1 Player |

---

## 🧠 AI Algorithms Deep Dive

### ♟️ Chess AI — The Most Advanced Engine

The Chess AI has **three distinct personality layers**:

#### 🟢 Easy Mode
- Prefers capturing moves with a favorable **value exchange ratio**
- Centers pieces on the board
- Checks for immediate check opportunities
- Uses random fallback to feel "human"

#### 🟡 Medium Mode
- Full **Minimax search at depth 2**
- Alpha-Beta Pruning for efficiency
- Shuffled move ordering for unpredictability

#### 🔴 Hard Mode
- **Minimax at depth 3** with intelligent **move ordering** (captures first, checks second)
- **Quiescence Search** — avoids the "horizon effect" by continuing to search capture chains past the depth limit
- **MongoDB AI Memory** — after losing, the AI replays the game, identifies the fatal move, and permanently marks it as "bad" in the database. It will never make the same mistake in the same position again.
- Position evaluation includes:
  - **Material score** (piece values: P=1, N=3, B=3.25, R=5, Q=9, K=100)
  - **Positional weights** (piece-square tables for pawns, knights, kings)
  - **Pawn structure** (doubled pawns, isolated pawns penalties)
  - **King safety** (check detection)

```python
# The AI literally learns from its losses
def learn_from_loss(self, move_history):
    # Replays the game, finds the last AI move
    # Stores it in MongoDB as a "bad move" for that board state
    self.memory.mark_bad_move(temp_logic.board, last_ai_move_str)
```

---

### 🔴 Connect 4 AI

| Mode | Algorithm | Depth |
|------|-----------|-------|
| Easy | Immediate win/block detection + center preference | 1 |
| Medium | Minimax + Alpha-Beta | 3 |
| Hard | Minimax + Alpha-Beta + Move Ordering | 5 |

Move ordering scores: wins (+100), blocks (+50), center columns (+1 to +3). This dramatically improves pruning efficiency.

---

### 💣 Battleship AI

The Battleship AI uses a **two-phase strategy**:

**Hunt Mode (No active hits):**
- Easy/Medium → Random hunt
- Hard → **Probability Density Heatmap**: simulates every possible remaining ship placement, calculates which cells have the highest overlap probability, applies **parity optimization** (checkerboard pattern — smaller ships can't hide on non-parity squares)

**Target Mode (Active hits exist):**
- Analyzes existing hit pattern
- If 2+ hits exist in a line → prioritizes extending the line (vertical or horizontal)
- Eliminates wasted shots

---

### 👻 Pacman — Ghost Personality AI (FSM + A\*)

Each ghost has a unique behavior powered by A\* Pathfinding with **Finite State Machine personalities**:

| Ghost | Personality | Behavior |
|-------|-------------|----------|
| 🔴 Blinky | Aggressive | Direct A\* chase toward Pacman |
| 🩷 Pinky | Ambusher | Targets position ahead of Pacman |
| 🟠 Clyde | Coward | Chases when far (dist ≥ 5), flees to corner when close |
| 🔵 Inky | Unpredictable | 30% random movement, 70% A\* chase |

The A\* implementation uses **Manhattan Distance** as the heuristic with a 200-iteration safety cap to prevent infinite loops on disconnected grids.

---

### 🐭 Maze Runner — Weighted A\*

The maze uses **terrain-cost A\*** where different cell types have different traversal costs:

```python
def get_cost(self, cell_type):
    if cell_type == "mud":   return 5   # Slows the cat down
    if cell_type == "wall":  return 999  # Impassable
    return 1                             # Normal path
```

This means the AI cat navigates around mud when possible, creating more natural and interesting chase sequences.

---

### ⭕ Tic-Tac-Toe — Perfect Minimax

The Minimax implementation is **provably optimal** — it will never lose. It scores moves as:
- Win at depth d → `10 - d` (prefers faster wins)
- Loss at depth d → `d - 10` (delays losses)
- Draw → `0`

This depth-adjusted scoring ensures the AI always picks the fastest path to victory.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  React 18 + Vite + TailwindCSS + React Router v7           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Games   │ │  Auth    │ │  Admin   │ │ Nexus Chatbot│  │
│  │  (7 JSX) │ │ Context  │ │Dashboard │ │   (Gemini)   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP (Axios) / REST API
┌─────────────────────▼───────────────────────────────────────┐
│                        SERVER                               │
│              FastAPI 0.121 + Uvicorn + Python               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Routes Layer                       │   │
│  │  /api/chess  /api/connect4  /api/tictactoe           │   │
│  │  /api/checkers  /api/battleship  /api/pacman         │   │
│  │  /api/maze  /api/auth  /api/chatbot                  │   │
│  └──────────────────┬───────────────────────────────────┘   │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │                   AI Game Engines                     │   │
│  │  ChessAI  Connect4AI  CheckersAI  TicTacToeAI        │   │
│  │  BattleshipAI  PacmanAI  MazeAI                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ Motor (async) + PyMongo (sync)
┌─────────────────────▼───────────────────────────────────────┐
│                    MongoDB Atlas                            │
│   Collections: users │ chess_learning_memory               │
└─────────────────────────────────────────────────────────────┘
                      │
              Google Gemini 2.5 Flash API
              (Nexus Chatbot via google-generativeai)
```

---

## 📁 Project Structure

```
ai-games-project/
│
├── 📂 backend/
│   ├── main.py                    # FastAPI app entry point, CORS, router registration
│   ├── requirements.txt           # All Python dependencies (pinned versions)
│   ├── .env                       # 🔑 Secret keys (not committed)
│   │
│   └── 📂 app/
│       ├── database.py            # MongoDB connection (Motor async client)
│       │
│       ├── 📂 games/              # 🧠 Pure AI logic — no HTTP, no side effects
│       │   ├── chess_ai.py        # Minimax + Alpha-Beta + Quiescence + MongoDB Memory
│       │   ├── chess_logic.py     # Full chess rules engine (legal moves, check, checkmate)
│       │   ├── connect4_ai.py     # Minimax + Alpha-Beta + Move Ordering (depth 5)
│       │   ├── connect4_logic.py  # Connect 4 board logic
│       │   ├── checkers_ai.py     # Minimax + Alpha-Beta + Positional Eval
│       │   ├── checkers_logic.py  # Checkers rules (jumps, kings, multi-capture)
│       │   ├── tic_tac_toe_ai.py  # Perfect Minimax
│       │   ├── battleship_ai.py   # Heatmap Hunt + Target Mode
│       │   ├── pacman_ai.py       # A* + Ghost Personality FSM
│       │   └── maze_ai.py         # Weighted A* Pathfinding
│       │
│       ├── 📂 routes/             # FastAPI routers (one per game + auth + chatbot)
│       │   ├── auth.py            # Register, Login (JWT), /me, Admin endpoints
│       │   ├── chess.py           # Chess game state management
│       │   ├── connect4.py        # Connect 4 endpoints
│       │   ├── checkers.py        # Checkers endpoints
│       │   ├── tictactoe.py       # Tic-Tac-Toe endpoints
│       │   ├── battleship.py      # Battleship endpoints
│       │   ├── pacman.py          # Pacman AI move endpoint
│       │   ├── maze.py            # Maze solver endpoint
│       │   └── chatbot.py         # Nexus chatbot endpoint
│       │
│       ├── 📂 models/             # Pydantic request/response models
│       │   ├── user_models.py     # UserCreate, UserInDB, UserResponse, Token
│       │   ├── chess_models.py    # Board state, move request/response
│       │   ├── connect4_models.py
│       │   ├── checkers_models.py
│       │   ├── game_models.py     # Shared enums (Player, GameStatus)
│       │   ├── battleship_models.py
│       │   ├── maze_models.py
│       │   └── pacman_models.py
│       │
│       ├── 📂 services/
│       │   └── chatbot_service.py # Gemini 2.5 Flash integration
│       │
│       ├── 📂 utils/
│       │   └── security.py        # bcrypt hashing, JWT creation/verification
│       │
│       └── 📂 data/
│           └── knowledge_base.txt # Nexus chatbot system prompt (hot-reloaded)
│
└── 📂 frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    │
    └── 📂 src/
        ├── App.jsx                # Root — React Router, auth guard, chatbot
        ├── main.jsx
        │
        ├── 📂 pages/
        │   ├── Login.jsx          # Login form with JWT auth
        │   ├── Register.jsx       # Registration with auto-login
        │   ├── AboutUs.jsx        # Team/project info page
        │   └── AdminDashboard.jsx # Admin-only user management view
        │
        ├── 📂 components/
        │   ├── MainMenu.jsx       # Landing page / home screen
        │   ├── FeaturedGames.jsx  # Game selection dashboard (protected)
        │   ├── Hero.jsx           # Hero section component
        │   ├── ProtectedRoute.jsx # Auth guard HOC (+ admin check)
        │   │
        │   ├── 📂 common/
        │   │   ├── Navbar.jsx     # Responsive navigation bar
        │   │   ├── Chatbot.jsx    # Nexus floating chatbot UI
        │   │   └── BackButton.jsx # Universal back navigation
        │   │
        │   └── 📂 games/          # One component per game
        │       ├── Chess.jsx
        │       ├── Connect4.jsx
        │       ├── Checkers.jsx
        │       ├── TicTacToe.jsx
        │       ├── Battleship.jsx
        │       ├── MazeRunner.jsx
        │       └── Pacman.jsx
        │
        ├── 📂 context/
        │   ├── AuthContext.jsx    # Global auth state (JWT + user info)
        │   └── AudioContext.jsx   # Global audio/music state
        │
        ├── 📂 hooks/              # Custom React hooks
        └── 📂 utils/              # Frontend utility functions
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | 0.121 | REST API framework, auto OpenAPI docs |
| **Uvicorn** | 0.38 | ASGI server |
| **Motor** | 3.7 | Async MongoDB driver |
| **PyMongo** | 4.15 | Sync MongoDB (Chess AI memory) |
| **Pydantic** | 2.12 | Request/response validation |
| **python-jose** | 3.5 | JWT token creation & verification |
| **passlib[bcrypt]** | 1.7 | Password hashing |
| **google-generativeai** | 0.8.5 | Gemini 2.5 Flash (Nexus chatbot) |
| **python-dotenv** | 1.2 | Environment variable management |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3 | UI library |
| **Vite** | 7.x | Build tool + dev server |
| **React Router** | 7.9 | Client-side routing |
| **TailwindCSS** | 3.4 | Utility-first styling |
| **Axios** | 1.13 | HTTP client |
| **Lucide React** | 0.553 | Icon library |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Cloud database (users + chess memory) |
| **Render.com** | Backend deployment |
| **Google Gemini API** | AI chatbot |

---

## ⚙️ Setup & Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Gemini API Key

---

### 1. Clone the Repository

```bash
git clone https://github.com/MAhmadThaheem/ai-games-project.git
cd ai-games-project
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux

# Install all dependencies
pip install -r requirements.txt

# Create your environment file
copy .env.example .env      # Windows
# cp .env.example .env      # Mac/Linux
```

Edit `.env` with your credentials (see [Environment Variables](#-environment-variables)).

```bash
# Start the backend server
python main.py
# OR
uvicorn main:app --reload --port 8000
```

Backend will be live at: **http://localhost:8000**  
API Docs (Swagger): **http://localhost:8000/docs**

---

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create your environment file
copy .env.example .env      # Windows

# Start the dev server
npm run dev
```

Frontend will be live at: **http://localhost:5173**

---

## 🌐 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login, get JWT token |
| `GET` | `/api/auth/me` | ✅ Bearer | Get current user profile |
| `GET` | `/api/auth/admin/users` | ✅ Admin | Get all users list |

### Games

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chess/move` | Make a chess move, get AI response |
| `POST` | `/api/chess/new-game` | Start a new chess game |
| `POST` | `/api/chess/learn-from-loss` | Trigger AI learning after player wins |
| `POST` | `/api/connect4/move` | Make a Connect 4 move |
| `POST` | `/api/tictactoe/move` | Make a Tic-Tac-Toe move |
| `POST` | `/api/checkers/move` | Make a Checkers move |
| `POST` | `/api/battleship/move` | Request AI Battleship shot |
| `POST` | `/api/pacman/move` | Get next ghost AI move |
| `POST` | `/api/maze/solve` | Solve maze from start to target |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API health check |
| `GET` | `/health` | Service status |
| `GET` | `/api/games` | List all available games |
| `POST` | `/api/chatbot/chat` | Chat with Nexus AI assistant |

---

## 🔐 Authentication System

The platform uses **JWT (JSON Web Tokens)** for stateless authentication.

```
User registers → Password hashed with bcrypt
User logs in → JWT token issued (stored in localStorage)
Protected requests → Token sent as "Authorization: Bearer <token>"
Backend validates → jose library decodes JWT, checks MongoDB user
```

**Special Rules:**
- 🥇 The **very first user** to register automatically becomes `admin`
- All other users register as `player`
- Admin users can access `/admin` dashboard and `/api/auth/admin/users`
- All game routes are **protected** — you must be logged in to play

**Frontend Guard:**
```jsx
// ProtectedRoute.jsx
<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />
</ProtectedRoute>
```

---

## 🤖 Nexus — The AI Chatbot

**Nexus** is the platform's built-in AI assistant, powered by **Google Gemini 2.5 Flash**.

**Key Features:**
- Context-aware responses about the platform, games, and AI concepts
- Knowledge base loaded from `backend/app/data/knowledge_base.txt`
- **Hot-reloaded** — edit the knowledge base file without restarting the server
- Graceful fallback if API key is missing or Gemini is unreachable
- Floating UI component accessible from any page

**How it works:**
```
User message → chatbot_service.py
  → Loads knowledge_base.txt (every request, for live updates)
  → Creates Gemini model with system instruction
  → Sends user message → Returns response
```

---

## 🗄️ Database Design

### Collection: `users`
```json
{
  "_id": "ObjectId",
  "username": "string (unique)",
  "email": "string",
  "hashed_password": "string (bcrypt)",
  "role": "admin | player",
  "points": "number",
  "stars": "number"
}
```

### Collection: `chess_learning_memory`
```json
{
  "state": "string (serialized board)",
  "bad_moves": ["e2e4", "d7d5", ...]
}
```

The Chess AI queries this collection before choosing its move in Hard mode. Any move in the `bad_moves` array for the current board state is filtered out. This makes the Hard AI **genuinely adaptive** — it improves with every game it loses.

---

## 📦 Environment Variables

### Backend (`backend/.env`)

```env
# MongoDB
MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/
DATABASE_NAME=ai_games_db

# JWT Security
SECRET_KEY=your-super-secret-key-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Google Gemini (for Nexus chatbot)
GEMINI_API_KEY=your-gemini-api-key-from-google-ai-studio
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
```

> ⚠️ **Never commit your `.env` files.** Both `.gitignore` files already exclude them.

---

## 🎯 Key Design Decisions

1. **AI lives on the backend** — No game logic or AI runs in the browser. This prevents cheating and keeps the frontend thin and fast.

2. **Stateless API** — Each API call contains full game state. No server-side sessions. This makes the backend horizontally scalable.

3. **MongoDB for Chess Memory** — The AI's "brain" (bad move database) persists across sessions. Each new game contributes to collective learning.

4. **Gemini Knowledge Base hot-reload** — The chatbot's personality can be changed without a server restart by editing a plain text file. Great for rapid iteration.

5. **First-user-is-admin pattern** — Simple zero-config admin setup for development and small deployments.

---

<div align="center">

**Built with ❤️ and a lot of Python recursion**

*"The best way to learn AI is to play against it."*

</div>
