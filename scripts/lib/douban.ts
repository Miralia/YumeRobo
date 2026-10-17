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

const ANIME_MAP_URL = 'https://rhilip.github.io/BangumiExtLinker/data/anime_map.json';
const DOUBAN_REXXAR_SEARCH_URL = 'https://m.douban.com/rexxar/api/v2/search/movie';

const CACHE_DIR = '.cache/metadata';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Minimum spacing between rexxar requests. Douban publishes no rate limit, so
 * the pause is explicit and overridable (`DOUBAN_REQUEST_DELAY_MS=0` for tests
 * and bulk backfills) instead of a hard-coded sleep.
 */
const DEFAULT_REXXAR_DELAY_MS = 1000;

export function getRexxarDelayMs(): number {
    const raw = process.env.DOUBAN_REQUEST_DELAY_MS;
    if (raw === undefined || raw.trim() === '') return DEFAULT_REXXAR_DELAY_MS;

    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_REXXAR_DELAY_MS;
}

const REXXAR_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    Referer: 'https://m.douban.com/',
};

/** Fetch JSON with a hard timeout; non-OK responses are failures, not "no match". */
async function fetchJson(url: string, init?: RequestInit, timeoutMs = 15000): Promise<unknown> {
    const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
        throw new Error(`douban HTTP ${response.status} for ${url}`);
    }
    return response.json();
}

/**
 * Match an anime map entry against a TMDB id. The dataset's `tmdb_id` field
 * looks like `tv/209867/season/1` or `movie/46343`; match on the numeric id
 * (and, for TV, prefer an exact season match when present).
 *
 * A season-scoped entry is never used to answer a season-less query: that
 * would guess a season and could confirm another season's — hence another
 * show's — link.
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
            if (entrySeason !== undefined) {
                if (season === undefined) continue;
                if (entrySeason === season) return entry;
                continue;
            }
            // Season-less entry: granularity matches any query season.
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
        const json = (await fetchJson(url, undefined, 60000)) as T;
        await Bun.write(path, JSON.stringify(json));
        return json;
    } catch {
        return null;
    }
}

let animeMapPromise: Promise<AnimeMapEntry[] | null> | null = null;

export async function loadAnimeMap(): Promise<AnimeMapEntry[] | null> {
    // 3.8 MB of JSON: parse once per process, not once per release.
    animeMapPromise ??= loadCachedJson<AnimeMapEntry[]>('anime_map.json', ANIME_MAP_URL)
        .then((value) => (Array.isArray(value) ? value : null));
    return animeMapPromise;
}

interface RexxarSearchResponse {
    r?: number;
    msg?: string;
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

/** Query the mobile rexxar search API. Throws on network/HTTP/error-payload failure. */
export async function searchDoubanRaw(query: string): Promise<DoubanSearchHit[]> {
    const url = `${DOUBAN_REXXAR_SEARCH_URL}?q=${encodeURIComponent(query)}`;
    const data = (await fetchJson(url, { headers: REXXAR_HEADERS })) as RexxarSearchResponse | null;

    // Douban answers rate limits/errors with a `r` code, which must not be
    // mistaken for "this id has no douban page".
    if (data && typeof data.r === 'number' && data.r !== 0) {
        throw new Error(`douban rexxar error (r=${data.r}): ${data.msg ?? 'unknown error'}`);
    }
    if (!data || !Array.isArray(data.items)) {
        throw new Error('douban rexxar returned an unexpected payload');
    }

    return data.items
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
            // Polite spacing between rexxar requests (configurable, may be 0).
            await new Promise((resolve) => setTimeout(resolve, getRexxarDelayMs()));
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
