import time
from collections import deque


def solve_maze(maze, start, end=None, fill_value=2):
    target_value = 0
    rows = len(maze)
    cols = len(maze[0])
    sr, sc = start

    if maze[sr][sc] != target_value:
        return {"maze": maze, "states": []}

    visited = set()
    queue = deque([start])
    states = []

    while queue:
        r, c = queue.popleft()
        if (r, c) in visited:
            continue
        visited.add((r, c))

        maze[r][c] = fill_value
        states.append({"maze": [row[:] for row in maze]})

        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr, nc = r+dr, c+dc
            if 0 <= nr < rows and 0 <= nc < cols and maze[nr][nc] == target_value:
                queue.append((nr, nc))

    return {"maze": maze, "states": states}
