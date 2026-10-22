import { isTopicCompleted } from "../components/progress.js";

class TableOfContents extends HTMLElement {
    connectedCallback() {
        this.handleProgressChange = () => this.updateProgressIndicators();
        window.addEventListener("annication:progress-changed", this.handleProgressChange);
        this.render();
    }

    disconnectedCallback() {
        window.removeEventListener("annication:progress-changed", this.handleProgressChange);
    }

    async render() {
        if (!window.courseData) {
            this.innerHTML = "";
            return;
        }
        const courseId = new URLSearchParams(window.location.search).get("course");
        let chaptersHtml = "";

        for (let chapterIndex = 0; chapterIndex < window.courseData.chapters.length; chapterIndex++) {
            const chapter = window.courseData.chapters[chapterIndex];
            let pagesHtml = "";

            for (let pageIndex = 0; pageIndex < chapter.pages.length; pageIndex++) {
                const page = chapter.pages[pageIndex];
                if (page.type !== "topic" && page.type !== "course-topic") {
                    throw new Error(`Ungültiger Topic-Typ: ${page.type}`);
                }
                let title = page.id;
                try {
                    const topic = await loadContent(page.id, page.type, courseId);
                    title = topic.metadata.title ?? page.id;
                } catch (error) {
                    console.warn(`Inhalt konnte nicht geladen werden: ${page.id}`, error);
                }

                const progressId = page.type === "topic"
                    ? page.id
                    : `course-topic:${courseId}:${page.id}`;
                const completed = isTopicCompleted(progressId);
                const href = `/pages/topic.html?${new URLSearchParams({ id: page.id, course: courseId })}`;
                pagesHtml += `
                    <a href="${this.escapeHtml(href)}" class="toc-topic"
                       data-topic-id="${this.escapeHtml(progressId)}">
                        <span class="toc-topic-title">
                            ${chapterIndex + 1}.${pageIndex + 1} ${this.escapeHtml(title)}
                        </span>
                        <span class="toc-topic-check" ${completed ? "" : "hidden"}
                              aria-label="Abgeschlossen">✓</span>
                    </a>
                `;
            }

            chaptersHtml += `
                <section class="toc-chapter">
                    <h3>${chapterIndex + 1}. ${this.escapeHtml(chapter.title)}</h3>
                    ${pagesHtml}
                </section>
            `;
        }

        this.innerHTML = `
            <div class="toc-overlay"></div>
            <aside class="toc-panel">${chaptersHtml}</aside>
        `;
        this.querySelector(".toc-overlay")?.addEventListener("click", () => this.close());
    }

    updateProgressIndicators() {
        for (const link of this.querySelectorAll(".toc-topic")) {
            const check = link.querySelector(".toc-topic-check");
            if (check) check.hidden = !isTopicCompleted(link.dataset.topicId);
        }
    }

    escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    open() {
        this.querySelector(".toc-overlay")?.classList.add("open");
        this.querySelector(".toc-panel")?.classList.add("open");
        this.dispatchEvent(new CustomEvent("toc-change", { detail: { open: true } }));
    }

    close() {
        this.querySelector(".toc-overlay")?.classList.remove("open");
        this.querySelector(".toc-panel")?.classList.remove("open");
        this.dispatchEvent(new CustomEvent("toc-change", { detail: { open: false } }));
    }

    toggle() {
        if (this.querySelector(".toc-panel")?.classList.contains("open")) this.close();
        else this.open();
    }
}

customElements.define("table-of-contents", TableOfContents);
