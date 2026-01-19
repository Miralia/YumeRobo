/**
 * Torrent file parser using bencode
 */
import bencode from 'bencode';
import fs from 'node:fs/promises';
import type { TorrentEntry, TorrentFile } from './types';

interface BencodedTorrent {
    info: {
        name: string | Buffer;
        files?: Array<{
            path: Array<string | Buffer>;
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
    const decoded = bencode.decode(buffer) as BencodedTorrent;

    // bencode v4 returns Uint8Array, not Buffer
    const toStr = (val: string | Buffer | Uint8Array): string => {
        if (typeof val === 'string') return val;
        if (val instanceof Uint8Array) return new TextDecoder().decode(val);
        return Buffer.from(val).toString('utf8');
    };

    const name = toStr(decoded.info.name);
    const files: TorrentFile[] = [];

    if (decoded.info.files) {
        // Multi-file torrent
        for (const file of decoded.info.files) {
            const pathParts = file.path.map(p => toStr(p));
            files.push({
                path: pathParts.join('/'),
                size: file.length
            });
        }
    } else if (decoded.info.length) {
        // Single-file torrent
        files.push({
            path: name,
            size: decoded.info.length
        });
    }

    return { name, files };
}

/**
 * Format file size for display
 */
export function formatSize(bytes: number): string {
    const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}
