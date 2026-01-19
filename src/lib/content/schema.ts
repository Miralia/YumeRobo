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
    display_name: z.string().describe('Short display name for Telegram: "**KWTR** BD 1080p FLAC x265"'),
    files: z.array(
        z.string().or(z.object({
            name: z.string(),
            size: z.number().optional()
        }))
    ).describe('Array of files/folders inside this torrent'),
    mediainfo: z.array(MediaInfoEntrySchema).describe('MediaInfo entries for this torrent')
});

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
    title_en: z.string().optional().describe('English title'),
    title_zh: z.string().optional().describe('Chinese title'),

    // Date
    date: z.string().datetime().or(z.string()).describe('Publication date in ISO format'),

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
 * Get display badge(s) for a release
 * Returns array of badge strings to display
 */
export function getReleaseBadges(release: Release): string[] {
    const badges: string[] = [];
    let baseBadge = '';

    // Determine Base Badge
    // Priority: special_type > media_type
    if (release.special_type) {
        switch (release.special_type) {
            case 'tva': baseBadge = release.season ? `S${release.season.toString().padStart(2, '0')}` : 'TVA'; break;
            case 'ova': baseBadge = 'OVA'; break;
            case 'ona': baseBadge = 'ONA'; break;
            case 'special': baseBadge = 'SP'; break;
        }
    } else {
        switch (release.media_type) {
            case 'movie': baseBadge = 'Movie'; break;
            case 'tv':
                baseBadge = release.season ? `S${release.season.toString().padStart(2, '0')}` : 'TV';
                break;
        }
    }

    // Logic for combined Special Type + Season (Requested by user)
    // If Special Type is present AND Season is present, combine them?
    // User logic: "Movie can be OVA". "TV can be OVA".
    // If Season exists, it usually implies Sxx.
    // If Special Type exists (e.g. OVA), we might want "OVA Sxx".
    if (release.season) {
        const seasonStr = `S${release.season.toString().padStart(2, '0')}`;
        // If special type set, use it as prefix unless it's TVA (standard Sxx)
        if (release.special_type && release.special_type !== 'tva') {
            const typeStr = release.special_type === 'special' ? 'SP' : release.special_type.toUpperCase();
            baseBadge = `${typeStr} ${seasonStr}`;
        } else {
            // Standard TV/TVA Sxx
            baseBadge = seasonStr;
        }
    }

    badges.push(baseBadge);

    // If custom badge_label is set, append it as suffix
    if (release.badge_label) {
        badges[0] = `${badges[0]} ${release.badge_label}`;
    }

    // Add Fin badge if complete
    if (release.is_complete) {
        badges.push('Fin');
    }

    return badges;
}
