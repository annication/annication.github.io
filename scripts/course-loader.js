async function loadCourse(courseId) {
    const password = sessionStorage.getItem("annication-password");

    if (!password) {
        window.location.replace("/password.html");
        throw new Error("Keine aktive Sitzung.");
    }

    const url = `/courses/${encodeURIComponent(courseId)}.enc`;

    window.courseData = await ContentCrypto.loadJSON(url, password);
}


function validateCoursePage(page) {
    if (page.type !== "topic" && page.type !== "course-topic") {
        throw new Error(`Ungültiger Topic-Typ bei "${page.id}": ${page.type}`);
    }
}

function findPageInCourse(pageId) {
    if (!window.courseData) return null;
    for (let chapterIndex = 0; chapterIndex < window.courseData.chapters.length; chapterIndex++) {
        const chapter = window.courseData.chapters[chapterIndex];
        for (let pageIndex = 0; pageIndex < chapter.pages.length; pageIndex++) {
            const page = chapter.pages[pageIndex];
            validateCoursePage(page);
            if (page.id === pageId) return { chapterIndex, pageIndex, chapter, page };
        }
    }
    return null;
}

function findNextPageInCourse(pageId) {
    if (!window.courseData) return null;
    const chapters = window.courseData.chapters;
    const position = findPageInCourse(pageId);
    if (!position) return null;
    const { chapterIndex, pageIndex } = position;
    const chapter = chapters[chapterIndex];
    if (pageIndex + 1 < chapter.pages.length) {
        const next = chapter.pages[pageIndex + 1];
        validateCoursePage(next);
        return next;
    }
    for (let index = chapterIndex + 1; index < chapters.length; index++) {
        if (chapters[index].pages.length > 0) {
            const next = chapters[index].pages[0];
            validateCoursePage(next);
            return next;
        }
    }
    return null;
}
