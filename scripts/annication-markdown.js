import {
    parseInlineSegments,
    WIKI_LINK_PATTERN
} from "./markdown-syntax.mjs";

class AnnicationMarkdown extends HTMLElement {
    setTopicUrlResolver(resolver) {
        this.topicUrlResolver = resolver;
    }

    renderTopic(topic) {
        const content = topic.content;

        this.innerHTML = "";

        const contentElement = document.createElement("div");
        contentElement.innerHTML = this.render(content);

        this.appendChild(contentElement);

        renderMathInElement(this, {
            delimiters: [
                {
                    left: "$$",
                    right: "$$",
                    display: true
                },
                {
                    left: "$",
                    right: "$",
                    display: false
                }
            ]
        });

        if (window.Prism) {
            Prism.highlightAllUnder(this);
        }



        mermaid.run({
            nodes: this.querySelectorAll(".mermaid")
        });
    }

    render(markdown) {
        return this.renderBlocks(markdown);
    }

    isTableStart(lines, index) {
        if (index + 1 >= lines.length) {
            return false;
        }

        const header = lines[index].trim();
        const separator = lines[index + 1].trim();

        if (!header.startsWith("|")) {
            return false;
        }

        return /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(
            separator
        );
    }

    parseBlocks(markdown) {
        const lines = markdown.trim().split("\n");

        const blocks = [];
        let currentBlock = [];

        let inCodeBlock = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Obsidian-Callout als zusammenhängenden Block erkennen
            if (!inCodeBlock && line.startsWith("> [!")) {
                if (currentBlock.length > 0) {
                    blocks.push(currentBlock.join("\n"));
                    currentBlock = [];
                }

                const calloutLines = [line];

                while (
                    i + 1 < lines.length &&
                    lines[i + 1].startsWith(">")
                ) {
                    i++;
                    calloutLines.push(lines[i]);
                }

                blocks.push(calloutLines.join("\n"));
                continue;
            }
            if (!inCodeBlock && this.isTableStart(lines, i)) {
                if (currentBlock.length > 0) {
                    blocks.push(currentBlock.join("\n"));
                    currentBlock = [];
                }

                const tableLines = [];

                while (
                    i < lines.length &&
                    lines[i].trim().startsWith("|")
                ) {
                    tableLines.push(lines[i]);
                    i++;
                }

                blocks.push(tableLines.join("\n"));

                i--;
                continue;
            }
            if (line.startsWith("```")) {
                if (!inCodeBlock && currentBlock.length > 0) {
                    blocks.push(
                        currentBlock.join("\n")
                    );

                    currentBlock = [];
                }

                currentBlock.push(line);

                inCodeBlock = !inCodeBlock;

                if (!inCodeBlock) {
                    blocks.push(
                        currentBlock.join("\n")
                    );

                    currentBlock = [];
                }

                continue;
            }

            if (
                line.trim() === "" &&
                !inCodeBlock
            ) {
                if (currentBlock.length > 0) {
                    blocks.push(
                        currentBlock.join("\n")
                    );

                    currentBlock = [];
                }

                continue;
            }

            currentBlock.push(line);
        }

        if (currentBlock.length > 0) {
            blocks.push(
                currentBlock.join("\n")
            );
        }

        return blocks;
    }

    renderBlocks(markdown) {
        const blocks = this.parseBlocks(markdown);

        return blocks
            .map(block => this.renderBlock(block))
            .join("\n");
    }

    renderBlock(block) {
        // Codeblock
        if (block.startsWith("```")) {
            return this.renderCodeBlock(block);
        }

        // Tabelle
        const lines = block.split("\n");

        if (this.isTableStart(lines, 0)) {
            return this.renderTable(block);
        }

        // Obsidian-Callout
        if (block.startsWith("> [!")) {
            return this.renderCallout(block);
        }

        // Liste
        if (
            block.startsWith("- ") ||
            /^\d+\. /.test(block)
        ) {
            return this.renderList(block);
        }

        // Überschrift
        if (block.startsWith("## ")) {
            const text = block.slice(3);

            return `<h2>${this.renderInline(text)}</h2>`;
        }

        // Absatz
        return `<p>${this.renderInline(block)}</p>`;
    }

    parseListLine(line) {
        const match = line.match(
            /^(\s*)(-|\d+\.)\s+(.+)$/
        );

        if (!match) {
            return null;
        }

        const indentation = match[1].length;
        const marker = match[2];
        const content = match[3];

        return {
            indentation,
            ordered: marker !== "-",
            content
        };
    }

    renderList(block) {
        const lines = block.split("\n");

        const items = lines
            .map(line => this.parseListLine(line))
            .filter(item => item !== null);

        const result = this.renderListLevel(
            items,
            0,
            items[0].indentation
        );

        return result.html;
    }

    renderListLevel(items, startIndex, indentation) {
        let index = startIndex;

        const ordered = items[startIndex].ordered;
        const tag = ordered ? "ol" : "ul";

        let html = `<${tag}>`;

        while (index < items.length) {
            const item = items[index];

            if (item.indentation < indentation) {
                break;
            }

            if (item.indentation > indentation) {
                break;
            }

            html += `<li>${this.renderInline(item.content)}`;

            index++;

            if (
                index < items.length &&
                items[index].indentation > indentation
            ) {
                const nestedList = this.renderListLevel(
                    items,
                    index,
                    items[index].indentation
                );

                html += nestedList.html;
                index = nestedList.nextIndex;
            }

            html += `</li>`;
        }

        html += `</${tag}>`;

        return {
            html,
            nextIndex: index
        };
    }

    getTableAlignment(separator) {
        if (separator.startsWith(":") && separator.endsWith(":")) {
            return "center";
        }

        if (separator.endsWith(":")) {
            return "right";
        }

        return "left";
    }

    renderTable(block) {
        const lines = block.split("\n");

        const rows = lines.map(line =>
            line
                .trim()
                .replace(/^\||\|$/g, "")
                .split("|")
                .map(cell => cell.trim())
        );

        const headers = rows[0];
        const dataRows = rows.slice(2);
        const alignments = rows[1].map(
            separator => this.getTableAlignment(separator)
        );

        const headerHtml = headers
            .map((cell, index) => `
                <th class="align-${alignments[index]}">
                    ${this.renderInline(cell)}
                </th>
            `)
            .join("");

        const bodyHtml = dataRows
            .map(row => {
                const cells = row
                    .map((cell, index) => `
                        <td class="align-${alignments[index]}">
                            ${this.renderInline(cell)}
                        </td>
                    `)
                    .join("");

                return `<tr>${cells}</tr>`;
            })
            .join("\n");

        return `
            <table>
                <thead>
                    <tr>${headerHtml}</tr>
                </thead>
                <tbody>
                    ${bodyHtml}
                </tbody>
            </table>
        `;
    }

    escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    renderCodeBlock(block) {
        const lines = block.split("\n");

        const openingFence = lines[0];
        const language = openingFence.slice(3).trim();

        const code = lines
            .slice(1, -1)
            .join("\n");

        const escapedCode = this.escapeHtml(code);

        // Mermaid-Diagramme
        if (language === "mermaid") {
            return `<div class="mermaid">${escapedCode}</div>`;
        }

        // Normale Codeblöcke
        return `
            <pre><code class="language-${language}">${escapedCode}</code></pre>
        `;
    }
    
    
    renderCallout(block) {
        const lines = block.split("\n");

        const headerMatch = lines[0].match(
            /^>\s+\[!(\w+)\]([+-])?(?:\s+(.+))?\s*$/
        );

        if (!headerMatch) {
            return `<p>${this.renderInline(block)}</p>`;
        }

        const type = headerMatch[1];
        const fold = headerMatch[2];
        const title = headerMatch[3] || "";

        const content = lines
            .slice(1)
            .map(line => line.replace(/^> ?/, ""))
            .join("\n")
            .trim();

        const supportedCallouts = [
            "definition",
            "theorem",
            "lemma",
            "proof",
            "example",
            "question",
            "quote",
            "note"
        ];

        if (!supportedCallouts.includes(type)) {
            return `<p>${this.renderInline(block)}</p>`;
        }

        return `
            <content-box
                type="${type}"
                title="${this.escapeHtml(this.renderInline(title))}"
                ${fold === "+" ? "open" : ""}
                ${fold === "-" ? "closed" : ""}
            >
                ${this.renderBlocks(content)}
            </content-box>
        `;
    }


    renderInline(text) {
        return parseInlineSegments(text)
            .map(segment => {
                if (segment.type === "code") {
                    return `<code>${this.escapeHtml(segment.value)}</code>`;
                }

                return this.renderInlineText(segment.value);
            })
            .join("");
    }

    renderInlineText(text) {
        let html = text;

        // Markdown-Bilder
        html = html.replace(
            /!\[([^\]]*)\]\(([^)]+)\)/g,
            (match, alt, path) => {
                const src = this.resolveAssetUrl(path);

                return `<img src="${src}" alt="${this.escapeHtml(alt)}">`;
            }
        );

        // Wikilinks mit optionalem Anzeigenamen
        // Wikilinks mit optionalem Anzeigenamen
        html = html.replace(
            WIKI_LINK_PATTERN,
            (match, topicId, title) => {
                return this.renderTopicLink(
                    topicId,
                    title ?? topicId
                );
            }
        );

        // Fett
        html = html.replace(
            /\*\*([^*]+)\*\*/g,
            "<strong>$1</strong>"
        );

        // Kursiv
        html = html.replace(
            /\*([^*]+)\*/g,
            "<em>$1</em>"
        );

        return html;
    }

    renderTopicLink(topicId, title) {
        const href = this.topicUrlResolver
            ? this.topicUrlResolver(topicId)
            : `/pages/topic.html?id=${encodeURIComponent(topicId)}`;

        return `<a class="topic-link" href="${href}">${title}</a>`;
    }

    resolveAssetUrl(path) {
        return new URL(
            path,
            new URL("/content/topics/", window.location.origin)
        ).href;
    }
}

customElements.define(
    "annication-markdown",
    AnnicationMarkdown
);