/**
 * External links validation
 */

const SUPPORTED_PLATFORMS: Record<string, RegExp> = {
    tmdb: /themoviedb\.org/i,
    imdb: /imdb\.com/i,
    douban: /douban\.com/i,
    bangumi: /bgm\.tv|bangumi\.tv/i,
    letterboxd: /letterboxd\.com/i,
    rotten_tomatoes: /rottentomatoes\.com/i,
    anidb: /anidb\.net/i,
    anilist: /anilist\.co/i,
    myanimelist: /myanimelist\.net/i,
    tvdb: /thetvdb\.com/i,
};

export type SupportedPlatform = keyof typeof SUPPORTED_PLATFORMS;
export type LinkCollectionResult =
    | { status: 'added'; platform: SupportedPlatform; links: Record<string, string> }
    | { status: 'duplicate'; platform: SupportedPlatform; links: Record<string, string> }
    | { status: 'unsupported'; platform: null; links: Record<string, string> };

/**
 * Detect platform from URL
 * Returns platform key if supported, null otherwise
 */
export function detectPlatform(url: string): SupportedPlatform | null {
    for (const [platform, regex] of Object.entries(SUPPORTED_PLATFORMS)) {
        if (regex.test(url)) {
            return platform as SupportedPlatform;
        }
    }
    return null;
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get list of supported platforms
 */
export function getSupportedPlatforms(): string[] {
    return Object.keys(SUPPORTED_PLATFORMS);
}

export function buildInitialExternalLinks(
    tmdbId: number,
    mediaType: string,
): Record<string, string> {
    if (tmdbId <= 0) {
        return {};
    }

    const type = mediaType === 'movie' ? 'movie' : 'tv';
    return {
        tmdb: `https://www.themoviedb.org/${type}/${tmdbId}`,
    };
}

export function addExternalLink(
    links: Record<string, string>,
    url: string,
): LinkCollectionResult {
    const platform = detectPlatform(url);
    if (!platform) {
        return {
            status: 'unsupported',
            platform: null,
            links: { ...links },
        };
    }

    if (links[platform]) {
        return {
            status: 'duplicate',
            platform,
            links: { ...links },
        };
    }

    return {
        status: 'added',
        platform,
        links: {
            ...links,
            [platform]: url,
        },
    };
}
