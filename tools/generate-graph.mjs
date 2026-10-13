import { readdir, readFile, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

import { extractWikiLinks } from "../scripts/markdown-syntax.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const topicsDirectory = path.join(projectRoot, "content", "topics");
const coursesDirectory = path.join(projectRoot, "courses");
const outputFile = path.join(projectRoot, "content", "graph.json");

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

// Liest Daten aus einer bestehenden Kurs-JavaScript-Datei.
// Die Datei wird in einem separaten Kontext ausgeführt.
async function readCourseScript(filename, propertyName) {
    const source = await readFile(filename, "utf8");

    const context = {
        window: {}
    };

    vm.runInNewContext(source, context, {
        filename,
        timeout: 1000
    });

    const data = context.window[propertyName];

    if (!data) {
        throw new Error(
            `${filename} definiert window.${propertyName} nicht.`
        );
    }

    return data;
}

async function loadCourses(topicIds) {
    const catalog = await readCourseScript(
        path.join(coursesDirectory, "index.js"),
        "courseCatalog"
    );

    const courses = [];

    for (const entry of catalog) {
        const courseFile = path.join(
            coursesDirectory,
            `${entry.id}.js`
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

        const courseData = await readCourseScript(
            courseFile,
            "courseData"
        );

        for (const chapter of courseData.chapters) {
            for (const page of chapter.pages) {
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

            // Nur Verbindungen zwischen existierenden Topics
            if (!topicIds.has(target)) {
                console.warn(
                    `Unbekanntes Topic: ${source} → ${target}`
                );
                continue;
            }

            // Keine Selbstverbindungen
            if (source === target) {
                continue;
            }

            // Ungerichtete Kanten eindeutig identifizieren
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

    // Kurszugehörigkeiten aus den bestehenden Kursdateien ableiten
    const courses = await loadCourses(topicIds);

    const graph = {
        nodes,
        edges,
        courses
    };

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