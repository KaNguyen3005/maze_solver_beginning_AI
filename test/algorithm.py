import heapq
import time

def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def solve_astar(maze, start, end):
    start_time = time.time()
    nodes_visited = 0
    
    open_set = []
    heapq.heappush(open_set, (0, 0, start))

    came_from = {start: None}
    g_score = {start: 0}
    visited = set()

    while open_set:
        _, g, current = heapq.heappop(open_set)
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

            if 0 <= nx < len(maze) and 0 <= ny < len(maze[0]) and maze[nx][ny] == 0:
                tentative_g = g + 1
                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    g_score[neighbor] = tentative_g
                    f = tentative_g + heuristic(neighbor, end)
                    heapq.heappush(open_set, (f, tentative_g, neighbor))
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

    result = solve_astar(maze, start, end)
    print(result)
