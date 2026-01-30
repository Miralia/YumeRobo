/**
 * YumeRobo CLI Manager
 * 
 * Central management tool for the YumeRobo static site engine.
 * Handles content creation, modification, and deployment to Cloudflare Pages.
 * 
 * Usage:
 *   bun run cli create         - Interactive wizard to create a new release
 *   bun run cli delete <slug>  - Delete a release by its slug
 *   bun run cli deploy         - Build and deploy to Cloudflare Pages (Direct Upload)
 * 
 * Environment:
 *   Requires .env file with:
 *     - TMDB_API_KEY (for metadata fetching)
 *     - TELEGRAM_BOT_TOKEN (optional, for notifications)
 *     - TELEGRAM_CHANNEL_ID (optional, for notifications)
 */

import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';
import { select } from '@inquirer/prompts';
import { confirm } from '@inquirer/prompts';

const exec = promisify(execCb);

// Modules
import {
    promptTMDBId,
    promptSearchQuery,
    promptManualMetadata,
    promptConfirmMetadata,
    promptPoster,
    promptTorrentPath,
    promptAddMore,
    promptMediaInfo,
    promptBBCode,
    promptLink,
    promptDisplayName,
    promptComparisons,
    promptTelegramImage,
    promptRefineMetadata,
    displayMetadata
} from './lib/prompts';
import {
    searchMulti,
    getMovieMetadata,
    getTVMetadata,
    getMetadataById,
    formatSearchResult,
    type TMDBMetadata
} from './lib/tmdb';
import { parseTorrent, formatSize } from './lib/torrent';
import { parseBBCodeSpecs } from './lib/bbcode';
import { detectPlatform, isValidUrl, getSupportedPlatforms } from './lib/links';
import { generateReleaseCode } from './lib/templates';
import { generateHash, type ReleaseData, type TorrentEntry, type MediaInfoEntry, type SpecEntry } from './lib/types';
import { processPoster } from './lib/images';
import { buildCaption, sendPhoto, isSupportedFormat } from './lib/telegram';
import { tempManager } from './lib/cleanup';

const RELEASES_DIR = path.join(process.cwd(), 'src/lib/content/releases');
const STATIC_PATH = path.join(process.cwd(), 'static');

// ==========================================
// Step Functions
// ==========================================

async function stepMetadata(): Promise<{
    title_en: string;
    title_zh: string;
    year: number;
    tmdb_id: number;
    media_type: 'movie' | 'tv';
    special_type?: 'tva' | 'ova' | 'ona' | 'special';
    season?: number;
    badge_label?: string;
    is_complete?: boolean;
} | null> {
    const tmdbId = await promptTMDBId();
    let metadata: TMDBMetadata | null = null;

    if (tmdbId) {
        let id: number;
        let type: 'movie' | 'tv' | undefined;

        if (tmdbId.includes('/')) {
            const parts = tmdbId.split('/');
            type = parts[0] as 'movie' | 'tv';
            id = parseInt(parts[1]);
        } else {
            id = parseInt(tmdbId);
        }

        try {
            const candidates = await getMetadataById(id, type);
            if (candidates.length === 0) {
                console.log('[!] TMDB lookup failed: No results found');
            } else if (candidates.length === 1) {
                metadata = candidates[0];
            } else {
                const selectedIndex = await select({
                    message: 'Multiple results found with this ID. Please select one:',
                    choices: candidates.map((c, i) => ({
                        name: formatSearchResult(c),
                        value: i
                    }))
                });
                metadata = candidates[selectedIndex];
            }
        } catch (e) {
            console.log(`[!] TMDB lookup failed: ${e}`);
        }
    } else {
        const query = await promptSearchQuery();
        const results = await searchMulti(query);

        if (results.length === 0) {
            console.log('[!] No results found');
        } else {
            const selected = await select({
                message: 'Select result:',
                choices: results.map((r, i) => ({
                    name: formatSearchResult(r),
                    value: i
                }))
            });

            const result = results[selected];
            try {
                if (result.media_type === 'movie') {
                    metadata = await getMovieMetadata(result.id);
                } else {
                    metadata = await getTVMetadata(result.id);
                }
            } catch (e) {
                console.log(`[!] Failed to fetch details: ${e}`);
            }
        }
    }

    if (metadata) {
        const refined = await promptRefineMetadata(metadata.media_type, metadata.number_of_seasons);
        const finalMetadata = {
            ...metadata,
            special_type: refined.special_type,
            season: refined.season,
            badge_label: refined.badge_label,
            is_complete: refined.is_complete
        };

        displayMetadata(finalMetadata);
        const confirmed = await promptConfirmMetadata();

        if (confirmed) {
            return finalMetadata;
        } else {
            const action = await select({
                message: 'What to do?',
                choices: [
                    { name: 'Search again', value: 'retry' },
                    { name: 'Manual entry', value: 'manual' }
                ]
            });

            if (action === 'retry') {
                return stepMetadata();
            }

            const manual = await promptManualMetadata();
            const refinedManual = await promptRefineMetadata(manual.media_type);
            return {
                ...manual,
                tmdb_id: 0,
                special_type: refinedManual.special_type,
                season: refinedManual.season,
                badge_label: refinedManual.badge_label,
                is_complete: refinedManual.is_complete
            };
        }
    } else {
        console.log('[!] Falling back to manual entry');
        const manual = await promptManualMetadata();
        const refinedManual = await promptRefineMetadata(manual.media_type);
        return {
            ...manual,
            tmdb_id: 0,
            special_type: refinedManual.special_type,
            season: refinedManual.season,
            badge_label: refinedManual.badge_label,
            is_complete: refinedManual.is_complete
        };
    }
}

async function stepPoster(slug: string): Promise<string> {
    console.log('\n--- Poster ---');
    const posterInput = await promptPoster();
    const posterPath = await processPoster(posterInput, slug);
    console.log(`[+] Poster saved: ${posterPath}`);
    return posterPath;
}

async function stepTorrents(): Promise<TorrentEntry[]> {
    console.log('\n--- Torrents ---');
    const torrents: TorrentEntry[] = [];

    do {
        const torrentPath = await promptTorrentPath();
        try {
            const parsedTorrent = await parseTorrent(torrentPath);
            console.log(`[+] Parsed: ${parsedTorrent.name} (${parsedTorrent.files.length} files)`);

            const display_name = await promptDisplayName(parsedTorrent.name);

            console.log(`\n--- MediaInfo for this Torrent ---`);
            const mediainfo: MediaInfoEntry[] = [];
            do {
                const content = await promptMediaInfo();
                if (!content.trim()) {
                    console.log('[!] Empty content, skipped');
                    continue;
                }

                const filenameMatch = content.match(/Complete name\s*:\s*(.+)/i);
                const filename = filenameMatch
                    ? filenameMatch[1].trim().split(/[/\\]/).pop() || 'unknown.mkv'
                    : 'unknown.mkv';

                const hash = generateHash(8);
                const hashPath = path.join(STATIC_PATH, 'mediainfo', hash);
                await fs.writeFile(hashPath, content, 'utf-8');

                mediainfo.push({ filename, raw_hash: hash });
                console.log(`[+] Saved: ${filename} -> ${hash}`);
            } while (mediainfo.length === 0 || await promptAddMore('MediaInfo to this torrent'));

            torrents.push({
                name: parsedTorrent.name,
                display_name,
                files: parsedTorrent.files,
                mediainfo
            });
            console.log(`[+] Added torrent with ${mediainfo.length} MediaInfo entries`);

        } catch (e) {
            console.log(`[!] Failed to parse torrent: ${e}`);
        }
    } while (torrents.length === 0 || await promptAddMore('torrent'));

    return torrents;
}

async function stepSpecs(): Promise<SpecEntry[]> {
    console.log('\n--- Specs (BBCode) ---');
    console.log('Paste all BBCode with [quote=Title]...[/quote] blocks');

    let specs: SpecEntry[] = [];
    do {
        const bbcode = await promptBBCode();
        specs = parseBBCodeSpecs(bbcode);

        if (specs.length === 0) {
            console.log('[!] No [quote=Title] blocks found, try again');
        } else {
            for (const spec of specs) {
                console.log(`[+] Extracted: ${spec.title}`);
            }
        }
    } while (specs.length === 0);

    return specs;
}

async function stepLinks(tmdbId: number, mediaType: string): Promise<Record<string, string>> {
    console.log('\n--- External Links ---');
    const links: Record<string, string> = {};

    if (tmdbId > 0) {
        const type = mediaType === 'movie' ? 'movie' : 'tv';
        links.tmdb = `https://www.themoviedb.org/${type}/${tmdbId}`;
        console.log(`[+] Auto-added: tmdb`);
    }

    let addMoreLinks = true;
    while (addMoreLinks) {
        const url = await promptLink();
        if (isValidUrl(url)) {
            const platform = detectPlatform(url);
            if (platform) {
                links[platform] = url;
                console.log(`[+] Added: ${platform}`);
            } else {
                console.log(`[!] Unknown platform, skipped`);
            }
        }
        addMoreLinks = await promptAddMore('link');
    }

    return links;
}

async function stepTelegram(release: ReleaseData): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    if (!token || !channelId) {
        console.log('[i] Telegram not configured');
        return;
    }

    const shouldPost = await confirm({ message: 'Post to Telegram?', default: false });
    if (!shouldPost) return;

    let imagePath: string = '';
    while (true) {
        const imageInput = await promptTelegramImage();

        if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
            const urlExt = imageInput.split('.').pop()?.split('?')[0]?.toLowerCase() || '';
            if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(urlExt)) {
                console.log(`[!] Unsupported format: ${urlExt}`);
                continue;
            }
            try {
                const response = await fetch(imageInput);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const buffer = Buffer.from(await response.arrayBuffer());
                imagePath = path.join(os.tmpdir(), `telegram-${Date.now()}.${urlExt}`);
                await fs.writeFile(imagePath, buffer);
                tempManager.add(imagePath);
                break;
            } catch (e) {
                console.log(`[!] Failed to download: ${e}`);
                continue;
            }
        } else {
            imagePath = imageInput.trim().replace(/\\(.)/g, '$1');
            if (!isSupportedFormat(imagePath)) {
                console.log(`[!] Unsupported format`);
                continue;
            }
            break;
        }
    }

    const comparisons = await promptComparisons();
    const caption = await buildCaption(release, comparisons);

    console.log('\n--- Telegram Preview ---');
    console.log(caption);

    const confirmSend = await confirm({ message: 'Send to channel?', default: true });
    if (!confirmSend) return;

    const buttons: Array<{ text: string; url: string }> = [];
    if (release.links?.tmdb) {
        buttons.push({ text: 'TMDB', url: release.links.tmdb });
    }
    const websiteUrl = `https://yumerobo.moe/${release.slug}`;
    buttons.push({ text: 'YumeRobo', url: websiteUrl });

    const result = await sendPhoto(token, channelId, imagePath, caption, buttons);

    if (result.ok) {
        console.log(`[+] Posted to Telegram! Message ID: ${result.messageId}`);
    } else {
        console.log(`[!] Failed to post: ${result.error}`);
    }
}

// ==========================================
// Commands
// ==========================================

async function create() {
    console.log('\n=== Create New Release ===\n');
    const slug = generateHash(8);
    console.log(`Slug: ${slug}\n`);

    let metadata = await stepMetadata();
    if (!metadata) return;

    let posterPath = await stepPoster(slug);
    let torrents = await stepTorrents();
    let specs = await stepSpecs();
    let links = await stepLinks(metadata.tmdb_id, metadata.media_type);

    while (true) {
        const releaseData: ReleaseData = {
            slug,
            title: metadata.title_en,
            title_en: metadata.title_en,
            title_zh: metadata.title_zh,
            date: new Date().toISOString(),
            tmdb_id: metadata.tmdb_id,
            media_type: metadata.media_type,
            special_type: metadata.special_type,
            year: metadata.year,
            poster: posterPath,
            torrents,
            specs,
            links,
            season: metadata.season,
            badge_label: metadata.badge_label,
            is_complete: metadata.is_complete
        };

        const codeBlock = generateReleaseCode(releaseData);
        // Clean up formatting: ensure it's a clean object literal
        const cleanCode = codeBlock.trim().replace(/,$/, '');

        // Generate full file content
        const fileContent = `import type { Release } from '../schema';

export const release: Release = ${cleanCode};
`;

        const tempFile = path.join(os.tmpdir(), `yumerobo-${slug}.ts`);
        await fs.writeFile(tempFile, fileContent, 'utf-8');
        tempManager.add(tempFile);

        console.log(`\n--- Preview (${tempFile}) ---\n`);
        console.log(fileContent.slice(0, 500) + '...');

        const action = await select({
            message: 'What to do?',
            choices: [
                { name: '[1] Confirm & Write', value: 'confirm' },
                { name: '[2] Edit Metadata', value: 'metadata' },
                { name: '[3] Edit Poster', value: 'poster' },
                { name: '[4] Edit Torrents', value: 'torrents' },
                { name: '[5] Edit Specs', value: 'specs' },
                { name: '[6] Edit Links', value: 'links' },
                { name: '[7] Cancel', value: 'cancel' }
            ]
        });

        if (action === 'confirm') {
            const targetPath = path.join(RELEASES_DIR, `${slug}.ts`);
            await fs.writeFile(targetPath, fileContent, 'utf-8');
            console.log(`\n[+] Release saved to: ${targetPath}`);
            await stepTelegram(releaseData);
            await tempManager.cleanup();
            break;
        } else if (action === 'cancel') {
            console.log('[!] Cancelled');
            await tempManager.cleanup();
            return;
        } else if (action === 'metadata') {
            const newMeta = await stepMetadata();
            if (newMeta) metadata = newMeta;
        } else if (action === 'poster') {
            posterPath = await stepPoster(slug);
        } else if (action === 'torrents') {
            torrents = await stepTorrents();
        } else if (action === 'specs') {
            specs = await stepSpecs();
        } else if (action === 'links') {
            links = await stepLinks(metadata.tmdb_id, metadata.media_type);
        }
    }
}

async function getReleases() {
    const files = await fs.readdir(RELEASES_DIR);
    const releases = [];
    for (const file of files) {
        if (!file.endsWith('.ts')) continue;
        const filePath = path.join(RELEASES_DIR, file);
        try {
            const mod = await import(filePath);
            if (mod.release) {
                releases.push({
                    name: `[${mod.release.date.split('T')[0]}] ${mod.release.title} (${mod.release.slug})`,
                    value: { slug: mod.release.slug, data: mod.release, path: filePath }
                });
            }
        } catch (e) {
            // skip
        }
    }
    return releases.sort((a, b) => b.name.localeCompare(a.name));
}

async function edit() {
    console.log('\n=== Edit Release ===\n');
    const choices = await getReleases();
    if (choices.length === 0) {
        console.log('No releases found.');
        return;
    }

    const { slug, data: currentData, path: filePath } = await select({
        message: 'Select release to edit:',
        choices
    });

    let metadata: any = {
        title_en: currentData.title_en,
        title_zh: currentData.title_zh,
        year: currentData.year,
        tmdb_id: currentData.tmdb_id,
        media_type: currentData.media_type,
        special_type: currentData.special_type,
        season: currentData.season,
        badge_label: currentData.badge_label,
        is_complete: currentData.is_complete
    };
    let posterPath = currentData.poster;
    let torrents = currentData.torrents;
    let specs = currentData.specs;
    let links = currentData.links;
    let date = currentData.date;

    while (true) {
        console.log(`\nEditing: ${metadata.title_en || metadata.title_zh}`);
        const action = await select({
            message: 'Select field to edit:',
            choices: [
                { name: 'Metadata (Re-fetch from TMDB)', value: 'metadata' },
                { name: 'Poster (Select new)', value: 'poster' },
                { name: 'Torrents (Enter new list)', value: 'torrents' },
                { name: 'Tech Specs (Enter new)', value: 'specs' },
                { name: 'Links (Re-enter)', value: 'links' },
                { name: 'Save & Exit', value: 'save' },
                { name: 'Cancel', value: 'cancel' }
            ]
        });

        if (action === 'cancel') return;
        if (action === 'save') {
            const updatedData: ReleaseData = {
                slug,
                title: metadata.title_en || metadata.title_zh,
                title_en: metadata.title_en,
                title_zh: metadata.title_zh,
                year: metadata.year,
                date: date,
                tmdb_id: metadata.tmdb_id,
                media_type: metadata.media_type,
                special_type: metadata.special_type,
                season: metadata.season,
                badge_label: metadata.badge_label,
                is_complete: metadata.is_complete,
                poster: posterPath,
                torrents,
                specs,
                links
            };
            const codeBlock = generateReleaseCode(updatedData);
            const cleanCode = codeBlock.trim().replace(/,$/, '');
            const fileContent = `import type { Release } from '../schema';

export const release: Release = ${cleanCode};
`;
            await fs.writeFile(filePath, fileContent);
            console.log(`[+] Saved changes to ${filePath}`);
            return;
        }

        if (action === 'metadata') {
            const newMeta = await stepMetadata();
            if (newMeta) metadata = newMeta;
        } else if (action === 'poster') {
            posterPath = await stepPoster(slug);
        } else if (action === 'torrents') {
            torrents = await stepTorrents();
        } else if (action === 'specs') {
            specs = await stepSpecs();
        } else if (action === 'links') {
            links = await stepLinks(metadata.tmdb_id, metadata.media_type);
        }
    }
}

async function deleteRelease(slug: string) {
    if (!slug) {
        console.log('[!] Slug required for delete. Usage: bun run cli delete <slug>');
        return;
    }
    const targetPath = path.join(RELEASES_DIR, `${slug}.ts`);
    try {
        await fs.access(targetPath);

        // Load release data to find associated files
        let releaseData: any = null;
        try {
            const mod = await import(targetPath);
            releaseData = mod.release;
        } catch (e) {
            console.log('[!] Could not parse release file, will only delete .ts file');
        }

        const shouldDelete = await confirm({ message: `Delete release ${slug}? This cannot be undone.`, default: false });
        if (shouldDelete) {
            // Delete the .ts file
            await fs.unlink(targetPath);
            console.log(`[+] Deleted ${targetPath}`);

            // Delete poster if exists
            if (releaseData?.poster) {
                const posterPath = path.join(STATIC_PATH, releaseData.poster);
                try {
                    await fs.access(posterPath);
                    await fs.unlink(posterPath);
                    console.log(`[+] Deleted poster: ${posterPath}`);
                } catch {
                    // Poster doesn't exist or already deleted
                }
            }

            // Delete mediainfo files
            if (releaseData?.torrents) {
                for (const torrent of releaseData.torrents) {
                    if (torrent.mediainfo) {
                        for (const mi of torrent.mediainfo) {
                            const miPath = path.join(STATIC_PATH, 'mediainfo', mi.raw_hash);
                            try {
                                await fs.access(miPath);
                                await fs.unlink(miPath);
                                console.log(`[+] Deleted mediainfo: ${miPath}`);
                            } catch {
                                // MediaInfo doesn't exist or already deleted
                            }
                        }
                    }
                }
            }

            console.log(`[✓] Release ${slug} fully deleted`);
        }
    } catch {
        console.log(`[!] Release ${slug} not found`);
    }
}

async function deploy() {
    console.log('\n=== Deploy to Cloudflare ===\n');
    try {
        console.log('[1/3] Building project...');
        await exec('npm run build');
        console.log('[+] Build complete.');

        console.log('[2/3] Ensuring Cloudflare Pages project exists...');
        try {
            // Try to create project (ignore if exists)
            await exec('npx wrangler pages project create yumerobo --production-branch main');
            console.log('[+] Project created/verified.');
        } catch (e) {
            // Check if error is "already exists" (exit code 1 usually)
            // We just ignore creation failure and hope it's because it exists
            // or let the deploy step fail with a clearer error if it's a real issue
            console.log('[i] Project might already exist or creation requires login. Proceeding to deploy...');
        }

        console.log('[3/3] Deploying (Direct Upload)...');
        // Add --commit-dirty=true to allow deploying with uncomitted changes (since we rely on local files)
        await exec('npx wrangler pages deploy build --project-name yumerobo --commit-dirty=true');
        console.log('[+] Deployment initiated!');
    } catch (e) {
        console.error('[!] Deployment failed:', e);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'create';

    switch (command) {
        case 'create':
            await create();
            break;
        case 'delete':
            await deleteRelease(args[1]);
            break;
        case 'deploy':
            await deploy();
            break;
        case 'edit':
            await edit();
            break;
        default:
            console.log(`[!] Unknown command: ${command}`);
            console.log('Usage: bun run cli [create|delete <slug>|deploy]');
    }
}

main().catch(console.error);
