
class ContentCrypto {
    static fromBase64(value) {
        return Uint8Array.from(atob(value), char => char.charCodeAt(0));
    }

    static async decrypt(encrypted, password) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        if (
            encrypted.version !== 1 ||
            encrypted.algorithm !== "aes-256-gcm" ||
            encrypted.kdf !== "pbkdf2-sha256"
        ) {
            throw new Error("Unsupported encryption format.");
        }

        const passwordKey = await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: ContentCrypto.fromBase64(encrypted.salt),
                iterations: encrypted.iterations,
                hash: "SHA-256"
            },
            passwordKey,
            {
                name: "AES-GCM",
                length: 256
            },
            false,
            ["decrypt"]
        );

        const plaintext = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: ContentCrypto.fromBase64(encrypted.iv)
            },
            key,
            ContentCrypto.fromBase64(encrypted.data)
        );

        return decoder.decode(plaintext);
    }

    static async loadJSON(url, password) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Datei konnte nicht geladen werden: ${url}`);
        }

        const encrypted = await response.json();
        const plaintext = await ContentCrypto.decrypt(encrypted, password);

        return JSON.parse(plaintext);
    }

    static async loadJSON(url, password) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Datei konnte nicht geladen werden: ${url}`);
        }

        const encrypted = await response.json();
        const plaintext = await ContentCrypto.decrypt(encrypted, password);

        return JSON.parse(plaintext);
    }
}

window.ContentCrypto = ContentCrypto;
