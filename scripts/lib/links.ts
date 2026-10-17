/**
 * External links validation
 *
 * Platform detection runs on URLs that a human pastes into an editor, so it
 * must never be fooled by a URL that merely *contains* a platform's name:
 * matching a substring would accept `https://evil.tld/?u=imdb.com`,
 * `https://imdb.com.evil.tld/x` and even `javascript:alert("imdb.com")`,
 * all of which then get stored as the release's link and rendered as an href.
 */

export type SupportedPlatform =
    | 'tmdb'
    | 'imdb'
    | 'douban'
    | 'bangumi'
    | 'letterboxd'
    | 'rotten_tomatoes'
    | 'anidb'
    | 'anilist'
    | 'myanimelist'
    | 'tvdb';

/**
 * Registrable domains per platform. A hostname matches when it is the domain
 * itself or a subdomain of it (`m.imdb.com` matches `imdb.com`), which is the
 * only safe way to accept platform subdomains without accepting lookalikes.
 */
const PLATFORM_DOMAINS: Record<SupportedPlatform, string[]> = {
    tmdb: ['themoviedb.org'],
    imdb: ['imdb.com'],
    douban: ['douban.com'],
    bangumi: ['bgm.tv', 'bangumi.tv'],
    letterboxd: ['letterboxd.com'],
    rotten_tomatoes: ['rottentomatoes.com'],
    anidb: ['anidb.net'],
    anilist: ['anilist.co'],
    myanimelist: ['myanimelist.net'],
    tvdb: ['thetvdb.com'],
};

const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_DOMAINS) as SupportedPlatform[];

export type LinkCollectionResult =
    | { status: 'added'; platform: SupportedPlatform; links: Record<string, string> }
    | { status: 'duplicate'; platform: SupportedPlatform; links: Record<string, string> }
    | { status: 'unsupported'; platform: null; links: Record<string, string> };

export function collectExternalLinks(
    initialLinks: Record<string, string>,
    editorContent: string,
): { links: Record<string, string>; added: SupportedPlatform[]; skipped: number } {
    let links = { ...initialLinks };
    const added: SupportedPlatform[] = [];
    let skipped = 0;

    for (const rawLine of editorContent.split(/\r?\n/)) {
        const url = rawLine.trim();
        if (!url || url.startsWith('#')) continue;

        if (!isValidUrl(url)) {
            skipped += 1;
            continue;
        }

        const result = addExternalLink(links, url);
        if (result.status === 'added') {
            links = result.links;
            added.push(result.platform);
        } else {
            skipped += 1;
        }
    }

    return { links, added, skipped };
}

function hostnameMatches(hostname: string, domain: string): boolean {
    const host = hostname.toLowerCase();
    return host === domain || host.endsWith(`.${domain}`);
}

/**
 * Detect platform from URL
 * Returns platform key if supported, null otherwise
 */
export function detectPlatform(url: string): SupportedPlatform | null {
    const parsed = parseHttpUrl(url);
    if (!parsed) return null;

    return (
        SUPPORTED_PLATFORMS.find((platform) =>
            PLATFORM_DOMAINS[platform].some((domain) =>
                hostnameMatches(parsed.hostname, domain),
            ),
        ) ?? null
    );
}

/**
 * Only absolute http(s) URLs are link material. `new URL()` alone accepts
 * `javascript:`, `mailto:`, `data:` and friends.
 */
function parseHttpUrl(url: string): URL | null {
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
        if (!parsed.hostname) return null;
        return parsed;
    } catch {
        return null;
    }
}

/**
 * Check if URL is a usable external link
 */
export function isValidUrl(url: string): boolean {
    return parseHttpUrl(url) !== null;
}

/**
 * Get list of supported platforms
 */
export function getSupportedPlatforms(): string[] {
    return [...SUPPORTED_PLATFORMS];
}

export function buildInitialExternalLinks(
    tmdbId: number,
    mediaType: string,
): Record<string, string> {
    if (!Number.isFinite(tmdbId) || tmdbId <= 0) {
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
