document.addEventListener("DOMContentLoaded", function () {
  const lButton = document.querySelector(".left");
  const rButton = document.querySelector(".right");

  rButton.addEventListener("mouseover", function () {
    lButton.classList.toggle("hovered");
  });
  rButton.addEventListener("mouseout", function () {
    lButton.classList.remove("hovered");
  });
});

function randomizeAnimationDelays() {
  const elements = document.querySelectorAll(".members__pict");

  elements.forEach((element, index) => {
    const randomDelay = 0.1 + Math.random() * 1.2;
    element.style.animationDelay = `${randomDelay.toFixed(2)}s`;
    const randomDuration = 0.3 + Math.random() * 0.7;
    element.style.animationDuration = `${randomDuration.toFixed(2)}s`;
  });
}
randomizeAnimationDelays();
