/**
 * Code template generation for release entries
 */
import type { ReleaseData, TorrentEntry } from './types';

/**
 * Generate TypeScript code for a release entry
 */
export function generateReleaseCode(data: ReleaseData): string {
    const lines: string[] = [];

    lines.push(`    {`);
    lines.push(`        slug: '${escapeString(data.slug)}',`);
    lines.push(`        title: '${escapeString(data.title)}',`);

    if (data.title_en) {
        lines.push(`        title_en: '${escapeString(data.title_en)}',`);
    }
    if (data.title_zh) {
        lines.push(`        title_zh: '${escapeString(data.title_zh)}',`);
    }

    lines.push(`        date: '${data.date}',`);
    lines.push(`        tmdb_id: ${data.tmdb_id},`);
    lines.push(`        media_type: '${data.media_type}',`);
    if (data.special_type) {
        lines.push(`        special_type: '${data.special_type}',`);
    }

    if (data.season) {
        lines.push(`        season: ${data.season},`);
    }
    if (data.badge_label) {
        lines.push(`        badge_label: '${escapeString(data.badge_label)}',`);
    }
    if (data.is_complete) {
        lines.push(`        is_complete: ${data.is_complete},`);
    }
    lines.push(`        year: ${data.year},`);
    lines.push(`        poster: '${escapeString(data.poster)}',`);

    // Torrents (with embedded mediainfo)
    lines.push(`        torrents: [`);
    for (const torrent of data.torrents) {
        lines.push(`            {`);
        lines.push(`                name: '${escapeString(torrent.name)}',`);
        lines.push(`                display_name: '${escapeString(torrent.display_name)}',`);
        // Format files array - extract path from TorrentFile objects
        const filesArray = torrent.files.map(f => {
            if (typeof f === 'string') return `'${escapeString(f)}'`;
            return `{ name: '${escapeString(f.path)}', size: ${f.size} }`;
        }).join(', ');
        lines.push(`                files: [${filesArray}],`);
        // Embedded mediainfo
        lines.push(`                mediainfo: [`);
        for (const mi of torrent.mediainfo) {
            lines.push(`                    { filename: '${escapeString(mi.filename)}', raw_hash: '${escapeString(mi.raw_hash)}' },`);
        }
        lines.push(`                ]`);
        lines.push(`            },`);
    }
    lines.push(`        ],`);

    // Specs
    if (data.specs.length > 0) {
        lines.push(`        specs: [`);
        for (const spec of data.specs) {
            lines.push(`            {`);
            lines.push(`                title: '${escapeString(spec.title)}',`);
            lines.push(`                content: \`${escapeTemplateString(spec.content)}\``);
            lines.push(`            },`);
        }
        lines.push(`        ],`);
    }

    // Links
    if (Object.keys(data.links).length > 0) {
        lines.push(`        links: {`);
        for (const [key, value] of Object.entries(data.links)) {
            lines.push(`            ${key}: '${escapeString(value)}',`);
        }
        lines.push(`        }`);
    }

    lines.push(`    },`);

    return lines.join('\n');
}

function escapeString(str: string | undefined | null): string {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n');
}

function escapeTemplateString(str: string | undefined | null): string {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\${/g, '\\${');
}

