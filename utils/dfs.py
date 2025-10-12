import time

def solve_maze(maze, start, end):
    stack = [start]
    came_from = {start: None}
    visited = set()
    discovered = set([start])

    start_time = time.time()
    nodes_visited = [start]
    states = []

    while stack:
        x, y = stack.pop()

        # đánh dấu current là visited (xử lý xong)
        visited.add((x, y))

        # lưu state trước khi mở rộng
        states.append({
            "current": (x, y),
            "open_set": list(stack),
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
                stack.append((nx, ny))
                came_from[(nx, ny)] = (x, y)
                new_neighbors.append((nx, ny))

        # cập nhật lại state sau khi thêm neighbor
        states[-1]["new_neighbors"] = new_neighbors
        states[-1]["open_set"] = list(stack)

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
