import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

import { processPoster } from "./images.ts";
import { getReleaseAssetReferences } from "./assets.ts";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const staticDir = path.join(repoRoot, "static");
const postersDir = path.join(staticDir, "posters");
const ogDir = path.join(staticDir, "og");

function getTestPosterPath(assetId: string) {
	return path.join(postersDir, `${assetId}.avif`);
}

function getTestCardPosterPath(assetId: string) {
	return path.join(postersDir, `${assetId}.card.avif`);
}

function getTestOgPath(assetId: string) {
	return path.join(ogDir, `${assetId}.jpg`);
}

test("processPoster generates a card-sized poster asset", async () => {
	const assetId = `card-poster-${Date.now()}`;
	const sourcePath = path.join(os.tmpdir(), `${assetId}.png`);

	await sharp({
		create: {
			width: 900,
			height: 1350,
			channels: 3,
			background: { r: 42, g: 84, b: 126 },
		},
	})
		.png()
		.toFile(sourcePath);

	const posterPath = getTestPosterPath(assetId);
	const cardPosterPath = getTestCardPosterPath(assetId);
	const ogPath = getTestOgPath(assetId);

	try {
		await processPoster(sourcePath, assetId);

		await fs.access(posterPath);
		await fs.access(cardPosterPath);
		await fs.access(ogPath);

		const cardMetadata = await sharp(cardPosterPath).metadata();
		assert.equal(cardMetadata.width, 200);
	} finally {
		await Promise.allSettled([
			fs.rm(sourcePath, { force: true }),
			fs.rm(posterPath, { force: true }),
			fs.rm(cardPosterPath, { force: true }),
			fs.rm(ogPath, { force: true }),
		]);
	}
});

test("release asset references include the derived card poster", () => {
	const { entries } = getReleaseAssetReferences(
		{
			slug: "demo-release",
			poster: "/posters/demo-release.avif",
			torrents: [],
		},
		repoRoot,
	);

	assert.ok(
		entries.some(
			(entry) => entry.kind === "poster" && entry.path === "posters/demo-release.card.avif",
		),
	);
});
