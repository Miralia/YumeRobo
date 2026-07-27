import type { Release } from "./schema";

export function getReleaseCodecLabels(
    release: Pick<Release, "torrents">,
): Array<"x264" | "x265" | "AV1"> {
    const labels: Array<"x264" | "x265" | "AV1"> = [];
    const seen = new Set<string>();

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
                labels.push(label);
            }
        }
    }

    return labels;
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

export function getReleaseSocialImagePath(posterPath: string): string {
    return posterPath
        .replace(/\.avif$/i, ".jpg")
        .replace(/^\/posters\//, "/og/");
}
