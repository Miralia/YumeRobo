import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import {
	clearCreateDraft,
	clearReleaseDrafts,
	getDraftComparisonFilePath,
	loadCreateDraft,
	loadEditDraft,
	saveCreateDraft,
	saveEditDraft,
} from "./drafts";
import type { ReleaseData } from "./types";

const release: ReleaseData = {
	slug: "release1",
	title: "Example",
	year: 2026,
	date: "2026-01-01T00:00:00.000Z",
	tmdb_id: 1,
	media_type: "movie",
	poster: "/images/posters/example.webp",
	torrents: [],
	specs: [],
	links: {},
};

describe("CLI drafts", () => {
	test("clearing a create draft removes its staged comparison", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-drafts-"));
		const comparisonPath = getDraftComparisonFilePath("create", "release1", root);
		try {
			await fs.mkdir(path.dirname(comparisonPath), { recursive: true });
			await fs.writeFile(comparisonPath, "{}", "utf8");
			await saveCreateDraft({
				slug: "release1",
				comparison: {
					status: "ready",
					filePath: comparisonPath,
					sourceUrl: "https://slow.pics/c/abc123",
				},
			}, root);

			await clearCreateDraft(root);

			expect(await loadCreateDraft(root)).toBeNull();
			await expect(fs.access(comparisonPath)).rejects.toMatchObject({ code: "ENOENT" });
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});

	test("clearing a skipped draft removes an unrecorded staging file", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-drafts-"));
		const comparisonPath = getDraftComparisonFilePath("create", "release1", root);
		try {
			await fs.mkdir(path.dirname(comparisonPath), { recursive: true });
			await fs.writeFile(comparisonPath, "partial", "utf8");
			await saveCreateDraft({
				slug: "release1",
				comparison: { status: "skipped" },
			}, root);

			await clearCreateDraft(root);

			await expect(fs.access(comparisonPath)).rejects.toMatchObject({ code: "ENOENT" });
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});

	test("clearing release drafts removes matching create and edit files", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-drafts-"));
		const createComparison = getDraftComparisonFilePath("create", "release1", root);
		const editComparison = getDraftComparisonFilePath("edit", "release1", root);
		try {
			await fs.mkdir(path.dirname(createComparison), { recursive: true });
			await fs.writeFile(createComparison, "{}", "utf8");
			await fs.writeFile(editComparison, "{}", "utf8");
			await saveCreateDraft({
				slug: "release1",
				comparison: { status: "ready", filePath: createComparison, sourceUrl: "https://slow.pics/c/a" },
			}, root);
			await saveEditDraft({
				slug: "release1",
				originalRelease: release,
				date: release.date,
				comparison: { status: "ready", filePath: editComparison, sourceUrl: "https://slow.pics/c/b" },
			}, root);

			await clearReleaseDrafts("release1", root);

			expect(await loadCreateDraft(root)).toBeNull();
			expect(await loadEditDraft("release1", root)).toBeNull();
			await expect(fs.access(createComparison)).rejects.toMatchObject({ code: "ENOENT" });
			await expect(fs.access(editComparison)).rejects.toMatchObject({ code: "ENOENT" });
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});
});

describe("CLI draft slug validation", () => {
	test("rejects a slug that would escape the drafts directory", async () => {
		// Slugs reach these helpers from CLI arguments, so a traversal value
		// must never be turned into a path.
		expect(() => getDraftComparisonFilePath("edit", "../../etc/passwd")).toThrow(TypeError);
		await expect(loadEditDraft("../../etc/passwd")).rejects.toThrow(TypeError);
		await expect(
			saveEditDraft({
				slug: "../../etc/passwd",
				originalRelease: release,
				date: release.date,
			}),
		).rejects.toThrow(TypeError);
	});

	test("a corrupt draft slug does not block clearing the draft", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-drafts-"));
		try {
			await fs.writeFile(
				path.join(root, "create.json"),
				JSON.stringify({ slug: "../../escape" }),
				"utf8",
			);

			await clearCreateDraft(root);

			expect(await loadCreateDraft(root)).toBeNull();
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});
});
