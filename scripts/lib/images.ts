/**
 * Image processing utilities using Sharp
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const POSTER_WIDTH = 500;
const POSTER_QUALITY = 80;
const CARD_POSTER_WIDTH = 200;
const CARD_POSTER_QUALITY = 60;
const OG_WIDTH = 600;
const OG_QUALITY = 80;
const OUTPUT_DIR = 'static/posters';
const OG_DIR = 'static/og';

function getPosterOutputPath(assetId: string): string {
    return path.join(OUTPUT_DIR, `${assetId}.avif`);
}

function getCardPosterOutputPath(assetId: string): string {
    return path.join(OUTPUT_DIR, `${assetId}.card.avif`);
}

function getOgOutputPath(assetId: string): string {
    return path.join(OG_DIR, `${assetId}.jpg`);
}

async function ensurePosterOutputDirs() {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(OG_DIR, { recursive: true });
}

async function readImageSource(source: string): Promise<Buffer> {
    if (source.startsWith('http')) {
        const response = await fetch(source);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
        }
        return Buffer.from(await response.arrayBuffer());
    }

    return await fs.readFile(source);
}

async function writePosterVariant(
    image: sharp.Sharp,
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

export function getCardPosterPathFromPoster(posterPath: string): string {
    return posterPath.replace(/\.avif$/i, '.card.avif');
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

        const image = sharp(buffer);
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

        const image = sharp(buffer);
        const outputPath = getCardPosterOutputPath(assetId);
        await writePosterVariant(image, outputPath, CARD_POSTER_WIDTH, CARD_POSTER_QUALITY);

        console.log(`[+] Card poster saved to ${outputPath}`);
        return getCardPosterPath(assetId);
    } catch (error) {
        console.error('❌ Error generating card poster:', error);
        throw error;
    }
}
