import heapq
from typing import List, Tuple, Dict, Optional

class MazeAI:
    def __init__(self):
        self.directions = [(0, 1), (1, 0), (0, -1), (-1, 0)] # R, D, L, U

    def heuristic(self, a: Tuple[int, int], b: Tuple[int, int]) -> int:
        # Manhattan distance
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    def get_cost(self, cell_type: str) -> int:
        if cell_type == "mud":
            return 5
        if cell_type == "wall":
            return 999
        return 1

    def solve_astar(self, grid: List[List[str]], start: Tuple[int, int], target: Tuple[int, int]):
        rows = len(grid)
        cols = len(grid[0])
        
        # Priority Queue: (f_score, g_score, current_pos, path)
        pq = [(0, 0, start, [])]
        visited = set()
        g_scores = {start: 0}
        
        came_from = {} # For path reconstruction if needed, currently storing in tuple
        
        while pq:
            f, g, current, path = heapq.heappop(pq)
            
            if current == target:
                return path + [current]
            
            if current in visited:
                continue
            visited.add(current)
            
            for dr, dc in self.directions:
                nr, nc = current[0] + dr, current[1] + dc
                
                if 0 <= nr < rows and 0 <= nc < cols:
                    cell = grid[nr][nc]
                    if cell == "wall":
                        continue
                        
                    new_cost = g + self.get_cost(cell)
                    neighbor = (nr, nc)
                    
                    if neighbor not in g_scores or new_cost < g_scores[neighbor]:
                        g_scores[neighbor] = new_cost
                        h = self.heuristic(neighbor, target)
                        new_path = path + [current]
                        heapq.heappush(pq, (new_cost + h, new_cost, neighbor, new_path))
        
        return [] # No path found

    def get_next_move(self, grid, cat_pos, mouse_pos):
        path = self.solve_astar(grid, (cat_pos.row, cat_pos.col), (mouse_pos.row, mouse_pos.col))
        
        # Path[0] is current pos, Path[1] is next step
        if len(path) > 1:
            next_step = path[1]
            return {"row": next_step[0], "col": next_step[1], "path": path}
        return {"row": cat_pos.row, "col": cat_pos.col, "path": []}