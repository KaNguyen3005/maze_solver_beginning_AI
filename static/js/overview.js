// Lấy tham số algo từ URL
const urlParams = new URLSearchParams(window.location.search);
const algo = urlParams.get("algo");

console.log(algo)

// Gán link cho menu phụ để chuyển trang vẫn giữ algo
if(algo === "ffill"){
    mazeSimulationUrl =  new URL(`/flood_fill.html`, window.location.origin);
}
else{
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

// // Fetch dữ liệu nội dung từ JSON
fetch("../static/data/algorithms.json")
  .then((res) => res.json())
  .then((data) => {
    const content = data[algo];
    if (!content) {
      document.getElementById("algo-title").innerText = "Không tìm thấy nội dung!";
      return;
    }
    document.getElementById("algo-title").innerText = content.title;
    document.getElementById("algo-content").innerHTML = content.overview;
  })
  .catch((err) => console.error(err));
