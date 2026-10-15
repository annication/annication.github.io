function loadCourse(courseId) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");

        script.src = `/courses/${courseId}.js`;

        script.onload = resolve;

        script.onerror = () => {
            reject(
                new Error(`Kurs konnte nicht geladen werden: ${courseId}`)
            );
        };

        document.head.appendChild(script);
    });
}


function findTopicInCourse(topicId) {
    if (!window.courseData) {
        return null;
    }

    for (
        let chapterIndex = 0;
        chapterIndex < window.courseData.chapters.length;
        chapterIndex++
    ) {
        const chapter = window.courseData.chapters[chapterIndex];

        for (
            let pageIndex = 0;
            pageIndex < chapter.pages.length;
            pageIndex++
        ) {
            const page = chapter.pages[pageIndex];

            if (page.id === topicId) {
                return {
                    chapterIndex,
                    pageIndex,
                    chapter,
                    page
                };
            }
        }
    }

    return null;
}

function findNextTopicInCourse(topicId) {
    if (!window.courseData) {
        return null;
    }

    const chapters = window.courseData.chapters;
    const position = findTopicInCourse(topicId);

    if (!position) {
        return null;
    }

    const { chapterIndex, pageIndex } = position;
    const chapter = chapters[chapterIndex];

    // Nächstes Topic innerhalb desselben Kapitels
    if (pageIndex + 1 < chapter.pages.length) {
        return chapter.pages[pageIndex + 1];
    }

    // Erstes Topic des nächsten nichtleeren Kapitels
    for (
        let index = chapterIndex + 1;
        index < chapters.length;
        index++
    ) {
        if (chapters[index].pages.length > 0) {
            return chapters[index].pages[0];
        }
    }

    // Letztes Topic des Kurses
    return null;
}