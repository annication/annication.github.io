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