
import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

async function walk(directory) {
    const files = [];

    for (const entry of await readdir(directory, {
        withFileTypes: true
    })) {
        const path = join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...await walk(path));
        } else if (entry.isFile()) {
            files.push(path);
        } else {
            errors.push(`Unerwarteter Dateityp: ${path}`);
        }
    }

    return files;
}

for (const directory of ["content", "courses", "auth"]) {
    const files = await walk(join(root, directory));

    for (const file of files) {
        const path = relative(root, file).replaceAll("\\", "/");
        const extension = extname(file);

        // Öffentliche Bilder sind vorläufig erlaubt.
        if (path.startsWith("content/assets/")) {
            continue;
        }

        if (path.startsWith("content/.obsidian/")) {
            errors.push(`Private Obsidian-Datei: ${path}`);
            continue;
        }

        if (extension !== ".enc") {
            errors.push(`Unverschlüsselte oder unerwartete Datei: ${path}`);
            continue;
        }

        try {
            const envelope = JSON.parse(await readFile(file, "utf8"));

            if (
                envelope.version !== 1 ||
                envelope.algorithm !== "aes-256-gcm" ||
                envelope.kdf !== "pbkdf2-sha256" ||
                envelope.iterations !== 600000 ||
                typeof envelope.salt !== "string" ||
                typeof envelope.iv !== "string" ||
                typeof envelope.data !== "string"
            ) {
                errors.push(`Ungültiges Verschlüsselungsformat: ${path}`);
            }
        } catch {
            errors.push(`Ungültige verschlüsselte Datei: ${path}`);
        }
    }
}

if (errors.length > 0) {
    console.error("Sicherheitsprüfung fehlgeschlagen:");

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

console.log("Sicherheitsprüfung bestanden.");
