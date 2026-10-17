import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import {
	auditManagedAssets,
	planReleaseAssetCleanup,
	pruneOrphanedAssets,
} from "./assets";
import type { ReleaseData } from "./types";

function makeRelease(overrides: Partial<ReleaseData> = {}): ReleaseData {
	return {
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
		...overrides,
	};
}

async function makeRoot(): Promise<string> {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-assets-"));
	await fs.mkdir(path.join(root, "static", "posters"), { recursive: true });
	await fs.mkdir(path.join(root, "static", "og"), { recursive: true });
	await fs.mkdir(path.join(root, "static", "mediainfo"), { recursive: true });
	return root;
}

async function write(root: string, relative: string, body = "x"): Promise<void> {
	const target = path.join(root, "static", relative);
	await fs.mkdir(path.dirname(target), { recursive: true });
	await fs.writeFile(target, body, "utf8");
}

async function exists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

describe("pruneOrphanedAssets", () => {
	test("deletes an orphan inside static/", async () => {
		const root = await makeRoot();
		try {
			await write(root, "posters/orphan.avif");

			const result = await pruneOrphanedAssets({
				orphanedFiles: [{ kind: "poster", path: "posters/orphan.avif" }],
				rootDir: root,
			});

			expect(result.delete).toHaveLength(1);
			expect(await exists(path.join(root, "static", "posters", "orphan.avif"))).toBe(false);
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});

	test("refuses a path that escapes static/", async () => {
		const root = await makeRoot();
		try {
			const outside = path.join(root, "outside.txt");
			await fs.writeFile(outside, "keep me", "utf8");

			const result = await pruneOrphanedAssets({
				orphanedFiles: [{ kind: "poster", path: "../outside.txt" }],
				rootDir: root,
			});

			expect(result.delete).toHaveLength(0);
			expect(await exists(outside)).toBe(true);
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});

	test("never deletes the site-owned home social card", async () => {
		const root = await makeRoot();
		try {
			await write(root, "og/home.jpg");

			const result = await pruneOrphanedAssets({
				orphanedFiles: [{ kind: "og", path: "og/home.jpg" }],
				rootDir: root,
			});

			expect(result.delete).toHaveLength(0);
			expect(result.keep.map((entry) => entry.asset.path)).toEqual(["og/home.jpg"]);
			expect(await exists(path.join(root, "static", "og", "home.jpg"))).toBe(true);
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});
});

describe("auditManagedAssets", () => {
	test("treats the home social card as referenced, not orphaned", async () => {
		const root = await makeRoot();
		try {
			await write(root, "og/home.jpg");

			const report = await auditManagedAssets({ releases: [], rootDir: root });

			expect(report.orphanedFiles).toEqual([]);
			expect(report.missingReferences).toEqual([]);
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});

	test("reports a missing derived asset as a missing reference", async () => {
		const root = await makeRoot();
		try {
			await write(root, "posters/abc12345.avif");
			// The site-owned home card is expected to exist.
			await write(root, "og/home.jpg");

			const report = await auditManagedAssets({
				releases: [makeRelease()],
				rootDir: root,
			});

			// The card poster and the OG render are derived from the poster.
			expect(report.missingReferences.map((issue) => issue.path).sort()).toEqual([
				"og/abc12345.jpg",
				"posters/abc12345.card.avif",
			]);
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});
});

describe("planReleaseAssetCleanup", () => {
	test("keeps the home social card even when a release maps onto it", async () => {
		const root = await makeRoot();
		try {
			// A release whose poster derives `og/home.jpg`.
			const release = makeRelease({ poster: "/posters/home.avif" });

			const plan = planReleaseAssetCleanup({
				release,
				remainingReleases: [],
				rootDir: root,
			});

			expect(plan.delete.map((entry) => entry.path)).not.toContain("og/home.jpg");
			expect(plan.keep.map((entry) => entry.asset.path)).toContain("og/home.jpg");
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});
});
