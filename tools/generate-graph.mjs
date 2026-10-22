
import { readdir, readFile, writeFile, access, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { extractWikiLinks } from "../scripts/markdown-syntax.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const contentRoot = path.resolve(projectRoot, "../annication-content");

const topicsDirectory = path.join(contentRoot, "content", "topics");
const coursesDirectory = path.join(contentRoot, "courses");
const courseTopicsDirectory = path.join(contentRoot, "content", "course-topics");
const outputFile = path.join(contentRoot, "build", "graph.json");

function removeFrontmatter(markdown) {
    return markdown.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n?/, "");
}

function removeCodeBlocks(markdown) {
    const lines = markdown.split("\n");
    const result = [];

    let inCodeBlock = false;

    for (const line of lines) {
        if (line.startsWith("```")) {
            inCodeBlock = !inCodeBlock;
            continue;
        }

        if (!inCodeBlock) {
            result.push(line);
        }
    }

    return result.join("\n");
}

async function readJSON(filename) {
    const source = await readFile(filename, "utf8");
    return JSON.parse(source);
}

async function loadCourses(topicIds) {
    const catalog = await readJSON(
        path.join(coursesDirectory, "catalog.json")
    );

    const courses = [];

    for (const entry of catalog) {
        const courseFile = path.join(
            coursesDirectory,
            `${entry.id}.json`
        );

        const courseTopicIds = new Set();

        try {
            await access(courseFile);
        } catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }

            console.warn(
                `Noch keine Kursdefinition vorhanden: ${entry.id}`
            );

            courses.push({
                id: entry.id,
                title: entry.title,
                topicIds: []
            });

            continue;
        }

        const courseData = await readJSON(courseFile);

        for (const chapter of courseData.chapters) {
            for (const page of chapter.pages) {
                if (page.type === "course-topic") {
                    const courseTopicFile = path.join(
                        courseTopicsDirectory,
                        entry.id,
                        `${page.id}.md`
                    );

                    try {
                        await access(courseTopicFile);
                    } catch (error) {
                        if (error.code !== "ENOENT") {
                            throw error;
                        }

                        console.warn(
                            `Course-Topic noch nicht vorhanden: ${entry.id}/${page.id}`
                        );
                    }

                    continue;
                }

                if (page.type !== "topic") {
                    throw new Error(
                        `Ungültiger Seitentyp im Kurs ${entry.id}: ${page.type}`
                    );
                }

                if (!topicIds.has(page.id)) {
                    console.warn(
                        `Unbekanntes Topic im Kurs ${entry.id}: ${page.id}`
                    );
                    continue;
                }

                courseTopicIds.add(page.id);
            }
        }

        courses.push({
            id: entry.id,
            title: entry.title,
            topicIds: [...courseTopicIds]
        });
    }

    return courses;
}

async function generateGraph() {
    const files = (await readdir(topicsDirectory))
        .filter(filename => filename.endsWith(".md"))
        .sort();

    const nodes = files.map(filename => {
        const id = filename.slice(0, -3);

        return {
            id,
            title: id
        };
    });

    const topicIds = new Set(nodes.map(node => node.id));
    const edges = [];
    const existingEdges = new Set();

    for (const filename of files) {
        const source = filename.slice(0, -3);

        const markdown = await readFile(
            path.join(topicsDirectory, filename),
            "utf8"
        );

        const content = removeCodeBlocks(
            removeFrontmatter(markdown)
        );

        for (const link of extractWikiLinks(content)) {
            const target = link.topicId;

            if (!topicIds.has(target)) {
                console.warn(
                    `Unbekanntes Topic: ${source} → ${target}`
                );
                continue;
            }

            if (source === target) {
                continue;
            }

            const [a, b] = [source, target].sort();
            const edgeKey = JSON.stringify([a, b]);

            if (existingEdges.has(edgeKey)) {
                continue;
            }

            existingEdges.add(edgeKey);

            edges.push({
                source: a,
                target: b
            });
        }
    }

    edges.sort(
        (a, b) =>
            a.source.localeCompare(b.source) ||
            a.target.localeCompare(b.target)
    );

    const courses = await loadCourses(topicIds);

    const graph = {
        nodes,
        edges,
        courses
    };

    await mkdir(path.dirname(outputFile), { recursive: true });

    await writeFile(
        outputFile,
        JSON.stringify(graph, null, 2) + "\n",
        "utf8"
    );

    console.log(
        `Graph generiert: ${nodes.length} Topics, ` +
        `${edges.length} Verbindungen, ` +
        `${courses.length} Kurse.`
    );
}

generateGraph().catch(error => {
    console.error("Fehler beim Generieren des Graphen:", error);
    process.exitCode = 1;
});
