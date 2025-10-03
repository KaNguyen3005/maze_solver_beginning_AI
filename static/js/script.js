const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const ROWS = 20;
const COLS = 20;
const CELL_SIZE = canvas.width / COLS;

let maze = [];
let path = [];
let start = [0, 0];
let end = [ROWS-1, COLS-1];

function drawMaze() {
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            if (maze[r][c] === 1) {
                ctx.fillStyle = 'black';
            } else {
                ctx.fillStyle = 'white';
            }
            ctx.fillRect(c*CELL_SIZE, r*CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeRect(c*CELL_SIZE, r*CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }

    // Vẽ đường đi
    ctx.fillStyle = 'yellow';
    console.log("PATH: ", path)
    for (const [r, c] of path) {
        ctx.fillRect(c*CELL_SIZE, r*CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    // Vẽ start và end
    ctx.fillStyle = 'red';
    ctx.fillRect(start[1]*CELL_SIZE, start[0]*CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = 'green';
    ctx.fillRect(end[1]*CELL_SIZE, end[0]*CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

async function generateMaze() {
    const res = await fetch('/api/generate');
    const data = await res.json();
    maze = data.maze;
    start = data.start;
    end = data.end;
    path = [];
    drawMaze();
}

async function solveMaze() {
    // console.log(maze)
    const res = await fetch('/api/solve', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({maze, start, end})
    });
    const data = await res.json();
    console.log(data)
    path = data.path;
    drawMaze();
}

document.getElementById('generateBtn').addEventListener('click', generateMaze);
document.getElementById('solveBtn').addEventListener('click', solveMaze);

// Khởi tạo lần đầu
generateMaze();
