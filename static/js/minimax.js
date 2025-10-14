const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const svg = document.getElementById('treeSvg');

let board = Array(9).fill(null);
let human = 'X', bot = 'O';

function renderBoard(){
  boardEl.innerHTML = '';
  board.forEach((v,i)=>{
    const d = document.createElement('div');
    d.className = 'cell';
    d.textContent = v || '';
    d.addEventListener('click', ()=> onCellClick(i));
    boardEl.appendChild(d);
  });
}

function onCellClick(i){
  if (board[i]) return;
  // check if game ended
  const winner = checkWinner(board);
  if (winner) { statusEl.textContent = 'Game ended. Reset to play again.'; return; }

  board[i] = human;
  renderBoard();
  sendToServer();
}

function checkWinner(b){
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const [a,b1,c] of lines){
    if (b[a] && b[a]===b[b1] && b[a]===b[c]) return b[a];
  }
  if (b.every(x=>x!==null)) return 'DRAW';
  return null;
}

async function sendToServer(){
  statusEl.textContent = 'Thinking...';
  try {
    const res = await fetch('/api/move', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ board: board, bot: bot })
    });
    const data = await res.json();
    if (data.error) { statusEl.textContent = data.error; return; }
    const move = data.move;
    const tree = data.tree;
    // apply bot move if present
    if (move !== null && move !== undefined) {
      board[move] = bot;
    }
    renderBoard();
    statusEl.textContent = 'Bot played at ' + (move === null ? 'none' : move);
    drawTree(tree);
  } catch (err){
    console.error(err);
    statusEl.textContent = 'Server error';
  }
}

document.getElementById('resetBtn').addEventListener('click', ()=>{
  board = Array(9).fill(null);
  renderBoard();
  svg.innerHTML = '';
  statusEl.textContent = '';
});
document.getElementById('genBtn').addEventListener('click', ()=>{
  // random partial board (valid)
  board = Array(9).fill(null);
  const steps = Math.floor(Math.random()*5);
  let cur = 'X';
  for(let k=0;k<steps;k++){
    const empties = board.map((v,i)=> v===null ? i : -1).filter(i=>i>=0);
    if (empties.length===0) break;
    const idx = empties[Math.floor(Math.random()*empties.length)];
    board[idx] = cur;
    cur = cur === 'X' ? 'O' : 'X';
    if (checkWinner(board)) break;
  }
  renderBoard();
  svg.innerHTML = '';
});

// ---------- Tree rendering ----------
function drawTree(tree){
  svg.innerHTML = '';
  if (!tree) return;

  // Step 1: compute layout (simple top->down, each subtree width = sum widths)
  function computeWidths(node){
    if (!node.children || node.children.length===0) {
      node._width = 1;
      node._height = 1;
      return 1;
    }
    let w = 0;
    for(const ch of node.children) w += computeWidths(ch);
    node._width = w;
    return node._width;
  }
  computeWidths(tree);

  const levelGapY = 100;
  const nodeGapX = 60;
  const nodeRadius = 18;

  // compute positions
  function setPositions(node, xStart, depth){
    // xStart is the leftmost x for this subtree
    if (!node.children || node.children.length===0){
      node._x = xStart + nodeRadius;
      node._y = depth * levelGapY + nodeRadius + 10;
      return xStart + node._width * nodeGapX;
    }
    let curX = xStart;
    for(const ch of node.children){
      curX = setPositions(ch, curX, depth+1);
    }
    // center this node over its children
    const first = node.children[0], last = node.children[node.children.length-1];
    node._x = (first._x + last._x) / 2;
    node._y = depth * levelGapY + nodeRadius + 10;
    return xStart + node._width * nodeGapX;
  }

  setPositions(tree, 10, 0);

  // Determine svg size
  const maxX = findMaxX(tree) + 200;
  const maxY = findMaxY(tree) + 100;
  svg.setAttribute('viewBox', `0 0 ${Math.max(600, maxX)} ${Math.max(400, maxY)}`);

  // draw edges then nodes
  function drawEdges(node){
    if (!node.children) return;
    for(const ch of node.children){
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1', node._x);
      line.setAttribute('y1', node._y + nodeRadius);
      line.setAttribute('x2', ch._x);
      line.setAttribute('y2', ch._y - nodeRadius);
      line.setAttribute('class','edge');
      svg.appendChild(line);
      drawEdges(ch);
    }
  }
  function drawNodes(node){
    // circle
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('transform', `translate(${node._x},${node._y})`);
    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('r', nodeRadius);
    circle.setAttribute('class','node-circle');
    g.appendChild(circle);

    // small text: score
    const t1 = document.createElementNS('http://www.w3.org/2000/svg','text');
    t1.setAttribute('class','node-text');
    t1.setAttribute('y', '-6');
    t1.textContent = node.score === null ? '' : node.score;
    g.appendChild(t1);

    // move / player text
    const t2 = document.createElementNS('http://www.w3.org/2000/svg','text');
    t2.setAttribute('class','node-text');
    t2.setAttribute('y', '10');
    t2.textContent = node.move===null ? '' : (node.player || '') + '@' + (node.move);
    g.appendChild(t2);

    // tooltip on hover -> show state small grid
    g.addEventListener('mouseenter', ()=>{
      showTooltip(node, node._x, node._y);
    });
    g.addEventListener('mouseleave', hideTooltip);

    svg.appendChild(g);

    if (node.children) for(const ch of node.children) drawNodes(ch);
  }

  function showTooltip(node, x, y){
    hideTooltip();
    const tt = document.createElementNS('http://www.w3.org/2000/svg','g');
    tt.setAttribute('id','__tooltip');
    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x', x + 20);
    rect.setAttribute('y', y - 10);
    rect.setAttribute('width', 120);
    rect.setAttribute('height', 90);
    rect.setAttribute('fill','#fff');
    rect.setAttribute('stroke','#333');
    svg.appendChild(tt);
    tt.appendChild(rect);

    // draw small 3x3 state
    const state = node.state || Array(9).fill(null);
    const cellW = 36;
    for(let r=0;r<3;r++){
      for(let c=0;c<3;c++){
        const i = r*3 + c;
        const tx = x + 26 + c*cellW;
        const ty = y - 6 + r*20;
        const text = document.createElementNS('http://www.w3.org/2000/svg','text');
        text.setAttribute('x', tx);
        text.setAttribute('y', ty);
        text.setAttribute('font-size', '12');
        text.textContent = state[i] || '.';
        tt.appendChild(text);
      }
    }
  }
  function hideTooltip(){
    const prev = document.getElementById('__tooltip');
    if (prev) prev.remove();
  }

  function findMaxX(node){
    let mx = node._x;
    if (node.children) for(const ch of node.children) mx = Math.max(mx, findMaxX(ch));
    return mx;
  }
  function findMaxY(node){
    let my = node._y;
    if (node.children) for(const ch of node.children) my = Math.max(my, findMaxY(ch));
    return my;
  }

  drawEdges(tree);
  drawNodes(tree);
}

renderBoard()