import type { Release } from "./schema";

/**
 * Deterministic codec label order, most modern first. Torrent order must not
 * leak into the social description, so the collected labels are re-sorted
 * through this list rather than returned in discovery order.
 */
const CODEC_PRIORITY: Array<"x264" | "x265" | "AV1"> = ["AV1", "x265", "x264"];

export function getReleaseCodecLabels(
    release: Pick<Release, "torrents">,
): Array<"x264" | "x265" | "AV1"> {
    const seen = new Set<"x264" | "x265" | "AV1">();

    for (const torrent of release.torrents) {
        const text = [
            torrent.name,
            ...torrent.mediainfo.map((entry) => entry.filename),
        ].join(" ");
        const candidates: Array<["x264" | "x265" | "AV1", RegExp]> = [
            ["AV1", /(?:^|[. _-])(?:av1|svt-av1)(?:[. _-]|$)/i],
            ["x265", /(?:^|[. _-])(?:x265|h\.?265|hevc)(?:[. _-]|$)/i],
            ["x264", /(?:^|[. _-])(?:x264|h\.?264|avc)(?:[. _-]|$)/i],
        ];

        for (const [label, pattern] of candidates) {
            if (!seen.has(label) && pattern.test(text)) {
                seen.add(label);
            }
        }
    }

    return CODEC_PRIORITY.filter((label) => seen.has(label));
}

export function getDetailSocialDescription(
    release: Pick<Release, "year" | "torrents">,
    badges: string[],
): string {
    const codecs = getReleaseCodecLabels(release);
    return [
        release.year ? String(release.year) : null,
        badges.join(" · ") || null,
        codecs.length ? codecs.join(" / ") : null,
    ].filter(Boolean).join(" · ");
}

/**
 * Maps a local poster path to its social (Open Graph) image.
 *
 * Only a plain `/posters/<id>.avif` path maps to `/og/<id>.jpg`, matched
 * case-insensitively. Anything else — another extension, an absolute URL, a
 * path carrying a query string — is returned unchanged (the documented
 * fallback) so callers such as `SocialMeta` still receive a usable string
 * instead of an undefined image.
 */
export function getReleaseSocialImagePath(posterPath: string): string {
    const match = posterPath.match(/^\/posters\/([^/]+)\.avif$/i);
    if (!match) return posterPath;
    return `/og/${match[1]}.jpg`;
}
