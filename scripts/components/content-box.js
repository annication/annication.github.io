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
            question: "HÄ?"
        };

        const typeName = typeNames[type];

        if (!typeName) {
            return;
        }

        if (type === "question") {
            this.innerHTML = `
                <details
                    class="content-box question"
                    ${this.hasAttribute("open") ? "open" : ""}
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
