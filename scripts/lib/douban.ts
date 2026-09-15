/**
 * Douban link resolution.
 *
 * Douban has no official API and TMDB does not carry a douban id, so links
 * come from two sources:
 *
 * 1. BangumiExtLinker's curated `anime_map.json` dataset (CC BY 4.0, daily
 *    release) — match on imdb_id / tmdb_id. Curated data counts as confirmed.
 * 2. The mobile rexxar search API queried with the IMDb id. Exact-identifier
 *    queries are confirmed only when exactly one subject matches.
 *
 * Desktop douban pages are behind anti-bot protection (302 to sec.douban.com),
 * so nothing here scrapes HTML. Any title-based fuzzy search result belongs to
 * the suggestion tier and is handled by the caller.
 */

import { buildDoubanSubjectUrl, type AnimeMapEntry } from './link-resolver';
import type { SupportedPlatform } from './links';

const ANIME_MAP_URL = 'https://rhilip.github.io/BangumiExtLinker/data/anime_map.json';
const DOUBAN_REXXAR_SEARCH_URL = 'https://m.douban.com/rexxar/api/v2/search/movie';

const CACHE_DIR = '.cache/metadata';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const REXXAR_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    Referer: 'https://m.douban.com/',
};

/**
 * Match an anime map entry against a TMDB id. The dataset's `tmdb_id` field
 * looks like `tv/209867/season/1` or `movie/46343`; match on the numeric id
 * (and, for TV, prefer an exact season match when present).
 */
export function matchAnimeMapEntry(
    entries: AnimeMapEntry[],
    tmdbId: number,
    mediaType: 'movie' | 'tv',
    season?: number,
): AnimeMapEntry | null {
    const prefix = mediaType === 'movie' ? 'movie' : 'tv';
    let fallback: AnimeMapEntry | null = null;

    for (const entry of entries) {
        const tmdb = entry.tmdb_id;
        if (!tmdb) continue;

        const match = tmdb.match(new RegExp(`^${prefix}/(\\d+)(?:/season/(\\d+))?$`));
        if (!match) continue;

        const id = Number(match[1]);
        if (id !== tmdbId) continue;

        if (mediaType === 'tv') {
            const entrySeason = match[2] ? Number(match[2]) : undefined;
            if (entrySeason !== undefined && season !== undefined) {
                if (entrySeason === season) return entry;
                continue;
            }
            // Entry or query has no season granularity — keep as fallback.
            fallback ??= entry;
            continue;
        }
        return entry;
    }
    return fallback;
}

async function loadCachedJson<T>(name: string, url: string): Promise<T | null> {
    const path = `${CACHE_DIR}/${name}`;
    try {
        const file = Bun.file(path);
        const stat = await file.stat();
        if (stat && Date.now() - stat.mtime.getTime() < CACHE_TTL_MS) {
            return (await file.json()) as T;
        }
    } catch {
        // Fall through to download.
    }

    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
        if (!response.ok) return null;
        const json = (await response.json()) as T;
        await Bun.write(path, JSON.stringify(json));
        return json;
    } catch {
        return null;
    }
}

export async function loadAnimeMap(): Promise<AnimeMapEntry[] | null> {
    return loadCachedJson<AnimeMapEntry[]>('anime_map.json', ANIME_MAP_URL);
}

interface RexxarSearchResponse {
    items?: Array<{
        layout?: string;
        target?: { id?: string; title?: string; year?: string };
    }>;
}

export interface DoubanSearchHit {
    id: string;
    title: string;
    year: string;
}

/** Query the mobile rexxar search API. Throws on network/HTTP failure. */
export async function searchDoubanRaw(query: string): Promise<DoubanSearchHit[]> {
    const url = `${DOUBAN_REXXAR_SEARCH_URL}?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
        headers: REXXAR_HEADERS,
        signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
        throw new Error(`douban rexxar HTTP ${response.status}`);
    }
    const data = (await response.json()) as RexxarSearchResponse;

    return (data.items ?? [])
        .filter((item) => item.layout === 'subject' && item.target?.id)
        .map((item) => ({
            id: String(item.target?.id),
            title: String(item.target?.title ?? ''),
            year: String(item.target?.year ?? ''),
        }));
}

export interface DoubanResolution {
    confirmed?: string;
    suggestion?: string;
    source?: string;
}

/**
 * Resolve the douban link for one entry.
 *
 * Order: anime_map imdb match → anime_map tmdb match (anime only) →
 * rexxar imdb query (confirmed only with a single hit). Title-based search
 * is intentionally not attempted here; fuzzy results are suggestion-tier
 * and the caller decides whether to run it.
 */
export async function resolveDoubanLink(input: {
    imdbId: string | null;
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    season?: number;
    isAnime: boolean;
}): Promise<DoubanResolution> {
    const { imdbId, tmdbId, mediaType, season, isAnime } = input;

    if (isAnime) {
        const animeMap = await loadAnimeMap();
        if (animeMap) {
            let matched: AnimeMapEntry | null = null;
            let source = '';

            if (imdbId) {
                matched = animeMap.find((e) => e.imdb_id === imdbId) ?? null;
                if (matched?.douban_id) source = 'anime_map imdb match';
            }
            if (!matched?.douban_id) {
                matched = matchAnimeMapEntry(animeMap, tmdbId, mediaType, season);
                if (matched?.douban_id) source = 'anime_map tmdb match';
            }

            if (matched?.douban_id) {
                return {
                    confirmed: buildDoubanSubjectUrl(matched.douban_id),
                    source: `douban: ${source}`,
                };
            }
        }
    }

    if (imdbId) {
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // polite rate limit
            const hits = await searchDoubanRaw(imdbId);
            if (hits.length === 1) {
                return {
                    confirmed: buildDoubanSubjectUrl(hits[0].id),
                    source: 'douban: rexxar imdb query (single hit)',
                };
            }
            if (hits.length > 1) {
                return { source: `douban: rexxar imdb query ambiguous (${hits.length} hits)` };
            }
        } catch (error) {
            return {
                source: `douban rexxar failed: ${error instanceof Error ? error.message : error}`,
            };
        }
    }

    return {};
}

/** Bangumi id from the same curated dataset, when present. */
export async function resolveBangumiFromAnimeMap(
    imdbId: string | null,
    tmdbId: number,
    mediaType: 'movie' | 'tv',
    season?: number,
): Promise<string | null> {
    const animeMap = await loadAnimeMap();
    if (!animeMap) return null;

    const matched =
        (imdbId ? animeMap.find((e) => e.imdb_id === imdbId) : undefined) ??
        matchAnimeMapEntry(animeMap, tmdbId, mediaType, season);
    return matched?.bgm_id ?? null;
}

/** Convenience for the resolver: true when a douban URL was produced. */
export function isDoubanResolved(resolution: DoubanResolution, platform: SupportedPlatform): boolean {
    return platform === 'douban' && !!resolution.confirmed;
}
