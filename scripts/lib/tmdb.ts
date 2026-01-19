/**
 * TMDB API Client (Simplified)
 * Only fetches: title_en, title_zh, year, tmdb_id, media_type
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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
    title_en: string;
    title_zh: string;
    year: number;
    media_type: 'movie' | 'tv';
    number_of_seasons?: number;
}

function getApiKey(): string {
    const key = process.env.TMDB_API_KEY;
    if (!key) {
        throw new Error('TMDB_API_KEY is not set in environment variables');
    }
    return key;
}

/**
 * Search TMDB for movies and TV shows (English results)
 */
export async function searchMulti(query: string): Promise<TMDBSearchResult[]> {
    const apiKey = getApiKey();
    const url = `${TMDB_BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return (data.results as TMDBSearchResult[])
        .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
        .slice(0, 10);
}

/**
 * Get metadata for a movie by ID
 */
export async function getMovieMetadata(id: number): Promise<TMDBMetadata> {
    const apiKey = getApiKey();
    const urlEn = `${TMDB_BASE_URL}/movie/${id}?api_key=${apiKey}&language=en-US`;
    const urlZh = `${TMDB_BASE_URL}/movie/${id}?api_key=${apiKey}&language=zh-CN`;

    const [resEn, resZh] = await Promise.all([
        fetch(urlEn),
        fetch(urlZh)
    ]);

    if (!resEn.ok) {
        throw new Error(`TMDB API error: ${resEn.status} ${resEn.statusText}`);
    }

    const dataEn = await resEn.json();
    const dataZh = resZh.ok ? await resZh.json() : null;

    const year = dataEn.release_date
        ? parseInt(dataEn.release_date.split('-')[0])
        : new Date().getFullYear();

    return {
        tmdb_id: dataEn.id,
        title_en: dataEn.title,
        title_zh: dataZh?.title || dataEn.title,
        year,
        media_type: 'movie'
    };
}

/**
 * Get metadata for a TV show by ID
 */
export async function getTVMetadata(id: number): Promise<TMDBMetadata> {
    const apiKey = getApiKey();
    const urlEn = `${TMDB_BASE_URL}/tv/${id}?api_key=${apiKey}&language=en-US`;
    const urlZh = `${TMDB_BASE_URL}/tv/${id}?api_key=${apiKey}&language=zh-CN`;

    const [resEn, resZh] = await Promise.all([
        fetch(urlEn),
        fetch(urlZh)
    ]);

    if (!resEn.ok) {
        throw new Error(`TMDB API error: ${resEn.status} ${resEn.statusText}`);
    }

    const dataEn = await resEn.json();
    const dataZh = resZh.ok ? await resZh.json() : null;

    const year = dataEn.first_air_date
        ? parseInt(dataEn.first_air_date.split('-')[0])
        : new Date().getFullYear();

    return {
        tmdb_id: dataEn.id,
        title_en: dataEn.name,
        title_zh: dataZh?.name || dataEn.name,
        year,
        media_type: 'tv',
        number_of_seasons: dataEn.number_of_seasons
    };
}

/**
 * Get metadata by ID, optionally specifying type.
 * If type is not specified, tries both Movie and TV in parallel.
 * Returns valid results found.
 */
export async function getMetadataById(id: number, type?: 'movie' | 'tv'): Promise<TMDBMetadata[]> {
    if (type === 'movie') {
        try {
            return [await getMovieMetadata(id)];
        } catch {
            return [];
        }
    } else if (type === 'tv') {
        try {
            return [await getTVMetadata(id)];
        } catch {
            return [];
        }
    } else {
        // Try both
        const [movieRes, tvRes] = await Promise.allSettled([
            getMovieMetadata(id),
            getTVMetadata(id)
        ]);

        const results: TMDBMetadata[] = [];

        if (movieRes.status === 'fulfilled') results.push(movieRes.value);
        if (tvRes.status === 'fulfilled') results.push(tvRes.value);

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
            const title = (result as TMDBSearchResult).title || (result as TMDBMetadata).title_en;
            const date = (result as TMDBSearchResult).release_date || (result as TMDBMetadata).year?.toString();
            const year = date ? date.substring(0, 4) : 'N/A';
            return `[Movie] ${title} (${year})`;
        } else {
            const name = (result as TMDBSearchResult).name || (result as TMDBMetadata).title_en;
            const date = (result as TMDBSearchResult).first_air_date || (result as TMDBMetadata).year?.toString();
            const year = date ? date.substring(0, 4) : 'N/A';
            return `[TV] ${name} (${year})`;
        }
    }
    return 'Unknown';
}
