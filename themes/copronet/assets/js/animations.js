document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("on");
          if (entry.target instanceof Element) {
            const delay = getComputedStyle(entry.target).transitionDelay;
            setTimeout(() => {
              removeTransitionDelay(entry.target);
            }, delay);
          }

          // removeTransitionDelay(entry);
        }
      });
    },
    { threshold: 0.1 },
  );

  document
    .querySelectorAll(
      ".service__img, .post__img, .boss__pict__container--left",
      "free-quote.desktop",
    )
    .forEach((el) => observer.observe(el));
});
