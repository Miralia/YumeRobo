import test from "node:test";
import assert from "node:assert/strict";

import { filterCards, type ReleaseCardData } from "./cards.ts";
import { toCardData } from "./cards.server.ts";
import type { Release } from "./schema.ts";

const release: Release = {
	slug: "abc12345",
	title: "Akira",
	date: "2026-01-19T10:58:38.626Z",
	media_type: "movie",
	year: 1988,
	poster: "/posters/abc12345.avif",
	torrents: [
		{
			name: "Akira.1988.1080p.BluRay.x265-Kawatare.mkv",
			files: [{ name: "Akira.1988.1080p.BluRay.x265-Kawatare.mkv", size: 1 }],
			mediainfo: [{ filename: "Akira.mkv", raw_hash: "9bpq866q" }],
		},
	],
};

test("projects a release down to card data with precomputed badges", () => {
	assert.deepEqual(toCardData(release), {
		slug: "abc12345",
		title: "Akira",
		poster: "/posters/abc12345.avif",
		date: "2026-01-19T10:58:38.626Z",
		badges: ["Movie"],
		torrentNames: ["Akira.1988.1080p.BluRay.x265-Kawatare.mkv"],
	});
});

test("includes Fin badge for completed series", () => {
	const tv: Release = { ...release, media_type: "tv", season: 1, is_complete: true };
	assert.deepEqual(toCardData(tv).badges, ["S01", "Fin"]);
});

const cards: ReleaseCardData[] = [
	toCardData(release),
	toCardData({ ...release, slug: "def67890", title: "Ghost in the Shell" }),
];

test("filters cards by case-insensitive title substring", () => {
	assert.equal(filterCards(cards, "ghost").length, 1);
	assert.equal(filterCards(cards, "GHOST")[0].slug, "def67890");
});

test("returns all cards for empty or whitespace queries", () => {
	assert.equal(filterCards(cards, "").length, 2);
	assert.equal(filterCards(cards, "   ").length, 2);
});

test("returns no cards when nothing matches", () => {
	assert.equal(filterCards(cards, "nonexistent").length, 0);
});
