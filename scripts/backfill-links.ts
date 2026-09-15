/**
 * Backfill external links for existing releases.
 *
 * Re-runs the resolver against every release that has a tmdb_id and writes
 * back only confirmed links. Existing links are never overwritten; the
 * release file is rewritten only when something new was added. A summary
 * report (added / still missing per slug) is printed at the end.
 *
 * Usage: bun scripts/backfill-links.ts [--dry-run]
 */
import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveExternalLinks } from './lib/link-resolver';
import { getTmdbApiKey } from './lib/tmdb';

const RELEASES_DIR = 'src/lib/content/releases';
const dryRun = process.argv.includes('--dry-run');

interface ReleaseFrontmatter {
    slug: string;
    title: string;
    tmdb_id: number;
    media_type: 'movie' | 'tv';
    special_type?: string;
    season?: number;
    year?: number;
    links?: Record<string, string>;
}

function parseLooseRelease(source: string): ReleaseFrontmatter | null {
    // The release files are TS object literals; extract the fields we need
    // with targeted regexes instead of importing (they are gitignored but
    // resolvable — importing would drag the whole schema in and we only
    // need scalars anyway).
    const slug = source.match(/slug:\s*'([^']+)'/)?.[1];
    const title = source.match(/title:\s*'((?:[^'\\]|\\.)*)'/)?.[1];
    const tmdbId = Number(source.match(/tmdb_id:\s*(\d+)/)?.[1]);
    const mediaType = source.match(/media_type:\s*'(movie|tv)'/)?.[1] as 'movie' | 'tv' | undefined;
    if (!slug || !title || !tmdbId || !mediaType) return null;

    const linksBlock = source.match(/links:\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? '';
    const links: Record<string, string> = {};
    for (const m of linksBlock.matchAll(/([a-z_]+):\s*'([^']+)'/g)) {
        links[m[1]] = m[2];
    }

    return {
        slug,
        title,
        tmdb_id: tmdbId,
        media_type: mediaType,
        special_type: source.match(/special_type:\s*'([a-z]+)'/)?.[1],
        season: source.match(/\n\s*season:\s*(\d+)/) ? Number(source.match(/\n\s*season:\s*(\d+)/)![1]) : undefined,
        year: source.match(/\n\s*year:\s*(\d+)/) ? Number(source.match(/\n\s*year:\s*(\d+)/)![1]) : undefined,
        links,
    };
}

function serializeLinks(links: Record<string, string>): string {
    const entries = Object.entries(links).map(([k, v]) => `            ${k}: '${v}',`);
    return `links: {\n${entries.join('\n')}\n        }`;
}

async function main(): Promise<void> {
    const apiKey = getTmdbApiKey();
    const files = (await readdir(RELEASES_DIR)).filter((f) => f.endsWith('.ts'));
    const added: Record<string, string[]> = {};
    const unchanged: string[] = [];
    const failed: Record<string, string> = {};

    for (const file of files) {
        const path = join(RELEASES_DIR, file);
        const source = await readFile(path, 'utf8');
        const meta = parseLooseRelease(source);
        if (!meta) {
            failed[file] = 'parse failed';
            continue;
        }
        if (!meta.links || !meta.links.tmdb) {
            failed[file] = 'no tmdb link';
            continue;
        }

        let resolved;
        try {
            resolved = await resolveExternalLinks(meta.tmdb_id, meta.media_type, {
                apiKey,
                season: meta.season,
                title: meta.title,
                year: meta.year,
                isAnime: ['tva', 'ova', 'ona'].includes(meta.special_type ?? ''),
            });
        } catch (error) {
            failed[meta.slug] = error instanceof Error ? error.message : String(error);
            continue;
        }

        const newLinks = { ...meta.links };
        const addedHere: string[] = [];
        for (const [platform, url] of Object.entries(resolved.confirmed)) {
            if (url && !newLinks[platform]) {
                newLinks[platform] = url;
                addedHere.push(platform);
            }
        }

        if (addedHere.length === 0) {
            unchanged.push(meta.slug);
            continue;
        }

        added[meta.slug] = addedHere;
        if (!dryRun) {
            const linksMatch = source.match(/links:\s*\{[\s\S]*?\n\s*\}/);
            if (!linksMatch) {
                failed[meta.slug] = 'links block not matched for rewrite';
                continue;
            }
            const updated = source.replace(linksMatch[0], serializeLinks(newLinks));
            await Bun.write(path, updated);
        }
        console.log(`[+] ${meta.slug}: +${addedHere.join(', ')}`);
    }

    console.log('\n--- Summary ---');
    console.log(`updated: ${Object.keys(added).length}, unchanged: ${unchanged.length}, failed: ${Object.keys(failed).length}`);
    for (const [slug, platforms] of Object.entries(added)) {
        console.log(`  ${slug}: ${platforms.join(', ')}`);
    }
    for (const [slug, reason] of Object.entries(failed)) {
        console.log(`  [!] ${slug}: ${reason}`);
    }
    if (dryRun) console.log('\n(dry run — no files written)');
}

await main();
