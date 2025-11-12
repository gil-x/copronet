const header = document.querySelector(".header");
const mainMenu = document.querySelector(".nav");
const submenu = document.querySelector(".submenu");
const fixedEntries = Array.from(document.querySelectorAll(".cta-btn-mini"));

const toggleMobileMenu = () => {
  mainMenu.classList.toggle("visible");
  document.body.classList.toggle("no-scroll");
};

const isTouchDevice = () => {
  if ("ontouchstart" in document.documentElement) {
    return true;
  }
  return false;
};

// DESIGN TEST
const designTest = document.querySelector(".design");
const actions = {
  i: () => (designTest.style.opacity = 0),
  v: () => (designTest.style.opacity = 1.0),
  d: () => (designTest.style.opacity = 0.5),
};

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (actions[key]) {
    actions[key]();
  }
});

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("header__call-menu-icon")) {
    toggleMobileMenu();
  } else if (
    event.target.classList.contains("section__offer__details__title")
  ) {
    event.target.nextElementSibling.classList.toggle("visible");
    event.target.classList.toggle("active");
  } else if (
    event.target.classList.contains("menu-item") ||
    event.target.parentElement.classList.contains("menu-item")
  ) {
    toggleMobileMenu();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const image = document.getElementById("circle");

  // alert(window.innerWidth);

  if (image) {
    // Store the original src
    const originalSrc = image.src;
    const hoverSrc = originalSrc.replace(".png", "_hover.png");

    function handleMouseEnter() {
      image.src = hoverSrc;
    }
    function handleMouseLeave() {
      image.src = originalSrc;
    }

    image.addEventListener("mouseenter", handleMouseEnter);
    image.addEventListener("mouseleave", handleMouseLeave);
  }

  let lastScrollTop = 0;

  window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
      // On scroll vers le bas
      header.classList.add("hidden");
      fixedEntries.forEach((entry) => {
        entry.classList.add("hidden");
      });
    } else {
      // On scroll vers le haut
      header.classList.remove("hidden");

      if (!document.body.classList.contains("contact")) {
        fixedEntries.forEach((entry) => {
          entry.classList.remove("hidden");
        });
      }
    }
    if (scrollTop < header.offsetHeight) {
      header.classList.remove("hidden");
      fixedEntries.forEach((entry) => {
        entry.classList.remove("hidden");
      });
    }

    lastScrollTop = scrollTop;
  });

  // Animations when elements visibles
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("on");
        }
      });
    },
    { threshold: 0.1 },
  );

  document
    .querySelectorAll(
      ".service__img, .boss__pict__container--left, .free-quote.desktop",
    )
    .forEach((el) => observer.observe(el));
});
