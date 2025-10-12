// Hàm lấy giá trị tham số trên URL
function getQueryParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

const algo = getQueryParam("algo");

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

// Hàm fetch nội dung thuật toán
function loadAlgorithmContent() {
  if (!algo) {
    document.getElementById("algo-title").innerText = "Thuật toán không xác định!";
    return;
  }

  fetch("/static/data/theory.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error("Không thể tải file JSON.");
      }
      return res.json();
    })
    .then((data) => {
      const content = data[algo];
      if (!content) {
        document.getElementById("algo-title").innerText = "Không tìm thấy nội dung!";
        return;
      }

      // Render ra giao diện
      document.getElementById("algo-title").innerText = content.title;
      document.getElementById("algo-content").innerHTML = content.overview;
    })
    .catch((err) => {
      console.error("Lỗi fetch:", err);
      document.getElementById("algo-title").innerText = "Lỗi tải dữ liệu!";
    });
}

// Gọi khi trang load xong
document.addEventListener("DOMContentLoaded", loadAlgorithmContent);
