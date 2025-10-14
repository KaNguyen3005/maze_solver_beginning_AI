const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const svg = document.getElementById("treeSvg");

let board = Array(9).fill(null);
let human = "X",
  bot = "O";

function renderBoard() {
  boardEl.innerHTML = "";
  board.forEach((v, i) => {
    const d = document.createElement("div");
    d.className = "cell";
    d.textContent = v || "";
    d.addEventListener("click", () => onCellClick(i));
    boardEl.appendChild(d);
  });
}

function onCellClick(i) {
  if (board[i]) return;

  // Nếu game đã kết thúc rồi thì không cho đánh nữa
  const w = checkWinner(board);
  if (w) return;

  // Người chơi đánh
  board[i] = human;
  renderBoard();

  // Kiểm tra sau lượt người
  const winner = checkWinner(board);
  if (winner) {
    handleGameEnd(winner);
    return;
  }

  // Gửi lên server cho bot đánh
  sendToServer();
}

function checkWinner(b) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b1, c] of lines) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]){
        return b[a];
    }
  }
  if (b.every((x) => x !== null)) return "DRAW";
  return null;
}

function handleGameEnd(winner) {
  if (winner === human) {
    statusEl.textContent = "🎉 You Win!";
  } else if (winner === bot) {
    statusEl.textContent = "❌ You Lose!";
  } else if (winner === "DRAW") {
    statusEl.textContent = "🤝 Draw!";
  }
}

async function sendToServer() {
  statusEl.textContent = "Thinking...";
  try {
    const res = await fetch("/api/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board: board, bot: bot }),
    });
    const data = await res.json();
    if (data.error) {
      statusEl.textContent = data.error;
      return;
    }
    const move = data.move;
    const tree = data.tree;

    if (move !== null && move !== undefined) {
      board[move] = bot;
    }

    renderBoard();

    // ✅ Kiểm tra kết quả sau lượt bot
    const winner = checkWinner(board);
    if (winner) {
      handleGameEnd(winner);
    } else {
      statusEl.textContent = "Bot played at " + (move === null ? "none" : move);
    }

    drawTree(tree);
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Server error";
  }
}

document.getElementById("resetBtn").addEventListener("click", () => {
  board = Array(9).fill(null);
  renderBoard();
  svg.innerHTML = "";
  statusEl.textContent = "";
});
document.getElementById("genBtn").addEventListener("click", () => {
  // random partial board (valid)
  do{

    board = Array(9).fill(null);
    let steps = Math.floor(Math.random() * 5) * 2; // 1,3,5,7,9
    steps = Math.min(steps, 9); // tránh quá giới hạn
    let cur = "X";
    for (let k = 0; k < steps; k++) {
        const empties = board
        .map((v, i) => (v === null ? i : -1))
        .filter((i) => i >= 0);
        if (empties.length === 0) break;
        const idx = empties[Math.floor(Math.random() * empties.length)];
        board[idx] = cur;
        cur = cur === "X" ? "O" : "X";
        if (checkWinner(board)) break;
    }
  } while(checkWinner(board) != null);

  renderBoard();
  svg.innerHTML = "";
});

// ---------- Tree rendering ----------
function drawTree(tree) {
  const svg = document.getElementById("treeSvg");
  if (!svg) {
    console.error("❌ Không tìm thấy phần tử SVG với id='treeSvg'");
    return;
  }

  svg.innerHTML = "";
  if (!tree) return;

  const levelGapY = 100;
  const nodeGapX = 60;
  const nodeRadius = 18;

  // ----------- 1. Tính chiều rộng subtree -----------
  function computeWidths(node) {
    if (!node || typeof node !== "object") return 0;
    if (!node.children || node.children.length === 0) {
      node._width = 1;
      return 1;
    }
    let w = 0;
    for (const ch of node.children) w += computeWidths(ch);
    node._width = Math.max(w, 1);
    return node._width;
  }
  computeWidths(tree);

  // ----------- 2. Tính vị trí từng node -----------
  function setPositions(node, xStart, depth) {
    if (!node || typeof node !== "object") return xStart;

    if (!node.children || node.children.length === 0) {
      node._x = xStart + nodeRadius;
      node._y = depth * levelGapY + nodeRadius + 10;
      return xStart + node._width * nodeGapX;
    }

    let curX = xStart;
    for (const ch of node.children) {
      curX = setPositions(ch, curX, depth + 1);
    }

    const first = node.children[0];
    const last = node.children[node.children.length - 1];
    node._x = (first._x + last._x) / 2;
    node._y = depth * levelGapY + nodeRadius + 10;

    if (isNaN(node._x) || isNaN(node._y)) {
      console.error("⚠️ Node tính toán lỗi vị trí:", node);
    }

    return xStart + node._width * nodeGapX;
  }
  setPositions(tree, 10, 0);

  // ----------- 3. Xác định kích thước viewBox -----------
  function findMaxX(node) {
    if (!node) return 0;
    let mx = node._x || 0;
    if (node.children)
      for (const ch of node.children) mx = Math.max(mx, findMaxX(ch));
    return mx;
  }
  function findMaxY(node) {
    if (!node) return 0;
    let my = node._y || 0;
    if (node.children)
      for (const ch of node.children) my = Math.max(my, findMaxY(ch));
    return my;
  }

  const maxX = findMaxX(tree) + 200;
  const maxY = findMaxY(tree) + 100;
  svg.setAttribute(
    "viewBox",
    `0 0 ${Math.max(600, maxX)} ${Math.max(400, maxY)}`
  );

  // ----------- 4. Vẽ cạnh -----------
  function drawEdges(node) {
    if (!node || !node.children) return;
    for (const ch of node.children) {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", node._x);
      line.setAttribute("y1", node._y + nodeRadius);
      line.setAttribute("x2", ch._x);
      line.setAttribute("y2", ch._y - nodeRadius);
      line.setAttribute("class", "edge");
      svg.appendChild(line);
      drawEdges(ch);
    }
  }

  // ----------- 5. Vẽ node -----------
  function drawNodes(node) {
    if (!node) return;

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${node._x},${node._y})`);

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("r", nodeRadius);
    circle.setAttribute("class", "node-circle");
    g.appendChild(circle);

    // Điểm / giá trị node
    const t1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t1.setAttribute("class", "node-text");
    t1.setAttribute("y", "-6");
    t1.textContent =
      node.score === null || node.score === undefined ? "" : node.score;
    g.appendChild(t1);

    // Nước đi
    // move / player text
    const t2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t2.setAttribute("class", "node-text");
    t2.setAttribute("y", "10");

    // 👉 Cách 1: Player (Move)
    if (node.move === null || node.move === undefined) {
      // 👉 Đây là root node
      t2.textContent = node.player || "";
    } else {
      // 👉 Các node còn lại
      if (node.player) {
        t2.textContent = `${node.player} (${node.move})`;
      } else {
        t2.textContent = `${node.move}`;
      }
    }

    g.appendChild(t2);
    // Tooltip
    g.addEventListener("mouseenter", () => {
      showTooltip(node, node._x, node._y);
    });
    g.addEventListener("mouseleave", hideTooltip);

    svg.appendChild(g);

    if (node.children) for (const ch of node.children) drawNodes(ch);
  }

  // ----------- Tooltip hiển thị state 3x3 -----------
  function showTooltip(node, x, y) {
    hideTooltip();

    const tt = document.createElementNS("http://www.w3.org/2000/svg", "g");
    tt.setAttribute("id", "__tooltip");

    // Kích thước tooltip
    const cellSize = 24;
    const rows = 3;
    const cols = 3;
    const padding = 10;
    const tooltipWidth = cols * cellSize + padding * 2;
    const tooltipHeight = rows * cellSize + padding * 2;

    // Vị trí hiển thị tooltip (bên phải node)
    const offsetX = 20;
    const offsetY = -tooltipHeight / 2;

    // Vẽ khung tooltip
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x + offsetX);
    rect.setAttribute("y", y + offsetY);
    rect.setAttribute("width", tooltipWidth);
    rect.setAttribute("height", tooltipHeight);
    rect.setAttribute("rx", 6);
    rect.setAttribute("ry", 6);
    rect.setAttribute("fill", "#fff");
    rect.setAttribute("stroke", "#333");
    rect.setAttribute("stroke-width", "1");
    tt.appendChild(rect);

    // Hiển thị state 3x3
    const state = node.state || Array(9).fill(null);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const tx = x + offsetX + padding + c * cellSize + cellSize / 2;
        const ty = y + offsetY + padding + r * cellSize + cellSize / 2 + 4;

        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", tx);
        text.setAttribute("y", ty);
        text.setAttribute("font-size", "14");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("alignment-baseline", "middle");
        text.textContent = state[i] || ".";
        tt.appendChild(text);
      }
    }

    svg.appendChild(tt);
  }

  function hideTooltip() {
    const old = document.getElementById("__tooltip");
    if (old) old.remove();
  }

  // ----------- 7. Gọi vẽ -----------
  drawEdges(tree);
  drawNodes(tree);
}

renderBoard();
