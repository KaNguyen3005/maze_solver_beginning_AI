import heapq
import time

def heuristic(a, b):
    # Heuristic Manhattan distance
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def solve_maze(maze, start, end):
    start_time = time.time()
    nodes_visited = [start]
    states = []  # 👈 thêm để lưu trạng thái mỗi bước

    open_set = []
    heapq.heappush(open_set, (0, 0, start))

    came_from = {start: None}
    g_score = {start: 0}
    visited = set()

    while open_set:
        _, g, current = heapq.heappop(open_set)
        nodes_visited.append(current)

        if current == end:
            break

        if current in visited:
            continue
        visited.add(current)

        x, y = current
        new_neighbors = []
        for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
            nx, ny = x + dx, y + dy
            neighbor = (nx, ny)

            if 0 <= nx < len(maze) and 0 <= ny < len(maze[0]) and maze[nx][ny] == 0:
                tentative_g = g + 1
                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    g_score[neighbor] = tentative_g
                    f = tentative_g + heuristic(neighbor, end)
                    heapq.heappush(open_set, (f, tentative_g, neighbor))
                    came_from[neighbor] = current
                    new_neighbors.append(neighbor)

        # 📌 Lưu trạng thái sau khi xử lý current
        states.append({
            "current": current,
            "open_set": [node[2] for node in open_set],  # lấy phần tử (x,y) thôi
            "visited": list(visited),
            "new_neighbors": new_neighbors
        })

    # nếu không tìm thấy đường
    if end not in came_from:
        return {
            'time_taken': round((time.time() - start_time) * 1000, 3),
            'path': None,
            'nodes_visited': nodes_visited,
            'states': states
        }

    # reconstruct path
    path = []
    cur = end
    while cur is not None:
        path.append(cur)
        cur = came_from.get(cur)
    path.reverse()

    return {
        'time_taken': round((time.time() - start_time) * 1000, 3),
        'path': path,
        'nodes_visited': nodes_visited,
        'states': states
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

    result = solve_maze(maze, start, end)
    print("Thời gian:", result['time_taken'], "ms")
    print("Path:", result['path'])
    print("Tổng số bước:", len(result['states']))
    print("Trạng thái đầu tiên:", result['states'][0])
