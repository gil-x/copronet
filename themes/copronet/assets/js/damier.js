document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".service:not(.cta)").forEach((item, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    item.style.background =
      (row + col) % 2 === 0 ? "transparent" : "rgba(237, 237, 237, 1)";
  });
});
