/**
 * Infinite Scroll Banner
 */
class InfiniteScroll {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.roll = this.container.querySelector(".section__customers__roll");
    this.init();
  }

  init() {
    // Dupliquer les items pour l'effet infini
    const items = Array.from(this.roll.children);
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      this.roll.appendChild(clone);
    });

    // Ajuster la vitesse selon la largeur
    this.adjustSpeed();
    window.addEventListener("resize", () => this.adjustSpeed());
  }

  adjustSpeed() {
    const rollWidth = this.roll.scrollWidth / 2; // Moitié car dupliqué
    const duration = rollWidth / 50; // 50px par seconde (ajuste selon besoin)
    this.roll.style.animationDuration = `${duration}s`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new InfiniteScroll(".section__customers__roll-container");
});
