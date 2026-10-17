import test from "node:test";
import assert from "node:assert/strict";

import { buildPosterMetaMap, getPosterMeta } from "./poster-meta.ts";

const validEntry = { accent: "#c96a4a", blur: "data:image/webp;base64,AAAA" };

test("keeps only well-formed sidecar entries", () => {
    const map = buildPosterMetaMap({
        ok000001: validEntry,
        missingBlur: { accent: "#c96a4a" },
        missingAccent: { blur: "data:image/webp;base64,AAAA" },
        wrongTypes: { accent: 12, blur: null },
        notAnObject: "nope",
        nullEntry: null
    });

    assert.deepEqual(map, { ok000001: validEntry });
});

test("tolerates a missing or non-object sidecar", () => {
    assert.deepEqual(buildPosterMetaMap(undefined), {});
    assert.deepEqual(buildPosterMetaMap(null), {});
    assert.deepEqual(buildPosterMetaMap("not an object"), {});
    assert.deepEqual(buildPosterMetaMap([]), {});
});

test("ignores paths that are not local poster assets", () => {
    // These never touch the sidecar, so they hold in any runtime.
    assert.equal(getPosterMeta("https://cdn.example.com/poster.avif"), undefined);
    assert.equal(getPosterMeta("/posters/nested/abc12345.avif"), undefined);
    assert.equal(getPosterMeta("/posters/abc12345.png"), undefined);
});
