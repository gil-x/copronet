const carrousels = Array.from(document.querySelectorAll(".carrousel"));
const timeInterval = 2000;
console.log("Carrousel JS Ready");
carrousels.forEach((carrousel) => {
  console.log("Carrousel found:", carrousel);
});

function updateCarousel(carrousel, index, itemWidth) {
  // Calculate the new scroll position
  const newScrollPosition = index * itemWidth;
  carrousel.scrollTo({
    left: newScrollPosition,
    behavior: "smooth",
  });
}
export function handleCarrousels() {
  carrousels.forEach((carrousel) => {
    console.log("Carrousel found:", carrousel);
    let currentIndex = 0;
    const items = carrousel.querySelectorAll(".carrousel__item");
    const totalItems = items.length;
    const itemWidth = items[0].offsetWidth; // Assuming all items have the same width
    const visibleItems = Math.ceil(carrousel.offsetWidth / itemWidth - 1);

    const controls = carrousel.nextElementSibling;

    if (!controls) {
      console.error("No controls found for carrousel:", carrousel);
      return;
    }

    const prevButton = controls.querySelector(".controls__btn:first-child");
    const nextButton = controls.querySelector(".controls__btn:last-child");

    let interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % totalItems; // Move to the next item
      updateCarousel(carrousel, currentIndex, itemWidth);
    }, timeInterval);

    carrousel.addEventListener("touchmove", function () {
      clearInterval(interval);
    });

    updateCarousel(carrousel, currentIndex, itemWidth); // Initialize the carousel position
  });
}
handleCarrousels();
