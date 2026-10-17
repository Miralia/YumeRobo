import test from "node:test";
import assert from "node:assert/strict";

import {
    MAX_STAGGER_INDEX,
    entranceFly,
    sectionDelay,
    sections,
    stagger,
} from "./animation.ts";

test("stagger clamps a negative index to zero", () => {
    assert.equal(stagger(-4), 0);
    assert.equal(stagger(3), 150);
});

test("sectionDelay caps the index contribution", () => {
    const capped = sections.torrents.base + MAX_STAGGER_INDEX * sections.torrents.offset;

    assert.equal(sectionDelay("torrents", 0), sections.torrents.base);
    assert.equal(sectionDelay("torrents", MAX_STAGGER_INDEX), capped);
    assert.equal(sectionDelay("torrents", 29), capped);
    assert.equal(sectionDelay("torrents", -3), sections.torrents.base);
});

test("entranceFly inherits the capped section delay", () => {
    const last = entranceFly("torrents", 29);
    const capped = entranceFly("torrents", MAX_STAGGER_INDEX);

    assert.equal(last.delay, capped.delay);
    assert.ok((last.delay as number) < 1000);
});
