/**
 * Unified type definitions for CLI
 */

export interface TorrentEntry {
    name: string;
    telegram_label?: string;     // Manual Telegram link label for new releases
    display_name?: string;       // Legacy Telegram display name
    files: TorrentFile[];
    mediainfo: MediaInfoEntry[]; // 内嵌 MediaInfo
}

export interface TorrentFile {
    path: string;
    size: number;
}

export interface MediaInfoEntry {
    filename: string;
    raw_hash: string;
}

export interface SpecEntry {
    title: string;
    content: string;
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
