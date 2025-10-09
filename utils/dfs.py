import time

def solve_maze(maze,start,end):
    print(start)
    stack=[start]
    came_from ={start:None}
    visited = set()
    visited.add(start)
    
    start_time =time.time()
    nodes_visited= [start]
    while stack:
        x,y = stack.pop()
        if (x,y) == end:
            end_time = time.time()
            break
        for dx,dy in [(-1,0),(1,0),(0,-1),(0,1)]:
            nx,ny = x+dx,y+dy
            if 0<=nx<len(maze) and 0<=ny<len(maze[0]) and maze[nx][ny]==0 and (nx,ny) not in visited:
                visited.add((nx,ny))
                nodes_visited.append((nx,ny))
                stack.append((nx,ny))
                came_from[(nx,ny)] = (x,y)
    if  end not in came_from:
        return {
            'time_taken':round((time.time() - start_time) * 1000, 3),
            'path':None,
            'nodes_visited':nodes_visited
        }
    path =[]
    cur =end
    while cur is not None:
        path.append(cur)
        cur=came_from.get(cur)
    path.reverse()
    end_time =time.time()
    return{
        'time_taken':round((time.time() - start_time) * 1000, 3),
        'path':path,
        'nodes_visited':nodes_visited
    }
maze = [
    [0,1,0,0,0],
    [0,1,1,1,0],
    [0,0,0,1,0],
    [0,1,1,1,0],
    [0,0,0,0,0]
]

start = (0,0)
end   = (4,4)

# print("DFS:", solve_dfs(maze, start, end))
