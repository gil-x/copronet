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
