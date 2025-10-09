import random
import heapq
from utils import bfs, dfs, astar, dijkstra
ROWS, COLS = 20, 20


SOLVERS = {
    "bfs": bfs.solve_maze,
    "dfs": dfs.solve_maze,
    "astar": astar.solve_maze,
    "dijkstra": dijkstra.solve_maze,
}

def generate_solvable_maze(rows=ROWS, cols=COLS):
    # Hàm tạo maze đơn giản, chỉ dùng 0 là đường, 1 là tường
    def is_solvable(maze, start, end):
        queue = [start]
        visited = set()
        while queue:
            x, y = queue.pop(0)
            if (x, y) == end:
                return True
            if (x, y) in visited:
                continue
            visited.add((x, y))
            for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < rows and 0 <= ny < cols and maze[nx][ny] == 0:
                    queue.append((nx, ny))
        return False

    start, end = (0, 0), (rows-1, cols-1)
    while True:
        maze = [[random.choice([0,1]) for _ in range(cols)] for _ in range(rows)]
        maze[start[0]][start[1]] = 0
        maze[end[0]][end[1]] = 0
        if is_solvable(maze, start, end):
            return maze, start, end

def solve_maze(maze, start, end, algo):
    """
    Giải maze bằng thuật toán chỉ định.
    algo có thể là: 'bfs', 'dfs', 'dijkstra', 'astar'
    """
    algo = algo.lower()

    if algo not in SOLVERS:
        raise Exception(f"Thuật toán {algo} không tồn tại")
    return SOLVERS[algo](maze, start, end)