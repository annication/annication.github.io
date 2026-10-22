import { getCourseProgress } from "./components/progress.js";

async function renderCourseCards() {
    const container = document.getElementById("course-grid");

    if (!container) {
        return;
    }

    const password = sessionStorage.getItem("annication-password");

    if (!password) {
        window.location.replace("/password.html");
        return;
    }

    let graphCourses = [];

    try {
        window.courseCatalog = await ContentCrypto.loadJSON(
            "/courses/catalog.enc",
            password
        );

        const graph = await ContentCrypto.loadJSON(
            "/content/graph.enc",
            password
        );

        graphCourses = graph.courses ?? [];
    } catch (error) {
        console.error("Kursdaten konnten nicht entschlüsselt werden:", error);
        sessionStorage.removeItem("annication-password");
        window.location.replace("/password.html");
        return;
    }

    container.innerHTML = "";

    for (const course of window.courseCatalog) {
        const card = document.createElement("a");
        card.href = "#";
        card.className = "course-card";

        const title = document.createElement("h3");
        title.className = "course-card-title";
        title.textContent = course.title;

        const description = document.createElement("p");
        description.className = "course-card-description";
        description.textContent = course.description;

        card.appendChild(title);
        card.appendChild(description);

        const graphCourse = graphCourses.find(
            item => item.id === course.id
        );

        if (graphCourse && graphCourse.topicIds.length > 0) {
            const progress = getCourseProgress(graphCourse.topicIds);

            const progressContainer = document.createElement("div");
            progressContainer.className = "course-card-progress";

            const progressLabel = document.createElement("span");
            progressLabel.className = "course-card-progress-label";
            progressLabel.textContent =
                `${progress.completed} von ${progress.total} Themen abgeschlossen`;

            const progressBar = document.createElement("div");
            progressBar.className = "course-card-progress-bar";
            progressBar.setAttribute("role", "progressbar");
            progressBar.setAttribute("aria-label", "Kursfortschritt");
            progressBar.setAttribute("aria-valuemin", "0");
            progressBar.setAttribute("aria-valuemax", "100");
            progressBar.setAttribute(
                "aria-valuenow",
                String(progress.percentage)
            );

            const progressFill = document.createElement("div");
            progressFill.className = "course-card-progress-fill";
            progressFill.style.width = `${progress.percentage}%`;

            progressBar.appendChild(progressFill);
            progressContainer.appendChild(progressLabel);
            progressContainer.appendChild(progressBar);
            card.appendChild(progressContainer);
        }

        card.addEventListener("click", async event => {
            event.preventDefault();

            try {
                await loadCourse(course.id);

                const firstTopic = window.courseData?.chapters
                    ?.flatMap(chapter => chapter.pages)[0]?.id;

                if (!firstTopic) {
                    console.error(`Course "${course.id}" has no topics.`);
                    return;
                }

                window.location.href =
                    `/pages/topic.html?id=${encodeURIComponent(firstTopic)}` +
                    `&course=${encodeURIComponent(course.id)}`;

            } catch (error) {
                console.error("Failed to open course:", error);
            }
        });

        container.appendChild(card);
    }
}

function initializeClickAnimation() {
    const clickWord = document.getElementById("click-word");

    if (!clickWord) {
        return;
    }

    function animateClick() {
        clickWord.classList.add("active");

        const ring = document.createElement("span");
        ring.className = "click-ring";

        clickWord.appendChild(ring);

        setTimeout(() => {
            clickWord.classList.remove("active");
            ring.remove();
        }, 500);
    }

    clickWord.addEventListener("click", animateClick);

    setTimeout(animateClick, 2000);
}

renderCourseCards();
initializeClickAnimation();

window.addEventListener(
    "annication:progress-changed",
    renderCourseCards
);
