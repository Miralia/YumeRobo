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

test("Welsh maps to a single Wales flag instead of a broken code", () => {
	const wales =
		"\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}";
	assert.equal(getLanguageFlag("Welsh"), wales);
	assert.equal(getLanguageFlag("cy"), wales);
});

test("blank or punctuation-only input falls back to the globe", () => {
	assert.equal(getLanguageFlag("   "), "🌐");
	assert.equal(getLanguageFlag("("), "🌐");
	assert.equal(getLanguageFlag("in"), "🌐");
});

test("scene tags are only stripped as standalone tokens", () => {
	assert.equal(normalizeLanguage("Occitan"), "occitan");
	assert.equal(normalizeLanguage("Reinforced"), "reinforced");
	assert.equal(getLanguageFlag("Occitan"), "🌐");
	assert.equal(normalizeLanguage("English SDH"), "english");
	assert.equal(normalizeLanguage("English (SDH)"), "english");
});

test("region variants match regardless of parenthesis spacing", () => {
	assert.equal(
		getLanguageFlag("Spanish(Latin America)"),
		getLanguageFlag("Spanish (Latin America)"),
	);
	assert.equal(
		normalizeLanguage("Spanish(Latin America)"),
		"spanish (latin america)",
	);
	assert.equal(
		getLanguageFlag("Portuguese(Brazil)"),
		getLanguageFlag("Portuguese (Brazil)"),
	);
});
