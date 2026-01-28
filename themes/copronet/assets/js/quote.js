// FORM
const form = document.getElementById("multiStepForm");
const steps = Array.from(form.querySelectorAll(".form-step"));
const stepTitles = Array.from(form.querySelectorAll(".step-title"));
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const sendBtn = document.getElementById("sendBtn");

let currentStep = 0;
const stepsCompleted = Array(steps.length).fill(false);

// --- Initialization ---
function initializeForm() {
  showStep(0); // Show the first step initially
  updateButtonVisibility();
  addEventListeners();
}

// --- Event Listeners ---
function addEventListeners() {
  if (nextBtn) {
    nextBtn.addEventListener("click", handleNext);
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", handlePrevious);
  }
  sendBtn.addEventListener("click", handleSubmit); // Changed type="submit" button
  steps[1].querySelector(".step-title").addEventListener("click", handleNext);
  steps[2].querySelector(".step-title").addEventListener("click", handleNext);

  stepTitles.forEach((title, index) => {
    title.addEventListener("click", () => handleTitleClick(index));
  });

  // Add input validation feedback listener
  steps.forEach((step, stepIndex) => {
    const inputs = step.querySelectorAll(
      "input[required], select[required], textarea[required]",
    );
    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        validateInput(input);
        checkStepCompletion(stepIndex); // ← Ajout
      });
      input.addEventListener("change", () => {
        // Pour radios/selects
        checkStepCompletion(stepIndex); // ← Ajout
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
    console.log(`Step ${currentStep + 1} is invalid.`);
    // Optional: Focus the first invalid field
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
    // No validation needed when going back, but clear current step errors? Optional.
    // clearStepErrors(currentStep);
    currentStep--;
    showStep(currentStep);
  }
}

function handleSubmit(event) {
  event.preventDefault(); // Prevent default form submission
  if (validateStep(currentStep)) {
    markStepCompleted(currentStep);
    console.log("Form Submitted! Data would be sent here.");

    const formData = new FormData(form); // Create a FormData object
    formData.append("action", "multistep_form_submit");
    formData.append("nonce", form.nonce);

    // Use Fetch API to send the form data
    fetch(form.ajaxurl, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Thank you! Your form has been submitted.");
          form.reset(); // Reset the form
        } else {
          console.log("An error occurred: " + data.data);
          form.innerHTML =
            '<p class="form-message form-message--error">Problème d\'envoi, veuillez réessayer.</p>';
          // Or gather data: const formData = new FormData(form);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // alert("An unexpected error occurred.");
      });
    // Disable form / show success message
    form.innerHTML =
      '<p class="form-message form-message--success">Merci pour votre demande de devis, elle a bien été prise en compte.<br>Notre équipe y travaille et vous fera un retour sous 24h maximum. À très bientôt !</p>';
    // Or gather data: const formData = new FormData(form);
  } else {
    console.log(`Final step (${currentStep + 1}) is invalid.`);
    const firstInvalid = steps[currentStep].querySelector(
      ".is-invalid, :invalid",
    );
    if (firstInvalid) {
      firstInvalid.focus();
    }
  }
}

function handleTitleClick(targetStepIndex) {
  // Allow clicking only if the target step is already completed OR it's the current step (to collapse/reopen maybe? No, let's stick to completed)
  // Or allow going back to any previous step if current step is valid or target is before current
  if (targetStepIndex === currentStep) {
    // Optional: Toggle current step visibility? For now, do nothing.
    return;
  }

  if (stepsCompleted[targetStepIndex] || targetStepIndex < currentStep) {
    // If moving *forward* via title click (shouldn't happen based on rule, but safety check)
    if (targetStepIndex > currentStep) {
      if (validateStep(currentStep)) {
        markStepCompleted(currentStep);
        currentStep = targetStepIndex;
        showStep(currentStep);
      }
    } else {
      // Moving backward via title click
      // Optional: Validate current step before allowing to leave? Not typical for back navigation.
      // clearStepErrors(currentStep); // Clear errors when leaving
      currentStep = targetStepIndex;
      showStep(currentStep);
    }
  }
  // Do nothing if clicking a future, non-completed step title
}

// --- Step Visibility and State ---
function showStep(stepIndex) {
  // Retire accessible de toutes les steps
  steps.forEach((step) => {
    step.classList.remove("accessible");
  });

  // Ajoute accessible uniquement à la step courante
  steps[stepIndex].classList.add("accessible");

  steps.forEach((step, index) => {
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

  clearStepErrors(stepIndex); // Clear previous errors for this step

  requiredInputs.forEach((input) => {
    if (!validateInput(input)) {
      // Use helper for individual validation
      isValid = false;
    }
  });

  return isValid;
}

function validateInput(input) {
  // Special handling for radio groups: check if *any* in the group is checked
  if (input.type === "radio" && input.required) {
    const groupName = input.name;
    const group = steps[currentStep].querySelectorAll(
      `input[name="${groupName}"]`,
    );
    const isChecked = Array.from(group).some((radio) => radio.checked);
    if (!isChecked) {
      // Mark the group or the first radio? Let's mark the group's container/label if possible
      const radioGroup = input.closest(".radio-group"); // Find the container
      if (radioGroup) {
        radioGroup.classList.add("group-invalidd");
      } // Add a class for group error styling (add SCSS for this)
      // Also mark the first input for consistency?
      markInputInvalid(input);
      return false;
    } else {
      const radioGroup = input.closest(".radio-group");
      if (radioGroup) {
        radioGroup.classList.remove("group-invalid");
      }
      // Need to clear invalid state from *all* radios in the group if one is valid
      const groupName = input.name;
      const group = steps[currentStep].querySelectorAll(
        `input[name="${groupName}"]`,
      );
      group.forEach((radio) => markInputValid(radio));
      return true;
    }
  }
  // Standard validation for other types
  else if (!input.checkValidity()) {
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
      console.log(
        "isChecked:",
        Array.from(group).some((radio) => radio.checked),
      );
      if (!isChecked) allValid = false;
    } else if (!input.value.trim() || !input.checkValidity()) {
      allValid = false;
    }
  });

  // Gère la classe completed
  if (allValid) {
    steps[stepIndex].classList.add("completed");
    stepsCompleted[stepIndex] = true;

    if (steps[stepIndex + 1]) {
      steps[stepIndex + 1].classList.add("accessible");
      console.log("apply accessible to:", steps[stepIndex + 1]);
    }
  } else {
    steps[stepIndex].classList.remove("completed"); // ← Retire si invalide
    stepsCompleted[stepIndex] = false;
    if (steps[stepIndex + 1]) {
      steps[stepIndex + 1].classList.remove("accessible");
      console.log("remove accessible to:", steps[stepIndex + 1]);
    }
  }
}

function markInputInvalid(input) {
  input.classList.add("is-invalid");
  // Optional: Add error message display logic here
}
function markInputValid(input) {
  input.classList.remove("is-invalid");
  // Optional: Remove error message display logic here
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

  sendBtn.style.display =
    currentStep === steps.length - 1 ? "inline-block" : "none";

  if (nextBtn) {
    nextBtn.style.display =
      currentStep < steps.length - 1 ? "inline-block" : "none";
  }
}

// --- Start the form ---
initializeForm();
