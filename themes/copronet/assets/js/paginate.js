document.addEventListener("DOMContentLoaded", function () {
  const loadMoreBtn = document.getElementById("load-more-btn");
  const loadMoreText = document.querySelector(".load-more__text");
  const loadMoreFill = document.querySelector(".load-more__fill");
  const postsContainer = document.querySelector(".posts");

  if (loadMoreBtn && postsContainer) {
    // Initialiser le compteur
    let currentCount = document.querySelectorAll(".post-card").length;
    const totalCount = parseInt(loadMoreBtn.dataset.total) || 0;

    function updateButton() {
      loadMoreText.innerHTML = `Vous avez vu ${currentCount} articles sur ${totalCount}`;
      loadMoreFill.style.width = `${(currentCount / totalCount) * 100}%`;
      loadMoreBtn.innerHTML = "Charger davantage";
      // loadMoreBtn.innerHTML = `
      //   <span>Vous avez vu ${currentCount} contenus sur ${totalCount}</span>
      //   <div class="progress-bar">
      //     <div class="progress-bar__fill" style="width: ${(currentCount / totalCount) * 100}%"></div>
      //   </div>
      // `;
    }

    updateButton();

    loadMoreBtn.addEventListener("click", function () {
      const nextUrl = this.dataset.next;
      const fullUrl = new URL(nextUrl, window.location.origin).href;

      // État de chargement
      this.innerHTML = "Chargement...";

      fetch(fullUrl)
        .then((response) => response.text())
        .then((html) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const newPosts = doc.querySelectorAll(".post-card");
          const nextBtn = doc.querySelector("#load-more-btn");

          if (newPosts.length > 0) {
            newPosts.forEach((post) => {
              postsContainer.appendChild(post);
            });
            currentCount += newPosts.length;
          }

          if (nextBtn && nextBtn.dataset.next) {
            this.dataset.next = nextBtn.dataset.next;
            updateButton();
          } else {
            updateButton();
            loadMoreText.innerHTML = `Tous les articles chargés (${totalCount})`;
            // this.innerHTML = `<span>Tous les articles chargés (${totalCount})</span>`;
            // this.style.opacity = 0;
            this.classList.add("disapear");
          }
        });
    });
  }
});
