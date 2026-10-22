
"use strict";

const loading = document.getElementById("staticrypt_loading");
const content = document.getElementById("staticrypt_content");
const form = document.getElementById("staticrypt-form");
const passwordInput = document.getElementById("staticrypt-password");
const errorMessage = document.getElementById("staticrypt-error");
const toggleButton = document.getElementById(
    "staticrypt-toggle-password-visibility"
);
const submitButton = form.querySelector('input[type="submit"]');

const PASSWORD_STORAGE_KEY = "annication-password";
const AUTH_FILE = "/auth/check.enc";
const AUTH_CHECK_VALUE = "annication-auth-v1";

async function checkPassword(password) {
    const response = await fetch(AUTH_FILE);

    if (!response.ok) {
        throw new Error("Prüfdatei konnte nicht geladen werden.");
    }

    const encrypted = await response.json();

    try {
        const plaintext = await ContentCrypto.decrypt(encrypted, password);
        return plaintext === AUTH_CHECK_VALUE;
    } catch (error) {
        if (error.name === "OperationError") {
            return false;
        }

        throw error;
    }
}

async function initializePasswordPage() {
    loading.classList.add("hidden");
    content.classList.remove("hidden");

    const savedPassword = sessionStorage.getItem(PASSWORD_STORAGE_KEY);

    if (savedPassword) {
        try {
            if (await checkPassword(savedPassword)) {
                window.location.replace("/");
                return;
            }
        } catch (error) {
            console.error("Automatische Passwortprüfung fehlgeschlagen:", error);
        }

        sessionStorage.removeItem(PASSWORD_STORAGE_KEY);
    }

    passwordInput.focus();
}

toggleButton.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";

    passwordInput.type = isVisible ? "password" : "text";

    toggleButton.setAttribute("aria-pressed", String(!isVisible));
    toggleButton.setAttribute(
        "aria-label",
        isVisible ? "Passwort anzeigen" : "Passwort verbergen"
    );
});

form.addEventListener("submit", async event => {
    event.preventDefault();

    errorMessage.classList.add("hidden");
    submitButton.disabled = true;

    try {
        const password = passwordInput.value;
        const isValid = await checkPassword(password);

        if (!isValid) {
            errorMessage.classList.remove("hidden");
            passwordInput.focus();
            passwordInput.select();
            return;
        }

        sessionStorage.setItem(PASSWORD_STORAGE_KEY, password);
        window.location.replace("/");
    } catch (error) {
        console.error("Passwortprüfung fehlgeschlagen:", error);
        errorMessage.textContent =
            "Die Passwortprüfung ist gerade nicht möglich. Bitte versuche es erneut.";
        errorMessage.classList.remove("hidden");
    } finally {
        submitButton.disabled = false;
    }
});

initializePasswordPage();
