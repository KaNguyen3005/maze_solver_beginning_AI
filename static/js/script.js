const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const ROWS = 20;
const COLS = 20;
const CELL_SIZE = canvas.width / COLS;

let maze = [
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
];
let visited = [
    [0,0], [1,0], [1,1], [1,2], [1,3], [1,4], [1,5], [1,6], [1,7], [1,8], [1,9],
  [1,10],[1,11],[1,12],[1,13],[1,14],[1,15],[1,16],[1,17],[1,18],[2,18],
  [3,18],[4,18],[5,18],[6,18],[7,18],[8,18],[9,18],[10,18],[11,18],[12,18],
  [13,18],[14,18],[15,18],[16,18],[17,18],[18,18],[19,18],[19,19]
];
let path = [
  [0,0], [1,0], [1,1], [1,2], [1,3], [1,4], [1,5], [1,6], [1,7], [1,8], [1,9],
  [1,10],[1,11],[1,12],[1,13],[1,14],[1,15],[1,16],[1,17],[1,18],[2,18],
  [3,18],[4,18],[5,18],[6,18],[7,18],[8,18],[9,18],[10,18],[11,18],[12,18],
  [13,18],[14,18],[15,18],[16,18],[17,18],[18,18],[19,18],[19,19]
];
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
    // maze = data.maze;
    // start = data.start;
    // end = data.end;
    // path = [];
    drawMaze();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// kham pha duong di
async function animateVisited() {
  for (const [r, c] of visited) {
    if ((r === start[0] && c === start[1]) || (r === end[0] && c === end[1])) continue;

    ctx.fillStyle = '#b3e5fc';
    ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    // danh dau da di
    ctx.fillStyle = 'green';
    ctx.font = `${CELL_SIZE * 0.6}px Arial`;
    ctx.fillText('✓', c * CELL_SIZE + CELL_SIZE / 4, r * CELL_SIZE + CELL_SIZE * 0.7);

    await sleep(100); 
  }
}

//tô đậm đường đi
async function animatePath() {
  await sleep(300); 
  for (const [r, c] of path) {
    ctx.fillStyle = '#0288d1'; 
    ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    await sleep(50);
  }

  // ve start/end
  ctx.fillStyle = 'red';
  ctx.fillRect(start[1] * CELL_SIZE, start[0] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  ctx.fillStyle = 'green';
  ctx.fillRect(end[1] * CELL_SIZE, end[0] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

async function generateMaze() {
  drawMaze();
}

async function solveMaze() {
  await animateVisited();
  await animatePath();
}

document.getElementById('generateBtn').addEventListener('click', generateMaze);
document.getElementById('solveBtn').addEventListener('click', solveMaze);


// hien thi thuc te chay thuan toan
function updateAlgorithmStatus(current, queue, visited, phase) {
    document.getElementById("currentNode").textContent = current || "None";
    document.getElementById("queueContent").textContent = "[" + queue.join(", ") + "]";
    document.getElementById("visitedList").textContent = "[" + visited.slice(-5).join(", ") + (visited.length > 5 ? ", ..." : "") + "]";
    document.getElementById("phase").textContent = phase;
}

//hien thi trang thai thuat toan thuat toan khi end
function updateStats(runtime, pathLength, visitedCount, updates, status) {
    document.getElementById("runtime").textContent = runtime + " ms";
    document.getElementById("pathLength").textContent = pathLength;
    document.getElementById("visitedCount").textContent = visitedCount;
    document.getElementById("updates").textContent = updates;
    document.getElementById("status").textContent = status;
}

// chay solveMaze()
async function solveMaze() {
    const startTime = performance.now();

    updateStats(0, 0, 0, 0, "Running...");

    await animateVisited();
    await animatePath();

    const endTime = performance.now();
    const runtime = Math.round(endTime - startTime);

    // ket qua
    updateStats(runtime, path.length, visited.length, visited.length + path.length, "✅ Found path");
}

// Khởi tạo
generateMaze();