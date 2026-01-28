/**
 * Contact Form Handler - Front only
 */
class ContactForm {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.submitBtn = this.form.querySelector("#sendBtn");
    this.init();
  }

  init() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Validation HTML5
    if (!this.form.checkValidity()) {
      this.form.reportValidity();
      return;
    }

    // Désactiver le bouton
    this.submitBtn.disabled = true;
    this.submitBtn.value = "ENVOI EN COURS...";

    const formData = new FormData(this.form);

    try {
      const response = await fetch("/php/contact.php", {
        method: "POST",
        body: formData,
      });

      // Succès si status 200
      if (response.ok) {
        this.showMessage("Votre message a été envoyé avec succès !", "success");
        this.form.reset();
      } else {
        throw new Error("Erreur serveur");
      }
    } catch (error) {
      this.showMessage("Problème d'envoi, veuillez réessayer.", "error");
    } finally {
      this.submitBtn.disabled = false;
      this.submitBtn.value = "ENVOYER";
    }
  }

  showMessage(message, type) {
    const oldMsg = this.form.querySelector(".form-message");
    if (oldMsg) oldMsg.remove();

    const msgDiv = document.createElement("div");
    msgDiv.className = `form-message form-message--${type}`;
    msgDiv.textContent = message;
    this.form.insertBefore(msgDiv, this.form.firstChild);

    setTimeout(() => msgDiv.remove(), 5000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ContactForm("contactForm");
});
