import { describe, expect, test } from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildCaption, computeRetryDelayMs, sendPhoto, sendPhotoWithRetry } from './telegram';
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

/**
 * Build a throwaway `static/mediainfo` tree.
 *
 * `buildCaption` reads MediaInfo from disk, and the real directory is
 * gitignored production content that does not exist in a clean checkout, so
 * tests must supply their own root instead of writing into the repository.
 */
async function makeMediaInfoRoot(fixtures: Record<string, string>): Promise<string> {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'yumerobo-telegram-'));
    const directory = path.join(root, 'static', 'mediainfo');
    await fs.mkdir(directory, { recursive: true });
    for (const [hash, content] of Object.entries(fixtures)) {
        await fs.writeFile(path.join(directory, hash), content, 'utf-8');
    }
    return root;
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
        const hash = 'telegramemptysubtitletest';
        const root = await makeMediaInfoRoot({ [hash]: `
General
Format                                   : Matroska

Text
Format                                   :
Language                                 :
Title                                    :
        ` });

        try {
            const release = makeRelease([
                {
                    name: 'Show.BD.1080p.x265-GROUP',
                    files: [],
                    mediainfo: [{ filename: 'show.mkv', raw_hash: hash }],
                },
            ]);

            const caption = await buildCaption(release, '', 'https://example.com', root);

            expect(caption).not.toContain('Subtitles:');
            expect(caption).toContain(`[x265](https://example\\.com/mediainfo/${hash})`);
        } finally {
            await fs.rm(root, { recursive: true, force: true });
        }
    });

    test('reads MediaInfo through a valid hash and refuses a traversal hash', async () => {
        const mediaInfo = `
General
Format                                   : Matroska

Text
Format                                   : UTF-8
Language                                 : Japanese
Title                                    : Signs
`;
        const validHash = 'telegramsubtitleflags';
        // The traversal target lives one level above `static/mediainfo`, exactly
        // where a `../` hash would point.
        const root = await makeMediaInfoRoot({ [validHash]: mediaInfo });
        const outsidePath = path.join(root, 'static', 'telegram-outside-mediainfo');
        await fs.writeFile(outsidePath, mediaInfo, 'utf-8');

        try {
            const viaHash = await buildCaption(
                makeRelease([{ name: 'Show.BD.1080p.x265-GROUP', files: [], mediainfo: [{ filename: 'a.mkv', raw_hash: validHash }] }]),
                '',
                'https://example.com',
                root,
            );
            expect(viaHash).toContain('Subtitles: 🇯🇵');

            const viaTraversal = await buildCaption(
                makeRelease([{ name: 'Show.BD.1080p.x265-GROUP', files: [], mediainfo: [{ filename: 'a.mkv', raw_hash: '../telegram-outside-mediainfo' }] }]),
                '',
                'https://example.com',
                root,
            );
            expect(viaTraversal).not.toContain('Subtitles:');
        } finally {
            await fs.rm(root, { recursive: true, force: true });
        }
    });
});

describe('computeRetryDelayMs', () => {
    test('honours an explicit retry_after, including zero', () => {
        expect(computeRetryDelayMs(3, 0, () => 0.999)).toBe(0);
        expect(computeRetryDelayMs(3, 2, () => 0)).toBe(2000);
    });

    test('falls back to exponential backoff with jitter', () => {
        expect(computeRetryDelayMs(1, undefined, () => 0)).toBe(1000);
        expect(computeRetryDelayMs(3, undefined, () => 0)).toBe(4000);
        expect(computeRetryDelayMs(1, undefined, () => 0.5)).toBe(1500);
    });

    test('caps the wait', () => {
        expect(computeRetryDelayMs(1, 3600, () => 0)).toBe(30_000);
        expect(computeRetryDelayMs(20, undefined, () => 0)).toBe(30_000);
    });
});

describe('sendPhoto guards', () => {
    test('refuses an over-long caption without calling the API', async () => {
        const original = globalThis.fetch;
        globalThis.fetch = (() => {
            throw new Error('fetch must not be called');
        }) as typeof fetch;

        try {
            const result = await sendPhoto('123456789:token', 'chat', 'https://example.com/p.jpg', 'x'.repeat(1025));
            expect(result.ok).toBe(false);
            expect(result.retryable).toBe(false);
            expect(result.error).toContain('1024');
        } finally {
            globalThis.fetch = original;
        }
    });

    test('treats a missing local poster as non-retryable', async () => {
        const original = globalThis.fetch;
        globalThis.fetch = (() => {
            throw new Error('fetch must not be called');
        }) as typeof fetch;

        try {
            const result = await sendPhoto('123456789:token', 'chat', 'static/missing-poster.jpg', 'caption');
            expect(result.ok).toBe(false);
            expect(result.retryable).toBe(false);
            expect(result.error).toContain('static/missing-poster.jpg');
        } finally {
            globalThis.fetch = original;
        }
    });

    test('uploads a local poster as multipart form-data', async () => {
        const posterPath = path.join(os.tmpdir(), `telegram-upload-${Date.now()}.jpg`);
        await fs.writeFile(posterPath, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));

        const original = globalThis.fetch;
        let body: FormData | undefined;
        globalThis.fetch = (async (_url: Parameters<typeof fetch>[0], init?: RequestInit) => {
            body = init?.body as FormData;
            return new Response(JSON.stringify({ ok: true, result: { message_id: 7 } }), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        }) as typeof fetch;

        try {
            const result = await sendPhoto('123456789:token', 'chat', posterPath, 'caption');

            expect(result.ok).toBe(true);
            expect(result.messageId).toBe(7);
            expect(body).toBeInstanceOf(FormData);
            expect(body?.get('photo')).toBeInstanceOf(File);
            expect(body?.get('caption')).toBe('caption');
        } finally {
            globalThis.fetch = original;
            await fs.rm(posterPath, { force: true });
        }
    });

    test('redacts the bot token from transport errors', async () => {
        const token = '123456789:AAFakeTokenValue';
        const original = globalThis.fetch;
        globalThis.fetch = (() => {
            throw new Error(`Unable to connect to https://api.telegram.org/bot${token}/sendPhoto`);
        }) as typeof fetch;

        try {
            const result = await sendPhoto(token, 'chat', 'https://example.com/p.jpg', 'hi');
            expect(result.ok).toBe(false);
            expect(result.error).not.toContain(token);
            expect(result.error).not.toContain('AAFakeTokenValue');
            expect(result.error).toContain('bot[redacted]');
        } finally {
            globalThis.fetch = original;
        }
    });
});

describe('sendPhotoWithRetry', () => {
    function stubFetch(handler: () => Response): { calls: () => number; restore: () => void } {
        const original = globalThis.fetch;
        let calls = 0;
        globalThis.fetch = (async () => {
            calls += 1;
            return handler();
        }) as typeof fetch;
        return { calls: () => calls, restore: () => { globalThis.fetch = original; } };
    }

    function jsonResponse(status: number, body: unknown): Response {
        return new Response(JSON.stringify(body), {
            status,
            headers: { 'content-type': 'application/json' },
        });
    }

    test('does not retry a 4xx that is not 429', async () => {
        const stub = stubFetch(() => jsonResponse(400, { ok: false, description: 'Bad Request' }));

        try {
            const result = await sendPhotoWithRetry('123456789:token', 'chat', 'https://example.com/p.jpg', 'hi', undefined, 3);
            expect(result.ok).toBe(false);
            expect(result.attempts).toBe(1);
            expect(stub.calls()).toBe(1);
        } finally {
            stub.restore();
        }
    });

    test('retries a 429 with retry_after 0 without the exponential wait', async () => {
        const stub = stubFetch(() => jsonResponse(429, {
            ok: false,
            description: 'Too Many Requests',
            parameters: { retry_after: 0 },
        }));

        try {
            const startedAt = Date.now();
            const result = await sendPhotoWithRetry('123456789:token', 'chat', 'https://example.com/p.jpg', 'hi', undefined, 2);
            const elapsed = Date.now() - startedAt;

            expect(result.ok).toBe(false);
            expect(result.attempts).toBe(2);
            expect(stub.calls()).toBe(2);
            // A falsy retry_after used to fall back to the 1s exponential delay.
            expect(elapsed).toBeLessThan(900);
        } finally {
            stub.restore();
        }
    });

    test('retries a 5xx response', async () => {
        const stub = stubFetch(() => jsonResponse(503, { ok: false, description: 'Service Unavailable' }));

        try {
            const result = await sendPhotoWithRetry('123456789:token', 'chat', 'https://example.com/p.jpg', 'hi', undefined, 2);
            expect(result.attempts).toBe(2);
            expect(stub.calls()).toBe(2);
        } finally {
            stub.restore();
        }
    });
});
