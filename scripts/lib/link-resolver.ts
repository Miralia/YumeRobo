/**
 * External link auto-resolution
 *
 * Resolves external database links from a TMDB id, with a confidence tier:
 * - confirmed:   deterministic sources (official APIs, curated datasets,
 *                exact identifier lookups) — safe to prefill
 * - suggestions: fuzzy matches (title searches) — shown as comments only
 * - missing:     nothing found — user fills manually
 */

import type { SupportedPlatform } from './links';
import {
    loadAnimeMap,
    resolveBangumiFromAnimeMap,
    resolveDoubanLink,
} from './douban';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const WIKIDATA_ENTITY_URL = 'https://www.wikidata.org/wiki/Special:EntityData';
const LETTERBOXD_IMDB_URL = 'https://letterboxd.com/imdb/';
const DUCKDUCKGO_HTML_URL = 'https://html.duckduckgo.com/html/?q=';
const ANIBRIDGE_MAPPINGS_URL =
    'https://github.com/anibridge/anibridge-mappings/releases/download/v3/mappings.min.json';
const BGM_SEARCH_URL = 'https://api.bgm.tv/v0/search/subjects';

export interface ResolvedLinks {
    confirmed: Partial<Record<SupportedPlatform, string>>;
    suggestions: Partial<Record<SupportedPlatform, string>>;
    missing: SupportedPlatform[];
    sources: string[];
}

export interface ResolveOptions {
    apiKey: string;
    season?: number;
    title?: string;
    year?: number;
    isAnime?: boolean;
}

interface TmdbExternalIds {
    imdbId: string | null;
    tvdbId: string | null;
    wikidataId: string | null;
}

// ---------------------------------------------------------------------------
// Pure helpers (unit-testable, no network)
// ---------------------------------------------------------------------------

/** Pad an IMDb numeric id so the deep link form has the full ttNNNNNNN width. */
export function formatImdbNumber(imdbId: string): string {
    const digits = imdbId.replace(/^tt/, '').replace(/\/$/, '');
    return digits.padStart(7, '0');
}

export function buildLetterboxdUrl(imdbId: string): string {
    return `${LETTERBOXD_IMDB_URL}tt${formatImdbNumber(imdbId)}/`;
}

export function buildImdbUrl(imdbId: string): string {
    return `https://www.imdb.com/title/${imdbId}/`;
}

export function buildTvdbUrl(tvdbId: string): string {
    return `https://thetvdb.com/dereferrer/series/${tvdbId}`;
}

/**
 * Normalize a Rotten Tomatoes path from Wikidata P1258.
 * TV entries may use underscores (`tv/breaking_bad`); RT serves both but
 * canonical form uses hyphens.
 */
export function normalizeRottenTomatoesPath(path: string): string {
    return path.replace(/^\/+/, '').replace(/_/g, '-');
}

export function buildRottenTomatoesUrl(path: string): string {
    return `https://www.rottentomatoes.com/${normalizeRottenTomatoesPath(path)}`;
}

/** UNIT3D-style DuckDuckGo fallback for finding the RT page manually. */
export function buildRtSearchUrl(title: string, year?: number): string {
    const yearSuffix = year ? ` (${year})` : '';
    const query = `${title}${yearSuffix} site:rottentomatoes.com`;
    return `${DUCKDUCKGO_HTML_URL}%22${encodeURIComponent(query)}%22`;
}

export function buildDoubanSubjectUrl(doubanId: string | number): string {
    return `https://movie.douban.com/subject/${doubanId}/`;
}

/** Douban keyword search URL (fuzzy, suggestion-tier only). */
export function buildDoubanSearchUrl(query: string): string {
    return `https://search.douban.com/movie/subject_search?search_text=${encodeURIComponent(query)}`;
}

export function buildBangumiSubjectUrl(bgmId: string | number): string {
    return `https://bgm.tv/subject/${bgmId}`;
}

export function buildAnilistUrl(id: string | number): string {
    return `https://anilist.co/anime/${id}`;
}

export function buildMalUrl(id: string | number): string {
    return `https://myanimelist.net/anime/${id}`;
}

export function buildAnidbUrl(id: string | number): string {
    return `https://anidb.net/anime/${id}`;
}

/**
 * Extract a platform link from an anibridge-mappings target descriptor.
 * Descriptors look like `anilist:185407`, `mal:60489`, `anidb:19038:R`,
 * `imdb_movie:tt123`, `tvdb_show:457645:s1`, `tmdb_show:284445:s1`.
 */
export function parseMappingDescriptor(
    descriptor: string,
): { provider: string; id: string; scope?: string } | null {
    const parts = descriptor.split(':');
    if (parts.length < 2 || !parts[0] || !parts[1]) return null;
    return { provider: parts[0], id: parts[1], scope: parts[2] };
}

/**
 * Look up anime database ids from the anibridge mappings dataset for one
 * TMDB entry. Returns raw provider ids keyed by provider name.
 */
export function lookupAnimeMappings(
    mappings: Record<string, unknown>,
    tmdbId: number,
    mediaType: 'movie' | 'tv',
    season?: number,
): { anidb?: string; anilist?: string; mal?: string } {
    const descriptor =
        mediaType === 'movie'
            ? `tmdb_movie:${tmdbId}`
            : `tmdb_show:${tmdbId}:s${season ?? 1}`;

    const targets = mappings[descriptor];
    if (!targets || typeof targets !== 'object') return {};

    const result: { anidb?: string; anilist?: string; mal?: string } = {};
    for (const [key] of Object.entries(targets as Record<string, unknown>)) {
        const parsed = parseMappingDescriptor(key);
        if (!parsed) continue;
        if (parsed.provider === 'anidb' && (!parsed.scope || parsed.scope === 'R')) {
            result.anidb ??= parsed.id;
        } else if (parsed.provider === 'anilist') {
            result.anilist ??= parsed.id;
        } else if (parsed.provider === 'mal') {
            result.mal ??= parsed.id;
        }
    }
    return result;
}

export interface AnimeMapEntry {
    name?: string;
    name_cn?: string;
    date?: string;
    bgm_id?: string;
    douban_id?: string;
    anidb_id?: string;
    mal_id?: string;
    tmdb_id?: string;
    imdb_id?: string;
    tvdb_id?: string;
    wikidata_id?: string;
}

// ---------------------------------------------------------------------------
// Network layer
// ---------------------------------------------------------------------------

async function fetchJson(url: string, init?: RequestInit, timeoutMs = 15000): Promise<unknown> {
    const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return response.json();
}

export async function fetchTmdbExternalIds(
    tmdbId: number,
    mediaType: 'movie' | 'tv',
    apiKey: string,
): Promise<TmdbExternalIds> {
    const url = `${TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${apiKey}&append_to_response=external_ids`;
    const data = (await fetchJson(url)) as {
        external_ids?: { imdb_id?: string; tvdb_id?: number; wikidata_id?: string };
    };
    const external = data.external_ids ?? {};
    return {
        imdbId: external.imdb_id || null,
        tvdbId: external.tvdb_id ? String(external.tvdb_id) : null,
        wikidataId: external.wikidata_id || null,
    };
}

/** Read the Rotten Tomatoes sitelink (P1258) from a Wikidata entity. */
export async function fetchRottenTomatoesPath(wikidataId: string): Promise<string | null> {
    try {
        const data = (await fetchJson(`${WIKIDATA_ENTITY_URL}/${wikidataId}.json`)) as {
            entities?: Record<string, { claims?: Record<string, Array<{ mainsnak?: { datavalue?: { value?: unknown } } }>> }>;
        };
        const entity = data.entities?.[wikidataId];
        const claims = entity?.claims?.P1258;
        const value = claims?.[0]?.mainsnak?.datavalue?.value;
        return typeof value === 'string' ? value : null;
    } catch {
        return null;
    }
}

/**
 * Search Bangumi by title via the official v0 API. Fuzzy matches are
 * suggestion-tier only; callers decide whether to trust them.
 */
export async function searchBangumiByTitle(
    keyword: string,
): Promise<{ id: string; name: string; nameCn: string; date: string }[]> {
    const data = (await fetchJson(BGM_SEARCH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'miralia/yumerobo (https://github.com/Miralia/YumeRobo)',
        },
        body: JSON.stringify({ keyword }),
    })) as {
        data?: Array<{ id?: number; name?: string; name_cn?: string; date?: string }>;
    };

    return (data.data ?? [])
        .filter((s) => s.id !== undefined)
        .map((s) => ({
            id: String(s.id),
            name: s.name ?? '',
            nameCn: s.name_cn ?? '',
            date: s.date ?? '',
        }));
}

// ---------------------------------------------------------------------------
// Dataset loading (cached under .cache/metadata)
// ---------------------------------------------------------------------------

const CACHE_DIR = '.cache/metadata';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function loadCachedJson<T>(name: string, url: string): Promise<T | null> {
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

export async function loadAnimeMappings(): Promise<Record<string, unknown> | null> {
    return loadCachedJson<Record<string, unknown>>('anibridge-mappings.json', ANIBRIDGE_MAPPINGS_URL);
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

function put(
    bucket: Partial<Record<SupportedPlatform, string>>,
    platform: SupportedPlatform,
    url: string,
): void {
    if (!bucket[platform]) bucket[platform] = url;
}

/**
 * Resolve external links for one TMDB entry.
 *
 * Confidence rules:
 * - TMDB external_ids (imdb/tvdb) and Letterboxd's imdb deep link: confirmed.
 * - Rotten Tomatoes via Wikidata P1258: confirmed; DDG search link: suggestion.
 * - Douban: curated anime_map imdb match confirmed; rexxar imdb query confirmed
 *   only when exactly one subject matches; title search is a suggestion.
 * - Bangumi/AniList/MAL/AniDB: dataset matches confirmed, title search only.
 */
export async function resolveExternalLinks(
    tmdbId: number,
    mediaType: 'movie' | 'tv',
    opts: ResolveOptions,
): Promise<ResolvedLinks> {
    const confirmed: Partial<Record<SupportedPlatform, string>> = {};
    const suggestions: Partial<Record<SupportedPlatform, string>> = {};
    const missing: SupportedPlatform[] = [];
    const sources: string[] = [];

    // Only track platforms that apply to this entry, so `missing` stays clean.
    const wanted: SupportedPlatform[] = ['imdb', 'letterboxd', 'rotten_tomatoes', 'douban'];
    if (mediaType === 'tv') wanted.push('tvdb');
    if (opts.isAnime) wanted.push('bangumi', 'anidb', 'anilist', 'myanimelist');

    // 1. TMDB external ids — deterministic.
    let imdbId: string | null = null;
    try {
        const external = await fetchTmdbExternalIds(tmdbId, mediaType, opts.apiKey);
        imdbId = external.imdbId;
        if (imdbId) {
            put(confirmed, 'imdb', buildImdbUrl(imdbId));
            sources.push('imdb: tmdb external_ids');
        }
        if (external.tvdbId) {
            put(confirmed, 'tvdb', buildTvdbUrl(external.tvdbId));
            sources.push('tvdb: tmdb external_ids');
        }
        if (imdbId) {
            put(confirmed, 'letterboxd', buildLetterboxdUrl(imdbId));
            sources.push('letterboxd: imdb deep link');
        }

        // 2. Rotten Tomatoes via Wikidata P1258.
        if (external.wikidataId) {
            const rtPath = await fetchRottenTomatoesPath(external.wikidataId);
            if (rtPath) {
                put(confirmed, 'rotten_tomatoes', buildRottenTomatoesUrl(rtPath));
                sources.push('rotten_tomatoes: wikidata P1258');
            } else if (opts.title) {
                put(suggestions, 'rotten_tomatoes', buildRtSearchUrl(opts.title, opts.year));
                sources.push('rotten_tomatoes: ddg search (no P1258)');
            }
        } else if (opts.title) {
            put(suggestions, 'rotten_tomatoes', buildRtSearchUrl(opts.title, opts.year));
            sources.push('rotten_tomatoes: ddg search (no wikidata id)');
        }
    } catch (error) {
        sources.push(`tmdb external_ids failed: ${error instanceof Error ? error.message : error}`);
    }

    // 3. Douban — curated dataset first, then exact rexxar lookup.
    const douban = await resolveDoubanLink({
        imdbId,
        tmdbId,
        mediaType,
        season: opts.season,
        isAnime: opts.isAnime ?? false,
    });
    if (douban.confirmed) {
        put(confirmed, 'douban', douban.confirmed);
    } else if (imdbId && opts.title) {
        // Title-based douban search is fuzzy; only offer it as a suggestion.
        put(suggestions, 'douban', buildDoubanSearchUrl(opts.title));
        sources.push('douban: title search (fuzzy, suggestion only)');
    }
    if (douban.source) sources.push(douban.source);

    // 3b. Bangumi from the same curated dataset (exact match → confirmed).
    if (!confirmed.bangumi && (opts.isAnime || imdbId)) {
        const bgmId = await resolveBangumiFromAnimeMap(imdbId, tmdbId, mediaType, opts.season);
        if (bgmId) {
            put(confirmed, 'bangumi', buildBangumiSubjectUrl(bgmId));
            sources.push('bangumi: bangumi-ext-linker anime_map');
        }
    }

    // 4. Anime databases via anibridge mappings.
    if (opts.isAnime) {
        const mappings = await loadAnimeMappings();
        if (mappings) {
            const ids = lookupAnimeMappings(mappings, tmdbId, mediaType, opts.season);
            if (ids.anidb) put(confirmed, 'anidb', buildAnidbUrl(ids.anidb));
            if (ids.anilist) put(confirmed, 'anilist', buildAnilistUrl(ids.anilist));
            if (ids.mal) put(confirmed, 'myanimelist', buildMalUrl(ids.mal));
            if (ids.anidb || ids.anilist || ids.mal) {
                sources.push('anidb/anilist/mal: anibridge mappings');
            }
        }

        // Bangumi title search as fallback (fuzzy → suggestion).
        if (!confirmed.bangumi && opts.title) {
            try {
                const hits = await searchBangumiByTitle(opts.title);
                if (hits.length === 1) {
                    put(suggestions, 'bangumi', buildBangumiSubjectUrl(hits[0].id));
                    sources.push('bangumi: title search (fuzzy)');
                }
            } catch (error) {
                sources.push(`bangumi search failed: ${error instanceof Error ? error.message : error}`);
            }
        }
    }

    for (const platform of wanted) {
        if (!confirmed[platform]) missing.push(platform);
    }

    return { confirmed, suggestions, missing, sources };
}
