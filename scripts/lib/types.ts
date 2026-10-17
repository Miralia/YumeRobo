/**
 * Unified type definitions for CLI
 */

export interface TorrentEntry {
    name: string;
    telegram_label?: string;     // Manual Telegram link label for new releases
    display_name?: string;       // Legacy Telegram display name
    files: Array<TorrentFile | string>;
    mediainfo: MediaInfoEntry[]; // 内嵌 MediaInfo
}

/**
 * One entry of a torrent's file list.
 *
 * `name` (not `path`) is the persisted shape and the shape the zod schema in
 * `src/lib/content/schema.ts` validates. The CLI used to model this as `path`
 * while the generator emitted `name`, so editing a release without re-entering
 * its torrents rewrote every file name as an empty string.
 */
export interface TorrentFile {
    name: string;
    size?: number;
}

export interface MediaInfoEntry {
    filename: string;
    raw_hash: string;
}

export interface SpecEntry {
    title: string;
    content: string;
    /**
     * Optional nested rows. Not produced by the BBCode parser, but present in
     * release files and consumed by the detail page and the comparison
     * extractor, so the code generator has to round-trip it.
     */
    subitems?: Array<{ title: string; content: string }>;
}

export interface ReleaseData {
    slug: string;
    title: string;
    date: string;
    tmdb_id: number;
    media_type: 'movie' | 'tv';
    special_type?: 'tva' | 'ova' | 'ona' | 'special';
    season?: number;
    badge_label?: string;
    is_complete?: boolean;
    year: number;
    poster: string;
    torrents: TorrentEntry[];
    specs: SpecEntry[];
    links: Record<string, string>;
}

/**
 * Generate random hash for MediaInfo storage
 */
export function generateHash(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
