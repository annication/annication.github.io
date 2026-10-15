
class ContentBox extends HTMLElement {
    connectedCallback() {
        const type = this.getAttribute("type");
        const title = this.getAttribute("title");
        const content = this.innerHTML;

        const typeNames = {
            definition: "DEFINITION",
            theorem: "SATZ",
            lemma: "LEMMA",
            proof: "BEWEIS",
            example: "BEISPIEL",
            question: "MIT ANDEREN WORTEN",
            quote: "ÜBERSETZUNG",
            note: "BEMERKUNG"
        };

        const typeName = typeNames[type];

        if (!typeName) {
            return;
        }

        const isCollapsible =
            this.hasAttribute("open") ||
            this.hasAttribute("closed");

        if (isCollapsible) {
            const isOpen = this.hasAttribute("open");

            this.innerHTML = `
                <details
                    class="content-box ${type}"
                    ${isOpen ? "open" : ""}
                >
                    <summary class="content-box-header">
                        <span class="content-box-type">
                            ${typeName}
                        </span>

                        ${
                            title
                                ? `<span class="content-box-title">${title}</span>`
                                : ""
                        }

                        <span class="content-box-chevron" aria-hidden="true">
                            ▾
                        </span>
                    </summary>

                    <div class="content-box-content">
                        ${content}
                    </div>
                </details>
            `;

            return;
        }

        this.innerHTML = `
            <article class="content-box ${type}">
                <div class="content-box-header">
                    <span class="content-box-type">
                        ${typeName}
                    </span>

                    ${
                        title
                            ? `<span class="content-box-title">${title}</span>`
                            : ""
                    }
                </div>

                <div class="content-box-content">
                    ${content}
                </div>
            </article>
        `;
    }
}

customElements.define("content-box", ContentBox);
