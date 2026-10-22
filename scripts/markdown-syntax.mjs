export const WIKI_LINK_PATTERN = /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g;

export function parseInlineSegments(text) {
    const segments = [];
    const codePattern = /`([^`]+)`/g;
    let lastIndex = 0;

    for (const match of text.matchAll(codePattern)) {
        if (match.index > lastIndex) {
            segments.push({
                type: "text",
                value: text.slice(lastIndex, match.index)
            });
        }

        segments.push({
            type: "code",
            value: match[1]
        });

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        segments.push({
            type: "text",
            value: text.slice(lastIndex)
        });
    }

    return segments;
}

export function extractWikiLinks(text) {
    const links = [];

    for (const segment of parseInlineSegments(text)) {
        if (segment.type !== "text") continue;

        for (const match of segment.value.matchAll(WIKI_LINK_PATTERN)) {
            links.push({
                topicId: match[1],
                title: match[2] ?? match[1]
            });
        }
    }

    return links;
}
