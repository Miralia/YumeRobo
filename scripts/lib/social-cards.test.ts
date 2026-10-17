import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import {
    escapeXml,
    generateHomeSocialCard,
    generateReleaseSocialCard,
    selectRandomHomePosters,
    wrapTitle,
} from "./social-cards";
import type { ReleaseData } from "./types";

async function writePoster(target: string): Promise<void> {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await sharp({
        create: {
            width: 500,
            height: 750,
            channels: 3,
            background: { r: 64, g: 112, b: 156 },
        },
    }).avif().toFile(target);
}

/** Small source image for tests that only care about the rendered card. */
async function writeTinyPoster(target: string): Promise<void> {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await sharp({
        create: {
            width: 40,
            height: 60,
            channels: 3,
            background: { r: 64, g: 112, b: 156 },
        },
    }).avif().toFile(target);
}

// sharp/mozjpeg rendering is CPU-bound and this file shares the machine with
// the rest of the suite, so give the heavy render tests room beyond the default.
const RENDER_TIMEOUT_MS = 30_000;

test("social cards render as 1200 x 630 JPEG images", { timeout: RENDER_TIMEOUT_MS }, async () => {
    const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-social-"));
    const homePosters = ["0z9re61m", "4n8cwx1o", "y3kb1dkq", "vbq7p246"];
    await Promise.all(homePosters.map((slug) =>
        writePoster(path.join(rootDir, "static", "posters", `${slug}.avif`))
    ));

    const release: ReleaseData = {
        slug: "y3kb1dkq",
        title: "A Whisker Away",
        date: "2026-07-25T07:54:15.157Z",
        tmdb_id: 667520,
        media_type: "movie",
        special_type: "ona",
        year: 2020,
        poster: "/posters/y3kb1dkq.avif",
        torrents: [
            {
                name: "A.Whisker.Away.2020.1080p.x265-Kawatare.mkv",
                files: [],
                mediainfo: [],
            },
            {
                name: "A.Whisker.Away.2020.1080p.AV1-Tasokare.mkv",
                files: [],
                mediainfo: [],
            },
        ],
        specs: [],
        links: {},
    };

    try {
        const releasePath = await generateReleaseSocialCard(release, rootDir);
        const homePath = await generateHomeSocialCard(
            homePosters.map((slug) => `/posters/${slug}.avif`),
            rootDir,
        );
        for (const target of [releasePath, homePath]) {
            const metadata = await sharp(target).metadata();
            assert.equal(metadata.format, "jpeg");
            assert.equal(metadata.width, 1200);
            assert.equal(metadata.height, 630);
        }
    } finally {
        await fs.rm(rootDir, { recursive: true, force: true });
    }
});

test("home social cards select four unique random posters", () => {
    const candidates = [
        "/posters/a.avif",
        "/posters/b.avif",
        "/posters/c.avif",
        "/posters/d.avif",
        "/posters/e.avif",
        "/posters/a.avif",
    ];

    assert.deepEqual(selectRandomHomePosters(candidates, () => 0), [
        "/posters/b.avif",
        "/posters/c.avif",
        "/posters/d.avif",
        "/posters/e.avif",
    ]);
    assert.equal(new Set(selectRandomHomePosters(candidates)).size, 4);
    assert.throws(
        () => selectRandomHomePosters(candidates.slice(0, 3)),
        /At least 4 unique posters/,
    );
});

function makeRelease(overrides: Partial<ReleaseData> = {}): ReleaseData {
    return {
        slug: "y3kb1dkq",
        title: "A Whisker Away",
        date: "2026-07-25T07:54:15.157Z",
        tmdb_id: 667520,
        media_type: "movie",
        year: 2020,
        poster: "/posters/y3kb1dkq.avif",
        torrents: [],
        specs: [],
        links: {},
        ...overrides,
    };
}

test("the home card degrades instead of aborting on a fresh install", { timeout: RENDER_TIMEOUT_MS }, async () => {
    const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-social-few-"));
    await writeTinyPoster(path.join(rootDir, "static", "posters", "only.avif"));

    try {
        const single = await generateHomeSocialCard(["/posters/only.avif"], rootDir);
        const singleMeta = await sharp(single).metadata();
        assert.equal(singleMeta.width, 1200);
        assert.equal(singleMeta.height, 630);

        // No posters at all (e.g. `backfill-social-cards` on an empty install).
        const empty = await generateHomeSocialCard([], rootDir);
        const emptyMeta = await sharp(empty).metadata();
        assert.equal(emptyMeta.width, 1200);
        assert.equal(emptyMeta.height, 630);
    } finally {
        await fs.rm(rootDir, { recursive: true, force: true });
    }
});

test("social cards survive emoji titles and XML-illegal control characters", { timeout: RENDER_TIMEOUT_MS }, async () => {
    const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-social-emoji-"));
    await writeTinyPoster(path.join(rootDir, "static", "posters", "y3kb1dkq.avif"));

    // Four 27-code-point tokens force the truncation branch; the emoji sitting
    // at the UTF-16 slice boundary used to emit a lone surrogate into the SVG.
    const emojiToken = "a".repeat(25) + "😀".repeat(2);
    const title = Array.from({ length: 4 }, () => emojiToken).join(" ") + "\u0007";

    try {
        const target = await generateReleaseSocialCard(
            makeRelease({ title, poster: "/posters/y3kb1dkq.avif" }),
            rootDir,
        );
        const metadata = await sharp(target).metadata();
        assert.equal(metadata.format, "jpeg");
        assert.equal(metadata.width, 1200);
    } finally {
        await fs.rm(rootDir, { recursive: true, force: true });
    }
});

test("release social cards refuse a poster path outside static/", async () => {
    const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-social-escape-"));

    try {
        await assert.rejects(
            () => generateReleaseSocialCard(
                makeRelease({ poster: "/../outside.avif" }),
                rootDir,
            ),
            /escapes static\//,
        );
    } finally {
        await fs.rm(rootDir, { recursive: true, force: true });
    }
});

test("poster read failures name the source path", async () => {
    const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-social-missing-"));

    try {
        await assert.rejects(
            () => generateReleaseSocialCard(makeRelease(), rootDir),
            /Failed to read poster .*y3kb1dkq\.avif/,
        );
    } finally {
        await fs.rm(rootDir, { recursive: true, force: true });
    }
});

test("wrapTitle truncates by code point and never emits a lone surrogate", () => {
    // 25 BMP chars then two surrogate pairs: a UTF-16 slice at 26 units would
    // split the first emoji in half.
    const token = "a".repeat(25) + "😀".repeat(2);
    const lines = wrapTitle(Array.from({ length: 4 }, () => token).join(" "));

    assert.equal(lines.length, 3);
    for (const line of lines) {
        assert.ok(Array.from(line).length <= 27, `line too long: ${line.length}`);
        assert.ok(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(line), "lone high surrogate");
        assert.ok(!/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(line), "lone low surrogate");
    }
    assert.ok(lines[2].endsWith("…"));
});

test("escapeXml strips XML-illegal control characters", () => {
    assert.equal(escapeXml("a\u0000b\u0007c\u001fd"), "abcd");
    assert.equal(escapeXml("&<>\"'"), "&amp;&lt;&gt;&quot;&apos;");
    assert.equal(escapeXml("tab\tkept"), "tab\tkept");
});
