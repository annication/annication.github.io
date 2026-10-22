

async function loadContent(pageId, pageType, courseId = null) {
    const password = sessionStorage.getItem("annication-password");

    if (!password) {
        window.location.replace("/password.html");
        throw new Error("Keine aktive Sitzung.");
    }

    let url;

    switch (pageType) {
        case "topic":
            url = `/content/topics/${encodeURIComponent(pageId)}.enc`;
            break;

        case "course-topic":
            if (!courseId) {
                throw new Error(
                    "Course-Topics benötigen einen Kurskontext."
                );
            }

            url =
                `/content/course-topics/${encodeURIComponent(courseId)}/` +
                `${encodeURIComponent(pageId)}.enc`;
            break;

        default:
            throw new Error(`Ungültiger Topic-Typ: ${pageType}`);
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Inhalt konnte nicht geladen werden: ${url}`);
    }

    const encrypted = await response.json();
    const markdown = await ContentCrypto.decrypt(encrypted, password);

    const match = markdown.match(
        /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/
    );

    const metadata = {};

    if (match) {
        for (const line of match[1].split(/\r?\n/)) {
            const separator = line.indexOf(":");

            if (separator === -1) {
                continue;
            }

            const key = line.slice(0, separator).trim();
            const value = line.slice(separator + 1).trim();

            metadata[key] = value;
        }
    }

    const content = match
        ? markdown.slice(match[0].length)
        : markdown;

    return {
        id: pageId,
        type: pageType,
        title: pageId,
        metadata,
        content
    };
}
