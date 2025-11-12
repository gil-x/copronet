document.addEventListener("DOMContentLoaded", function () {
  if (window.innerWidth > 768) {
    document.querySelectorAll(".service:not(.cta)").forEach((item, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      item.style.background =
        (row + col) % 2 === 0 ? "transparent" : "rgba(237, 237, 237, 1)";
    });
  } else {
    document.querySelectorAll(".service:not(.cta)").forEach((item, i) => {
      if (i === 0 || i === 2 || i === 4 || i === 6) {
        item.style.background = "rgba(237, 237, 237, 1)";
      }
    });
  }
});
