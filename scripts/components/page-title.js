class PageTitle extends HTMLElement {
    render(title, chapter = null) {
        this.innerHTML = "";

        const header = document.createElement("header");
        header.classList.add("page-title");

        if (chapter) {
            const chapterNumber = document.createElement("p");
            chapterNumber.classList.add("chapter-number");
            chapterNumber.textContent = `Kapitel ${chapter}`;

            header.appendChild(chapterNumber);
        }

        const heading = document.createElement("h1");
        heading.textContent = title;

        header.appendChild(heading);
        this.appendChild(header);
    }
}

customElements.define("page-title", PageTitle);