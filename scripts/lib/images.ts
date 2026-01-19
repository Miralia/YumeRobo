/**
 * Image processing utilities using Sharp
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const POSTER_WIDTH = 500;
const POSTER_QUALITY = 80;
const OUTPUT_DIR = 'static/posters';

/**
 * Process a poster image from a URL or local path
 * 1. Downloads/Reads image
 * 2. Resizes to standard width (preserving aspect ratio)
 * 3. Converts to AVIF format
 * 4. Saves to static/posters directory
 * 
 * @returns The relative path to the saved image (e.g., '/posters/slug.avif')
 */
export async function processPoster(source: string, slug: string): Promise<string> {
    try {
        let buffer: ArrayBuffer;

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

        // Ensure output directory exists
        await fs.mkdir(OUTPUT_DIR, { recursive: true });

        const filename = `${slug}.avif`;
        const outputPath = path.join(OUTPUT_DIR, filename);

        // Process image with Sharp
        await sharp(buffer)
            .resize(POSTER_WIDTH, null, {
                withoutEnlargement: true // Don't upscale if smaller
            })
            .avif({
                quality: POSTER_QUALITY,
                effort: 4 // Balance between speed and compression
            })
            .toFile(outputPath);

        console.log(`[+] Poster saved to ${outputPath}`);
        return `/posters/${filename}`;

    } catch (error) {
        console.error('❌ Error processing poster:', error);
        throw error;
    }
}
