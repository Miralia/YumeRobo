import { describe, expect, test } from "bun:test";
import { formatCreateDraftSummary, formatEditDraftSummary } from "./summary";
import type { CreateDraft, EditDraft } from "./drafts";
import type { ReleaseData } from "./types";

const release: ReleaseData = {
	slug: "abc12345",
	title: "Example",
	date: "2026-01-01T00:00:00.000Z",
	tmdb_id: 1,
	media_type: "movie",
	year: 2026,
	poster: "/posters/abc12345.avif",
	torrents: [],
	specs: [],
	links: {},
};

describe("draft summaries", () => {
	test("does not throw for a torrent with no mediainfo array", () => {
		// Drafts can be hand-edited or written by an older CLI, so `mediainfo`
		// may be missing entirely.
		const draft = {
			slug: "abc12345",
			torrents: [{ name: "legacy" }],
		} as unknown as CreateDraft;

		const summary = formatCreateDraftSummary(draft);

		expect(summary).toContain("torrents status=done count=1 mediainfo=0");
	});

	test("reports empty sections as missing rather than done", () => {
		const summary = formatCreateDraftSummary({
			slug: "abc12345",
			torrents: [],
			specs: [],
			links: {},
		});

		expect(summary).toContain("torrents status=missing");
		expect(summary).toContain("specs status=missing");
		expect(summary).toContain("links status=missing");
	});

	test("keeps the edit summary on one line per field", () => {
		const draft: EditDraft = {
			slug: "abc12345",
			originalRelease: release,
			date: release.date,
			links: { tmdb: "https://www.themoviedb.org/movie/1" },
		};

		const summary = formatEditDraftSummary(draft);

		expect(summary.split("\n").every((line) => line.trim().length > 0)).toBe(true);
		expect(summary).toContain("EDIT_DRAFT slug=abc12345");
		expect(summary).toContain("original title=Example");
		expect(summary).toContain("links status=done count=1");
	});
});
