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

export async function readPosterMetaMap(): Promise<PosterMetaMap> {
    try {
        const raw = await fs.readFile(POSTER_META_PATH, 'utf8');
        return JSON.parse(raw) as PosterMetaMap;
    } catch {
        return {};
    }
}

export async function writePosterMetaMap(map: PosterMetaMap): Promise<void> {
    const sorted: PosterMetaMap = {};
    for (const key of Object.keys(map).sort()) {
        sorted[key] = map[key];
    }
    await fs.mkdir(path.dirname(POSTER_META_PATH), { recursive: true });
    await fs.writeFile(POSTER_META_PATH, `${JSON.stringify(sorted, null, '\t')}\n`, 'utf8');
}

export async function upsertPosterMeta(assetId: string, meta: PosterMeta): Promise<void> {
    const map = await readPosterMetaMap();
    map[assetId] = meta;
    await writePosterMetaMap(map);
}

export async function removePosterMeta(assetId: string): Promise<void> {
    const map = await readPosterMetaMap();
    if (assetId in map) {
        delete map[assetId];
        await writePosterMetaMap(map);
    }
}
