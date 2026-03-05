// FORM
const form = document.getElementById("multiStepForm");
const steps = Array.from(form.querySelectorAll(".form-step"));
const stepTitles = Array.from(form.querySelectorAll(".step-title"));
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const sendBtn = document.getElementById("sendBtn");
const sendResult = document.getElementById("send-result");

let currentStep = 0;
const stepsCompleted = Array(steps.length).fill(false);

// --- Initialization ---
function initializeForm() {
    showStep(0);
    updateButtonVisibility();
    addEventListeners();
}

function displayEndMessage(success) {
    var message;
    sendResult.classList.remove("success", "error");
    if (success) {
        message = "Votre demande de devis a bien été prise en compte";
        sendResult.classList.add("success");
        sendBtn.value = "Merci !";
        sendBtn.disabled = true;
    } else {
        message =
            "Une erreur s'est produite lors de l'envoi du message.<br>Veuillez réessayer.";
        sendResult.classList.add("error");
        sendBtn.value = "Aïe...";
        sendBtn.disabled = true;
    }
    sendResult.innerHTML = message;
}

// --- Event Listeners ---
function addEventListeners() {
    if (nextBtn) {
        nextBtn.addEventListener("click", handleNext);
    }
    if (prevBtn) {
        prevBtn.addEventListener("click", handlePrevious);
    }
    sendBtn.addEventListener("click", handleSubmit);
    steps[1].querySelector(".step-title").addEventListener("click", handleNext);
    steps[2].querySelector(".step-title").addEventListener("click", handleNext);

    stepTitles.forEach((title, index) => {
        title.addEventListener("click", () => handleTitleClick(index));
    });

    steps.forEach((step, stepIndex) => {
        const inputs = step.querySelectorAll(
            "input[required], select[required], textarea[required]",
        );
        inputs.forEach((input) => {
            input.addEventListener("input", () => {
                validateInput(input);
                checkStepCompletion(stepIndex);
            });
            input.addEventListener("change", () => {
                checkStepCompletion(stepIndex);
            });
            input.addEventListener("invalid", (e) => {
                e.preventDefault();
                markInputInvalid(input);
            });
            input.addEventListener("blur", () => validateInput(input));
        });
    });
}

// --- Navigation Logic ---
function handleNext() {
    if (validateStep(currentStep)) {
        markStepCompleted(currentStep);
        if (currentStep < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
        }
    } else {
        const firstInvalid = steps[currentStep].querySelector(
            ".is-invalid, :invalid",
        );
        if (firstInvalid) {
            firstInvalid.focus();
        }
    }
}

function handlePrevious() {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    if (!validateStep(currentStep)) {
        const firstInvalid = steps[currentStep].querySelector(
            ".is-invalid, :invalid",
        );
        if (firstInvalid) firstInvalid.focus();
        return;
    }

    markStepCompleted(currentStep);

    // Désactiver le bouton pendant l'envoi
    sendBtn.disabled = true;
    sendBtn.value = "ENVOI EN COURS...";
    sendResult.innerHTML = "";
    sendResult.className = "";

    const formData = new FormData(form);

    try {
        const response = await fetch("/php/quote.php", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            form.reset();
            displayEndMessage(true);
        } else {
            displayEndMessage(false);
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
        displayEndMessage(false);
    }
}

function handleTitleClick(targetStepIndex) {
    if (targetStepIndex === currentStep) {
        return;
    }

    if (stepsCompleted[targetStepIndex] || targetStepIndex < currentStep) {
        if (targetStepIndex > currentStep) {
            if (validateStep(currentStep)) {
                markStepCompleted(currentStep);
                currentStep = targetStepIndex;
                showStep(currentStep);
            }
        } else {
            currentStep = targetStepIndex;
            showStep(currentStep);
        }
    }
}

// --- Step Visibility and State ---
function showStep(stepIndex) {
    steps.forEach((step) => {
        step.classList.remove("accessible");
    });

    steps[stepIndex].classList.add("accessible");

    steps.forEach((step, index) => {
        if (step.classList.contains("form-navigation")) {
            return;
        }
        const title = stepTitles[index];
        const arrow = title.querySelector(".step-arrow");

        if (index === stepIndex) {
            step.classList.add("active");
            title.classList.add("active-title");
            if (arrow) arrow.innerHTML = "▼";
        } else {
            step.classList.remove("active");
            title.classList.remove("active-title");
            if (arrow) arrow.innerHTML = "▶";
        }

        if (stepsCompleted[index]) {
            title.classList.add("completed");
        } else {
            title.classList.remove("completed");
        }
    });
    updateButtonVisibility();
}

function markStepCompleted(stepIndex) {
    if (stepIndex >= 0 && stepIndex < steps.length) {
        stepsCompleted[stepIndex] = true;
        stepTitles[stepIndex].classList.add("completed");
    }
}

// --- Validation ---
function validateStep(stepIndex) {
    let isValid = true;
    const step = steps[stepIndex];
    const requiredInputs = step.querySelectorAll("[required]");

    clearStepErrors(stepIndex);

    requiredInputs.forEach((input) => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    return isValid;
}

function validateInput(input) {
    if (input.type === "radio" && input.required) {
        const groupName = input.name;
        const group = steps[currentStep].querySelectorAll(
            `input[name="${groupName}"]`,
        );
        const isChecked = Array.from(group).some((radio) => radio.checked);
        if (!isChecked) {
            const radioGroup = input.closest(".radio-group");
            if (radioGroup) {
                radioGroup.classList.add("group-invalidd");
            }
            markInputInvalid(input);
            return false;
        } else {
            const radioGroup = input.closest(".radio-group");
            if (radioGroup) {
                radioGroup.classList.remove("group-invalid");
            }
            const group = steps[currentStep].querySelectorAll(
                `input[name="${groupName}"]`,
            );
            group.forEach((radio) => markInputValid(radio));
            return true;
        }
    } else if (!input.checkValidity()) {
        markInputInvalid(input);
        return false;
    } else {
        markInputValid(input);
        return true;
    }
}

function checkStepCompletion(stepIndex) {
    const step = steps[stepIndex];
    const requiredInputs = step.querySelectorAll("[required]");

    let allValid = true;
    requiredInputs.forEach((input) => {
        if (input.type === "radio") {
            const groupName = input.name;
            const group = step.querySelectorAll(`input[name="${groupName}"]`);
            const isChecked = Array.from(group).some((radio) => radio.checked);
            if (!isChecked) allValid = false;
        } else if (!input.value.trim() || !input.checkValidity()) {
            allValid = false;
        }
    });

    if (allValid) {
        steps[stepIndex].classList.add("completed");
        stepsCompleted[stepIndex] = true;

        if (steps[stepIndex + 1]) {
            steps[stepIndex + 1].classList.add("accessible");
        }
    } else {
        steps[stepIndex].classList.remove("completed");
        stepsCompleted[stepIndex] = false;
        if (steps[stepIndex + 1]) {
            steps[stepIndex + 1].classList.remove("accessible");
        }
    }
    updateButtonVisibility();
}

function markInputInvalid(input) {
    input.classList.add("is-invalid");
}
function markInputValid(input) {
    input.classList.remove("is-invalid");
}

function clearStepErrors(stepIndex) {
    const step = steps[stepIndex];
    const invalidInputs = step.querySelectorAll(".is-invalid");
    invalidInputs.forEach((input) => input.classList.remove("is-invalid"));
    const invalidGroups = step.querySelectorAll(".group-invalid");
    invalidGroups.forEach((group) => group.classList.remove("group-invalid"));
}

// --- Button Visibility ---
function updateButtonVisibility() {
    if (prevBtn) {
        prevBtn.style.display = currentStep > 0 ? "inline-block" : "none";
    }

    if (stepsCompleted[0] && stepsCompleted[1] && stepsCompleted[2]) {
        sendBtn.disabled = false;
    } else {
        sendBtn.disabled = true;
    }

    if (nextBtn) {
        nextBtn.style.display =
            currentStep < steps.length - 1 ? "inline-block" : "none";
    }
}

// --- Start the form ---
initializeForm();