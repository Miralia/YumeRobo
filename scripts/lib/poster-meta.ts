/**
 * Sidecar store for build-time poster metadata (dynamic accent color +
 * micro blur thumbnail). Kept out of the release .ts files so existing
 * content never needs rewriting; the frontend reads it server-side and
 * tolerates its absence (the file is private content, like posters).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import type { PosterMeta } from './images';

const POSTER_META_PATH = path.join('src', 'lib', 'content', 'poster-meta.json');

export type PosterMetaMap = Record<string, PosterMeta>;

/**
 * Read the sidecar.
 *
 * Only a missing file means "empty": every other failure (truncated write,
 * corrupt JSON, permissions) must surface, because callers are read-modify-write
 * and would otherwise silently replace the whole map with a single entry.
 */
export async function readPosterMetaMap(filePath: string = POSTER_META_PATH): Promise<PosterMetaMap> {
    let raw: string;
    try {
        raw = await fs.readFile(filePath, 'utf8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
        throw new Error(
            `Failed to read poster meta at ${filePath}: ${error instanceof Error ? error.message : error}`,
        );
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        throw new Error(
            `Corrupt poster meta at ${filePath}: ${error instanceof Error ? error.message : error}`,
        );
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error(`Corrupt poster meta at ${filePath}: expected a JSON object`);
    }

    return parsed as PosterMetaMap;
}

/** Write the sidecar atomically: temp file in the same directory, then rename. */
export async function writePosterMetaMap(
    map: PosterMetaMap,
    filePath: string = POSTER_META_PATH,
): Promise<void> {
    const sorted: PosterMetaMap = {};
    for (const key of Object.keys(map).sort()) {
        sorted[key] = map[key];
    }

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    try {
        await fs.writeFile(tempPath, `${JSON.stringify(sorted, null, '\t')}\n`, 'utf8');
        await fs.rename(tempPath, filePath);
    } catch (error) {
        await fs.rm(tempPath, { force: true }).catch(() => {});
        throw error;
    }
}

export async function upsertPosterMeta(
    assetId: string,
    meta: PosterMeta,
    filePath: string = POSTER_META_PATH,
): Promise<void> {
    const map = await readPosterMetaMap(filePath);
    map[assetId] = meta;
    await writePosterMetaMap(map, filePath);
}

/** Remove one entry; a missing sidecar (or entry) is a no-op. */
export async function removePosterMeta(
    assetId: string,
    filePath: string = POSTER_META_PATH,
): Promise<void> {
    const map = await readPosterMetaMap(filePath);
    if (assetId in map) {
        delete map[assetId];
        await writePosterMetaMap(map, filePath);
    }
}
