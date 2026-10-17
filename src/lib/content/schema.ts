/**
 * Content schema definitions using Zod
 * Validates frontmatter for release posts
 */
import { z } from 'zod';

/**
 * Media type enum
 * - movie: Feature film
 * - tv: Live-action TV series
 * - tva: TV Animation (regular anime series)
 * - ova: Original Video Animation
 * - ona: Original Net Animation
 * - special: Specials, extras, etc.
 */
export const MediaTypeSchema = z.enum(['movie', 'tv', 'tva', 'ova', 'ona', 'special']);
export type MediaType = z.infer<typeof MediaTypeSchema>;

/**
 * MediaInfo entry schema
 * Each entry represents one video file's MediaInfo
 * Summary is auto-generated from raw content
 */
export const MediaInfoEntrySchema = z.object({
    filename: z.string().describe('Video filename'),
    raw_hash: z.string().describe('Hash ID pointing to static/mediainfo/[hash] raw text file')
});

/**
 * Torrent entry schema
 * Each release can have multiple torrents (e.g., different encoders/formats)
 * Each torrent has a top-level name, display name, files, and embedded MediaInfo
 */
export const TorrentEntrySchema = z.object({
    name: z.string().describe('Torrent top-level folder name'),
    telegram_label: z.string().optional().describe('Manual MediaInfo link label for Telegram'),
    display_name: z.string().optional().describe('Legacy Telegram display name'),
    files: z.array(
        z.string().or(z.object({
            name: z.string(),
            size: z.number().optional()
        }))
    ).describe('Array of files/folders inside this torrent'),
    mediainfo: z.array(MediaInfoEntrySchema).describe('MediaInfo entries for this torrent')
});

/**
 * Publication date schema.
 *
 * Accepts what the content CLI writes — an ISO 8601 date-time with a `Z`
 * or numeric offset (e.g. `2026-01-19T10:58:38.626Z`) — plus a bare
 * `YYYY-MM-DD` date, which some hand-authored entries use. Anything else
 * (including an unparsable string) is rejected: a wrong date would
 * silently corrupt the release ordering.
 */
export const ReleaseDateSchema = z.union(
    [z.iso.datetime({ offset: true }), z.iso.date()],
    {
        error: 'date must be an ISO 8601 date-time (e.g. 2026-01-19T10:58:38.626Z) or a bare YYYY-MM-DD date'
    }
);

/**
 * External links schema
 */
export const ExternalLinksSchema = z.object({
    tmdb: z.string().optional(),
    imdb: z.string().optional(),
    douban: z.string().optional(),
    bangumi: z.string().optional(),
    letterboxd: z.string().optional(),
    rotten_tomatoes: z.string().optional(),
    anidb: z.string().optional(),
    anilist: z.string().optional(),
    myanimelist: z.string().optional(),
    tvdb: z.string().optional(),
});
export type ExternalLinks = z.infer<typeof ExternalLinksSchema>;

/**
 * Main release post frontmatter schema
 */
export const ReleaseSchema = z.object({
    // Core identifiers
    slug: z.string().describe('Hash-based URL slug'),

    // Content metadata
    title: z.string().describe('Primary display title'),

    // Date
    date: ReleaseDateSchema.describe('Publication date in ISO format'),

    // TMDB integration
    tmdb_id: z.number().optional().describe('TMDB movie/TV ID'),

    // Media type and badge system
    media_type: MediaTypeSchema.describe('Content type: movie, tv'),
    special_type: z.enum(['tva', 'ova', 'ona', 'special']).optional().describe('Special display type override'),
    season: z.number().optional().describe('Season number for series content'),
    badge_label: z.string().optional().describe('Custom badge label override (e.g., "S01 Part1", "S01E13-E24")'),
    is_complete: z.boolean().optional().describe('Whether series is complete (shows "Fin" badge)'),

    // Additional metadata
    year: z.number().optional().describe('Release year'),

    // Media assets
    poster: z.string().describe('Path to poster image'),

    // Torrent structure (multiple torrents with embedded MediaInfo)
    torrents: z.array(TorrentEntrySchema).describe('Array of torrent entries with file structure and MediaInfo'),
    specs: z.array(z.object({
        title: z.string(),
        content: z.string().optional(),
        subitems: z.array(z.object({
            title: z.string(),
            content: z.string()
        })).optional()
    })).optional().describe('Technical specs sections (NFO style)'),

    // External links
    links: ExternalLinksSchema.optional().describe('External service links'),

});

// Type exports
export type TorrentEntry = z.infer<typeof TorrentEntrySchema>;
export type MediaInfoEntry = z.infer<typeof MediaInfoEntrySchema>;
export type Release = z.infer<typeof ReleaseSchema>;

/**
 * Validate release frontmatter
 */
export function validateRelease(data: unknown): Release {
    return ReleaseSchema.parse(data);
}

/**
 * Safe validation
 */
export function safeValidateRelease(
    data: unknown
): { success: true; data: Release } | { success: false; error: z.ZodError } {
    return ReleaseSchema.safeParse(data);
}

/**
 * Fallback badge per media type. Every value is non-empty so a badge chip
 * can never render blank (the previous `switch` only handled movie/tv and
 * produced an empty string for tva/ova/ona/special).
 */
const MEDIA_TYPE_BADGES: Record<MediaType, string> = {
    movie: 'Movie',
    tv: 'TV',
    tva: 'TVA',
    ova: 'OVA',
    ona: 'ONA',
    special: 'SP'
};

/**
 * Get display badge(s) for a release
 * Returns array of badge strings to display
 *
 * Season 0 is a real season (special/bonus season), so it renders as `S00`
 * in every branch; only a missing season falls back to the type label.
 */
export function getReleaseBadges(release: Release): string[] {
    const badges: string[] = [];

    const seasonBadge = typeof release.season === 'number'
        ? `S${release.season.toString().padStart(2, '0')}`
        : null;

    // Determine Base Badge
    // Priority: special_type > media_type
    let baseBadge: string;
    if (release.special_type) {
        const typeBadge = release.special_type === 'special'
            ? 'SP'
            : release.special_type.toUpperCase();

        if (release.special_type === 'tva') {
            // Standard TVA: the season is the whole badge.
            baseBadge = seasonBadge ?? typeBadge;
        } else {
            // e.g. "OVA S01" when a season is known, plain "OVA" otherwise.
            baseBadge = seasonBadge ? `${typeBadge} ${seasonBadge}` : typeBadge;
        }
    } else {
        baseBadge = seasonBadge ?? MEDIA_TYPE_BADGES[release.media_type];
    }

    badges.push(baseBadge);

    // If custom badge_label is set, append it as suffix.
    // The filter keeps a leading space out of the badge if the base is ever empty.
    if (release.badge_label) {
        badges[0] = [badges[0], release.badge_label].filter(Boolean).join(' ');
    }

    // Add Fin badge if complete
    if (release.is_complete) {
        badges.push('Fin');
    }

    return badges;
}
