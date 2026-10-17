import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import {
	clearCreateDraft,
	getDraftComparisonFilePath,
	loadCreateDraft,
	saveCreateDraft,
	type DraftComparison,
} from "./drafts";
import { commitReleaseSidecars } from "./release-commit";

/**
 * Reproduces the release-commit sequence against the real draft helpers.
 *
 * The regression this guards against shipped a release file and then died with
 * ENOENT because the draft (and with it the staged comparison sidecar) had been
 * cleared before the sidecar was published.
 */
async function stageDraft(root: string, slug: string): Promise<DraftComparison> {
	const staged = getDraftComparisonFilePath("create", slug, root);
	await fs.mkdir(path.dirname(staged), { recursive: true });
	await fs.writeFile(staged, '{"schemaVersion":1,"source":{"provider":"slowpics"}}', "utf8");

	const comparison: DraftComparison = {
		status: "ready",
		filePath: staged,
		sourceUrl: "https://slow.pics/c/8VZ9WSZy",
	};
	await saveCreateDraft({ slug, comparison }, root);
	return comparison;
}

describe("commitReleaseSidecars", () => {
	test("publishes the staged sidecar before the draft is cleared", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-commit-"));
		const slug = "aq8ufjon";
		try {
			const comparison = await stageDraft(root, slug);
			const published: string[] = [];

			await commitReleaseSidecars({
				slug,
				comparison,
				publishComparison: async (_slug, draft) => {
					if (draft?.status !== "ready") return;
					published.push(await fs.readFile(draft.filePath, "utf8"));
				},
				clearDraft: () => clearCreateDraft(root),
			});

			expect(published).toHaveLength(1);
			expect(published[0]).toContain("slowpics");
			expect(await loadCreateDraft(root)).toBeNull();
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});

	test("clearing a draft first destroys the staged sidecar", async () => {
		// Documents why the order matters: this is the failure the wizard hit.
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-commit-"));
		const slug = "aq8ufjon";
		try {
			const comparison = await stageDraft(root, slug);
			await clearCreateDraft(root);

			await expect(
				fs.readFile((comparison as { filePath: string }).filePath, "utf8"),
			).rejects.toMatchObject({ code: "ENOENT" });
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});

	test("does nothing extra when the comparison was skipped", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-commit-"));
		try {
			await saveCreateDraft({ slug: "abcdefgh", comparison: { status: "skipped" } }, root);
			let published = 0;

			await commitReleaseSidecars({
				slug: "abcdefgh",
				comparison: { status: "skipped" },
				publishComparison: async () => {
					published += 1;
				},
				clearDraft: () => clearCreateDraft(root),
			});

			expect(published).toBe(1);
			expect(await loadCreateDraft(root)).toBeNull();
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});
});
