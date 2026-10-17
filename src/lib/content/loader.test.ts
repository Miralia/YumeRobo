import test from "node:test";
import assert from "node:assert/strict";

import { buildReleaseIndex, compareReleasesByDateDesc } from "./loader.ts";

function releaseModule(slug: string, date: string) {
    return {
        release: {
            slug,
            title: `Release ${slug}`,
            date,
            media_type: "movie" as const,
            poster: `/posters/${slug}.avif`,
            torrents: []
        }
    };
}

test("buildReleaseIndex accepts valid release modules", () => {
    const releases = buildReleaseIndex({
        "./releases/aaa11111.ts": releaseModule("aaa11111", "2026-01-19T10:58:38.626Z"),
        // The CLI may also write a bare date, which stays valid.
        "./releases/bbb22222.ts": releaseModule("bbb22222", "2026-03-01")
    });

    assert.deepEqual(releases.map((r) => r.slug), ["bbb22222", "aaa11111"]);
});

test("buildReleaseIndex ignores modules without a release export", () => {
    const releases = buildReleaseIndex({
        "./releases/helper.ts": { somethingElse: true },
        "./releases/aaa11111.ts": releaseModule("aaa11111", "2026-01-19T10:58:38.626Z")
    });

    assert.deepEqual(releases.map((r) => r.slug), ["aaa11111"]);
});

test("buildReleaseIndex throws naming the file and the zod issue path", () => {
    assert.throws(
        () =>
            buildReleaseIndex({
                "./releases/broken.ts": {
                    release: {
                        slug: "broken01",
                        title: "Broken",
                        date: "not-a-date",
                        media_type: "movie",
                        poster: "/posters/broken01.avif",
                        torrents: []
                    }
                }
            }),
        (error: unknown) => {
            assert.ok(error instanceof Error);
            assert.match(error.message, /Invalid release content in \.\/releases\/broken\.ts/);
            assert.match(error.message, /date: date must be an ISO 8601 date-time/);
            return true;
        }
    );
});

test("buildReleaseIndex throws on duplicate slugs", () => {
    assert.throws(
        () =>
            buildReleaseIndex({
                "./releases/one.ts": releaseModule("dup00001", "2026-01-01T00:00:00.000Z"),
                "./releases/two.ts": releaseModule("dup00001", "2026-02-01T00:00:00.000Z")
            }),
        /Duplicate release slug "dup00001" in \.\/releases\/two\.ts \(already defined in \.\/releases\/one\.ts\)/
    );
});

test("compareReleasesByDateDesc pushes unparsable dates to the end", () => {
    const valid = { date: "2026-01-01T00:00:00.000Z", slug: "valid001" };
    const garbageA = { date: "not-a-date", slug: "aaa00001" };
    const garbageB = { date: "also-not-a-date", slug: "bbb00002" };

    const sorted = [garbageB, valid, garbageA].sort(compareReleasesByDateDesc);

    assert.deepEqual(sorted.map((r) => r.slug), ["valid001", "aaa00001", "bbb00002"]);
    // A NaN comparator result would leave the order undefined.
    assert.ok(Number.isFinite(compareReleasesByDateDesc(garbageA, valid)));
    assert.ok(Number.isFinite(compareReleasesByDateDesc(garbageA, garbageB)));
});

test("buildReleaseIndex warns instead of throwing when no content exists", () => {
    const originalWarn = console.warn;
    const warnings: string[] = [];
    console.warn = (...args: unknown[]) => {
        warnings.push(args.join(" "));
    };

    try {
        assert.deepEqual(buildReleaseIndex({}), []);
    } finally {
        console.warn = originalWarn;
    }

    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /No releases found/);
});
