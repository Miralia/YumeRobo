/**
 * Torrent file parser using bencode
 */
import bencode from 'bencode';
import fs from 'node:fs/promises';
import type { TorrentEntry, TorrentFile } from './types';

interface BencodedTorrent {
    info: {
        name: string | Buffer;
        'name.utf-8'?: string | Buffer;
        files?: Array<{
            path: Array<string | Buffer>;
            'path.utf-8'?: Array<string | Buffer>;
            length: number;
        }>;
        length?: number; // For single-file torrents
    };
}

/**
 * Parse a .torrent file and extract file structure
 */
export async function parseTorrent(torrentPath: string): Promise<TorrentEntry> {
    const buffer = await fs.readFile(torrentPath);
    const decoded = bencode.decode(buffer) as BencodedTorrent | null;

    if (!decoded || typeof decoded !== 'object' || !decoded.info) {
        throw new Error(`${torrentPath} is not a valid torrent (no info dictionary)`);
    }

    // bencode v4 returns Uint8Array, not Buffer
    const toStr = (val: string | Buffer | Uint8Array): string => {
        if (typeof val === 'string') return val;
        return new TextDecoder().decode(val);
    };

    // BEP-3 encodes non-ASCII names in the local charset; the optional
    // `*.utf-8` keys carry the correct Unicode spelling when present.
    const name = decoded.info['name.utf-8']
        ? toStr(decoded.info['name.utf-8'])
        : toStr(decoded.info.name);
    const files: TorrentFile[] = [];

    if (decoded.info.files) {
        // Multi-file torrent
        for (const file of decoded.info.files) {
            const parts = file['path.utf-8'] ?? file.path;
            files.push({
                name: parts.map((p) => toStr(p)).join('/'),
                size: file.length,
            });
        }
    } else if (decoded.info.length !== undefined) {
        // Single-file torrent (a zero-byte file is still a real entry)
        files.push({
            name,
            size: decoded.info.length,
        });
    }

    // `mediainfo` is filled in by the caller once the user pastes MediaInfo;
    // the parser cannot know it.
    return { name, files, mediainfo: [] };
}

/**
 * Format file size for display
 */
export function formatSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) return '—';

    const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}
