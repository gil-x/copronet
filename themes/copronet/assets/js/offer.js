document.addEventListener("DOMContentLoaded", function () {
  // Sélectionner tous les éléments avec la classe .hero__expend__title
  const expandTitles = document.querySelectorAll(".hero__expend__title");

  // Ajouter un événement de clic à chaque titre
  expandTitles.forEach(function (title) {
    title.addEventListener("click", function () {
      // Toggle la classe .active sur le titre cliqué
      this.classList.toggle("active");

      // Trouver l'élément suivant avec la classe .hero__expend__p
      const nextElement = this.nextElementSibling;

      if (nextElement && nextElement.classList.contains("hero__expend__p")) {
        // Toggle la classe .hidden sur l'élément de contenu
        nextElement.classList.toggle("hidden");
      }
    });
  });
});
