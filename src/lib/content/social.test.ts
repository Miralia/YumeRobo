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
    assert.deepEqual(getReleaseCodecLabels(release), ["x265", "AV1"]);
    assert.equal(
        getDetailSocialDescription(release, ["ONA"]),
        "2020 · ONA · x265 / AV1",
    );
});

test("social image path follows the poster asset id", () => {
    assert.equal(
        getReleaseSocialImagePath("/posters/y3kb1dkq.avif"),
        "/og/y3kb1dkq.jpg",
    );
});
