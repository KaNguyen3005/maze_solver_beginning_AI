import time
from collections import deque

def solve_maze(maze, start, end):
    queue = deque([start])
    came_from = {start: None}
    visited = set()
    discovered = set([start])

    start_time = time.time()
    nodes_visited = [start]
    states = []

    while queue:
        x, y = queue.popleft()
        visited.add((x, y))

        # lưu state trước khi mở rộng
        states.append({
            "current": (x, y),
            "open_set": list(queue),
            "visited": list(visited),
            "new_neighbors": []
        })

        if (x, y) == end:
            break

        new_neighbors = []
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = x + dx, y + dy
            if (
                0 <= nx < len(maze) and
                0 <= ny < len(maze[0]) and
                maze[nx][ny] == 0 and
                (nx, ny) not in discovered
            ):
                discovered.add((nx, ny))
                nodes_visited.append((nx, ny))
                queue.append((nx, ny))
                came_from[(nx, ny)] = (x, y)
                new_neighbors.append((nx, ny))

        # cập nhật neighbors vào state cuối cùng
        states[-1]["new_neighbors"] = new_neighbors
        states[-1]["open_set"] = list(queue)

    # reconstruct path nếu có
    path = None
    if end in came_from:
        path = []
        cur = end
        while cur is not None:
            path.append(cur)
            cur = came_from.get(cur)
        path.reverse()

    return {
        "time_taken": round((time.time() - start_time) * 1000, 3),
        "path": path,
        "nodes_visited": nodes_visited,
        "states": states
    }


# ----------------- Test -----------------
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

    result = solve_bfs(maze, start, end)
    print("✅ Path:", result['path'])
    print("🧭 State sample:", result['states'][:3])
