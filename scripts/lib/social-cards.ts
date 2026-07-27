import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getReleaseCodecLabels } from "../../src/lib/content/social";
import type { ReleaseData } from "./types";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const DETAIL_POSTER_WIDTH = 300;
const DETAIL_POSTER_HEIGHT = 450;
const HOME_POSTER_WIDTH = 142;
const HOME_POSTER_HEIGHT = 213;

const HOME_POSTERS = [
    "/posters/0z9re61m.avif",
    "/posters/4n8cwx1o.avif",
    "/posters/y3kb1dkq.avif",
    "/posters/vbq7p246.avif",
];

function escapeXml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

function splitLongToken(token: string, limit: number): string[] {
    const characters = [...token];
    const parts: string[] = [];
    while (characters.length) parts.push(characters.splice(0, limit).join(""));
    return parts;
}

function wrapTitle(value: string, limit = 27, maxLines = 3): string[] {
    const tokens = value
        .split(/\s+/)
        .flatMap((token) => token.length > limit ? splitLongToken(token, limit) : [token]);
    const lines: string[] = [];
    let line = "";

    for (const token of tokens) {
        const next = line ? `${line} ${token}` : token;
        if (next.length <= limit) {
            line = next;
            continue;
        }
        if (line) lines.push(line);
        line = token;
    }
    if (line) lines.push(line);

    if (lines.length > maxLines) {
        const visible = lines.slice(0, maxLines);
        visible[maxLines - 1] = `${visible[maxLines - 1].slice(0, limit - 1).trimEnd()}…`;
        return visible;
    }
    return lines;
}

function releaseBadge(release: ReleaseData): string {
    let badge = release.special_type === "special"
        ? "SP"
        : release.special_type?.toUpperCase()
            ?? (release.media_type === "movie" ? "Movie" : "TV");
    if (release.season) {
        const season = `S${String(release.season).padStart(2, "0")}`;
        badge = release.special_type && release.special_type !== "tva"
            ? `${badge} ${season}`
            : season;
    }
    if (release.badge_label) badge = `${badge} ${release.badge_label}`;
    if (release.is_complete) badge = `${badge} · Fin`;
    return badge;
}

function detailCardSvg(release: ReleaseData): Buffer {
    const titleLines = wrapTitle(release.title);
    const longestLine = Math.max(...titleLines.map((line) => line.length));
    const titleSize = titleLines.length >= 3
        ? 40
        : longestLine > 22
            ? 48
            : longestLine > 16
                ? 56
                : 64;
    const titleY = titleLines.length === 1 ? 210 : titleLines.length === 2 ? 174 : 142;
    const titleMarkup = titleLines.map((line, index) =>
        `<tspan x="440" dy="${index === 0 ? 0 : titleSize * 1.12}">${escapeXml(line)}</tspan>`
    ).join("");
    const codecs = getReleaseCodecLabels(release).join(" · ");
    const metadata = [release.year, releaseBadge(release)].filter(Boolean).join(" · ");

    return Buffer.from(`
        <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f2f1f4"/>
            <rect x="56" y="66" width="348" height="498" rx="18" fill="#16161b" opacity="0.10"/>
            <rect x="416" y="86" width="6" height="458" rx="3" fill="#d35353"/>
            <text x="440" y="${titleY}" fill="#17171c" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="${titleSize}" font-weight="700">${titleMarkup}</text>
            <text x="440" y="390" fill="#4d4d56" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="28" font-weight="500">${escapeXml(metadata)}</text>
            <text x="440" y="438" fill="#4d4d56" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="28" font-weight="500">${escapeXml(codecs)}</text>
            <text x="440" y="526" fill="#777781" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="25">夢みる機械</text>
        </svg>
    `);
}

async function posterBuffer(
    sourcePath: string,
    width: number,
    height: number,
): Promise<Buffer> {
    return sharp(sourcePath)
        .resize(width, height, {
            fit: "contain",
            background: { r: 242, g: 241, b: 244, alpha: 1 },
        })
        .png()
        .toBuffer();
}

function posterAssetId(posterPath: string): string {
    return path.posix.basename(posterPath).replace(/\.avif$/i, "");
}

export async function generateReleaseSocialCard(
    release: ReleaseData,
    rootDir = process.cwd(),
): Promise<string> {
    const sourcePath = path.join(rootDir, "static", release.poster.replace(/^\//, ""));
    const outputPath = path.join(rootDir, "static", "og", `${posterAssetId(release.poster)}.jpg`);
    const poster = await posterBuffer(sourcePath, DETAIL_POSTER_WIDTH, DETAIL_POSTER_HEIGHT);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await sharp(detailCardSvg(release))
        .composite([{ input: poster, left: 80, top: 90 }])
        .jpeg({ quality: 86, mozjpeg: true })
        .toFile(outputPath);
    return outputPath;
}

export async function generateHomeSocialCard(rootDir = process.cwd()): Promise<string> {
    const background = Buffer.from(`
        <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f2f1f4"/>
            <rect x="78" y="166" width="6" height="298" rx="3" fill="#d35353"/>
            <text x="112" y="286" fill="#17171c" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="72" font-weight="700">夢みる機械</text>
            <text x="112" y="356" fill="#55555e" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="30">A record of some releases.</text>
        </svg>
    `);
    const posters = await Promise.all(HOME_POSTERS.map((posterPath) =>
        posterBuffer(
            path.join(rootDir, "static", posterPath.replace(/^\//, "")),
            HOME_POSTER_WIDTH,
            HOME_POSTER_HEIGHT,
        )
    ));
    const outputPath = path.join(rootDir, "static", "og", "home.jpg");

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await sharp(background)
        .composite(posters.map((input, index) => ({
            input,
            left: 594 + index * 148,
            top: 208,
        })))
        .jpeg({ quality: 86, mozjpeg: true })
        .toFile(outputPath);
    return outputPath;
}
