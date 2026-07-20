export interface TorrentTelegramLabelClassification {
    label?: 'x265' | 'AV1' | 'x264';
    requiresManualLabel: boolean;
}

const CODEC_PATTERNS = [
    { label: 'x265' as const, pattern: /(?:^|[^a-z0-9])x265(?:$|[^a-z0-9])/i },
    { label: 'AV1' as const, pattern: /(?:^|[^a-z0-9])av1(?:$|[^a-z0-9])/i },
    { label: 'x264' as const, pattern: /(?:^|[^a-z0-9])x264(?:$|[^a-z0-9])/i },
];

const VARIANT_PATTERN = /hdr(?:10(?:\+)?|\+)?|dovi|dolby[ ._-]+vision|(?:^|[^a-z0-9])dv(?:$|[^a-z0-9])/i;

export function classifyTorrentTelegramLabel(name: string): TorrentTelegramLabelClassification {
    const matches = CODEC_PATTERNS.filter(({ pattern }) => pattern.test(name));
    const requiresManualLabel = matches.length !== 1 || VARIANT_PATTERN.test(name);

    return {
        label: requiresManualLabel ? undefined : matches[0].label,
        requiresManualLabel,
    };
}
