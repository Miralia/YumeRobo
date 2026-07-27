import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import {
    generateHomeSocialCard,
    generateReleaseSocialCard,
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

test("social cards render as 1200 x 630 JPEG images", async () => {
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
        const homePath = await generateHomeSocialCard(rootDir);
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
