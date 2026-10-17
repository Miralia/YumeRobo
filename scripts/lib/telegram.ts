/**
 * Telegram Bot API Integration
 * Sends release announcements to Telegram channel
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseMediaInfo, toStructured } from '../../src/lib/utils/mediainfo-parser';
import { getUniqueLanguageFlags } from '../../src/lib/utils/language-flags';
import type { ReleaseData } from './types';
import { classifyTorrentTelegramLabel } from './torrent-label';

const TELEGRAM_API = 'https://api.telegram.org/bot';

// Telegram supported image formats
const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

/** Bot API hard limit for photo captions. */
const TELEGRAM_CAPTION_LIMIT = 1024;

/** MediaInfo hashes are generated ids; anything else must not reach path.join. */
const MEDIAINFO_HASH_RE = /^[a-z0-9]+$/;

/** Retry waits are capped so a hostile Retry-After cannot stall the CLI. */
const MAX_RETRY_DELAY_MS = 30_000;
const RETRY_JITTER_MS = 1_000;

/**
 * Strip the bot token from any message that can reach the caller.
 * The token is embedded in the request URL, so transport errors leak it.
 */
function redactToken(message: string, token: string): string {
    let result = message;
    if (token.length >= 8) result = result.split(token).join('[redacted]');
    return result.replace(/bot\d{6,}:[A-Za-z0-9_-]+/g, 'bot[redacted]');
}

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

function getTorrentTelegramLabel(torrent: ReleaseData['torrents'][number]): string {
    if (torrent.telegram_label?.trim()) return torrent.telegram_label.trim();
    const classification = classifyTorrentTelegramLabel(torrent.name);
    return classification.label || torrent.display_name || 'MediaInfo';
}

/**
 * Build Telegram caption from release data
 */
export async function buildCaption(
    release: ReleaseData,
    comparisonsLink: string,
    siteUrl: string
): Promise<string> {
    const lines: string[] = [];

    // Title + Season (bold)
    const season = release.season ? ` S${String(release.season).padStart(2, '0')}` : '';
    lines.push(`**${escapeMarkdown(`${release.title}${season}`)}**`);
    lines.push('');

    // Subtitles - extract from first MediaInfo of first torrent
    const firstTorrent = release.torrents[0];
    const firstHash = firstTorrent?.mediainfo?.[0]?.raw_hash;
    if (firstTorrent?.mediainfo?.length > 0 && typeof firstHash === 'string' && MEDIAINFO_HASH_RE.test(firstHash)) {
        try {
            const rawPath = path.join(process.cwd(), 'static', 'mediainfo', firstHash);
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

    // Combine all torrent MediaInfo links into one compact line.
    const linkParts: string[] = [];
    for (const torrent of release.torrents) {
        if (torrent.mediainfo.length > 0) {
            const miUrl = `${siteUrl}/mediainfo/${torrent.mediainfo[0].raw_hash}`;
            linkParts.push(`[${escapeMarkdown(getTorrentTelegramLabel(torrent))}](${escapeMarkdown(miUrl)})`);
        }
    }
    if (comparisonsLink) {
        linkParts.push(`[Comparisons](${escapeMarkdown(comparisonsLink)})`);
    }
    if (linkParts.length > 0) {
        lines.push(linkParts.join(' \\| '));
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
 * Backoff for one retry: honour an explicit `retry_after` (including 0), cap
 * the wait and add jitter so parallel senders do not retry in lockstep.
 */
export function computeRetryDelayMs(
    attempt: number,
    retryAfterSeconds?: number,
    random: () => number = Math.random,
): number {
    const hasRetryAfter =
        typeof retryAfterSeconds === 'number' &&
        Number.isFinite(retryAfterSeconds) &&
        retryAfterSeconds >= 0;

    const base = hasRetryAfter
        ? retryAfterSeconds * 1000  // Telegram-specified delay
        : Math.pow(2, attempt - 1) * 1000;  // Exponential backoff: 1s, 2s, 4s

    const capped = Math.min(Math.max(base, 0), MAX_RETRY_DELAY_MS);
    const jitter = capped === 0 ? 0 : Math.floor(random() * Math.min(RETRY_JITTER_MS, capped));
    return capped + jitter;
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
    if (caption.length > TELEGRAM_CAPTION_LIMIT) {
        return {
            ok: false,
            error: `Caption is ${caption.length} characters, over Telegram's ${TELEGRAM_CAPTION_LIMIT}-character limit`,
            retryable: false,
        };
    }

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

            let photoBuffer: Buffer;
            try {
                photoBuffer = await fs.readFile(photoSource);
            } catch (error) {
                // Local read failure (ENOENT/EISDIR): retrying cannot help.
                const detail = error instanceof Error ? error.message : String(error);
                return {
                    ok: false,
                    error: redactToken(`Cannot read poster ${photoSource}: ${detail}`, token),
                    retryable: false,
                };
            }

            const mimeType = getMimeType(ext);
            // `Buffer` widens to `Uint8Array<ArrayBufferLike>`, which is not a
            // `BlobPart` under the CLI's `esnext` lib; copy into a plain view.
            const file = new File([new Uint8Array(photoBuffer)], `poster.${ext}`, { type: mimeType });

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
            return {
                ok: false,
                error: redactToken(result.description || 'Unknown error', token),
                retryable,
                retryAfter,
            };
        }
    } catch (e) {
        // Transport errors, timeouts, etc. are retryable
        return { ok: false, error: redactToken(String(e), token), retryable: true };
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
        const delayMs = computeRetryDelayMs(attempt, result.retryAfter);

        console.log(`[i] Attempt ${attempt}/${maxRetries} failed: ${lastError}`);
        console.log(`[i] Retrying in ${(delayMs / 1000).toFixed(1)}s...`);

        await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    return { ok: false, error: lastError, attempts: maxRetries };
}
