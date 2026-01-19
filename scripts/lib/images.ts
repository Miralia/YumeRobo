/**
 * Image processing utilities using Sharp
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const POSTER_WIDTH = 500;
const POSTER_QUALITY = 80;
const OG_WIDTH = 600;
const OG_QUALITY = 80;
const OUTPUT_DIR = 'static/posters';
const OG_DIR = 'static/og';

/**
 * Process a poster image from a URL or local path
 * 1. Downloads/Reads image
 * 2. Resizes to standard width (preserving aspect ratio)
 * 3. Converts to AVIF format (for web) and JPG (for OG)
 * 4. Saves to static/posters and static/og directories
 * 
 * @returns The relative path to the saved main image (e.g., '/posters/slug.avif')
 */
export async function processPoster(source: string, slug: string): Promise<string> {
    try {
        let buffer: Buffer | ArrayBuffer;

        // Check if source is URL or local path
        if (source.startsWith('http')) {
            const response = await fetch(source);
            if (!response.ok) {
                throw new Error(`Failed to download image: ${response.statusText}`);
            }
            buffer = await response.arrayBuffer();
        } else {
            // Assume local path
            buffer = await fs.readFile(source);
        }

        // Ensure output directories exist
        await fs.mkdir(OUTPUT_DIR, { recursive: true });
        await fs.mkdir(OG_DIR, { recursive: true });

        const filenameAvif = `${slug}.avif`;
        const filenameJpg = `${slug}.jpg`;
        const outputPathAvif = path.join(OUTPUT_DIR, filenameAvif);
        const outputPathJpg = path.join(OG_DIR, filenameJpg);

        const image = sharp(buffer);

        // 1. Generate AVIF (Main)
        await image
            .clone()
            .resize(POSTER_WIDTH, null, {
                withoutEnlargement: true
            })
            .avif({
                quality: POSTER_QUALITY,
                effort: 4
            })
            .toFile(outputPathAvif);

        // 2. Generate JPG (OG / Social)
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
        console.log(`[+] OG Image saved to ${outputPathJpg}`);

        return `/posters/${filenameAvif}`;

    } catch (error) {
        console.error('❌ Error processing poster:', error);
        throw error;
    }
}
