import test from "node:test";
import assert from "node:assert/strict";

import { generateSummary, getResolution, parseMediaInfo, toStructured } from "./mediainfo-parser.ts";

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

test("non-breaking spaces and whitespace runs in keys are normalised", () => {
    const parsed = parseMediaInfo(
        "General\nComplete\u00a0name                       : /movies/example.mkv\n\nVideo\nBit   depth                               : 10 bits",
    );

    assert.equal(parsed.General[0].data["Complete name"], "/movies/example.mkv");
    assert.equal(parsed.Video[0].data["Bit depth"], "10 bits");
});

test("a literal backslash-n in a Windows path does not split the text", () => {
    const parsed = parseMediaInfo(
        "General\nComplete name                            : C:\\new\\movie.mkv\n\nVideo\nWidth                                    : 1920",
    );

    assert.equal(parsed.General[0].data["Complete name"], "C:\\new\\movie.mkv");
    assert.equal(parsed.Video[0].data["Width"], "1920");
});

test("single-line escaped MediaInfo text is still unescaped", () => {
    const parsed = parseMediaInfo("General\\nFormat : Matroska");

    assert.equal(parsed.General[0].data["Format"], "Matroska");
});

test("fields named like prototype members stay ordinary entries", () => {
    const parsed = parseMediaInfo(
        "Video\nconstructor                              : 1\nconstructor                              : 2\n__proto__                                : value",
    );

    assert.deepEqual(parsed.Video[0].data["constructor"], ["1", "2"]);
    assert.equal(parsed.Video[0].data["__proto__"], "value");
});

test("getResolution prefers the higher-ranked of width and height", () => {
    assert.equal(getResolution("1920", "800"), "1080p");
    assert.equal(getResolution("3840", "1600"), "4K");
    assert.equal(getResolution("1920", "1080"), "1080p");
    assert.equal(getResolution("1280", "720"), "720p");
    assert.equal(getResolution("720", "480"), "480p");
    assert.equal(getResolution("640", "360"), "360p");
    assert.equal(getResolution(undefined, "1080"), "1080p");
    assert.equal(getResolution("1920", undefined), "");
});

test("bit depth is compared numerically, not by substring", () => {
    const eight = generateSummary(toStructured(parseMediaInfo(
        "Video\nFormat                                   : HEVC\nBit depth                                : 8 bits\nWidth                                    : 1920\nHeight                                   : 1080",
    )));
    const ten = generateSummary(toStructured(parseMediaInfo(
        "Video\nFormat                                   : HEVC\nBit depth                                : 10 bits\nWidth                                    : 1920\nHeight                                   : 1080",
    )));

    assert.equal(eight, "HEVC 1080p");
    assert.equal(ten, "HEVC 10-bit 1080p");
});

test("getHDRInfo keeps every distinct HDR flag", () => {
    const combined = generateSummary(toStructured(parseMediaInfo(
        "Video\nHDR format                               : Dolby Vision, Version 1.0, HDR10 compatible\nWidth                                    : 3840\nHeight                                   : 2160",
    )));
    const plus = generateSummary(toStructured(parseMediaInfo(
        "Video\nHDR format                               : HDR10+\nWidth                                    : 3840\nHeight                                   : 2160",
    )));

    assert.equal(combined, "4K DV HDR10");
    assert.equal(plus, "4K HDR10+");
});
