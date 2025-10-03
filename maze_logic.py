import random
import heapq

ROWS, COLS = 20, 20

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

def solve_maze(maze, start, end):
    # Dùng BFS để đơn giản
    queue = [start]
    came_from = {start: None}
    visited = set()
    visited.add(start)
    while queue:
        x, y = queue.pop(0)
        if (x, y) == end:
            break
        for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < len(maze) and 0 <= ny < len(maze[0]) and maze[nx][ny] == 0 and (nx, ny) not in visited:
                visited.add((nx, ny))
                queue.append((nx, ny))
                came_from[(nx, ny)] = (x, y)
    if end not in came_from:
        return []
    # Tạo đường đi từ end về start
    path = []
    cur = end
    visited_in_trace = set()  # để tránh vòng lặp

    while cur is not None:
        path.append(cur)
        cur = came_from.get(cur)

    path.reverse()
    return path

prin(1)