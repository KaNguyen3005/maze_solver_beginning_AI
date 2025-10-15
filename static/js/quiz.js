document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const algo = urlParams.get("algo");

  // ✅ Di chuyển đoạn này vào trong
let mazeSimulationUrl;
if (algo === "ffill") {
  mazeSimulationUrl = new URL(`/flood_fill.html?algo=${algo}`, window.location.origin);
} else if (algo === "minimax") {
  mazeSimulationUrl = new URL(`/minimax.html?algo=${algo}`, window.location.origin);
} else {
  mazeSimulationUrl = new URL(`/maze.html?algo=${algo}&mode=simulation`, window.location.origin);
}
 const mazeStepByStepUrl = new URL(`maze.html?algo=${algo}&mode=step_by_step`, window.location.origin);
  const mazeOverviewUrl = new URL(`Algorithm/overview.html?algo=${algo}`, window.location.origin);
  const mazeTheoryUrl = new URL(`Algorithm/theory.html?algo=${algo}`, window.location.origin);
  const mazeQuizUrl = new URL(`Algorithm/quiz.html?algo=${algo}`, window.location.origin);

  // Kiểm tra phần tử có tồn tại trước khi gán (tránh lỗi nếu class chưa có trong HTML)
  document.querySelector(".overview")?.setAttribute("href", mazeOverviewUrl);
  document.querySelector(".theory")?.setAttribute("href", mazeTheoryUrl);
  document.querySelector(".simulation")?.setAttribute("href", mazeSimulationUrl);
  document.querySelector(".stepbystep")?.setAttribute("href", mazeStepByStepUrl);
  document.querySelector(".quiz")?.setAttribute("href", mazeQuizUrl);

  const titleEl = document.getElementById("algo-title");
  const contentEl = document.getElementById("algo-content");

  if (!algo) {
    titleEl.textContent = "❌ Không có thuật toán nào được chọn!";
    return;
  }

  try {
    const res = await fetch("../static/data/quiz.json");
    if (!res.ok) throw new Error("Không thể tải file quiz.json");

    const data = await res.json();
    const quiz = data[algo];

    if (!quiz) {
      titleEl.textContent = `❌ Không tìm thấy quiz cho "${algo}"`;
      return;
    }
    console.log(quiz)
    titleEl.textContent = quiz.title;
    contentEl.innerHTML = quiz.overview;
  } catch (error) {
    console.error(error);
    titleEl.textContent = "❌ Lỗi khi tải nội dung quiz!";
  }
});
