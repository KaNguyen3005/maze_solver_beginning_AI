
async function generateMaze() {
  // Lấy mode từ query string
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") || ""; 

  // Chọn kích thước theo mode
  const rows = mode === "step_by_step" ? ROWS_STEP_BY_STEP : ROWS;
  const cols = mode === "step_by_step" ? COLS_STEP_BY_STEP : COLS;

  // Gọi API kèm query params rows & cols
  const res = await fetch(`/api/generate?rows=${rows}&cols=${cols}`);
  const data = await res.json();

  // Cập nhật maze và kích thước, start/end
  maze = data.maze;
 
  // Nếu server không trả start/end đúng, đặt mặc định theo rows/cols
  if (!start) start = [0, 0];
  if (!end) end = [rows - 1, cols - 1];

  window.ACTUAL_ROWS = rows;
  window.ACTUAL_COLS = cols;
  CELL_SIZE = canvas.width / cols;

  // Reset path & visited
  path = [];
  visited = [];

  drawMaze();
}

window.onload = () => {
  // Lấy algo từ query string
  const params = new URLSearchParams(window.location.search);
  // Sau đó generate maze
  generateMaze();
};
