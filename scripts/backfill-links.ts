/**
 * Backfill external links for existing releases.
 *
 * Re-runs the resolver against every release that has a tmdb_id and writes back
 * only confirmed links. Existing links are never overwritten; the release file
 * is rewritten only when something new was added. A summary report (added /
 * still missing per slug) is printed at the end.
 *
 * Rewrites go through the same code generator the interactive CLI uses, so the
 * file is always re-emitted from the parsed release instead of being patched
 * with regexes — a hand-rolled "replace the links block" pass silently corrupts
 * the file as soon as any other field changes shape.
 *
 * Usage: bun scripts/backfill-links.ts [--dry-run]
 */
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveExternalLinks } from './lib/link-resolver';
import { getTmdbApiKey } from './lib/tmdb';
import { generateReleaseCode } from './lib/templates';
import type { ReleaseData } from './lib/types';

const RELEASES_DIR = path.join(process.cwd(), 'src/lib/content/releases');
const dryRun = process.argv.includes('--dry-run');

async function loadRelease(filePath: string): Promise<ReleaseData | undefined> {
    const mod = (await import(`${pathToFileURL(filePath).href}?t=${Date.now()}`)) as {
        release?: ReleaseData;
    };
    return mod.release;
}

function renderModule(release: ReleaseData): string {
    return `import type { Release } from '../schema';

export const release: Release = ${generateReleaseCode(release).trim()};
`;
}

async function main(): Promise<void> {
    const apiKey = getTmdbApiKey();
    const files = (await fs.readdir(RELEASES_DIR)).filter((f) => f.endsWith('.ts'));
    const added: Record<string, string[]> = {};
    const unchanged: string[] = [];
    const failed: Record<string, string> = {};

    for (const file of files) {
        const filePath = path.join(RELEASES_DIR, file);

        let release: ReleaseData | undefined;
        try {
            release = await loadRelease(filePath);
        } catch (error) {
            failed[file] = `unreadable: ${error instanceof Error ? error.message : error}`;
            continue;
        }

        if (!release) {
            failed[file] = 'module does not export `release`';
            continue;
        }
        if (!release.tmdb_id) {
            failed[file] = 'no tmdb id';
            continue;
        }
        if (!release.links?.tmdb) {
            failed[file] = 'no tmdb link';
            continue;
        }

        let resolved;
        try {
            resolved = await resolveExternalLinks(release.tmdb_id, release.media_type, {
                apiKey,
                season: release.season,
                title: release.title,
                year: release.year,
                isAnime: ['tva', 'ova', 'ona'].includes(release.special_type ?? ''),
            });
        } catch (error) {
            failed[file] = error instanceof Error ? error.message : String(error);
            continue;
        }

        const newLinks = { ...release.links };
        const addedHere: string[] = [];
        for (const [platform, url] of Object.entries(resolved.confirmed)) {
            if (url && !newLinks[platform]) {
                newLinks[platform] = url;
                addedHere.push(platform);
            }
        }

        if (addedHere.length === 0) {
            unchanged.push(release.slug);
            continue;
        }

        added[release.slug] = addedHere;

        if (!dryRun) {
            const content = renderModule({ ...release, links: newLinks });
            const temporary = `${filePath}.${process.pid}.tmp`;
            await fs.writeFile(temporary, content, 'utf8');
            await fs.rename(temporary, filePath);
        }

        console.log(`[+] ${release.slug}: +${addedHere.join(', ')}`);
    }

    console.log('\n--- Summary ---');
    console.log(
        `updated: ${Object.keys(added).length}, unchanged: ${unchanged.length}, failed: ${Object.keys(failed).length}`,
    );
    for (const [slug, platforms] of Object.entries(added)) {
        console.log(`  ${slug}: ${platforms.join(', ')}`);
    }
    for (const [file, reason] of Object.entries(failed)) {
        console.log(`  [!] ${file}: ${reason}`);
    }
    if (dryRun) console.log('\n(dry run — no files written)');

    if (Object.keys(failed).length > 0) {
        process.exitCode = 1;
    }
}

await main();
