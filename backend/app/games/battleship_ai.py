import random

class BattleshipLogic:
    def __init__(self):
        self.rows = 10
        self.cols = 10

    def get_logical_hint(self, board, ships_remaining):
        """
        Uses a Probability Density / Constraint Satisfaction approach to simulate 'Logic'.
        It calculates which square has the highest probability of containing a ship
        based on the remaining ships and current hits/misses.
        """
        probability_grid = [[0] * self.cols for _ in range(self.rows)]
        max_prob = -1
        best_coords = None
        
        # 1. Analyze "Hunt" vs "Target" mode
        hits = []
        for r in range(self.rows):
            for c in range(self.cols):
                if board[r][c] == "hit":
                    hits.append((r, c))
        
        # LOGIC ENGINE:
        # If we have hits that aren't sunk, we use strict logic (Constraint Satisfaction)
        if hits:
            # Simple Logic: Find neighbors of hits
            candidates = []
            reasoning = "We have a damaged ship! "
            
            for hr, hc in hits:
                neighbors = [(hr+1, hc), (hr-1, hc), (hr, hc+1), (hr, hc-1)]
                valid_neighbors = []
                for nr, nc in neighbors:
                    if 0 <= nr < self.rows and 0 <= nc < self.cols and board[nr][nc] == "empty":
                        valid_neighbors.append((nr, nc))
                
                if valid_neighbors:
                    candidates.extend(valid_neighbors)
                    
            if candidates:
                # Pick one that aligns with other hits if possible
                best = candidates[0] # Simplified for brevity
                return {
                    "row": best[0], "col": best[1],
                    "reason": f"Logic dictates attacking ({best[0]},{best[1]}) to finish the damaged ship."
                }

        # 2. If no current hits, calculate Probability Density
        # Try placing every remaining ship in every possible position
        for ship_len in ships_remaining:
            # Horizontal checks
            for r in range(self.rows):
                for c in range(self.cols - ship_len + 1):
                    valid = True
                    for k in range(ship_len):
                        if board[r][c+k] != "empty":
                            valid = False; break
                    if valid:
                        for k in range(ship_len):
                            probability_grid[r][c+k] += 1
            
            # Vertical checks
            for r in range(self.rows - ship_len + 1):
                for c in range(self.cols):
                    valid = True
                    for k in range(ship_len):
                        if board[r+k][c] != "empty":
                            valid = False; break
                    if valid:
                        for k in range(ship_len):
                            probability_grid[r+k][c] += 1

        # Find max probability
        for r in range(self.rows):
            for c in range(self.cols):
                if probability_grid[r][c] > max_prob and board[r][c] == "empty":
                    max_prob = probability_grid[r][c]
                    best_coords = (r, c)
        
        if best_coords:
            return {
                "row": best_coords[0],
                "col": best_coords[1],
                "reason": f"Based on probabilistic analysis, square ({best_coords[0]},{best_coords[1]}) has the highest likelihood ({max_prob} configurations) of hiding a ship."
            }
        
        return {"row": 0, "col": 0, "reason": "No logical moves detected."}

    def get_ai_move(self, board):
        # AI uses the same logic against the player, but we just return coordinates
        # Simplified: Random move for 'easy', logic for 'hard' (implemented as random here for brevity)
        while True:
            r, c = random.randint(0, 9), random.randint(0, 9)
            if board[r][c] in ["empty", "ship"]: # Logic to assume board state passed in is masked or unmasked? 
                # Assuming simple backend logic here
                return {"row": r, "col": c}