import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

import { processPoster } from "./images.ts";
import { removePosterMeta } from "./poster-meta.ts";
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

// sharp/AVIF encoding is CPU-bound and this file shares the machine with the
// rest of the suite, so give the render test room beyond the default timeout.
test("processPoster generates a card-sized poster asset", { timeout: 30_000 }, async () => {
	const assetId = `cardposter${Date.now()}`;
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
			removePosterMeta(assetId),
		]);
	}
});

test("processPoster rejects an asset id that is not a bare hash", async () => {
	const sourcePath = path.join(os.tmpdir(), `images-guard-${Date.now()}.png`);

	await sharp({
		create: {
			width: 100,
			height: 150,
			channels: 3,
			background: { r: 10, g: 20, b: 30 },
		},
	})
		.png()
		.toFile(sourcePath);

	try {
		await assert.rejects(
			() => processPoster(sourcePath, "../../escape"),
			/Invalid poster asset id/,
		);
		await assert.rejects(
			() => processPoster(sourcePath, "Card-Poster"),
			/Invalid poster asset id/,
		);
	} finally {
		await fs.rm(sourcePath, { force: true });
	}
});

test("processPoster treats only http(s) sources as remote", async () => {
	const assetId = `localprefix${Date.now()}`;

	// `http` without `://` used to be handed to fetch(); it must stay a local path.
	await assert.rejects(
		() => processPoster("http-not-a-url", assetId),
		(error: NodeJS.ErrnoException) => error.code === "ENOENT",
	);
});

test("processPoster rejects a remote non-image response", async () => {
	const assetId = `notanimage${Date.now()}`;
	const server = Bun.serve({
		port: 0,
		fetch: () => new Response("<html>error page</html>", {
			headers: { "content-type": "text/html; charset=utf-8" },
		}),
	});

	try {
		await assert.rejects(
			() => processPoster(`http://127.0.0.1:${server.port}/poster.png`, assetId),
			/Refusing to process a non-image response/,
		);
	} finally {
		server.stop(true);
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
