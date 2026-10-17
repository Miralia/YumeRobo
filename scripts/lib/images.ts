/**
 * Image processing utilities using Sharp
 */
import sharp, { type Sharp } from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const POSTER_WIDTH = 500;
const POSTER_QUALITY = 80;
const CARD_POSTER_WIDTH = 200;
const CARD_POSTER_QUALITY = 60;
const OG_WIDTH = 600;
const OG_QUALITY = 80;
// Micro thumbnail embedded as a data URI: CSS upscaling of a 24px image
// gives the detail page its ambient glow without any runtime blur.
const MICRO_WIDTH = 24;
const MICRO_QUALITY = 45;
const OUTPUT_DIR = 'static/posters';
const OG_DIR = 'static/og';

// Remote sources are unbounded input: a hung server must not stall the CLI and
// an oversized (or HTML) response must not reach sharp.
const IMAGE_FETCH_TIMEOUT_MS = 20_000;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

/** Asset ids are generated hashes (`[a-z0-9]{8}`); anything else is unsafe in a path. */
const ASSET_ID_RE = /^[a-z0-9]+$/;

function assertAssetId(assetId: string): string {
    if (typeof assetId !== 'string' || !ASSET_ID_RE.test(assetId)) {
        throw new TypeError(`Invalid poster asset id: ${JSON.stringify(assetId)}`);
    }
    return assetId;
}

function getPosterOutputPath(assetId: string): string {
    return path.join(OUTPUT_DIR, `${assertAssetId(assetId)}.avif`);
}

function getCardPosterOutputPath(assetId: string): string {
    return path.join(OUTPUT_DIR, `${assertAssetId(assetId)}.card.avif`);
}

function getOgOutputPath(assetId: string): string {
    return path.join(OG_DIR, `${assertAssetId(assetId)}.jpg`);
}

async function ensurePosterOutputDirs() {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(OG_DIR, { recursive: true });
}

/** Stream a response body into a buffer, refusing to exceed `maxBytes`. */
async function readCappedBody(response: Response, source: string, maxBytes: number): Promise<Buffer> {
    const body = response.body;
    if (!body) return Buffer.alloc(0);

    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            if (total > maxBytes) {
                await reader.cancel();
                throw new Error(`Image at ${source} exceeds the ${maxBytes} byte limit`);
            }
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }

    return Buffer.concat(chunks);
}

async function readImageSource(source: string): Promise<Buffer> {
    const isRemote = source.startsWith('http://') || source.startsWith('https://');
    if (!isRemote) {
        return await fs.readFile(source);
    }

    const response = await fetch(source, { signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS) });
    if (!response.ok) {
        throw new Error(`Failed to download image: HTTP ${response.status} ${response.statusText} (${source})`);
    }

    const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    if (!contentType.startsWith('image/')) {
        throw new Error(
            `Refusing to process a non-image response (content-type: ${contentType || 'missing'}) from ${source}`,
        );
    }

    const declaredLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_BYTES) {
        throw new Error(`Image at ${source} exceeds the ${MAX_IMAGE_BYTES} byte limit`);
    }

    return readCappedBody(response, source, MAX_IMAGE_BYTES);
}

async function writePosterVariant(
    image: Sharp,
    outputPath: string,
    width: number,
    quality: number,
) {
    await image
        .clone()
        .resize(width, null, {
            withoutEnlargement: true
        })
        .avif({
            quality,
            effort: 4
        })
        .toFile(outputPath);
}

export function getPosterPath(assetId: string): string {
    return `/posters/${assetId}.avif`;
}

export function getCardPosterPath(assetId: string): string {
    return `/posters/${assetId}.card.avif`;
}

/**
 * Process a poster image from a URL or local path
 * 1. Downloads/Reads image
 * 2. Resizes to standard width (preserving aspect ratio)
 * 3. Converts to AVIF format (for web) and JPG (for OG)
 * 4. Saves to static/posters and static/og directories
 * 
 * @returns The relative path to the saved main image (e.g., '/posters/slug.avif')
 */
export async function processPoster(source: string, assetId: string): Promise<string> {
    try {
        const buffer = await readImageSource(source);
        await ensurePosterOutputDirs();

        // .rotate() applies the EXIF orientation tag (and drops it), so posters
        // shot with an orientation tag are not written sideways.
        const image = sharp(buffer).rotate();
        const outputPathAvif = getPosterOutputPath(assetId);
        const outputPathCardAvif = getCardPosterOutputPath(assetId);
        const outputPathJpg = getOgOutputPath(assetId);

        // 1. Generate AVIF (Main)
        await writePosterVariant(image, outputPathAvif, POSTER_WIDTH, POSTER_QUALITY);

        // 2. Generate card-sized AVIF (Homepage cards)
        await writePosterVariant(
            image,
            outputPathCardAvif,
            CARD_POSTER_WIDTH,
            CARD_POSTER_QUALITY,
        );

        // 3. Generate JPG (OG / Social)
        await image
            .clone()
            .resize(OG_WIDTH, null, {
                withoutEnlargement: true
            })
            .jpeg({
                quality: OG_QUALITY,
                mozjpeg: true
            })
            .toFile(outputPathJpg);

        console.log(`[+] Poster saved to ${outputPathAvif}`);
        console.log(`[+] Card poster saved to ${outputPathCardAvif}`);
        console.log(`[+] OG Image saved to ${outputPathJpg}`);

        // 4. Dynamic color metadata (accent + micro blur thumb)
        const { upsertPosterMeta } = await import('./poster-meta');
        const meta = await extractPosterMetaFromSharp(image);
        await upsertPosterMeta(assetId, meta);
        console.log(`[+] Poster meta recorded (accent ${meta.accent})`);

        return getPosterPath(assetId);

    } catch (error) {
        console.error('❌ Error processing poster:', error);
        throw error;
    }
}

export async function backfillCardPoster(posterSourcePath: string, assetId: string): Promise<string> {
    try {
        const buffer = await readImageSource(posterSourcePath);
        await ensurePosterOutputDirs();

        const image = sharp(buffer).rotate();
        const outputPath = getCardPosterOutputPath(assetId);
        await writePosterVariant(image, outputPath, CARD_POSTER_WIDTH, CARD_POSTER_QUALITY);

        console.log(`[+] Card poster saved to ${outputPath}`);
        return getCardPosterPath(assetId);
    } catch (error) {
        console.error('❌ Error generating card poster:', error);
        throw error;
    }
}

/**
 * Build-time poster metadata driving the Ginmaku dynamic color system:
 * - accent: dominant poster color, normalized into a usable ambient range
 * - blur: 24px-wide AVIF as a data URI (~0.5-1KB), upscaled by CSS into
 *   the detail-page glow — replaces runtime blur() entirely
 */
export interface PosterMeta {
    accent: string;
    blur: string;
}

/**
 * Clamp the dominant color into a range that works as an ambient tint:
 * near-black or near-white dominants produce invisible or washed glows.
 */
function normalizeAccent(r: number, g: number, b: number): string {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    let h = 0;
    const l = (max + min) / 2;
    const d = max - min;
    let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

    if (d !== 0) {
        if (max === rn) h = ((gn - bn) / d) % 6;
        else if (max === gn) h = (bn - rn) / d + 2;
        else h = (rn - gn) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
    }

    const clampedL = Math.min(0.6, Math.max(0.34, l));
    const clampedS = Math.min(0.85, s);

    const c = (1 - Math.abs(2 * clampedL - 1)) * clampedS;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = clampedL - c / 2;
    let r2 = 0, g2 = 0, b2 = 0;
    if (h < 60) [r2, g2, b2] = [c, x, 0];
    else if (h < 120) [r2, g2, b2] = [x, c, 0];
    else if (h < 180) [r2, g2, b2] = [0, c, x];
    else if (h < 240) [r2, g2, b2] = [0, x, c];
    else if (h < 300) [r2, g2, b2] = [x, 0, c];
    else [r2, g2, b2] = [c, 0, x];

    const toHex = (v: number) =>
        Math.round((v + m) * 255)
            .toString(16)
            .padStart(2, '0');
    return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}

async function extractPosterMetaFromSharp(image: Sharp): Promise<PosterMeta> {
    // Normalize to 8-bit sRGB first: greyscale/16-bit sources otherwise report
    // channel values that normalizeAccent turns into `#NaNNaNNaN`.
    const { dominant } = await image.clone().toColourspace('srgb').stats();
    if (
        !dominant ||
        !Number.isFinite(dominant.r) ||
        !Number.isFinite(dominant.g) ||
        !Number.isFinite(dominant.b)
    ) {
        throw new Error('Could not determine a dominant colour from the poster image');
    }
    const accent = normalizeAccent(dominant.r, dominant.g, dominant.b);

    const microBuffer = await image
        .clone()
        .resize(MICRO_WIDTH, null, { withoutEnlargement: true })
        .avif({ quality: MICRO_QUALITY, effort: 4 })
        .toBuffer();
    const blur = `data:image/avif;base64,${microBuffer.toString('base64')}`;

    return { accent, blur };
}

export async function extractPosterMeta(source: string): Promise<PosterMeta> {
    const buffer = await readImageSource(source);
    return extractPosterMetaFromSharp(sharp(buffer).rotate());
}
