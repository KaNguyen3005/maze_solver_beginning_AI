import random
import heapq
import time
def solve_bfs(maze, start, end):
    # Dùng BFS để đơn giản
    queue = [start]
    came_from = {start: None}
    visited = set()
    visited.add(start)
    start_time =time.time()
    nodes_visited = 0
    while queue:
        x, y = queue.pop(0)
        nodes_visited += 1
        if (x, y) == end:
            end_time =time.time()
            break
        for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < len(maze) and 0 <= ny < len(maze[0]) and maze[nx][ny] == 0 and (nx, ny) not in visited:
                visited.add((nx, ny))
                queue.append((nx, ny))
                came_from[(nx, ny)] = (x, y)
    if end not in came_from:
        return {
            'time_taken':round((time.time() - start_time) * 1000, 3),
            'path':None,
            'nodes_visited':nodes_visited
        }
    # Tạo đường đi từ end về start
    path = []
    cur = end
    visited_in_trace = set()  # để tránh vòng lặp

    while cur is not None:
        path.append(cur)
        cur = came_from.get(cur)

    path.reverse()
    end_time =time.time()
    
    return{
        'time_taken':round((time.time() - start_time) * 1000, 3),
        'path':path,
        'nodes_visited':nodes_visited
    }
    
maze = [
    [0,1,0,0,0],
    [0,1,0,1,0],
    [0,0,0,1,0],
    [0,1,1,1,0],
    [0,0,0,0,0]
]

start = (0,0)
end   = (4,4)

dic = solve_bfs(maze, start, end)
print(dic)