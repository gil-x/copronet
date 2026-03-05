/**
 * Formulaire de visite - Handler JS
 */
class VisiteForm {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        this.submitBtn = this.form.querySelector('[type="submit"]');
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

        // Désactiver le bouton pendant l'envoi
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = "ENVOI EN COURS...";

        const formData = new FormData(this.form);

        try {
            const response = await fetch("/php/quality.php", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                this.showMessage(
                    "Le rapport de visite a bien été envoyé.",
                    "success"
                );
                this.form.reset();
                this.submitBtn.textContent = "Envoyé ✓";
            } else {
                const errorText = await response.text();
                throw new Error(errorText || "Erreur serveur");
            }
        } catch (error) {
            this.showMessage(
                `Problème d'envoi, veuillez réessayer. (${error.message})`,
                "error"
            );
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = "Envoyer";
        }
    }

    showMessage(message, type) {
        const oldMsg = this.form.querySelector(".form-message");
        if (oldMsg) oldMsg.remove();

        const msgDiv = document.createElement("div");
        msgDiv.className = `form-message form-message--${type}`;
        msgDiv.textContent = message;

        const actions = this.form.querySelector(".form-actions");
        actions.insertAdjacentElement("beforebegin", msgDiv);

        if (type !== "success") {
            setTimeout(() => msgDiv.remove(), 6000);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new VisiteForm(".form");
});