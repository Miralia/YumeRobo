/**
 * Interactive Prompts (Simplified, no emoji)
 */
import { input, select, confirm, editor } from '@inquirer/prompts';
import type { ReleaseData } from './types';

/**
 * Prompt for TMDB ID (optional, empty = search mode)
 * Supports generic ID "123" or explicit type "tv/123", "movie/123"
 */
export async function promptTMDBId(): Promise<string> {
    return input({
        message: 'TMDB ID (e.g. 12345 or tv/12345):',
        validate: (val) => {
            if (val === '') return true;
            // Allow "12345" or "movie/12345" or "tv/12345"
            return /^(?:(movie|tv)\/)?\d+$/.test(val) || 'Invalid format (use 12345 or tv/12345)';
        }
    });
}

/**
 * Prompt for search query
 */
export async function promptSearchQuery(): Promise<string> {
    return input({
        message: 'Search query:',
        validate: (val) => val.length > 0 || 'Query is required'
    });
}

/**
 * Prompt for manual metadata entry (fallback mode)
 */
export async function promptManualMetadata(): Promise<{
    title_en: string;
    title_zh: string;
    year: number;
    media_type: 'movie' | 'tv';
}> {
    const title_en = await input({
        message: 'English title:',
        validate: (val) => !!val || 'Required'
    });

    const title_zh = await input({
        message: 'Chinese title:',
        validate: (val) => !!val || 'Required'
    });

    const yearStr = await input({
        message: 'Year (YYYY):',
        default: new Date().getFullYear().toString(),
        validate: (val) => /^\d{4}$/.test(val) || 'Invalid year'
    });

    const media_type = await select({
        message: 'Media type:',
        choices: [
            { name: 'Movie', value: 'movie' as const },
            { name: 'TV', value: 'tv' as const }
        ]
    });

    return {
        title_en,
        title_zh,
        year: parseInt(yearStr),
        media_type
    };
}

/**
 * Prompt to confirm metadata
 */
export async function promptConfirmMetadata(): Promise<boolean> {
    return confirm({
        message: 'Use this metadata?',
        default: true
    });
}

/**
 * Prompt for poster input (required)
 */
export async function promptPoster(): Promise<string> {
    const method = await select({
        message: 'Poster source:',
        choices: [
            { name: 'URL (download)', value: 'url' },
            { name: 'Local file', value: 'local' }
        ]
    });

    const result = await input({
        message: method === 'url' ? 'Image URL:' : 'File path:',
        validate: (val) => !!val || 'Poster is required'
    });

    return method === 'local' ? result.trim().replace(/\\(.)/g, '$1') : result.trim();
}

/**
 * Prompt for torrent display name (for Telegram)
 */
export async function promptDisplayName(torrentName: string): Promise<string> {
    return input({
        message: 'Display name for Telegram (e.g. **KWTR** BD 1080p FLAC x265):',
        default: torrentName.substring(0, 50),
        validate: (val) => !!val.trim() || 'Display name is required'
    });
}

/**
 * Prompt for Comparisons link (for Telegram)
 */
export async function promptComparisons(): Promise<string> {
    return input({
        message: 'Comparisons link (slow.pics, optional):',
        default: ''
    });
}

/**
 * Prompt for Telegram image (file path or URL)
 */
export async function promptTelegramImage(): Promise<string> {
    return input({
        message: 'Telegram image (file path or URL):',
        validate: (val) => !!val.trim() || 'Image is required for Telegram'
    });
}

/**
 * Prompt for torrent file path
 */
export async function promptTorrentPath(): Promise<string> {
    const raw = await input({
        message: 'Torrent file path (.torrent):',
        validate: (val) => {
            if (!val) return 'Path is required';
            // Check extension on cleaned path
            const clean = val.trim().replace(/\\(.)/g, '$1');
            if (!clean.endsWith('.torrent')) return 'Must be a .torrent file';
            return true;
        }
    });
    return raw.trim().replace(/\\(.)/g, '$1');
}

/**
 * Prompt to add more items
 */
export async function promptAddMore(itemType: string): Promise<boolean> {
    return confirm({
        message: `Add another ${itemType}?`,
        default: false
    });
}

/**
 * Prompt for MediaInfo raw text (editor only)
 */
export async function promptMediaInfo(): Promise<string> {
    return editor({
        message: 'Paste MediaInfo content:'
    });
}

/**
 * Prompt for BBCode content (editor)
 */
export async function promptBBCode(): Promise<string> {
    return editor({
        message: 'Paste BBCode content:'
    });
}

/**
 * Prompt for BBCode spec entry
 */
export async function promptSpec(): Promise<{ title: string; bbcode: string }> {
    const title = await input({
        message: 'Spec title (e.g. "Info", "x265 log"):',
        validate: (val) => !!val || 'Required'
    });

    const bbcode = await editor({
        message: 'Paste BBCode content:'
    });

    return { title, bbcode };
}

/**
 * Prompt for external link
 */
export async function promptLink(): Promise<string> {
    return input({
        message: 'External link URL:',
        validate: (val) => {
            if (!val) return 'URL is required';
            try {
                new URL(val);
                return true;
            } catch {
                return 'Invalid URL';
            }
        }
    });
}

/**
 * Prompt for final confirmation before writing
 */
export async function promptFinalConfirm(): Promise<boolean> {
    return confirm({
        message: 'Write to sample-data.ts?',
        default: true
    });
}

/**
 * Display metadata summary (no emoji)
 */
/**
 * Prompt to refine metadata (media type, season, etc.)
 */
export async function promptRefineMetadata(
    initialType: 'movie' | 'tv',
    knownSeasonCount?: number
): Promise<{
    special_type?: 'tva' | 'ova' | 'ona' | 'special';
    season?: number;
    badge_label?: string;
    is_complete?: boolean;
}> {
    let special_type: 'tva' | 'ova' | 'ona' | 'special' | undefined;

    // 1. Optional Special Type Override
    const specialInput = await select({
        message: 'Is this a Special Type? (e.g. OVA/ONA)',
        default: 'none',
        choices: [
            { name: 'None (Keep TMDB Type)', value: 'none' },
            { name: 'TV Animation (TVA)', value: 'tva' },
            { name: 'OVA', value: 'ova' },
            { name: 'ONA', value: 'ona' },
            { name: 'Special', value: 'special' }
        ]
    });

    if (specialInput !== 'none') {
        special_type = specialInput as any;
    }

    let season: number | undefined;
    let is_complete: boolean | undefined;

    // 2. Season Logic
    // Only ask for season if TMDB type is TV (not for movies, even OVA/special)
    if (initialType === 'tv') {
        const seasonMsg = knownSeasonCount
            ? `Season Number (0 for none/single) [TMDB has ${knownSeasonCount}]:`
            : 'Season Number (0 for none/single):';

        const seasonStr = await input({
            message: seasonMsg,
            default: '1',
            validate: (val) => !isNaN(parseInt(val)) || 'Must be a number'
        });
        const seasonVal = parseInt(seasonStr);
        if (seasonVal > 0) {
            season = seasonVal;
        }

        is_complete = await confirm({
            message: 'Is this release complete? (Fin Badge)',
            default: false
        });
    }

    const badge_label = await input({
        message: 'Badge Suffix (optional, e.g. "Part 1"):',
    });

    return {
        special_type,
        season,
        is_complete,
        badge_label: badge_label.trim() || undefined
    };
}

/**
 * Display metadata summary (no emoji)
 */
export function displayMetadata(data: {
    title_en: string;
    title_zh: string;
    year: number;
    tmdb_id: number;
    media_type: string;
    season?: number;
    badge_label?: string;
    is_complete?: boolean;
}): void {
    console.log('\n--- Metadata ---');
    console.log(`  Title (EN): ${data.title_en}`);
    console.log(`  Title (ZH): ${data.title_zh}`);
    console.log(`  Year:       ${data.year}`);
    console.log(`  TMDB ID:    ${data.tmdb_id}`);
    console.log(`  Type:       ${data.media_type}`);
    if (data.season) console.log(`  Season:     ${data.season}`);
    if (data.badge_label) console.log(`  Badge:      ${data.badge_label}`);
    if (data.is_complete) console.log(`  Complete:   Yes`);
    console.log('----------------\n');
}
