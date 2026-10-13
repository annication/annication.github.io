class SiteHeader extends HTMLElement {
    connectedCallback() {
        this.render();

        const toc = document.querySelector("table-of-contents");

        toc?.addEventListener("toc-change", (event) => {
            this.updateMenuButton(event.detail.open);
        });
    }

    render() {
        const courseTitle = window.courseData?.title;

        const currentTheme = document.documentElement.dataset.theme;
        const themeLabel = currentTheme === "dark"
            ? "Lightmode aktivieren"
            : "Darkmode aktivieren";

        this.innerHTML = `
            <header class="site-header">
                <div class="header-inner">

                    <div class="header-brand">
                        <a class="brand" href="/">
                            anni<span>cation</span>
                        </a>

                        ${
                            courseTitle
                                ? `
                                    <span class="site-header-separator">·</span>
                                    <span class="site-course">
                                        ${courseTitle}
                                    </span>
                                `
                                : ""
                        }
                    </div>

                    <div class="header-actions">
                        <button
                            class="theme-toggle"
                            type="button"
                            aria-label="${themeLabel}"
                            title="${themeLabel}">
                            ${currentTheme === "dark" ? "☀" : "☾"}
                        </button>

                        ${
                            courseTitle
                                ? `
                                    <button
                                        class="table-of-contents-button"
                                        type="button"
                                        aria-label="Inhaltsverzeichnis öffnen"
                                        aria-expanded="false"
                                        title="Inhaltsverzeichnis öffnen">

                                        <svg
                                            class="menu-icon"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            aria-hidden="true">
                                            <path d="M4 6H20 M4 12H20 M4 18H20"></path>
                                        </svg>
                                    </button>
                                `
                                : ""
                        }
                    </div>

                </div>
            </header>
        `;

        const tocButton = this.querySelector(".table-of-contents-button");

        tocButton?.addEventListener("click", () => {
            document.querySelector("table-of-contents")?.toggle();
        });

        const themeButton = this.querySelector(".theme-toggle");

        themeButton.addEventListener("click", () => {
            toggleTheme();
            this.render();

            const toc = document.querySelector("table-of-contents");
            const isOpen = toc?.querySelector(".toc-panel")?.classList.contains("open");

            this.updateMenuButton(Boolean(isOpen));
        });
    }

    updateMenuButton(isOpen) {
        const button = this.querySelector(".table-of-contents-button");

        if (!button) {
            return;
        }

        const label = isOpen
            ? "Inhaltsverzeichnis schließen"
            : "Inhaltsverzeichnis öffnen";

        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
        button.setAttribute("aria-expanded", String(isOpen));

        const icon = button.querySelector(".menu-icon path");

        if (icon) {
            icon.setAttribute(
                "d",
                isOpen
                    ? "M5 5L19 19 M19 5L5 19"
                    : "M4 6H20 M4 12H20 M4 18H20"
            );
        }
    }
}

customElements.define("site-header", SiteHeader);