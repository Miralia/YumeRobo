import { describe, expect, test } from 'bun:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildCaption } from './telegram';
import type { ReleaseData } from './types';

function makeRelease(torrents: ReleaseData['torrents']): ReleaseData {
    return {
        slug: 'release1',
        title: 'Test Release',
        date: '2026-07-20T00:00:00.000Z',
        tmdb_id: 1,
        media_type: 'tv',
        year: 2026,
        poster: '/posters/release1.avif',
        torrents,
        specs: [],
        links: {},
    };
}

describe('buildCaption', () => {
    test('combines torrent MediaInfo and Comparisons links on one line in torrent order', async () => {
        const release = makeRelease([
            {
                name: 'Show.BD.1080p.x265-GROUP',
                files: [],
                mediainfo: [{ filename: 'x265.mkv', raw_hash: 'hash265' }],
            },
            {
                name: 'Show.BD.1080p.AV1-GROUP',
                files: [],
                mediainfo: [{ filename: 'av1.mkv', raw_hash: 'hashav1' }],
            },
        ]);

        const caption = await buildCaption(release, 'https://example.com/release1/comparisons', 'https://example.com');

        expect(caption).toContain(
            '[x265](https://example\\.com/mediainfo/hash265) \\| ' +
            '[AV1](https://example\\.com/mediainfo/hashav1) \\| ' +
            '[Comparisons](https://example\\.com/release1/comparisons)',
        );
        expect(caption).not.toContain('Mediainfo');
        expect(caption).not.toContain('————————————');
    });

    test('uses a manual label and retains duplicate codec links', async () => {
        const release = makeRelease([
            {
                name: 'Show.UHD.2160p.x265.HDR10-GROUP',
                telegram_label: 'x265 HDR10',
                files: [],
                mediainfo: [{ filename: 'hdr.mkv', raw_hash: 'hdrhash' }],
            },
            {
                name: 'Show.BD.1080p.x265-GROUP',
                files: [],
                mediainfo: [{ filename: 'sdr.mkv', raw_hash: 'sdrhash' }],
            },
        ]);

        const caption = await buildCaption(release, '', 'https://example.com');

        expect(caption).toContain('[x265 HDR10](https://example\\.com/mediainfo/hdrhash) \\| [x265](https://example\\.com/mediainfo/sdrhash)');
    });

    test('falls back to the legacy display name for an unknown codec and skips torrents without MediaInfo', async () => {
        const release = makeRelease([
            {
                name: 'Show.BD.1080p.VP9-GROUP',
                display_name: 'VP9',
                files: [],
                mediainfo: [{ filename: 'vp9.mkv', raw_hash: 'vp9hash' }],
            },
            {
                name: 'Show.BD.1080p.x264-GROUP',
                files: [],
                mediainfo: [],
            },
        ]);

        const caption = await buildCaption(release, '', 'https://example.com');

        expect(caption).toContain('[VP9](https://example\\.com/mediainfo/vp9hash)');
        expect(caption).not.toContain('x264');
    });

    test('omits the subtitles line when MediaInfo has only blank text fields', async () => {
        const hash = 'telegram-empty-subtitle-test';
        const mediaInfoPath = path.join(process.cwd(), 'static', 'mediainfo', hash);
        await fs.writeFile(mediaInfoPath, `
General
Format                                   : Matroska

Text
Format                                   :
Language                                 :
Title                                    :
        `, 'utf-8');

        try {
            const release = makeRelease([
                {
                    name: 'Show.BD.1080p.x265-GROUP',
                    files: [],
                    mediainfo: [{ filename: 'show.mkv', raw_hash: hash }],
                },
            ]);

            const caption = await buildCaption(release, '', 'https://example.com');

            expect(caption).not.toContain('Subtitles:');
            expect(caption).toContain('[x265](https://example\\.com/mediainfo/telegram\\-empty\\-subtitle\\-test)');
        } finally {
            await fs.rm(mediaInfoPath, { force: true });
        }
    });
});
