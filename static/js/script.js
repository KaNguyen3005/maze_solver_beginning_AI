const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const ROWS = 20;
const COLS = 20;
const CELL_SIZE = canvas.width / COLS;
let solving = false; // đang chạy Solve
let runningDotsInterval = null;

let start = [0, 0];
let end = [ROWS - 1, COLS - 1];

function drawMaze() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (maze[r][c] === 1) {
        ctx.fillStyle = "black";
      } else {
        ctx.fillStyle = "white";
      }
      ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  // Vẽ đường đi
  ctx.fillStyle = "yellow";
  console.log("PATH: ", path);
  for (const [r, c] of path) {
    ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }

  // Vẽ start và end
  ctx.fillStyle = "red";
  ctx.fillRect(
    start[1] * CELL_SIZE,
    start[0] * CELL_SIZE,
    CELL_SIZE,
    CELL_SIZE
  );
  ctx.fillStyle = "green";
  ctx.fillRect(end[1] * CELL_SIZE, end[0] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

async function generateMaze() {
  const res = await fetch("/api/generate");
  const data = await res.json();
  maze = data.maze;
  start = data.start;
  end = data.end;

  // Reset path & visited
  path = [];
  visited = [];

  drawMaze();
}

let sleepTimeout;
function sleep(ms) {
  return new Promise((resolve) => {
    sleepTimeout = setTimeout(resolve, ms);
  });
}

function cancelSleep() {
  clearTimeout(sleepTimeout);
}
// kham pha duong di
async function animateVisited() {
  for (const [r, c] of visited) {
    if ((r === start[0] && c === start[1]) || (r === end[0] && c === end[1]))
      continue;

    ctx.fillStyle = "#b3e5fc";
    ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    // danh dau da di
    ctx.fillStyle = "green";
    ctx.font = `${CELL_SIZE * 0.6}px Arial`;
    ctx.fillText(
      "✓",
      c * CELL_SIZE + CELL_SIZE / 4,
      r * CELL_SIZE + CELL_SIZE * 0.7
    );

    await sleep(100);
  }
}

//tô đậm đường đi
async function animatePath() {
  await sleep(300);
  for (const [r, c] of path) {
    ctx.fillStyle = "#0288d1";
    ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    await sleep(50);
  }

  // ve start/end
  ctx.fillStyle = "red";
  ctx.fillRect(
    start[1] * CELL_SIZE,
    start[0] * CELL_SIZE,
    CELL_SIZE,
    CELL_SIZE
  );
  ctx.fillStyle = "green";
  ctx.fillRect(end[1] * CELL_SIZE, end[0] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

// hien thi thuc te chay thuan toan
function updateAlgorithmStatus(current, queue, visited, phase) {
  document.getElementById("currentNode").textContent = current || "None";
  document.getElementById("queueContent").textContent =
    "[" + queue.join(", ") + "]";
  document.getElementById("visitedList").textContent =
    "[" +
    visited.slice(-5).join(", ") +
    (visited.length > 5 ? ", ..." : "") +
    "]";
  document.getElementById("phase").textContent = phase;
}

//hien thi trang thai thuat toan thuat toan khi end
function updateStats(runtime, pathLength, visitedCount, status) {
  document.getElementById("runtime").textContent = runtime + " ms";
  document.getElementById("pathLength").textContent = pathLength;
  document.getElementById("visitedCount").textContent = visitedCount;
  document.getElementById("status").textContent = status;
}

function startRunningDots() {
  const statusEl = document.getElementById("status"); // element hiển thị trạng thái
  let dotCount = 0;

  // Xóa interval cũ nếu có
  if (runningDotsInterval) clearInterval(runningDotsInterval);

  runningDotsInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 4; // 0,1,2,3
    const dots = '.'.repeat(dotCount);
    statusEl.textContent = `Running${dots}`;
  }, 500); // mỗi 0.5s đổi dấu
}

function stopRunningDots(finalText) {
  if (runningDotsInterval) {
    clearInterval(runningDotsInterval);
    runningDotsInterval = null;
  }
  document.getElementById("status").textContent = finalText;
}

async function solveMaze() {
  if (solving) {
    console.log("Đang chạy solve trước đó, hủy animation cũ...");
    cancelSleep(); // dừng sleep
  }

  solving = true;
  changeSelect.disabled = true;
  const params = new URLSearchParams(window.location.search);
  const algo = params.get("algo") || "bfs"; // lấy algo từ query

  // Reset các biến trước khi chạy
  path = [];
  visited = [];
  drawMaze();

  startRunningDots(); // ✅ bật hiệu ứng "Running..."

  // Gửi maze, start, end, algo lên server
  const res = await fetch(`/api/solve?algo=${algo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maze, start, end }),
  });
  const data = await res.json();
  console.log("Kết quả từ server:", data);
  path = data.path;
  visited = data.nodes_visited;
  const run_time = data.time_taken; // Animate kết quả
  await animateVisited();
  await animatePath(); // Hiển thị kết quả
  stopRunningDots((path.length > 0) ? "✅ Found path" : "❌ No path found"); 
  updateStats(
    run_time,
    path.length,
    visited.length,
    (path.length > 0) ? "✅ Found path" : "❌ No path found"
  );
  solving = false;
  changeSelect.disabled = false;
}

function init() {
  generateMaze();
}

document.getElementById("generateBtn").addEventListener("click", generateMaze);
document.getElementById("solveBtn").addEventListener("click", solveMaze);
const changeSelect = document.getElementById("algoSelect");
changeSelect.addEventListener("change", (e) => {
  const newAlgo = e.target.value || "bfs";

  // Cập nhật query string mà không reload page
  const url = new URL(window.location);
  url.searchParams.set("algo", newAlgo);
  window.history.replaceState(null, "", url);

  // Reset maze & path
  path = [];
  visited = [];
  drawMaze();

  console.log("Query algo đã được đổi thành:", newAlgo);
});

window.onload = () => {
  // Lấy algo từ query string
  const params = new URLSearchParams(window.location.search);
  const algo = params.get("algo") || "bfs";

  // Cập nhật select theo giá trị query
  const algoSelect = document.getElementById("algoSelect");
  algoSelect.value = algo;

  // Sau đó generate maze
  generateMaze();
};
