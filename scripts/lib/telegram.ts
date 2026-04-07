/**
 * Telegram Bot API Integration
 * Sends release announcements to Telegram channel
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseMediaInfo, toStructured } from '../../src/lib/utils/mediainfo-parser';
import { getUniqueLanguageFlags } from '../../src/lib/utils/language-flags';
import type { ReleaseData } from './types';

const TELEGRAM_API = 'https://api.telegram.org/bot';
const SITE_URL = 'https://yumerobo.moe';

// Telegram supported image formats
const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

/**
 * Get MIME type for supported formats
 */
function getMimeType(ext: string): string {
    const mimeMap: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
    };
    return mimeMap[ext.toLowerCase()] || 'image/jpeg';
}

/**
 * Check if file format is supported by Telegram
 */
export function isSupportedFormat(filePath: string): boolean {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    return SUPPORTED_FORMATS.includes(ext);
}

/**
 * Escape special characters for MarkdownV2
 */
function escapeMarkdown(text: string): string {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

/**
 * Group keywords to auto-bold in display names
 */
const GROUP_KEYWORDS = [
    'Natuyuki', 'NTYK',
    'Kawatare', 'KWTR',
    'Tasokare', 'TSKR'
];

/**
 * Format display name with auto-bolded group names
 * Input: "KWTR BD 1080p FLAC x265"
 * Output: "**KWTR** BD 1080p FLAC x265" (with escape)
 */
function formatDisplayName(displayName: string): string {
    let result = displayName;

    // Replace group keywords with bold version
    for (const keyword of GROUP_KEYWORDS) {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
        result = result.replace(regex, `**$1**`);
    }

    // Escape everything except our bold markers
    // Split by ** markers, escape middle parts, rejoin
    const parts = result.split(/(\*\*[^*]+\*\*)/);
    return parts.map(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // Bold part: escape the inner text only
            const inner = part.slice(2, -2);
            return `**${escapeMarkdown(inner)}**`;
        }
        return escapeMarkdown(part);
    }).join('');
}

/**
 * Build Telegram caption from release data
 */
export async function buildCaption(
    release: ReleaseData,
    comparisonsLink: string
): Promise<string> {
    const lines: string[] = [];

    // Title + Season (bold)
    const title = release.title_zh || release.title;
    const season = release.season ? ` S${String(release.season).padStart(2, '0')}` : '';
    lines.push(`**${escapeMarkdown(`${title}${season}`)}**`);
    lines.push('');

    // Subtitles - extract from first MediaInfo of first torrent
    const firstTorrent = release.torrents[0];
    if (firstTorrent?.mediainfo?.length > 0) {
        const hash = firstTorrent.mediainfo[0].raw_hash;
        try {
            const rawPath = path.join(process.cwd(), 'static', 'mediainfo', hash);
            const rawContent = await fs.readFile(rawPath, 'utf-8');
            const structured = toStructured(parseMediaInfo(rawContent));
            const langs = structured.text?.map(t => t.language).filter(Boolean) || [];
            const flags = getUniqueLanguageFlags(langs as string[]).map(f => f.flag).join('');
            if (flags) {
                lines.push(`Subtitles: ${flags}`);
                lines.push('');
            }
        } catch (e) {
            // Ignore if MediaInfo not found
        }
    }

    // Each torrent
    for (const torrent of release.torrents) {
        lines.push('————————————');
        lines.push('');
        lines.push(formatDisplayName(torrent.display_name));

        // Links
        const linkParts: string[] = [];
        if (torrent.mediainfo.length > 0) {
            const miUrl = `${SITE_URL}/mediainfo/${torrent.mediainfo[0].raw_hash}`;
            linkParts.push(`[Mediainfo](${escapeMarkdown(miUrl)})`);
        }
        if (comparisonsLink) {
            linkParts.push(`[Comparisons](${escapeMarkdown(comparisonsLink)})`);
        }
        if (linkParts.length > 0) {
            lines.push(linkParts.join(' \\| '));
        }
        lines.push('');
    }

    return lines.join('\n');
}

/**
 * Classify whether an error is retryable based on HTTP status
 */
function isRetryableStatus(status: number): boolean {
    // 429 Too Many Requests, 5xx Server Errors
    return status === 429 || status >= 500;
}

/**
 * Send photo with caption and inline buttons to Telegram channel.
 * photoSource can be:
 *   - A URL string (passed directly to Telegram, which downloads it)
 *   - A local file path (uploaded via multipart form-data)
 */
export async function sendPhoto(
    token: string,
    chatId: string,
    photoSource: string,
    caption: string,
    buttons?: Array<{ text: string; url: string }>
): Promise<{ ok: boolean; messageId?: number; error?: string; retryable?: boolean; retryAfter?: number }> {
    try {
        const isUrl = photoSource.startsWith('http://') || photoSource.startsWith('https://');

        // Build inline keyboard if buttons provided
        let replyMarkup: object | undefined;
        if (buttons && buttons.length > 0) {
            replyMarkup = {
                inline_keyboard: [
                    buttons.map(btn => ({ text: btn.text, url: btn.url }))
                ]
            };
        }

        let response: Response;

        if (isUrl) {
            // For URL photos: use JSON body (avoids Bun FormData compatibility issues)
            const payload: Record<string, unknown> = {
                chat_id: chatId,
                photo: photoSource,
                caption,
                parse_mode: 'MarkdownV2'
            };
            if (replyMarkup) {
                payload.reply_markup = replyMarkup;
            }

            response = await fetch(`${TELEGRAM_API}${token}/sendPhoto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // For local files: must use multipart form-data upload
            const ext = photoSource.split('.').pop()?.toLowerCase() || '';
            if (!SUPPORTED_FORMATS.includes(ext)) {
                return { ok: false, error: `Unsupported format: ${ext}. Use JPG, PNG, GIF, or WEBP.`, retryable: false };
            }
            const photoBuffer = await fs.readFile(photoSource);
            const mimeType = getMimeType(ext);
            const file = new File([photoBuffer], `poster.${ext}`, { type: mimeType });

            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('photo', file);
            formData.append('caption', caption);
            formData.append('parse_mode', 'MarkdownV2');
            if (replyMarkup) {
                formData.append('reply_markup', JSON.stringify(replyMarkup));
            }

            response = await fetch(`${TELEGRAM_API}${token}/sendPhoto`, {
                method: 'POST',
                body: formData
            });
        }

        const result = await response.json() as {
            ok: boolean;
            result?: { message_id: number };
            description?: string;
            parameters?: { retry_after?: number };
        };

        if (result.ok) {
            return { ok: true, messageId: result.result?.message_id };
        } else {
            const retryable = isRetryableStatus(response.status);
            const retryAfter = result.parameters?.retry_after;
            return { ok: false, error: result.description || 'Unknown error', retryable, retryAfter };
        }
    } catch (e) {
        // Network errors, timeouts, etc. are retryable
        return { ok: false, error: String(e), retryable: true };
    }
}

/**
 * Send photo with automatic retry and exponential backoff
 */
export async function sendPhotoWithRetry(
    token: string,
    chatId: string,
    photoSource: string,
    caption: string,
    buttons?: Array<{ text: string; url: string }>,
    maxRetries: number = 3
): Promise<{ ok: boolean; messageId?: number; error?: string; attempts: number }> {
    let lastError = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const result = await sendPhoto(token, chatId, photoSource, caption, buttons);

        if (result.ok) {
            return { ok: true, messageId: result.messageId, attempts: attempt };
        }

        lastError = result.error || 'Unknown error';

        // Non-retryable error: return immediately
        if (!result.retryable) {
            return { ok: false, error: lastError, attempts: attempt };
        }

        // Last attempt: don't wait
        if (attempt === maxRetries) break;

        // Calculate delay
        const baseDelay = result.retryAfter
            ? result.retryAfter * 1000  // Telegram-specified delay
            : Math.pow(2, attempt - 1) * 1000;  // Exponential backoff: 1s, 2s, 4s

        console.log(`[i] Attempt ${attempt}/${maxRetries} failed: ${lastError}`);
        console.log(`[i] Retrying in ${(baseDelay / 1000).toFixed(0)}s...`);

        await new Promise(resolve => setTimeout(resolve, baseDelay));
    }

    return { ok: false, error: lastError, attempts: maxRetries };
}

