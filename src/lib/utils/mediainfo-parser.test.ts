import test from "node:test";
import assert from "node:assert/strict";

import { generateSummary, parseMediaInfo, toStructured } from "./mediainfo-parser.ts";

test("toStructured treats blank media tracks as absent", () => {
    const structured = toStructured(parseMediaInfo(`
General
Format                                   : Matroska

Video
Format                                   :
Width                                    :

Audio
Format                                   :
Language                                 :

Text
Format                                   :
Language                                 :
Title                                    :
    `));

    assert.equal(structured.video, null);
    assert.equal(structured.audio, null);
    assert.equal(structured.text, null);
    assert.equal(generateSummary(structured), "");
});

test("toStructured keeps tracks with at least one structured value", () => {
    const structured = toStructured(parseMediaInfo(`
Text #1
Format                                   :
Language                                 :

Text #2
Format                                   : ASS
Language                                 :
    `));

    assert.deepEqual(structured.text, [{ format: "ASS", title: undefined, language: undefined }]);
    assert.equal(generateSummary(structured), "1 Sub");
});
