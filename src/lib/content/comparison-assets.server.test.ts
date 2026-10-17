import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import { getComparisonAsset } from "./comparison-assets.server.ts";

test("getComparisonAsset reads sidecars from static comparisons", async () => {
    const slug = "assettest";
    const filePath = path.join(process.cwd(), "static", "comparisons", `${slug}.json`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({
        schemaVersion: 1,
        source: {
            provider: "slowpics",
            key: "abc123",
            url: "https://slow.pics/c/abc123",
        },
        collection: {
            comparisons: [
                {
                    images: [
                        { name: "Source", width: 1920, height: 1080 },
                        { name: "Encode", width: 1920, height: 1080 },
                    ],
                },
            ],
        },
    }), "utf8");

    try {
        assert.deepEqual(getComparisonAsset(slug), {
            assetUrl: "/comparisons/assettest.json",
            sourceUrl: "https://slow.pics/c/abc123",
            sourceKey: "abc123",
            collection: {
                comparisons: [
                    {
                        images: [
                            { name: "Source", width: 1920, height: 1080 },
                            { name: "Encode", width: 1920, height: 1080 },
                        ],
                    },
                ],
            },
        });
        assert.equal(getComparisonAsset("missing"), null);
        assert.equal(getComparisonAsset("../missing"), null);
    } finally {
        await fs.rm(filePath, { force: true });
    }
});

async function writeSidecar(slug: string, contents: string): Promise<string> {
    const filePath = path.join(process.cwd(), "static", "comparisons", `${slug}.json`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, contents, "utf8");
    return filePath;
}

test("getComparisonAsset names the file when a sidecar is malformed JSON", async () => {
    const slug = "assetbroken";
    const filePath = await writeSidecar(slug, "{ not json");

    try {
        assert.throws(
            () => getComparisonAsset(slug),
            (error: unknown) => {
                assert.ok(error instanceof Error);
                assert.match(error.message, /Failed to read comparison sidecar/);
                assert.ok(
                    error.message.includes(filePath),
                    `error should name ${filePath}, got: ${error.message}`,
                );
                return true;
            },
        );
    } finally {
        await fs.rm(filePath, { force: true });
    }
});

test("getComparisonAsset rejects a collection that is not an object", async () => {
    const slug = "assetbadcollection";
    const filePath = await writeSidecar(slug, JSON.stringify({
        schemaVersion: 1,
        source: {
            provider: "slowpics",
            key: "abc123",
            url: "https://slow.pics/c/abc123",
        },
        collection: "not-an-object",
    }));

    try {
        assert.equal(getComparisonAsset(slug), null);
    } finally {
        await fs.rm(filePath, { force: true });
    }
});

test("getComparisonAsset rejects a collection without a comparisons array", async () => {
    const slug = "assetbadcomparisons";
    const filePath = await writeSidecar(slug, JSON.stringify({
        schemaVersion: 1,
        source: {
            provider: "slowpics",
            key: "abc123",
            url: "https://slow.pics/c/abc123",
        },
        collection: { comparisons: "not-an-array" },
    }));

    try {
        assert.equal(getComparisonAsset(slug), null);
    } finally {
        await fs.rm(filePath, { force: true });
    }
});
