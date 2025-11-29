import random
from typing import List, Tuple

class BattleshipAI:
    def __init__(self):
        self.board_size = 10
        self.ships = [5, 4, 3, 3, 2] 
        
    def get_best_move(self, board_state: List[List[int]], difficulty: str = "hard") -> Tuple[int, int]:
        """
        Determines move based on difficulty.
        0=Unknown, 1=Miss, 2=Hit, 3=Sunk
        """
        # 1. Check for 'Target Mode' (unfinished hits)
        # Even Medium AI should know how to finish a kill
        hits = []
        for r in range(self.board_size):
            for c in range(self.board_size):
                if board_state[r][c] == 2: # Hit but not sunk
                    hits.append((r, c))
        
        # Target Mode (Used by Medium and Hard)
        if hits and difficulty != 'easy':
            return self._target_mode(board_state, hits)
        
        # 2. Hunt Mode (The difference in difficulty)
        if difficulty == 'easy':
            return self._random_hunt(board_state)
        elif difficulty == 'medium':
            return self._random_hunt(board_state) # Medium hunts randomly but targets smartly
        else:
            return self._heatmap_hunt(board_state) # Hard uses math

    def _random_hunt(self, board) -> Tuple[int, int]:
        """Just pick a random valid spot"""
        empties = [(r, c) for r in range(10) for c in range(10) if board[r][c] == 0]
        if not empties: return (0,0)
        return random.choice(empties)

    def _target_mode(self, board, hits) -> Tuple[int, int]:
        """Smart targeting for damaged ships"""
        candidates = []
        for r, c in hits:
            neighbors = [(r-1, c), (r+1, c), (r, c-1), (r, c+1)]
            for nr, nc in neighbors:
                if 0 <= nr < self.board_size and 0 <= nc < self.board_size:
                    if board[nr][nc] == 0:
                        candidates.append((nr, nc))
                        
        if len(hits) >= 2:
            hits.sort()
            if hits[0][1] == hits[1][1]: # Vertical
                top_r, col = hits[0]
                bot_r, _ = hits[-1]
                priority = []
                if top_r > 0 and board[top_r-1][col] == 0: priority.append((top_r-1, col))
                if bot_r < 9 and board[bot_r+1][col] == 0: priority.append((bot_r+1, col))
                if priority: return random.choice(priority)
            if hits[0][0] == hits[1][0]: # Horizontal
                row, left_c = hits[0]
                _, right_c = hits[-1]
                priority = []
                if left_c > 0 and board[row][left_c-1] == 0: priority.append((row, left_c-1))
                if right_c < 9 and board[row][right_c+1] == 0: priority.append((row, right_c+1))
                if priority: return random.choice(priority)

        return random.choice(candidates) if candidates else self._random_hunt(board)

    def _heatmap_hunt(self, board) -> Tuple[int, int]:
        """Probability Density Search (Hard Mode)"""
        probability_grid = [[0]*10 for _ in range(10)]
        
        for ship_len in self.ships:
            # Horizontal
            for r in range(10):
                for c in range(10 - ship_len + 1):
                    valid = True
                    for i in range(ship_len):
                        if board[r][c+i] in [1, 3]: valid = False; break
                    if valid:
                        for i in range(ship_len):
                            if board[r][c+i] == 0: probability_grid[r][c+i] += 1
            # Vertical
            for r in range(10 - ship_len + 1):
                for c in range(10):
                    valid = True
                    for i in range(ship_len):
                        if board[r+i][c] in [1, 3]: valid = False; break
                    if valid:
                        for i in range(ship_len):
                            if board[r+i][c] == 0: probability_grid[r+i][c] += 1

        best_score = -1
        best_move = None
        
        for r in range(10):
            for c in range(10):
                if board[r][c] == 0:
                    score = probability_grid[r][c]
                    if (r + c) % 2 == 0: score += 5 # Parity
                    score += random.randint(0, 2) # Noise
                    
                    if score > best_score:
                        best_score = score
                        best_move = (r, c)
        
        return best_move or self._random_hunt(board)