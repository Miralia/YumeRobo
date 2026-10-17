import test from "node:test";
import assert from "node:assert/strict";
import {
    getDetailSocialDescription,
    getReleaseCodecLabels,
    getReleaseSocialImagePath,
} from "./social";

const release = {
    year: 2020,
    torrents: [
        { name: "Movie.1080p.x265-Group.mkv", files: [], mediainfo: [] },
        { name: "Movie.1080p.SVT-AV1-Group.mkv", files: [], mediainfo: [] },
    ],
};

test("social metadata normalizes release codecs", () => {
    assert.deepEqual(getReleaseCodecLabels(release), ["AV1", "x265"]);
    assert.equal(
        getDetailSocialDescription(release, ["ONA"]),
        "2020 · ONA · AV1 / x265",
    );
});

test("codec labels do not depend on torrent order", () => {
    assert.deepEqual(
        getReleaseCodecLabels({ ...release, torrents: [...release.torrents].reverse() }),
        ["AV1", "x265"],
    );
    assert.deepEqual(
        getReleaseCodecLabels({
            torrents: [{ name: "Movie.1080p.x264-Group.mkv", files: [], mediainfo: [] }],
        }),
        ["x264"],
    );
});

test("social image path follows the poster asset id", () => {
    assert.equal(
        getReleaseSocialImagePath("/posters/y3kb1dkq.avif"),
        "/og/y3kb1dkq.jpg",
    );
});

test("social image path matches the avif extension case-insensitively", () => {
    assert.equal(
        getReleaseSocialImagePath("/posters/y3kb1dkq.AVIF"),
        "/og/y3kb1dkq.jpg",
    );
});

test("social image path falls back to the input it cannot map", () => {
    for (const input of [
        "/posters/y3kb1dkq.webp",
        "/posters/y3kb1dkq.avif?v=2",
        "/posters/nested/y3kb1dkq.avif",
        "https://cdn.example.com/posters/y3kb1dkq.avif",
    ]) {
        assert.equal(getReleaseSocialImagePath(input), input);
    }
});
