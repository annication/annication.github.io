
import { isTopicCompleted } from "../components/progress.js";

class TableOfContents extends HTMLElement {
    connectedCallback() {
        this.handleProgressChange = () => {
            this.updateProgressIndicators();
        };

        window.addEventListener(
            "annication:progress-changed",
            this.handleProgressChange
        );

        this.render();
    }

    disconnectedCallback() {
        window.removeEventListener(
            "annication:progress-changed",
            this.handleProgressChange
        );
    }

    async render() {
        if (!window.courseData) {
            this.innerHTML = "";
            return;
        }

        const courseId = new URLSearchParams(
            window.location.search
        ).get("course");

        let chaptersHtml = "";

        for (
            let chapterIndex = 0;
            chapterIndex < courseData.chapters.length;
            chapterIndex++
        ) {
            const chapter = courseData.chapters[chapterIndex];

            let pagesHtml = "";

            for (
                let pageIndex = 0;
                pageIndex < chapter.pages.length;
                pageIndex++
            ) {
                const page = chapter.pages[pageIndex];

                const topic = await loadTopic(page.id);
                const title = topic.metadata.title ?? page.id;
                const completed = isTopicCompleted(page.id);

                pagesHtml += `
                    <a
                        href="/pages/topic.html?id=${encodeURIComponent(page.id)}&course=${encodeURIComponent(courseId)}"
                        class="toc-topic"
                        data-topic-id="${this.escapeHtml(page.id)}"
                    >
                        <span class="toc-topic-title">
                            ${chapterIndex + 1}.${pageIndex + 1}
                            ${this.escapeHtml(title)}
                        </span>

                        <span
                            class="toc-topic-check"
                            ${completed ? "" : "hidden"}
                            aria-label="Abgeschlossen"
                        >✓</span>
                    </a>
                `;
            }

            chaptersHtml += `
                <section class="toc-chapter">
                    <h3>
                        ${chapterIndex + 1}. ${this.escapeHtml(chapter.title)}
                    </h3>

                    ${pagesHtml}
                </section>
            `;
        }

        this.innerHTML = `
            <div class="toc-overlay"></div>

            <aside class="toc-panel">
                ${chaptersHtml}
            </aside>
        `;

        const overlay = this.querySelector(".toc-overlay");

        overlay.addEventListener("click", () => {
            this.close();
        });
    }

    updateProgressIndicators() {
        const links = this.querySelectorAll(".toc-topic");

        for (const link of links) {
            const topicId = link.dataset.topicId;
            const check = link.querySelector(".toc-topic-check");

            if (check) {
                check.hidden = !isTopicCompleted(topicId);
            }
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

        this.dispatchEvent(new CustomEvent("toc-change", {
            detail: { open: true }
        }));
    }

    close() {
        this.querySelector(".toc-overlay")?.classList.remove("open");
        this.querySelector(".toc-panel")?.classList.remove("open");

        this.dispatchEvent(new CustomEvent("toc-change", {
            detail: { open: false }
        }));
    }

    toggle() {
        const isOpen = this.querySelector(".toc-panel")?.classList.contains("open");

        if (isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
}

customElements.define("table-of-contents", TableOfContents);
