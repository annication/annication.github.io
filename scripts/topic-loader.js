async function loadTopic(topicId) {
    const response = await fetch(
        `/content/topics/${encodeURIComponent(topicId)}.md`
    );

    if (!response.ok) {
        throw new Error(
            `Topic konnte nicht geladen werden: ${topicId}`
        );
    }

    const markdown = await response.text();

    const match = markdown.match(
        /^---\s*\n([\s\S]*?)\n---\s*\n?/
    );

    const metadata = {};

    if (match) {
        for (const line of match[1].split("\n")) {
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
        id: topicId,
        title: topicId,
        metadata,
        content
    };
}