import {
    isTopicCompleted,
    setTopicCompleted
} from "./components/progress.js";

const params = new URLSearchParams(window.location.search);

const topicId = params.get("id");
const courseId = params.get("course");

if (!topicId) {
    throw new Error("Keine Topic-ID angegeben.");
}


async function loadPage() {
    let coursePosition = null;

    // Kurskontext laden
    if (courseId) {
        await loadCourse(courseId);
        coursePosition = findTopicInCourse(topicId);
    }

    // Topic laden
    const topicData = await loadTopic(topicId);

    const pageTitle = document.querySelector("page-title");

    if (pageTitle) {
        const chapter = coursePosition
            ? `${coursePosition.chapterIndex + 1}.${coursePosition.pageIndex + 1}`
            : null;

        pageTitle.render(
            topicData.title,
            chapter
        );

        document.title =
            `${topicData.title} | annication`;
    }

    // Header aktualisieren
    const siteHeader = document.querySelector("site-header");

    if (siteHeader) {
        siteHeader.render();
    }

    // Inhaltsverzeichnis aktualisieren
    const tableOfContents =
        document.querySelector("table-of-contents");

    if (tableOfContents) {
        await tableOfContents.render();
    }

    // Markdown-Renderer erstellen
    const topicContainer = document.getElementById("topic");

    const markdownElement =
        document.createElement("annication-markdown");

    // Links innerhalb eines Topics bekommen den passenden Kurskontext
    markdownElement.setTopicUrlResolver(
        targetTopicId => {
            let href =
                `/pages/topic.html?id=${targetTopicId}`;

            if (
                courseId &&
                findTopicInCourse(targetTopicId)
            ) {
                href += `&course=${courseId}`;
            }

            return href;
        }
    );

    // Topic darstellen
    topicContainer.appendChild(markdownElement);
    markdownElement.renderTopic(topicData);

    // Fortschrittsmarkierung erstellen
    renderProgressCheckbox(topicContainer);
}


function renderProgressCheckbox(container) {
    const label = document.createElement("label");
    label.className = "topic-progress";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isTopicCompleted(topicId);

    const text = document.createElement("span");
    text.textContent = "Da hat's Klick gemacht!";

    checkbox.addEventListener("change", () => {
        const saved = setTopicCompleted(
            topicId,
            checkbox.checked
        );

        if (!saved) {
            checkbox.checked = isTopicCompleted(topicId);
        }
    });

    label.appendChild(checkbox);
    label.appendChild(text);

    container.appendChild(label);
}


loadPage();