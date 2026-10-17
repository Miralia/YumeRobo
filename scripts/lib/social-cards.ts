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
const HOME_POSTER_COUNT = 4;

/** Control characters are illegal in XML 1.0 even when escaped as entities. */
const XML_ILLEGAL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g;

/** Exported for tests: XML escaping must also drop control characters. */
export function escapeXml(value: string): string {
    return value
        .replace(XML_ILLEGAL_RE, "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

function codePointLength(value: string): number {
    return Array.from(value).length;
}

/** Slice by code point so a truncation can never emit a lone surrogate. */
function truncateCodePoints(value: string, limit: number): string {
    const characters = Array.from(value);
    return characters.length <= limit ? value : characters.slice(0, limit).join("");
}

function splitLongToken(token: string, limit: number): string[] {
    const characters = [...token];
    const parts: string[] = [];
    while (characters.length) parts.push(characters.splice(0, limit).join(""));
    return parts;
}

/** Exported for tests: wrapping/truncation must stay code-point safe. */
export function wrapTitle(value: string, limit = 27, maxLines = 3): string[] {
    const tokens = value
        .split(/\s+/)
        .flatMap((token) => codePointLength(token) > limit ? splitLongToken(token, limit) : [token]);
    const lines: string[] = [];
    let line = "";

    for (const token of tokens) {
        const next = line ? `${line} ${token}` : token;
        if (codePointLength(next) <= limit) {
            line = next;
            continue;
        }
        if (line) lines.push(line);
        line = token;
    }
    if (line) lines.push(line);

    if (lines.length > maxLines) {
        const visible = lines.slice(0, maxLines);
        visible[maxLines - 1] = `${truncateCodePoints(visible[maxLines - 1], limit - 1).trimEnd()}…`;
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
    try {
        return await sharp(sourcePath)
            // Honour EXIF orientation before resizing, otherwise rotated
            // posters are composited sideways.
            .rotate()
            .resize(width, height, {
                fit: "contain",
                background: { r: 242, g: 241, b: 244, alpha: 1 },
            })
            .png()
            .toBuffer();
    } catch (error) {
        throw new Error(
            `Failed to read poster ${sourcePath}: ${error instanceof Error ? error.message : error}`,
        );
    }
}

/**
 * Resolve a release poster path and assert it stays inside `<rootDir>/static`.
 * Poster paths come from release data, so a `../` value must never escape.
 */
function resolveStaticPosterPath(rootDir: string, posterPath: string): string {
    const staticDir = path.resolve(rootDir, "static");
    const resolved = path.resolve(staticDir, posterPath.replace(/^\/+/, ""));
    const relative = path.relative(staticDir, resolved);

    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error(`Poster path escapes static/: ${posterPath}`);
    }
    return resolved;
}

function posterAssetId(posterPath: string): string {
    return path.posix.basename(posterPath).replace(/\.avif$/i, "");
}

export function selectRandomHomePosters(
    posterPaths: string[],
    random: () => number = Math.random,
): string[] {
    const candidates = [...new Set(posterPaths)];
    if (candidates.length < HOME_POSTER_COUNT) {
        throw new Error(`At least ${HOME_POSTER_COUNT} unique posters are required for the home social card`);
    }

    for (let index = candidates.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(random() * (index + 1));
        [candidates[index], candidates[randomIndex]] = [candidates[randomIndex], candidates[index]];
    }
    return candidates.slice(0, HOME_POSTER_COUNT);
}

/**
 * Poster slots for the home card. The card is regenerated right after the
 * first release file lands, so demanding four unique posters would abort the
 * wizard *after* the release was written. With fewer posters than slots the
 * available ones are repeated to keep the fixed four-slot layout valid.
 */
function homeCardPosters(posterPaths: string[], random: () => number): string[] {
    const candidates = [...new Set(posterPaths)];
    if (candidates.length === 0) {
        console.log("[!] No posters available; the home social card will use the plain background");
        return [];
    }
    if (candidates.length < HOME_POSTER_COUNT) {
        console.log(
            `[!] Only ${candidates.length} unique poster(s) available for ${HOME_POSTER_COUNT} slots; ` +
            "repeating them so the home social card can still be generated",
        );
        return Array.from(
            { length: HOME_POSTER_COUNT },
            (_, index) => candidates[index % candidates.length],
        );
    }
    return selectRandomHomePosters(candidates, random);
}

export async function generateReleaseSocialCard(
    release: ReleaseData,
    rootDir = process.cwd(),
): Promise<string> {
    const sourcePath = resolveStaticPosterPath(rootDir, release.poster);
    const outputPath = path.join(rootDir, "static", "og", `${posterAssetId(release.poster)}.jpg`);
    const poster = await posterBuffer(sourcePath, DETAIL_POSTER_WIDTH, DETAIL_POSTER_HEIGHT);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await sharp(detailCardSvg(release))
        .composite([{ input: poster, left: 80, top: 90 }])
        .jpeg({ quality: 86, mozjpeg: true })
        .toFile(outputPath);
    return outputPath;
}

export async function generateHomeSocialCard(
    posterPaths: string[],
    rootDir = process.cwd(),
    random: () => number = Math.random,
): Promise<string> {
    const background = Buffer.from(`
        <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f2f1f4"/>
            <rect x="78" y="166" width="6" height="298" rx="3" fill="#d35353"/>
            <text x="112" y="286" fill="#17171c" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="72" font-weight="700">夢みる機械</text>
            <text x="112" y="356" fill="#55555e" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="30">A record of some releases.</text>
        </svg>
    `);
    const selectedPosters = homeCardPosters(posterPaths, random);
    const posters = await Promise.all(selectedPosters.map((posterPath) =>
        posterBuffer(
            resolveStaticPosterPath(rootDir, posterPath),
            HOME_POSTER_WIDTH,
            HOME_POSTER_HEIGHT,
        )
    ));
    const outputPath = path.join(rootDir, "static", "og", "home.jpg");

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const card = sharp(background);
    if (posters.length > 0) {
        card.composite(posters.map((input, index) => ({
            input,
            left: 594 + index * 148,
            top: 208,
        })));
    }
    await card
        .jpeg({ quality: 86, mozjpeg: true })
        .toFile(outputPath);
    return outputPath;
}
