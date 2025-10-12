import time
from collections import deque

def solve_maze(maze, start, end):
    target_value = maze[start[0]][start[1]]
    fill_value = 2

    # Nếu start hoặc end không hợp lệ
    if target_value == fill_value or maze[end[0]][end[1]] != target_value:
        return {"time_taken": 0, "path": [], "nodes_visited": [], "states": []}

    print("FLOOD FILL (và tìm đường)")
    queue = deque([start])
    visited = set([start])
    parent = {start: None}
    states = []
    nodes_visited = [start]

    start_time = time.time()

    found = False
    while queue:
        x, y = queue.popleft()
        # maze[x][y] = fill_value  # tô vùng đã đi

        new_neighbors = []
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = x + dx, y + dy
            if (
                0 <= nx < len(maze) and
                0 <= ny < len(maze[0]) and
                (nx, ny) not in visited and
                maze[nx][ny] == target_value
            ):
                visited.add((nx, ny))
                parent[(nx, ny)] = (x, y)  # lưu cha
                nodes_visited.append((nx, ny))
                queue.append((nx, ny))
                new_neighbors.append((nx, ny))

                # nếu gặp end thì dừng
                if (nx, ny) == end:
                    found = True
                    break

        states.append({
            "current": (x, y),
            "open_set": list(queue),
            "visited": list(visited),
            "new_neighbors": new_neighbors
        })

        if found:
            break

    time_taken = round((time.time() - start_time) * 1000, 3)

    # dựng lại đường đi từ end về start nếu tìm thấy
    path = []
    if found:
        cur = end
        while cur is not None:
            path.append(cur)
            cur = parent[cur]
        path.reverse()
    else:
        path = []

    return {
        "time_taken": time_taken,
        "path": path,
        "nodes_visited": nodes_visited,
        "states": states
    }
