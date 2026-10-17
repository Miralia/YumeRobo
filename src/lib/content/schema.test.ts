import test from "node:test";
import assert from "node:assert/strict";

import {
    ReleaseDateSchema,
    getReleaseBadges,
    safeValidateRelease,
    type Release
} from "./schema.ts";

const base: Release = {
    slug: "abc12345",
    title: "Kawatare",
    date: "2026-01-19T10:58:38.626Z",
    media_type: "tv",
    poster: "/posters/abc12345.avif",
    torrents: []
};

test("date schema accepts the CLI formats and rejects garbage", () => {
    assert.equal(ReleaseDateSchema.safeParse("2026-01-19T10:58:38.626Z").success, true);
    assert.equal(ReleaseDateSchema.safeParse("2026-01-19T10:58:38+02:00").success, true);
    assert.equal(ReleaseDateSchema.safeParse("2026-01-19").success, true);

    for (const value of ["", "yesterday", "19/01/2026", "2026-13-01", "2026-01-19T10:58"]) {
        assert.equal(ReleaseDateSchema.safeParse(value).success, false, `${value} must be rejected`);
    }
});

test("date schema reports a clear error message", () => {
    const result = ReleaseDateSchema.safeParse("yesterday");
    assert.equal(result.success, false);
    if (!result.success) {
        assert.match(result.error.issues[0].message, /ISO 8601 date-time/);
    }
});

test("release validation points at the offending date field", () => {
    const result = safeValidateRelease({ ...base, date: "yesterday" });
    assert.equal(result.success, false);
    if (!result.success) {
        assert.deepEqual(result.error.issues.map((issue) => issue.path.join(".")), ["date"]);
    }
});

test("special media types always produce a non-empty badge", () => {
    assert.deepEqual(getReleaseBadges(base), ["TV"]);
    assert.deepEqual(getReleaseBadges({ ...base, media_type: "tva" }), ["TVA"]);
    assert.deepEqual(getReleaseBadges({ ...base, media_type: "ova" }), ["OVA"]);
    assert.deepEqual(getReleaseBadges({ ...base, media_type: "ona" }), ["ONA"]);
    assert.deepEqual(getReleaseBadges({ ...base, media_type: "special" }), ["SP"]);
    assert.deepEqual(getReleaseBadges({ ...base, media_type: "movie", special_type: "ova" }), ["OVA"]);
    assert.deepEqual(getReleaseBadges({ ...base, special_type: "tva" }), ["TVA"]);
    assert.deepEqual(getReleaseBadges({ ...base, special_type: "special" }), ["SP"]);
});

test("season 0 renders as S00 in every branch", () => {
    assert.deepEqual(getReleaseBadges({ ...base, season: 0 }), ["S00"]);
    assert.deepEqual(getReleaseBadges({ ...base, media_type: "tva", season: 0 }), ["S00"]);
    assert.deepEqual(getReleaseBadges({ ...base, special_type: "tva", season: 0 }), ["S00"]);
    assert.deepEqual(getReleaseBadges({ ...base, media_type: "movie", special_type: "ova", season: 0 }), ["OVA S00"]);
    assert.deepEqual(getReleaseBadges({ ...base, season: 1 }), ["S01"]);
});

test("badge_label is appended without a leading space", () => {
    assert.deepEqual(getReleaseBadges({ ...base, season: 1, badge_label: "Part 1" }), ["S01 Part 1"]);
    assert.deepEqual(
        getReleaseBadges({ ...base, media_type: "movie", badge_label: "E01-E12", is_complete: true }),
        ["Movie E01-E12", "Fin"]
    );

    for (const badge of getReleaseBadges({ ...base, media_type: "tva", badge_label: "Extras" })) {
        assert.equal(badge, badge.trim());
        assert.notEqual(badge, "");
    }
});
