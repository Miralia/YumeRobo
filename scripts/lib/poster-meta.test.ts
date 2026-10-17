import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
	readPosterMetaMap,
	removePosterMeta,
	upsertPosterMeta,
	writePosterMetaMap,
} from "./poster-meta.ts";

const meta = { accent: "#123456", blur: "data:image/avif;base64,AAAA" };

async function withTempDir<T>(run: (filePath: string) => Promise<T>): Promise<T> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-poster-meta-"));
	try {
		return await run(path.join(dir, "poster-meta.json"));
	} finally {
		await fs.rm(dir, { recursive: true, force: true });
	}
}

test("a missing sidecar reads as an empty map", async () => {
	await withTempDir(async (filePath) => {
		assert.deepEqual(await readPosterMetaMap(filePath), {});
	});
});

test("a corrupt sidecar is reported instead of silently replaced", async () => {
	await withTempDir(async (filePath) => {
		await fs.writeFile(filePath, '{"a1b2c3d4": {"accent": "#fff", "bl', "utf8");

		await assert.rejects(() => readPosterMetaMap(filePath), /Corrupt poster meta/);
		// The read-modify-write path must not overwrite the damaged file either.
		await assert.rejects(() => upsertPosterMeta("e5f6a7b8", meta, filePath), /Corrupt poster meta/);

		const untouched = await fs.readFile(filePath, "utf8");
		assert.ok(untouched.endsWith('"bl'), "corrupt file must be left as-is");
	});
});

test("a JSON array is not a valid sidecar", async () => {
	await withTempDir(async (filePath) => {
		await fs.writeFile(filePath, "[]", "utf8");
		await assert.rejects(() => readPosterMetaMap(filePath), /expected a JSON object/);
	});
});

test("upsert writes sorted, atomically renamed JSON and leaves no temp file", async () => {
	await withTempDir(async (filePath) => {
		await upsertPosterMeta("zzz11111", meta, filePath);
		await upsertPosterMeta("aaa22222", meta, filePath);

		const raw = await fs.readFile(filePath, "utf8");
		assert.ok(raw.indexOf("aaa22222") < raw.indexOf("zzz11111"));
		assert.deepEqual(await readPosterMetaMap(filePath), { aaa22222: meta, zzz11111: meta });

		const leftovers = (await fs.readdir(path.dirname(filePath))).filter((name) => name.endsWith(".tmp"));
		assert.deepEqual(leftovers, []);
	});
});

test("removePosterMeta tolerates a missing sidecar and a missing entry", async () => {
	await withTempDir(async (filePath) => {
		await removePosterMeta("nope", filePath);
		await upsertPosterMeta("aaa22222", meta, filePath);
		await removePosterMeta("nope", filePath);
		assert.deepEqual(await readPosterMetaMap(filePath), { aaa22222: meta });
		await removePosterMeta("aaa22222", filePath);
		assert.deepEqual(await readPosterMetaMap(filePath), {});
	});
});
