import test from "node:test";
import assert from "node:assert/strict";

import {
	getLanguageFlag,
	normalizeLanguage,
	getUniqueLanguageFlags,
} from "./language-flags.ts";

test("'emn' (English + honorifics) resolves to the English flag", () => {
	assert.equal(getLanguageFlag("emn"), getLanguageFlag("english"));
});

test("'emn' is case-insensitive", () => {
	assert.equal(getLanguageFlag("Emn"), getLanguageFlag("english"));
	assert.equal(getLanguageFlag("EMN"), getLanguageFlag("english"));
});

test("'emn' dedups with 'English' to a single entry", () => {
	const flags = getUniqueLanguageFlags(["emn", "English"]);
	assert.equal(flags.length, 1);
	assert.equal(flags[0].language, "english");
});

test("normalization still merges SDH/CC variants", () => {
	assert.equal(normalizeLanguage("English (SDH)"), "english");
});

test("non-scene languages are unaffected", () => {
	assert.equal(getLanguageFlag("japanese"), getLanguageFlag("ja"));
});
