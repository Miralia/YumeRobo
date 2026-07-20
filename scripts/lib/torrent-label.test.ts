import { describe, expect, test } from 'bun:test';
import { classifyTorrentTelegramLabel } from './torrent-label';

describe('classifyTorrentTelegramLabel', () => {
    test.each([
        ['Show.BD.1080p.x265-GROUP', 'x265'],
        ['Show.BD.1080p.AV1-GROUP', 'AV1'],
        ['Show.BD.1080p.X264-GROUP', 'x264'],
    ])('normalizes the codec in %s', (name, expected) => {
        expect(classifyTorrentTelegramLabel(name)).toEqual({
            label: expected,
            requiresManualLabel: false,
        });
    });

    test.each([
        'Show.BD.1080p-GROUP',
        'Show.x264.x265-GROUP',
        'Show.x265.HDR-GROUP',
        'Show.x265.HDR10-GROUP',
        'Show.x265.HDR10+-GROUP',
        'Show.x265.DoVi-GROUP',
        'Show.x265.DV-GROUP',
        'Show.x265.Dolby.Vision-GROUP',
    ])('requires a manual label for %s', (name) => {
        expect(classifyTorrentTelegramLabel(name).requiresManualLabel).toBe(true);
    });

    test.each([
        'Show.UHD.2160p.x265-GROUP',
        'Show.BD.1080p.x265-GROUP',
    ])('does not treat resolution markers as variants in %s', (name) => {
        expect(classifyTorrentTelegramLabel(name).requiresManualLabel).toBe(false);
    });
});
