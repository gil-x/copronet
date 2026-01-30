function checkSide(event) {
  const rect = event.target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Calcul des distances aux bords
  const top = y;
  const bottom = rect.height - y;
  const left = x;
  const right = rect.width - x;

  // Le plus petit = côté d'entrée
  const min = Math.min(top, bottom, left, right);

  let side;
  if (min === top) side = "top";
  else if (min === bottom) side = "bottom";
  else if (min === left) side = "left";
  else side = "right";

  return side;
}

document.addEventListener("DOMContentLoaded", function () {
  const lButton = document.querySelector(".left");
  const rButton = document.querySelector(".right");

  lButton.addEventListener("mouseenter", function (event) {
    let side = checkSide(event);

    if (side === "right") {
      lButton.classList.remove("hovered");
      rButton.classList.remove("hovered");
    } else {
      lButton.classList.add("hovered");
      rButton.classList.add("hovered");
    }
  });

  lButton.addEventListener("mouseleave", function (event) {
    let side = checkSide(event);
    if (side === "right") {
      lButton.classList.add("hovered");
      rButton.classList.add("hovered");
    } else {
      lButton.classList.remove("hovered");
      rButton.classList.remove("hovered");
    }
  });

  rButton.addEventListener("mouseenter", function (event) {
    let side = checkSide(event);

    if (side === "left") {
      rButton.classList.remove("hovered");
      lButton.classList.remove("hovered");
    } else {
      rButton.classList.add("hovered");
      lButton.classList.add("hovered");
    }
  });

  rButton.addEventListener("mouseleave", function (event) {
    let side = checkSide(event);
    if (side === "right") {
      rButton.classList.add("hovered");
      lButton.classList.add("hovered");
    } else {
      rButton.classList.remove("hovered");
      lButton.classList.remove("hovered");
    }
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
