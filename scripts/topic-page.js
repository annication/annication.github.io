import { isTopicCompleted, setTopicCompleted } from "./components/progress.js";

const params = new URLSearchParams(window.location.search);
const pageId = params.get("id");
const courseId = params.get("course");

if (!pageId) throw new Error("Keine Topic-ID angegeben.");

async function loadPage() {
    const password = sessionStorage.getItem("annication-password");

    if (!password) {
        window.location.replace("/password.html");
        return;
    }

    let coursePosition = null;

    if (courseId) {
        await loadCourse(courseId);
        coursePosition = findPageInCourse(pageId);

        if (!coursePosition) {
            throw new Error(
                `Topic "${pageId}" ist nicht im Kurs "${courseId}" enthalten.`
            );
        }
    }

    const pageType = coursePosition ? coursePosition.page.type : "topic";
    if (pageType !== "topic" && pageType !== "course-topic") {
        throw new Error(`Ungültiger Topic-Typ: ${pageType}`);
    }

    const pageData = await loadContent(pageId, pageType, courseId);
    const title = pageData.metadata.title ?? pageData.title;
    const pageTitle = document.querySelector("page-title");
    if (pageTitle) {
        const chapter = coursePosition
            ? `${coursePosition.chapterIndex + 1}.${coursePosition.pageIndex + 1}`
            : null;
        pageTitle.render(title, chapter);
    }
    document.title = `${title} | annication`;

    document.querySelector("site-header")?.render();
    const tableOfContents = document.querySelector("table-of-contents");
    if (tableOfContents) await tableOfContents.render();

    const container = document.getElementById("topic");
    if (!container) throw new Error('Container mit ID "topic" fehlt.');
    container.replaceChildren();

    const markdownElement = document.createElement("annication-markdown");
    const assetBaseUrl = pageType === "topic"
        ? "/content/topics/"
        : `/content/course-topics/${encodeURIComponent(courseId)}/`;
    markdownElement.setPageContext(pageType, assetBaseUrl);
    // Alle Wiki-Links führen zu globalen Topics.
    markdownElement.setPageUrlResolver(targetTopicId => {
        if (!targetTopicId) {
            throw new Error("Leere Topic-ID in Wiki-Link.");
        }

        const targetParams = new URLSearchParams({ id: targetTopicId });
        if (
            courseId &&
            findPageInCourse(targetTopicId)?.page.type === "topic"
        ) {
            targetParams.set("course", courseId);
        }
        return `/pages/topic.html?${targetParams.toString()}`;
    });

    container.appendChild(markdownElement);
    markdownElement.renderTopic(pageData);

    const actions = document.createElement("div");
    actions.className = "topic-actions";
    container.appendChild(actions);

    const progressId = pageType === "topic"
        ? pageId
        : `course-topic:${courseId}:${pageId}`;
    renderProgressCheckbox(actions, progressId);
    if (coursePosition) renderNextPageButton(actions, pageId);
}

function renderNextPageButton(container, currentPageId) {
    const nextPage = findNextPageInCourse(currentPageId);
    if (!nextPage) return;

    const link = document.createElement("a");
    link.className = "next-topic-button";
    link.href = `/pages/topic.html?${new URLSearchParams({ id: nextPage.id, course: courseId })}`;

    const text = document.createElement("span");
    text.textContent = "Weiter";
    const arrow = document.createElement("span");
    arrow.className = "next-topic-arrow";
    arrow.textContent = "→";
    arrow.setAttribute("aria-hidden", "true");
    link.append(text, arrow);
    container.appendChild(link);
}

function renderProgressCheckbox(container, progressId) {
    const label = document.createElement("label");
    label.className = "topic-progress";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isTopicCompleted(progressId);
    const text = document.createElement("span");
    text.textContent = "Bei mir hat's Klick gemacht!";
    checkbox.addEventListener("change", () => {
        const saved = setTopicCompleted(progressId, checkbox.checked);
        if (!saved) checkbox.checked = isTopicCompleted(progressId);
    });
    label.append(checkbox, text);
    container.appendChild(label);
}

document.addEventListener("DOMContentLoaded", () => {
    loadPage().catch(console.error);
});