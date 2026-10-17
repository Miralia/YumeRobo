/**
 * TMDB API Client (Simplified)
 * Only fetches: title, year, tmdb_id, media_type
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_TIMEOUT_MS = 15000;

export interface TMDBSearchResult {
    id: number;
    title?: string;           // For movies (en)
    name?: string;            // For TV shows (en)
    release_date?: string;    // For movies
    first_air_date?: string;  // For TV shows
    media_type: 'movie' | 'tv';
}

export interface TMDBMetadata {
    tmdb_id: number;
    title: string;
    year: number;
    media_type: 'movie' | 'tv';
    number_of_seasons?: number;
}

/** HTTP-level failure; `status` lets callers tell "missing" from "unauthorized". */
export class TmdbApiError extends Error {
    readonly status: number;

    constructor(status: number, statusText: string) {
        super(`TMDB API error: ${status}${statusText ? ` ${statusText}` : ''}`);
        this.name = 'TmdbApiError';
        this.status = status;
    }
}

/** A 200 response whose body is not usable metadata. */
export class TmdbPayloadError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TmdbPayloadError';
    }
}

function getApiKey(): string {
    const key = process.env.TMDB_API_KEY;
    if (!key) {
        throw new Error('TMDB_API_KEY is not set in environment variables');
    }
    return key;
}

/** Expose the configured key for other modules (link resolution). */
export function getTmdbApiKey(): string {
    return getApiKey();
}

async function fetchTmdb(path: string): Promise<unknown> {
    const response = await fetch(`${TMDB_BASE_URL}${path}`, {
        signal: AbortSignal.timeout(TMDB_TIMEOUT_MS),
    });

    if (!response.ok) {
        throw new TmdbApiError(response.status, response.statusText);
    }

    return response.json();
}

/**
 * TMDB dates are `YYYY-MM-DD` (or `YYYY-MM`). Anything else — including an
 * empty string, which `parseInt` turns into `NaN` — must not be written into
 * release data as `year`: throw so the CLI falls back to manual entry.
 */
function parseReleaseYear(value: unknown, context: string): number {
    if (typeof value !== 'string' || !value.trim()) {
        throw new TmdbPayloadError(`${context} has no release date`);
    }

    const match = /^(\d{4})(?:-\d{2}(?:-\d{2})?)?$/.exec(value.trim());
    if (!match) {
        throw new TmdbPayloadError(`${context} has an unusable release date: ${JSON.stringify(value)}`);
    }

    return Number(match[1]);
}

function assertValidId(id: unknown, context: string): number {
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
        throw new TmdbPayloadError(`${context} returned an unexpected payload`);
    }
    return id;
}

/**
 * Search TMDB for movies and TV shows (English results)
 */
export async function searchMulti(query: string): Promise<TMDBSearchResult[]> {
    const apiKey = getApiKey();
    const url = `/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US`;

    const data = (await fetchTmdb(url)) as { results?: unknown } | null;
    if (!data || !Array.isArray(data.results)) {
        throw new TmdbPayloadError('TMDB search returned an unexpected payload');
    }

    return (data.results as TMDBSearchResult[])
        .filter((r) => (r.media_type === 'movie' || r.media_type === 'tv') && hasDisplayTitle(r))
        .slice(0, 10);
}

function hasDisplayTitle(result: TMDBSearchResult): boolean {
    const title = result.media_type === 'movie' ? result.title : result.name;
    return typeof title === 'string' && title.trim().length > 0;
}

/**
 * Get metadata for a movie by ID
 */
export async function getMovieMetadata(id: number): Promise<TMDBMetadata> {
    const apiKey = getApiKey();
    const url = `/movie/${id}?api_key=${apiKey}&language=en-US`;
    const data = (await fetchTmdb(url)) as {
        id?: unknown;
        title?: unknown;
        release_date?: unknown;
    } | null;

    const tmdbId = assertValidId(data?.id, `TMDB movie ${id}`);
    if (typeof data?.title !== 'string' || !data.title.trim()) {
        throw new TmdbPayloadError(`TMDB movie ${id} has no title`);
    }

    return {
        tmdb_id: tmdbId,
        title: data.title,
        year: parseReleaseYear(data.release_date, `TMDB movie ${id}`),
        media_type: 'movie'
    };
}

/**
 * Get metadata for a TV show by ID
 */
export async function getTVMetadata(id: number): Promise<TMDBMetadata> {
    const apiKey = getApiKey();
    const url = `/tv/${id}?api_key=${apiKey}&language=en-US`;
    const data = (await fetchTmdb(url)) as {
        id?: unknown;
        name?: unknown;
        first_air_date?: unknown;
        number_of_seasons?: unknown;
    } | null;

    const tmdbId = assertValidId(data?.id, `TMDB TV show ${id}`);
    if (typeof data?.name !== 'string' || !data.name.trim()) {
        throw new TmdbPayloadError(`TMDB TV show ${id} has no name`);
    }

    const seasons = typeof data.number_of_seasons === 'number' && Number.isInteger(data.number_of_seasons)
        ? data.number_of_seasons
        : undefined;

    return {
        tmdb_id: tmdbId,
        title: data.name,
        year: parseReleaseYear(data.first_air_date, `TMDB TV show ${id}`),
        media_type: 'tv',
        number_of_seasons: seasons
    };
}

function isNotFound(error: unknown): boolean {
    return error instanceof TmdbApiError && error.status === 404;
}

/**
 * Get metadata by ID, optionally specifying type.
 * If type is not specified, tries both Movie and TV in parallel.
 * Returns valid results found.
 *
 * Only a 404 ("this id is not a movie") is folded into "no results"; an auth
 * or rate-limit failure is rethrown so it cannot masquerade as an empty search.
 */
export async function getMetadataById(id: number, type?: 'movie' | 'tv'): Promise<TMDBMetadata[]> {
    if (type === 'movie') {
        try {
            return [await getMovieMetadata(id)];
        } catch (error) {
            if (isNotFound(error)) return [];
            throw error;
        }
    } else if (type === 'tv') {
        try {
            return [await getTVMetadata(id)];
        } catch (error) {
            if (isNotFound(error)) return [];
            throw error;
        }
    } else {
        // Try both
        const [movieRes, tvRes] = await Promise.allSettled([
            getMovieMetadata(id),
            getTVMetadata(id)
        ]);

        const results: TMDBMetadata[] = [];
        const failures: unknown[] = [];

        if (movieRes.status === 'fulfilled') results.push(movieRes.value);
        else failures.push(movieRes.reason);
        if (tvRes.status === 'fulfilled') results.push(tvRes.value);
        else failures.push(tvRes.reason);

        if (results.length === 0) {
            const fatal = failures.find((reason) => !isNotFound(reason));
            if (fatal) throw fatal;
        }

        return results;
    }
}

/**
 * Format search result for display
 */
export function formatSearchResult(result: TMDBSearchResult | TMDBMetadata): string {
    // Handle both SearchResult and Metadata types
    if ('media_type' in result) {
        if (result.media_type === 'movie') {
            const title = (result as TMDBSearchResult).title || (result as TMDBMetadata).title;
            const date = (result as TMDBSearchResult).release_date || (result as TMDBMetadata).year?.toString();
            const year = date ? date.substring(0, 4) : 'N/A';
            return `[Movie] ${title} (${year})`;
        } else {
            const name = (result as TMDBSearchResult).name || (result as TMDBMetadata).title;
            const date = (result as TMDBSearchResult).first_air_date || (result as TMDBMetadata).year?.toString();
            const year = date ? date.substring(0, 4) : 'N/A';
            return `[TV] ${name} (${year})`;
        }
    }
    return 'Unknown';
}
