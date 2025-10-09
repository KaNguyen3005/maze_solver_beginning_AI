from collections import deque
import time

def solve_maze(maze, start, end):
    start_time = time.time()
    nodes_visited = 0

    rows, cols = len(maze), len(maze[0])
    visited = [[False]*cols for _ in range(rows)]
    parent = {start: None}

    queue = deque([start])
    visited[start[0]][start[1]] = True

    while queue:
        current = queue.popleft()
        nodes_visited += 1

        if current == end:
            break

        x, y = current
        for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < rows and 0 <= ny < cols and not visited[nx][ny] and maze[nx][ny] == 0:
                visited[nx][ny] = True
                parent[(nx, ny)] = current
                queue.append((nx, ny))

    # Nếu không tìm thấy đường
    if end not in parent:
        return {
            'time_taken': round((time.time() - start_time) * 1000, 3),
            'path': None,
            'nodes_visited': nodes_visited
        }

    # reconstruct path
    path = []
    cur = end
    while cur is not None:
        path.append(cur)
        cur = parent[cur]
    path.reverse()

    return {
        'time_taken': round((time.time() - start_time) * 1000, 3),
        'path': path,
        'nodes_visited': nodes_visited
    }


# --- Test ---
if __name__ == "__main__":
    maze = [
        [0,1,0,0,0],
        [0,1,0,1,0],
        [0,0,0,1,0],
        [0,1,1,1,0],
        [0,0,0,0,0]
    ]
    start = (0,0)
    end   = (4,4)

    # result = flood_fill(maze, start, end)
    # print(result)
