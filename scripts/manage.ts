/**
 * YumeRobo CLI Manager
 * 
 * Central management tool for the YumeRobo static site engine.
 * Handles content creation, modification, and deployment to Cloudflare Pages.
 * 
 * Usage:
 *   bun run cli create         - Interactive wizard to create a new release
 *   bun run cli edit           - Edit an existing release
 *   bun run cli delete <slug>  - Delete a release by its slug
 *   bun run cli telegram       - Push an existing release to Telegram
 *   bun run cli audit-assets   - Audit managed media assets for drift/orphans
 *   bun run cli prune-assets   - Delete orphaned managed media assets after confirmation
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
    promptTelegramLabel,
    promptLinksEditor,
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
import { buildInitialExternalLinks, collectExternalLinks } from './lib/links';
import { classifyTorrentTelegramLabel } from './lib/torrent-label';
import { generateReleaseCode } from './lib/templates';
import { generateHash, type ReleaseData, type TorrentEntry, type MediaInfoEntry, type SpecEntry } from './lib/types';
import { backfillCardPoster, processPoster } from './lib/images';
import { buildCaption, sendPhotoWithRetry, isSupportedFormat } from './lib/telegram';
import { tempManager } from './lib/cleanup';
import { getCliUsage, resolveCliCommand } from './lib/cli';
import {
    ensurePagesProject,
    formatDeployPreflightIssues,
    getDeployCommand,
    getDeployPreflightIssues,
    hasDeployPreflightIssues,
} from './lib/deploy';
import { getCliConfig, getReleaseUrl, getTelegramConfig } from './lib/config';
import {
    clearCreateDraft,
    clearEditDraft,
    loadCreateDraft,
    loadEditDraft,
    saveCreateDraft,
    saveEditDraft,
    type CreateDraft,
    type EditDraft,
} from './lib/drafts';
import {
    formatCreateDraftSummary,
    formatEditDraftSummary,
} from './lib/summary';
import {
    auditManagedAssets,
    executeCleanupPlan,
    formatAuditReport,
    formatCleanupResult,
    hasAuditIssues,
    planReleaseAssetCleanup,
    planReleaseAssetDiffCleanup,
    pruneOrphanedAssets,
    validateReleaseAssets,
} from './lib/assets';

const RELEASES_DIR = path.join(process.cwd(), 'src/lib/content/releases');
const STATIC_PATH = path.join(process.cwd(), 'static');

interface ReleaseRecord {
    slug: string;
    data: ReleaseData;
    path: string;
}

interface ReleaseMetadataState {
    title: string;
    year: number;
    tmdb_id: number;
    media_type: 'movie' | 'tv';
    special_type?: 'tva' | 'ova' | 'ona' | 'special';
    season?: number;
    badge_label?: string;
    is_complete?: boolean;
}

function hasValidationIssues(result: Awaited<ReturnType<typeof validateReleaseAssets>>): boolean {
    return (
        result.missingReferences.length > 0 ||
        result.malformedReferences.length > 0 ||
        result.derivedMismatches.length > 0
    );
}

function formatValidationReport(
    slug: string,
    result: Awaited<ReturnType<typeof validateReleaseAssets>>,
): string {
    return [
        `ASSET_VALIDATION release=${slug}`,
        `missing_references count=${result.missingReferences.length}`,
        ...result.missingReferences.map((issue) => `- kind=${issue.kind} path=${issue.path}`),
        `malformed_references count=${result.malformedReferences.length}`,
        ...result.malformedReferences.map((issue) => `- kind=${issue.kind} path=${issue.path}${issue.detail ? ` detail=${issue.detail}` : ''}`),
        `derived_mismatches count=${result.derivedMismatches.length}`,
        ...result.derivedMismatches.map((issue) => `- kind=${issue.kind} path=${issue.path}${issue.expectedPath ? ` expected=${issue.expectedPath}` : ''}${issue.detail ? ` detail=${issue.detail}` : ''}`),
    ].join('\n');
}

function shouldPrintCleanupSummary(cleanup: Awaited<ReturnType<typeof executeCleanupPlan>>): boolean {
    return (
        cleanup.delete.length > 0 ||
        cleanup.keep.length > 0 ||
        cleanup.missing.length > 0 ||
        cleanup.errors.length > 0
    );
}

async function loadReleaseRecords(): Promise<ReleaseRecord[]> {
    const files = await fs.readdir(RELEASES_DIR);
    const records: ReleaseRecord[] = [];

    for (const file of files) {
        if (!file.endsWith('.ts')) continue;

        const filePath = path.join(RELEASES_DIR, file);
        try {
            const mod = await import(filePath);
            if (mod.release) {
                records.push({
                    slug: mod.release.slug,
                    data: mod.release as ReleaseData,
                    path: filePath,
                });
            }
        } catch {
            // Ignore malformed files here; callers may fall back to raw file deletion.
        }
    }

    return records;
}

function toMetadataState(release: ReleaseData): ReleaseMetadataState {
    return {
        title: release.title,
        year: release.year,
        tmdb_id: release.tmdb_id,
        media_type: release.media_type,
        special_type: release.special_type,
        season: release.season,
        badge_label: release.badge_label,
        is_complete: release.is_complete,
    };
}

function buildCreateDraftState(input: {
    slug: string;
    metadata?: ReleaseMetadataState;
    posterPath?: string;
    torrents?: TorrentEntry[];
    specs?: SpecEntry[];
    links?: Record<string, string>;
}): CreateDraft {
    return {
        slug: input.slug,
        metadata: input.metadata,
        posterPath: input.posterPath,
        torrents: input.torrents,
        specs: input.specs,
        links: input.links,
    };
}

function buildEditDraftState(input: {
    slug: string;
    originalRelease: ReleaseData;
    metadata?: ReleaseMetadataState;
    posterPath?: string;
    torrents?: TorrentEntry[];
    specs?: SpecEntry[];
    links?: Record<string, string>;
    date: string;
}): EditDraft {
    return {
        slug: input.slug,
        originalRelease: input.originalRelease,
        metadata: input.metadata,
        posterPath: input.posterPath,
        torrents: input.torrents,
        specs: input.specs,
        links: input.links,
        date: input.date,
    };
}

function syncTmdbLink(
    links: Record<string, string>,
    tmdbId: number,
    mediaType: string,
): Record<string, string> {
    const nextLinks = { ...links };
    const initialLinks = buildInitialExternalLinks(tmdbId, mediaType);

    if (initialLinks.tmdb) {
        nextLinks.tmdb = initialLinks.tmdb;
    } else {
        delete nextLinks.tmdb;
    }

    return nextLinks;
}

async function persistCreateDraft(draft: CreateDraft) {
    await saveCreateDraft(draft);
    console.log(formatCreateDraftSummary(draft));
}

async function persistEditDraft(draft: EditDraft) {
    await saveEditDraft(draft);
    console.log(formatEditDraftSummary(draft));
}

// ==========================================
// Step Functions
// ==========================================

async function stepMetadata(): Promise<{
    title: string;
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

function getPosterAssetId(posterPath: string): string | undefined {
    const normalized = posterPath.replace(/\\/g, '/').split('?')[0];
    const basename = path.posix.basename(normalized);
    return basename.endsWith('.avif') ? basename.slice(0, -'.avif'.length) : undefined;
}

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function generateFreshPosterAssetId(previousPosterPath: string): Promise<string> {
    const previousAssetId = getPosterAssetId(previousPosterPath);

    for (let attempt = 0; attempt < 20; attempt += 1) {
        const assetId = generateHash(8);
        if (assetId === previousAssetId) continue;

        const posterPath = path.join(STATIC_PATH, 'posters', `${assetId}.avif`);
        const cardPosterPath = path.join(STATIC_PATH, 'posters', `${assetId}.card.avif`);
        const ogPath = path.join(STATIC_PATH, 'og', `${assetId}.jpg`);
        if (!await fileExists(posterPath) && !await fileExists(cardPosterPath) && !await fileExists(ogPath)) {
            return assetId;
        }
    }

    throw new Error('Failed to generate a unique poster asset id');
}

async function stepTorrents(): Promise<TorrentEntry[]> {
    console.log('\n--- Torrents ---');
    const torrents: TorrentEntry[] = [];

    do {
        const torrentPath = await promptTorrentPath();
        try {
            const parsedTorrent = await parseTorrent(torrentPath);
            console.log(`[+] Parsed: ${parsedTorrent.name} (${parsedTorrent.files.length} files)`);

            const labelClassification = classifyTorrentTelegramLabel(parsedTorrent.name);
            const telegram_label = labelClassification.requiresManualLabel
                ? await promptTelegramLabel()
                : undefined;

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
                telegram_label,
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
    let links = buildInitialExternalLinks(tmdbId, mediaType);

    if (links.tmdb) {
        console.log(`[+] Auto-added: tmdb`);
    }

    const result = collectExternalLinks(links, await promptLinksEditor());
    for (const platform of result.added) {
        console.log(`[+] Added: ${platform}`);
    }
    if (result.skipped > 0) console.log(`[i] Skipped ${result.skipped} unusable or duplicate link(s)`);

    return result.links;
}

async function stepTelegram(release: ReleaseData): Promise<void> {
    const config = getCliConfig();
    const telegramConfig = getTelegramConfig(config);

    if (!telegramConfig) {
        console.log('[i] Telegram not configured (set TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID in .env)');
        return;
    }

    const shouldPost = await confirm({ message: 'Post to Telegram?', default: false });
    if (!shouldPost) return;

    let photoSource: string = '';
    while (true) {
        const imageInput = await promptTelegramImage();

        if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
            const urlExt = imageInput.split('.').pop()?.split('?')[0]?.toLowerCase() || '';
            if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(urlExt)) {
                console.log(`[!] Unsupported format: ${urlExt}`);
                continue;
            }
            // Pass URL directly to Telegram — no need to download first
            photoSource = imageInput;
            break;
        } else {
            photoSource = imageInput.trim().replace(/\\\\(.)/g, '$1');
            if (!isSupportedFormat(photoSource)) {
                console.log(`[!] Unsupported format`);
                continue;
            }
            break;
        }
    }

    const comparisons = await promptComparisons();
    const caption = await buildCaption(release, comparisons, config.siteUrl);

    console.log('\n--- Telegram Preview ---');
    console.log(caption);

    const confirmSend = await confirm({ message: 'Send to channel?', default: true });
    if (!confirmSend) return;

    const buttons: Array<{ text: string; url: string }> = [];
    if (release.links?.tmdb) {
        buttons.push({ text: 'TMDB', url: release.links.tmdb });
    }
    const websiteUrl = getReleaseUrl(config, release.slug);
    buttons.push({ text: 'YumeRobo', url: websiteUrl });

    // Send with automatic retry
    while (true) {
        const result = await sendPhotoWithRetry(
            telegramConfig.token,
            telegramConfig.channelId,
            photoSource,
            caption,
            buttons,
        );

        if (result.ok) {
            console.log(`[+] Posted to Telegram! Message ID: ${result.messageId}`);
            if (result.attempts > 1) {
                console.log(`[i] Succeeded after ${result.attempts} attempts`);
            }
            return;
        }

        console.log(`[!] Failed after ${result.attempts} attempt(s): ${result.error}`);

        const action = await select({
            message: 'What to do?',
            choices: [
                { name: 'Retry', value: 'retry' },
                { name: 'Skip Telegram posting', value: 'skip' }
            ]
        });

        if (action === 'skip') {
            console.log('[i] Skipped Telegram posting');
            return;
        }
        // action === 'retry': loop continues
    }
}

// ==========================================
// Commands
// ==========================================

async function create() {
    console.log('\n=== Create New Release ===\n');
    const existingDraft = await loadCreateDraft();
    let slug: string;
    let metadata: ReleaseMetadataState | undefined;
    let posterPath: string | undefined;
    let torrents: TorrentEntry[] | undefined;
    let specs: SpecEntry[] | undefined;
    let links: Record<string, string> | undefined;

    if (existingDraft) {
        const draftAction = await select({
            message: `Found an unfinished create draft for ${existingDraft.slug}.`,
            choices: [
                { name: 'Resume draft', value: 'resume' },
                { name: 'Discard draft and start new', value: 'discard' },
            ],
        });

        if (draftAction === 'resume') {
            slug = existingDraft.slug;
            metadata = existingDraft.metadata;
            posterPath = existingDraft.posterPath;
            torrents = existingDraft.torrents;
            specs = existingDraft.specs;
            links = existingDraft.links;
            console.log(`[i] Resumed draft: ${slug}\n`);
            console.log(formatCreateDraftSummary(existingDraft));
        } else {
            await clearCreateDraft();
            slug = generateHash(8);
            console.log(`Slug: ${slug}\n`);
            await persistCreateDraft(buildCreateDraftState({ slug }));
        }
    } else {
        slug = generateHash(8);
        console.log(`Slug: ${slug}\n`);
        await persistCreateDraft(buildCreateDraftState({ slug }));
    }

    if (!metadata) {
        metadata = await stepMetadata() ?? undefined;
        if (!metadata) return;
        await persistCreateDraft(buildCreateDraftState({ slug, metadata, posterPath, torrents, specs, links }));
    }

    if (!posterPath) {
        posterPath = await stepPoster(slug);
        await persistCreateDraft(buildCreateDraftState({ slug, metadata, posterPath, torrents, specs, links }));
    }

    if (!torrents) {
        torrents = await stepTorrents();
        await persistCreateDraft(buildCreateDraftState({ slug, metadata, posterPath, torrents, specs, links }));
    }

    if (!specs) {
        specs = await stepSpecs();
        await persistCreateDraft(buildCreateDraftState({ slug, metadata, posterPath, torrents, specs, links }));
    }

    if (!links) {
        links = await stepLinks(metadata.tmdb_id, metadata.media_type);
        await persistCreateDraft(buildCreateDraftState({ slug, metadata, posterPath, torrents, specs, links }));
    }

    while (true) {
        console.log(formatCreateDraftSummary(
            buildCreateDraftState({ slug, metadata, posterPath, torrents, specs, links }),
        ));
        const releaseData: ReleaseData = {
            slug,
            title: metadata.title,
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
            const validation = await validateReleaseAssets({ release: releaseData });
            if (hasValidationIssues(validation)) {
                console.log(`\n[!] Release written to: ${targetPath}`);
                console.log(formatValidationReport(slug, validation));
                process.exitCode = 1;
                await tempManager.cleanup();
                return;
            }
            console.log(`\n[+] Release saved to: ${targetPath}`);
            await clearCreateDraft();
            await stepTelegram(releaseData);
            await tempManager.cleanup();
            break;
        } else if (action === 'cancel') {
            console.log('[!] Cancelled');
            await clearCreateDraft();
            await tempManager.cleanup();
            return;
        } else if (action === 'metadata') {
            const newMeta = await stepMetadata();
            if (newMeta) {
                metadata = newMeta;
                links = syncTmdbLink(links, metadata.tmdb_id, metadata.media_type);
                await persistCreateDraft(buildCreateDraftState({ slug, metadata, posterPath, torrents, specs, links }));
            }
        } else if (action === 'poster') {
            posterPath = await stepPoster(slug);
            await persistCreateDraft(buildCreateDraftState({ slug, metadata, posterPath, torrents, specs, links }));
        } else if (action === 'torrents') {
            torrents = await stepTorrents();
            await persistCreateDraft(buildCreateDraftState({ slug, metadata, posterPath, torrents, specs, links }));
        } else if (action === 'specs') {
            specs = await stepSpecs();
            await persistCreateDraft(buildCreateDraftState({ slug, metadata, posterPath, torrents, specs, links }));
        } else if (action === 'links') {
            links = await stepLinks(metadata.tmdb_id, metadata.media_type);
            await persistCreateDraft(buildCreateDraftState({ slug, metadata, posterPath, torrents, specs, links }));
        }
    }
}

async function getReleases() {
    const records = await loadReleaseRecords();
    return records
        .map((record) => ({
            name: `[${record.data.date.split('T')[0]}] ${record.data.title} (${record.slug})`,
            value: record,
        }))
        .sort((a, b) => b.name.localeCompare(a.name));
}

async function edit() {
    console.log('\n=== Edit Release ===\n');
    const records = await loadReleaseRecords();
    const choices = records
        .map((record) => ({
            name: `[${record.data.date.split('T')[0]}] ${record.data.title} (${record.slug})`,
            value: record,
        }))
        .sort((a, b) => b.name.localeCompare(a.name));
    if (choices.length === 0) {
        console.log('No releases found.');
        return;
    }

    const { slug, data: currentData, path: filePath } = await select({
        message: 'Select release to edit:',
        choices
    });

    const existingDraft = await loadEditDraft(slug);
    let originalRelease = currentData;
    let metadata: ReleaseMetadataState;
    let posterPath: string;
    let torrents: TorrentEntry[];
    let specs: SpecEntry[];
    let links: Record<string, string>;
    let date: string;

    if (existingDraft) {
        const draftAction = await select({
            message: `Found an unfinished edit draft for ${slug}.`,
            choices: [
                { name: 'Resume draft', value: 'resume' },
                { name: 'Discard draft and reload current release', value: 'discard' },
            ],
        });

        if (draftAction === 'resume') {
            originalRelease = existingDraft.originalRelease;
            metadata = existingDraft.metadata ?? toMetadataState(currentData);
            posterPath = existingDraft.posterPath ?? currentData.poster;
            torrents = existingDraft.torrents ?? currentData.torrents;
            specs = existingDraft.specs ?? currentData.specs;
            links = existingDraft.links ?? currentData.links;
            date = existingDraft.date;
            console.log(`[i] Resumed edit draft for ${slug}`);
            console.log(formatEditDraftSummary(existingDraft));
        } else {
            await clearEditDraft(slug);
            metadata = toMetadataState(currentData);
            posterPath = currentData.poster;
            torrents = currentData.torrents;
            specs = currentData.specs;
            links = currentData.links;
            date = currentData.date;
            await persistEditDraft(buildEditDraftState({
                slug,
                originalRelease,
                metadata,
                posterPath,
                torrents,
                specs,
                links,
                date,
            }));
        }
    } else {
        metadata = toMetadataState(currentData);
        posterPath = currentData.poster;
        torrents = currentData.torrents;
        specs = currentData.specs;
        links = currentData.links;
        date = currentData.date;
        await persistEditDraft(buildEditDraftState({
            slug,
            originalRelease,
            metadata,
            posterPath,
            torrents,
            specs,
            links,
            date,
        }));
    }

    while (true) {
        console.log(`\nEditing: ${metadata.title}`);
        console.log(formatEditDraftSummary(
            buildEditDraftState({
                slug,
                originalRelease,
                metadata,
                posterPath,
                torrents,
                specs,
                links,
                date,
            }),
        ));
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

        if (action === 'cancel') {
            await clearEditDraft(slug);
            return;
        }
        if (action === 'save') {
            const updatedData: ReleaseData = {
                slug,
                title: metadata.title,
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
            const otherReleases = records
                .filter((record) => record.slug !== slug)
                .map((record) => record.data);
            const cleanupPlan = planReleaseAssetDiffCleanup({
                previousRelease: originalRelease,
                nextRelease: updatedData,
                otherReleases,
            });
            const cleanup = await executeCleanupPlan(cleanupPlan);
            if (shouldPrintCleanupSummary(cleanup)) {
                console.log(formatCleanupResult(cleanup));
            }

            const validation = await validateReleaseAssets({ release: updatedData });
            if (hasValidationIssues(validation)) {
                console.log(`[!] Saved changes to ${filePath}, but asset validation failed`);
                console.log(formatValidationReport(slug, validation));
                process.exitCode = 1;
                return;
            }

            if (cleanup.errors.length > 0) {
                process.exitCode = 1;
            }

            await clearEditDraft(slug);
            console.log(`[+] Saved changes to ${filePath}`);
            return;
        }

        if (action === 'metadata') {
            const newMeta = await stepMetadata();
            if (newMeta) {
                metadata = newMeta;
                links = syncTmdbLink(links, metadata.tmdb_id, metadata.media_type);
                await persistEditDraft(buildEditDraftState({
                    slug,
                    originalRelease,
                    metadata,
                    posterPath,
                    torrents,
                    specs,
                    links,
                    date,
                }));
            }
        } else if (action === 'poster') {
            posterPath = await stepPoster(await generateFreshPosterAssetId(posterPath));
            await persistEditDraft(buildEditDraftState({
                slug,
                originalRelease,
                metadata,
                posterPath,
                torrents,
                specs,
                links,
                date,
            }));
        } else if (action === 'torrents') {
            torrents = await stepTorrents();
            await persistEditDraft(buildEditDraftState({
                slug,
                originalRelease,
                metadata,
                posterPath,
                torrents,
                specs,
                links,
                date,
            }));
        } else if (action === 'specs') {
            specs = await stepSpecs();
            await persistEditDraft(buildEditDraftState({
                slug,
                originalRelease,
                metadata,
                posterPath,
                torrents,
                specs,
                links,
                date,
            }));
        } else if (action === 'links') {
            links = await stepLinks(metadata.tmdb_id, metadata.media_type);
            await persistEditDraft(buildEditDraftState({
                slug,
                originalRelease,
                metadata,
                posterPath,
                torrents,
                specs,
                links,
                date,
            }));
        }
    }
}

async function telegramPush() {
    console.log('\n=== Push to Telegram ===\n');

    const choices = await getReleases();
    if (choices.length === 0) {
        console.log('No releases found.');
        return;
    }

    const { data: releaseData } = await select({
        message: 'Select release to push:',
        choices
    });

    console.log(`\nSelected: ${releaseData.title} (${releaseData.slug})`);
    await stepTelegram(releaseData);
    await tempManager.cleanup();
}

async function auditAssets() {
    const records = await loadReleaseRecords();
    const report = await auditManagedAssets({
        releases: records.map((record) => record.data),
    });

    console.log(formatAuditReport(report));
    if (hasAuditIssues(report)) {
        process.exitCode = 1;
    }
}

async function pruneAssets() {
    const records = await loadReleaseRecords();
    const report = await auditManagedAssets({
        releases: records.map((record) => record.data),
    });

    console.log(formatAuditReport(report));

    if (report.orphanedFiles.length === 0) {
        console.log('[i] No orphaned assets to prune');
        if (
            report.missingReferences.length > 0 ||
            report.malformedReferences.length > 0 ||
            report.derivedMismatches.length > 0
        ) {
            process.exitCode = 1;
        }
        return;
    }

    const shouldDelete = await confirm({
        message: `Delete ${report.orphanedFiles.length} orphaned asset(s)?`,
        default: false,
    });
    if (!shouldDelete) {
        console.log('[i] Prune cancelled');
        process.exitCode = 1;
        return;
    }

    const cleanup = await pruneOrphanedAssets({
        orphanedFiles: report.orphanedFiles,
    });
    console.log(formatCleanupResult(cleanup));

    if (cleanup.errors.length > 0) {
        process.exitCode = 1;
        return;
    }

    if (
        report.missingReferences.length > 0 ||
        report.malformedReferences.length > 0 ||
        report.derivedMismatches.length > 0
    ) {
        process.exitCode = 1;
    }
}

async function backfillCardPosters() {
    const records = await loadReleaseRecords();
    if (records.length === 0) {
        console.log('[i] No releases found');
        return;
    }

    let generated = 0;

    for (const record of records) {
        const assetId = getPosterAssetId(record.data.poster);
        if (!assetId) {
            console.log(`[!] Skipping ${record.slug}: malformed poster path ${record.data.poster}`);
            process.exitCode = 1;
            continue;
        }

        const sourcePosterPath = path.join(STATIC_PATH, 'posters', `${assetId}.avif`);
        const cardPosterPath = path.join(STATIC_PATH, 'posters', `${assetId}.card.avif`);

        if (!await fileExists(sourcePosterPath)) {
            console.log(`[!] Skipping ${record.slug}: missing source poster ${sourcePosterPath}`);
            process.exitCode = 1;
            continue;
        }

        if (await fileExists(cardPosterPath)) {
            continue;
        }

        await backfillCardPoster(sourcePosterPath, assetId);
        generated += 1;
    }

    console.log(`[✓] Generated ${generated} card poster asset(s)`);

    const report = await auditManagedAssets({
        releases: records.map((record) => record.data),
    });
    console.log(formatAuditReport(report));

    const hasPosterRelatedIssues =
        report.missingReferences.some((issue) => issue.kind === 'poster' || issue.kind === 'og') ||
        report.malformedReferences.some((issue) => issue.kind === 'poster' || issue.kind === 'og') ||
        report.derivedMismatches.some((issue) => issue.kind === 'poster' || issue.kind === 'og') ||
        report.orphanedFiles.some((issue) => issue.kind === 'poster' || issue.kind === 'og');

    if (hasPosterRelatedIssues) {
        process.exitCode = 1;
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
        const records = await loadReleaseRecords();
        const record = records.find((entry) => entry.slug === slug);

        const shouldDelete = await confirm({ message: `Delete release ${slug}? This cannot be undone.`, default: false });
        if (!shouldDelete) {
            return;
        }

        await fs.unlink(targetPath);
        console.log(`[+] Deleted ${targetPath}`);

        if (!record) {
            console.log('[!] Could not parse release file, deleted the .ts file only');
            process.exitCode = 1;
            return;
        }

        const remainingReleases = records
            .filter((entry) => entry.slug !== slug)
            .map((entry) => entry.data);
        const cleanupPlan = planReleaseAssetCleanup({
            release: record.data,
            remainingReleases,
        });
        const cleanup = await executeCleanupPlan(cleanupPlan);
        if (shouldPrintCleanupSummary(cleanup)) {
            console.log(formatCleanupResult(cleanup));
        }
        if (cleanup.errors.length > 0) {
            process.exitCode = 1;
        }

        console.log(`[✓] Release ${slug} fully deleted`);
    } catch {
        console.log(`[!] Release ${slug} not found`);
        process.exitCode = 1;
    }
}

async function deploy() {
    console.log('\n=== Deploy to Cloudflare ===\n');
    const config = getCliConfig();
    const preflightIssues = getDeployPreflightIssues(config);
    if (hasDeployPreflightIssues(preflightIssues)) {
        console.log(formatDeployPreflightIssues(preflightIssues));
        process.exitCode = 1;
        return;
    }
    try {
        console.log('[1/3] Building project...');
        await exec('npm run build');
        console.log('[+] Build complete.');

        console.log('[2/3] Ensuring Cloudflare Pages project exists...');
        const projectStatus = await ensurePagesProject(
            exec,
            config.cloudflarePagesProject,
            config.cloudflareProductionBranch,
        );
        if (projectStatus === 'created') {
            console.log('[+] Project created.');
        } else {
            console.log('[i] Project already exists.');
        }

        console.log('[3/3] Deploying (Direct Upload)...');
        await exec(getDeployCommand(config.cloudflarePagesProject, 'build'));
        console.log('[+] Deployment initiated!');
    } catch (e) {
        console.error('[!] Deployment failed:', e);
        process.exitCode = 1;
    }
}

async function main() {
    const resolved = resolveCliCommand(process.argv.slice(2));
    const command = resolved.command;
    const args = resolved.args;

    switch (command) {
        case 'create':
            await create();
            break;
        case 'delete':
            await deleteRelease(args[0]);
            break;
        case 'deploy':
            await deploy();
            break;
        case 'edit':
            await edit();
            break;
        case 'telegram':
            await telegramPush();
            break;
        case 'audit-assets':
            await auditAssets();
            break;
        case 'prune-assets':
            await pruneAssets();
            break;
        case 'backfill-card-posters':
            await backfillCardPosters();
            break;
        case 'help':
            console.log(getCliUsage());
            break;
        default:
            console.log(`[!] Unknown command: ${command}`);
            console.log(getCliUsage());
            process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
