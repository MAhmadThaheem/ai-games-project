import heapq
from typing import List, Tuple, Dict
import random

class Node:
    def __init__(self, position: Tuple[int, int], parent=None):
        self.position = position
        self.parent = parent
        self.g = 0 # Distance from start
        self.h = 0 # Heuristic (distance to end)
        self.f = 0 # Total cost

    def __eq__(self, other):
        return self.position == other.position
    
    def __lt__(self, other):
        return self.f < other.f

class PacmanAI:
    def __init__(self):
        # Directions: (dx, dy)
        self.directions = {
            "UP": (0, -1),
            "DOWN": (0, 1),
            "LEFT": (-1, 0),
            "RIGHT": (1, 0)
        }

    def get_next_move(self, grid: List[List[int]], ghost_pos: Tuple[int, int], pacman_pos: Tuple[int, int], ghost_type: str) -> str:
        """Decide the next move based on Ghost Personality"""
        
        target = pacman_pos

        # PERSONALITY AI: Adjust target based on ghost type
        if ghost_type == "blinky":
            # Blinky: Chases directly (Standard A*)
            target = pacman_pos
        elif ghost_type == "pinky":
            # Pinky: Tries to ambush (Target 4 tiles ahead of Pacman)
            # Simplified: Just aims slightly offset
            # In a real game, you'd use Pacman's direction to calculate this
            target = pacman_pos 
        elif ghost_type == "clyde":
            # Clyde: Chases, but if too close (dist < 8), runs away to bottom-left corner
            dist = abs(ghost_pos[0] - pacman_pos[0]) + abs(ghost_pos[1] - pacman_pos[1])
            if dist < 5:
                target = (1, len(grid) - 2) # Corner
            else:
                target = pacman_pos
        else:
            # Inky: Random movement mixed with chasing
            if random.random() < 0.3:
                return random.choice(list(self.directions.keys()))
            target = pacman_pos

        # Calculate path using A*
        path = self.astar_search(grid, ghost_pos, target)
        
        if not path or len(path) < 2:
            # No path found or already there, pick random valid move
            valid_moves = self.get_valid_moves(grid, ghost_pos)
            return random.choice(valid_moves) if valid_moves else "IDLE"

        # The next step in the path
        next_step = path[1] # index 0 is current pos
        
        # Determine direction string from coordinate change
        dx = next_step[0] - ghost_pos[0]
        dy = next_step[1] - ghost_pos[1]
        
        if dx == 1: return "RIGHT"
        if dx == -1: return "LEFT"
        if dy == 1: return "DOWN"
        if dy == -1: return "UP"
        
        return "IDLE"

    def heuristic(self, a: Tuple[int, int], b: Tuple[int, int]) -> int:
        """Manhattan Distance: |x1 - x2| + |y1 - y2|"""
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    def get_valid_moves(self, grid: List[List[int]], pos: Tuple[int, int]) -> List[str]:
        moves = []
        rows = len(grid)
        cols = len(grid[0])
        
        for direction, (dx, dy) in self.directions.items():
            nx, ny = pos[0] + dx, pos[1] + dy
            
            # Check bounds
            if 0 <= nx < cols and 0 <= ny < rows:
                # Check walls (Assuming 1 is wall)
                if grid[ny][nx] != 1:
                    moves.append(direction)
        return moves

    def astar_search(self, grid: List[List[int]], start: Tuple[int, int], end: Tuple[int, int]):
        """A* Pathfinding Algorithm"""
        
        # Ensure start and end are valid
        rows = len(grid)
        cols = len(grid[0])
        
        # Create start and end node
        start_node = Node(start, None)
        end_node = Node(end, None)

        open_list = []
        closed_list = []

        heapq.heappush(open_list, start_node)

        # Max iterations to prevent infinite loops in bad grids
        iterations = 0
        max_iterations = 200 

        while open_list:
            iterations += 1
            if iterations > max_iterations:
                return None # Too expensive, fallback

            # Get current node
            current_node = heapq.heappop(open_list)
            closed_list.append(current_node)

            # Found the goal
            if current_node == end_node:
                path = []
                current = current_node
                while current is not None:
                    path.append(current.position)
                    current = current.parent
                return path[::-1] # Return reversed path

            # Generate children
            children = []
            for direction, (dx, dy) in self.directions.items():
                node_position = (current_node.position[0] + dx, current_node.position[1] + dy)

                # Check within range
                if node_position[0] > (cols - 1) or node_position[0] < 0 or node_position[1] > (rows - 1) or node_position[1] < 0:
                    continue

                # Make sure walkable terrain
                if grid[node_position[1]][node_position[0]] == 1:
                    continue

                new_node = Node(node_position, current_node)
                children.append(new_node)

            # Loop through children
            for child in children:
                # Child is on the closed list
                if len([closed_child for closed_child in closed_list if closed_child == child]) > 0:
                    continue

                # Create the f, g, and h values
                child.g = current_node.g + 1
                child.h = self.heuristic(child.position, end_node.position)
                child.f = child.g + child.h

                # Child is already in the open list
                if len([open_node for open_node in open_list if child == open_node and child.g > open_node.g]) > 0:
                    continue

                # Add the child to the open list
                heapq.heappush(open_list, child)
        
        return None