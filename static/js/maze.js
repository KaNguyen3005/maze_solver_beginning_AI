
function updateMenuLinks(algo) {
  const mazeSimulationUrl = new URL(`/maze.html?algo=${algo}&mode=simulation`, window.location.origin);
  const mazeStepByStepUrl = new URL(`/maze.html?algo=${algo}&mode=step_by_step`, window.location.origin);
  const mazeOverviewUrl = new URL(`Algorithm/overview.html?algo=${algo}`, window.location.origin);
  const mazeTheoryUrl = new URL(`Algorithm/theory.html?algo=${algo}`, window.location.origin);
  const mazeQuizUrl = new URL(`Algorithm/quiz.html?algo=${algo}`, window.location.origin);

  document.querySelector(".overview").href = mazeOverviewUrl;
  document.querySelector(".theory").href = mazeTheoryUrl;
  document.querySelector(".simulation").href = mazeSimulationUrl;
  document.querySelector(".stepbystep").href = mazeStepByStepUrl;
  document.querySelector(".quiz").href = mazeQuizUrl;
}

// --- Lấy thuật toán hiện tại từ URL ---
const urlParams = new URLSearchParams(window.location.search);
let algo = urlParams.get("algo") || "bfs"; // mặc định BFS nếu không có

// Gán giá trị cho dropdown ban đầu
const algoSelect = document.getElementById("algoSelect");
algoSelect.value = algo;

// Gọi hàm cập nhật link menu khi load
updateMenuLinks(algo);

// --- Lắng nghe sự kiện đổi thuật toán ---
algoSelect.addEventListener("change", (e) => {
  const newAlgo = e.target.value;

  // Cập nhật URL trên thanh địa chỉ mà không reload
  const newUrl = `${window.location.pathname}?algo=${newAlgo}&mode=${urlParams.get("mode")}`;
  window.history.pushState({}, "", newUrl);

  // Cập nhật lại menu
  updateMenuLinks(newAlgo);
});

// --- Khi người dùng bấm back/forward ---
window.addEventListener("popstate", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentAlgo = urlParams.get("algo") || "bfs";
  algoSelect.value = currentAlgo;
  updateMenuLinks(currentAlgo);
});