// Hàm lấy giá trị tham số trên URL
function getQueryParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

const algo = getQueryParam("algo");

let mazeSimulationUrl;
if (algo === "ffill") {
  mazeSimulationUrl = new URL(`/flood_fill.html?algo=${algo}`, window.location.origin);
} else if (algo === "minimax") {
  mazeSimulationUrl = new URL(`/minimax.html?algo=${algo}`, window.location.origin);
} else {
  mazeSimulationUrl = new URL(`/maze.html?algo=${algo}&mode=simulation`, window.location.origin);
}
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


const overviewEl = document.querySelector(".overview");
const theoryEl = document.querySelector(".theory");
const simulationEl = document.querySelector(".simulation");
const stepByStepEl = document.querySelector(".stepbystep");
const quizEl = document.querySelector(".quiz");

if (overviewEl) overviewEl.href = mazeOverviewUrl;
if (theoryEl) theoryEl.href = mazeTheoryUrl;
if (simulationEl) simulationEl.href = mazeSimulationUrl;
if (stepByStepEl) stepByStepEl.href = mazeStepByStepUrl;
if (quizEl) quizEl.href = mazeQuizUrl;

// --- Disable step-by-step & quiz cho các thuật toán đặc biệt ---
const forwardNames = new Set([
  "forward",
  "forwardchaining",
  "forward_chaining",
  "forward-chaining",
  "fc",
  "forwardchain",
  "forward_chain"
]);

const isAlgoRestricted =
  algo === "ffill" ||
  algo === "minimax" ||
  forwardNames.has(String(algo).toLowerCase());

// helper functions
function disableAnchor(el, reasonText = "") {
  if (!el) return;
  if (!el.dataset.origHref) el.dataset.origHref = el.getAttribute("href") || "";
  el.removeAttribute("href");
  el.classList.add("disabled");
  el.setAttribute("aria-disabled", "true");
  el.title = reasonText || "Tính năng này không khả dụng với thuật toán này.";
  el.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  });
}

function enableAnchor(el) {
  if (!el) return;
  if (el.dataset.origHref) {
    el.setAttribute("href", el.dataset.origHref);
    delete el.dataset.origHref;
  }
  el.classList.remove("disabled");
  el.removeAttribute("aria-disabled");
  el.removeAttribute("title");
  const clone = el.cloneNode(true);
  el.parentNode.replaceChild(clone, el);
}

// áp dụng
if (isAlgoRestricted) {
  const reason =
    algo === "ffill"
      ? "Step-by-step và Quiz không khả dụng với Flood Fill."
      : algo === "minimax"
      ? "Step-by-step và Quiz không khả dụng với Minimax."
      : "Step-by-step và Quiz không khả dụng với Forward Chaining.";
  disableAnchor(stepByStepEl, reason);
  disableAnchor(quizEl, reason);
  if(algo === "fc"){
    disableAnchor(simulationEl, reason)
  }
} else {
  enableAnchor(stepByStepEl);
  enableAnchor(quizEl);
  enableAnchor(simulationEl);
}

// --- CSS disable ---
(function injectDisabledCss() {
  const css = `
    a.disabled {
      pointer-events: none;
      opacity: 0.45;
      cursor: default;
      text-decoration: none;
    }
    a.disabled:hover {
      text-decoration: none;
    }
  `;
  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);
})();
// // Fetch dữ liệu nội dung từ JSON
fetch("../static/data/theory.json")
  .then((res) => res.json())
  .then((data) => {
    const content = data[algo];
    if (!content) {
      document.getElementById("algo-title").innerText = "";
      return;
    }
    document.getElementById("algo-title").innerText = content.title;
    document.getElementById("algo-content").innerHTML = content.overview;
  })
  .catch((err) => console.error(err));
