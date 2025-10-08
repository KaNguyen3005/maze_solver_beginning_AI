import heapq
import time

def solve_dijkstra(maze, start, end):
    start_time = time.time()
    nodes_visited = 0

    rows, cols = len(maze), len(maze[0])

    # priority queue (khoảng cách, node)
    pq = []
    heapq.heappush(pq, (0, start))

    # lưu đường đi
    came_from = {start: None}

    # lưu chi phí ngắn nhất đến mỗi node
    dist = {start: 0}

    visited = set()

    while pq:
        current_dist, current = heapq.heappop(pq)
        nodes_visited += 1

        if current == end:
            break

        if current in visited:
            continue
        visited.add(current)

        x, y = current
        for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
            nx, ny = x + dx, y + dy
            neighbor = (nx, ny)

            # kiểm tra hợp lệ và không phải tường
            if 0 <= nx < rows and 0 <= ny < cols and maze[nx][ny] == 0:
                new_dist = current_dist + 1  # mỗi bước = 1
                if neighbor not in dist or new_dist < dist[neighbor]:
                    dist[neighbor] = new_dist
                    heapq.heappush(pq, (new_dist, neighbor))
                    came_from[neighbor] = current

    # nếu không tìm thấy đường
    if end not in came_from:
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
        cur = came_from.get(cur)
    path.reverse()

    return {
        'time_taken': round((time.time() - start_time) * 1000, 3),
        'path': path,
        'nodes_visited': nodes_visited
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

    result = solve_dijkstra(maze, start, end)
    print(result)
