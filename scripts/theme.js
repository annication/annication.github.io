const THEME_KEY = "annication-theme";

function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.dataset.theme;

    setTheme(currentTheme === "dark" ? "light" : "dark");
}

document.documentElement.dataset.theme = getPreferredTheme();