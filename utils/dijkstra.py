import heapq
import time

def solve_maze(maze, start, end):
    start_time = time.time()
    rows, cols = len(maze), len(maze[0])
    pq = []
    heapq.heappush(pq, (0, start))

    came_from = {start: None}
    dist = {start: 0}
    visited = set()

    nodes_visited = [start]
    states = []

    states.append({
        "current": start,
        "open_set": [start],
        "visited": [],
        "new_neighbors": []
    })

    while pq:
        current_dist, current = heapq.heappop(pq)

        # ❗ Bỏ qua node đã thăm rồi
        if current in visited:
            continue
        visited.add(current)

        # ✅ kiểm tra end sau visited
        if current == end:
            # thêm state cuối trước khi thoát vòng lặp
            states.append({
                "current": current,
                "open_set": [n for _, n in pq],
                "visited": list(visited),
                "new_neighbors": []
            })
            break
        x, y = current
        new_neighbors = []

        for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
            nx, ny = x + dx, y + dy
            neighbor = (nx, ny)
            if 0 <= nx < rows and 0 <= ny < cols and maze[nx][ny] == 0:
                new_dist = current_dist + 1
                if neighbor not in dist or new_dist < dist[neighbor]:
                    dist[neighbor] = new_dist
                    came_from[neighbor] = current
                    heapq.heappush(pq, (new_dist, neighbor))
                    nodes_visited.append(neighbor)
                    new_neighbors.append(neighbor)

        states.append({
            "current": current,
            "open_set": [n for _, n in pq],
            "visited": list(visited),
            "new_neighbors": new_neighbors
        })

    # reconstruct path
    path = None
    if end in came_from:
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
    print("✅ Path:", result['path'])
    print("🧭 States sample (first 3):", result['states'][:3])
