const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

// Kích thước mặc định và chế độ step-by-step (dùng cho demo)

const ROWS = 20;
const COLS = 20;
const ROWS_STEP_BY_STEP = 8;
const COLS_STEP_BY_STEP = 8;

// CELL_SIZE sẽ được tính lại sau khi biết COLS thực tế

let CELL_SIZE = canvas.width / COLS;
let solving = false;
let runningDotsInterval = null;

let states = [];
let currentStateIndex = 0;
let start = null;
let end = null;

// global maze/path/visited (giữ như bạn có)
let maze = [];
let path = [];
let visited = [];
let run_time = 0;
// Sửa hàm drawMaze để vẽ start/end nếu có
function drawMaze() {
  if (!maze || maze.length === 0) return;

  const rows = maze.length;
  const cols = maze[0].length;
  CELL_SIZE = canvas.width / cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = maze[r][c] === 1 ? "black" : "white";
      ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  // Vẽ start nếu đã chọn
  if (start) {
    ctx.fillStyle = "red";
    ctx.fillRect(
      start[1] * CELL_SIZE,
      start[0] * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
  }

  // Vẽ end nếu đã chọn
  if (end) {
    ctx.fillStyle = "green";
    ctx.fillRect(end[1] * CELL_SIZE, end[0] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
}

async function generateMaze() {
  // Lấy mode từ query string
  stopRunningDots("Idle");
  solving = false
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") || ""; // có thể "", "step_by_step", ...

  // Chọn kích thước theo mode
  const rows = mode === "step_by_step" ? ROWS_STEP_BY_STEP : ROWS;
  const cols = mode === "step_by_step" ? COLS_STEP_BY_STEP : COLS;

  // Gọi API kèm query params rows & cols
  const res = await fetch(`/api/generate?rows=${rows}&cols=${cols}&algo=${algo}`);
  const data = await res.json();

  // Cập nhật maze và kích thước, start/end
  maze = data.maze;
  start = data.start;
  end = data.end;

  // Nếu server không trả start/end đúng, đặt mặc định theo rows/cols
  // if (!start) start = [0, 0];
  // if (!end) end = [rows - 1, cols - 1];

  // Cập nhật biến ROWS/COLS thực tế và CELL_SIZE
  // LƯU Ý: nếu bạn muốn giữ ROWS/COLS nguyên tại file (const),
  // có thể dùng biến khác; ở đây ta dùng let để cập nhật.
  window.ACTUAL_ROWS = rows;
  window.ACTUAL_COLS = cols;
  CELL_SIZE = canvas.width / cols;

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

// format mảng node thành dạng { (r,c), (r,c) }
function formatNodeList(list) {
  return "{ " + list.map(([r, c]) => `(${r},${c})`).join(", ") + " }";
}

function onAlgorithmChange(algo) {
  if (algo === "bfs" || algo == "ffill") dataStructureName = "Queue";
  else if (algo === "dfs") dataStructureName = "Stack";
  else if (algo === "dijkstra" || algo === "astar")
    dataStructureName = "Open Set";
  else dataStructureName = "Frontier"; // fallback

  document.getElementById("dataStructureLabel").textContent = dataStructureName;
}

function updateAlgorithmStatus(current, queue, visited, phase) {
  const currentText = current ? `(${current[0]},${current[1]})` : "None";

  document.getElementById("currentNode").textContent = currentText;
  document.getElementById("queueContent").textContent = formatNodeList(queue);
  document.getElementById("visitedList").textContent = formatNodeList(visited);
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
    const dots = ".".repeat(dotCount);
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

function highlightState(state) {
  drawMaze(); // vẽ lại maze gốc
  const { current, open_set, visited: visitedNodes, new_neighbors } = state;

  // visited
  visitedNodes.forEach(([r, c]) => {
    ctx.fillStyle = "#b3e5fc";
    ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  });

  // open_set
  open_set.forEach(([r, c]) => {
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  });

  // new_neighbors
  new_neighbors.forEach(([r, c]) => {
    ctx.fillStyle = "#FFA500";
    ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  });

  // current
  if (current) {
    const [r, c] = current;
    ctx.fillStyle = "#FF4500";
    ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }

  // tô lại start - end
  ctx.fillStyle = "red";
  ctx.fillRect(
    start[1] * CELL_SIZE,
    start[0] * CELL_SIZE,
    CELL_SIZE,
    CELL_SIZE
  );
  ctx.fillStyle = "green";
  ctx.fillRect(end[1] * CELL_SIZE, end[0] * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  updateAlgorithmStatus(
    current,
    open_set,
    visitedNodes,
    `Step ${currentStateIndex + 1}`
  );
}

async function nextStep() {
  if (currentStateIndex < states.length) {
    highlightState(states[currentStateIndex]);
    currentStateIndex++;

    // bật prevStepBtn nếu cần
    const prevBtn = document.getElementById("prevStepBtn");
    if (prevBtn) prevBtn.disabled = false;

    if (currentStateIndex === states.length) {
      const nextBtn = document.getElementById("nextStepBtn");
      if (nextBtn) nextBtn.disabled = true;

      animatePath();
      stopRunningDots("✅ Successes");
      updateStats(
        run_time ? run_time : 0,
        path ? path.length : 0,
        visited ? visited.length : 0,
        path && path.length > 0 ? "✅ Successes" : "❌ Failed"
      );
    }
  } else {
    const nextBtn = document.getElementById("nextStepBtn");
    if (nextBtn) nextBtn.disabled = true;
    animatePath();
    stopRunningDots("✅ Successes");
  }
}

async function prevStep() {
  if (currentStateIndex > 0) {
    currentStateIndex--; // giảm trước
    highlightState(states[currentStateIndex]);

    // Bật nút nextStepBtn nếu bị disable
    const nextBtn = document.getElementById("nextStepBtn");
    if (nextBtn) nextBtn.disabled = false;
  }
}

// Sửa solveMaze để kiểm tra start/end
async function solveMaze() {
  if (!start || !end) {
    alert("Please select both START and END before solving!");
    return;
  }

 solving = true; // bật cờ


  const params = new URLSearchParams(window.location.search);
  const algo = params.get("algo") || "bfs";
  const mode = params.get("mode") || "normal";

  // reset
  path = [];
  visited = [];
  drawMaze();

  startRunningDots();

  const res = await fetch(`/api/solve?algo=${algo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maze, start, end }),
  });

  const data = await res.json();
  path = data.path;
  visited = data.nodes_visited;
  run_time = data.time_taken;

  if (mode === "step_by_step") {
    states = data.states || [];
    currentStateIndex = 0;
    document.getElementById("prevStepBtn").style.visibility = "visible";
    document.getElementById("nextStepBtn").style.visibility = "visible";
    document.getElementById("nextStepBtn").disabled = states.length === 0;

    stopRunningDots(states.length > 0 ? "Ready to step" : "No state found");
  } else {
    await animateVisited();
    await animatePath();
    stopRunningDots(path.length > 0 ? "✅ Successes" : "❌ Failed");
    updateStats(
      run_time,
      path.length,
      visited.length,
      path.length > 0 ? "✅ Successes" : "❌ Failed"
    );
  }
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
  onAlgorithmChange(newAlgo);

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

  onAlgorithmChange(algo);

  // Sau đó generate maze
  generateMaze();
};

canvas.addEventListener("mousedown", (e) => {
  e.preventDefault(); // ngăn menu chuột phải

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  const col = Math.floor(x / (canvas.width / window.ACTUAL_COLS));
  const row = Math.floor(y / (canvas.height / window.ACTUAL_ROWS));

   if (solving) {
    console.log("Cannot change start/end while solving!");
    return;
  }

  if (
    row < 0 ||
    row >= window.ACTUAL_ROWS ||
    col < 0 ||
    col >= window.ACTUAL_COLS
  )
    return;
  if (maze[row][col] === 1) {
    console.log("Cannot place on wall!");
    return; // không đặt start/end trên tường
  }

  if (e.button === 0) start = [row, col];
  else if (e.button === 2) end = [row, col];

  drawMaze();
});

// Ngăn menu chuột phải hiện ra
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

function drawStartEnd() {
  if (start) {
    ctx.fillStyle = "green";
    ctx.fillRect(
      start[1] * CELL_SIZE,
      start[0] * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
  }
  if (end) {
    ctx.fillStyle = "red";
    ctx.fillRect(end[1] * CELL_SIZE, end[0] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
}
