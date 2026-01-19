/**
 * MediaInfo Text Parser
 * Parses MediaInfo --Output=Text into structured data
 * Auto-generates summary from parsed content
 */

/**
 * Represents a single section in MediaInfo Text output
 */
export interface MediaInfoSection {
    header: string;
    base: string;
    index?: number;
    data: Record<string, string | string[]>;
}

/**
 * Parsed MediaInfo structure
 */
export type MediaInfoParsed = Record<string, MediaInfoSection[]>;

/**
 * Structured MediaInfo output (similar to PHP reference)
 */
export interface MediaInfoStructured {
    general: {
        file_name?: string;
        format?: string;
        duration?: string;
        file_size?: string;
        bit_rate?: string;
    } | null;
    video: Array<{
        format?: string;
        format_profile?: string;
        codec?: string;
        width?: string;
        height?: string;
        bit_depth?: string;
        hdr_format?: string;
        transfer_characteristics?: string;
        frame_rate?: string;
        bit_rate?: string;
    }> | null;
    audio: Array<{
        format?: string;
        format_profile?: string;
        channels?: string;
        bit_rate?: string;
        title?: string;
        language?: string;
        commercial_name?: string;
    }> | null;
    text: Array<{
        format?: string;
        title?: string;
        language?: string;
    }> | null;
}

/**
 * Parse MediaInfo --Output=Text into a structured object.
 */
export function parseMediaInfo(text: string): MediaInfoParsed {
    if (!text) return {};

    const looksEscaped = /\\n/.test(text);
    const normalized = (looksEscaped ? text.replace(/\\n/g, '\n') : text)
        .replace(/\r\n?/g, '\n')
        .replace(/\xc2\xa0/g, ' ')
        .trim();

    const blocks = normalized.split(/\n\s*\n+/);
    const result: MediaInfoParsed = {};

    for (const block of blocks) {
        const lines = block
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
        if (!lines.length) continue;

        const header = lines[0];
        const match = header.match(/^(.+?)\s*(?:#(\d+))?$/);
        const base = match?.[1]?.trim() ?? header;
        const index = match?.[2] ? Number(match[2]) : undefined;

        const data: Record<string, string | string[]> = {};

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.includes(':')) continue;

            const [rawKey, ...rest] = line.split(':');
            const key = rawKey.trim();
            const value = rest.join(':').trim();

            if (!key) continue;

            if (key in data) {
                const existing = data[key];
                data[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
            } else {
                data[key] = value;
            }
        }

        const section: MediaInfoSection = { header, base, index, data };
        (result[base] ??= []).push(section);
    }

    return result;
}

/**
 * Get first string value from data field
 */
function getFirst(value: string | string[] | undefined): string | undefined {
    if (!value) return undefined;
    return Array.isArray(value) ? value[0] : value;
}

/**
 * Convert parsed MediaInfo to structured format
 */
export function toStructured(parsed: MediaInfoParsed): MediaInfoStructured {
    const general = parsed['General']?.[0];
    const videos = parsed['Video'] ?? [];
    const audios = (parsed['Audio'] ?? []).concat(
        Object.keys(parsed)
            .filter((k) => k.startsWith('Audio #'))
            .flatMap((k) => parsed[k])
    );
    const texts = (parsed['Text'] ?? []).concat(
        Object.keys(parsed)
            .filter((k) => k.startsWith('Text #'))
            .flatMap((k) => parsed[k])
    );

    return {
        general: general
            ? {
                file_name: getFirst(general.data['Complete name']),
                format: getFirst(general.data['Format']),
                duration: getFirst(general.data['Duration']),
                file_size: getFirst(general.data['File size']),
                bit_rate: getFirst(general.data['Overall bit rate'])
            }
            : null,
        video: videos.length
            ? videos.map((v) => ({
                format: getFirst(v.data['Format']),
                format_profile: getFirst(v.data['Format profile']),
                codec: getFirst(v.data['Codec ID']),
                width: getFirst(v.data['Width']),
                height: getFirst(v.data['Height']),
                bit_depth: getFirst(v.data['Bit depth']),
                hdr_format: getFirst(v.data['HDR format']),
                transfer_characteristics: getFirst(v.data['Transfer characteristics']),
                frame_rate: getFirst(v.data['Frame rate']),
                bit_rate: getFirst(v.data['Bit rate'])
            }))
            : null,
        audio: audios.length
            ? audios.map((a) => ({
                format: getFirst(a.data['Format']),
                format_profile: getFirst(a.data['Format profile']),
                channels: getFirst(a.data['Channel(s)']),
                bit_rate: getFirst(a.data['Bit rate']),
                title: getFirst(a.data['Title']),
                language: getFirst(a.data['Language']),
                commercial_name: getFirst(a.data['Commercial name'])
            }))
            : null,
        text: texts.length
            ? texts.map((t) => ({
                format: getFirst(t.data['Format']),
                title: getFirst(t.data['Title']),
                language: getFirst(t.data['Language'])
            }))
            : null
    };
}

/**
 * Parse audio channels string (e.g., "6 channels" -> "5.1ch")
 */
function parseChannels(channelStr?: string): string {
    if (!channelStr) return '';
    const num = parseInt(channelStr.replace(/[^\d]/g, ''), 10);
    if (isNaN(num)) return channelStr;

    switch (num) {
        case 1:
            return '1.0';
        case 2:
            return '2.0';
        case 6:
            return '5.1';
        case 7:
            return '6.1';
        case 8:
            return '7.1';
        default:
            return `${num}ch`;
    }
}

/**
 * Get resolution string from width/height
 */
function getResolution(width?: string, height?: string): string {
    if (!height) return '';
    const h = parseInt(height.replace(/[^\d]/g, ''), 10);
    if (isNaN(h)) return '';

    if (h >= 2160) return '4K';
    if (h >= 1080) return '1080p';
    if (h >= 720) return '720p';
    if (h >= 576) return '576p';
    if (h >= 480) return '480p';
    return `${h}p`;
}

/**
 * Check if video has HDR
 */
function getHDRInfo(video: MediaInfoStructured['video']): string {
    if (!video?.length) return '';
    const v = video[0];

    if (v.hdr_format) {
        if (v.hdr_format.toLowerCase().includes('dolby vision')) return 'DV';
        if (v.hdr_format.toLowerCase().includes('hdr10+')) return 'HDR10+';
        if (v.hdr_format.toLowerCase().includes('hdr10')) return 'HDR10';
        if (v.hdr_format.toLowerCase().includes('hlg')) return 'HLG';
        return 'HDR';
    }

    const transfer = v.transfer_characteristics?.toLowerCase() ?? '';
    if (transfer.includes('pq') || transfer.includes('smpte st 2084')) return 'HDR10';
    if (transfer.includes('hlg')) return 'HLG';

    return '';
}

/**
 * Get unique languages from text tracks
 */
function getSubtitleLanguages(texts: MediaInfoStructured['text']): string[] {
    if (!texts?.length) return [];

    const languages = new Set<string>();
    for (const t of texts) {
        if (t.language) {
            // Extract just the language name (before any parentheses)
            const lang = t.language.split('(')[0].trim();
            languages.add(lang);
        }
    }
    return Array.from(languages);
}

/**
 * Generate a summary from structured MediaInfo
 * Format: "HEVC 10-bit 1080p HDR10+ | Atmos + FLAC | 18 Subs (zh, en, ja...)"
 */
export function generateSummary(structured: MediaInfoStructured): string {
    const parts: string[] = [];

    // Video info
    if (structured.video?.length) {
        const v = structured.video[0];
        const videoParts: string[] = [];

        // Codec
        if (v.format) {
            videoParts.push(v.format);
        }

        // Bit depth
        if (v.bit_depth && !v.bit_depth.includes('8')) {
            videoParts.push(v.bit_depth.replace(' bits', '-bit').replace(' bit', '-bit'));
        }

        // Resolution
        const res = getResolution(v.width, v.height);
        if (res) videoParts.push(res);

        // HDR
        const hdr = getHDRInfo(structured.video);
        if (hdr) videoParts.push(hdr);

        if (videoParts.length) {
            parts.push(videoParts.join(' '));
        }
    }

    // Audio info
    if (structured.audio?.length) {
        const audioFormats: string[] = [];

        for (const a of structured.audio) {
            let audioDesc = '';

            // Use commercial name if available (e.g., "Dolby Digital Plus with Dolby Atmos")
            if (a.commercial_name?.toLowerCase().includes('atmos')) {
                audioDesc = 'Atmos';
            } else if (a.commercial_name?.toLowerCase().includes('truehd')) {
                audioDesc = 'TrueHD';
            } else if (a.commercial_name?.toLowerCase().includes('dts')) {
                audioDesc = a.commercial_name.includes('HD') ? 'DTS-HD MA' : 'DTS';
            } else if (a.format) {
                // Simplify format names
                const fmt = a.format.toUpperCase();
                if (fmt.includes('E-AC-3') || fmt.includes('EAC3')) {
                    audioDesc = 'DD+';
                } else if (fmt.includes('AC-3') || fmt === 'AC3') {
                    audioDesc = 'DD';
                } else if (fmt.includes('AAC')) {
                    audioDesc = 'AAC';
                } else if (fmt.includes('FLAC')) {
                    audioDesc = 'FLAC';
                } else if (fmt.includes('OPUS')) {
                    audioDesc = 'Opus';
                } else if (fmt.includes('TRUEHD')) {
                    audioDesc = 'TrueHD';
                } else if (fmt.includes('DTS')) {
                    audioDesc = 'DTS';
                } else {
                    audioDesc = a.format;
                }
            }

            // Add channels
            const ch = parseChannels(a.channels);
            if (ch && audioDesc) {
                audioDesc += ` ${ch}`;
            }

            if (audioDesc && !audioFormats.includes(audioDesc)) {
                audioFormats.push(audioDesc);
            }
        }

        if (audioFormats.length) {
            // Show up to 2 unique audio formats
            parts.push(audioFormats.slice(0, 2).join(' + '));
        }
    }

    // Subtitle info
    if (structured.text?.length) {
        const count = structured.text.length;
        const langs = getSubtitleLanguages(structured.text);

        let subInfo = `${count} Sub${count !== 1 ? 's' : ''}`;
        if (langs.length > 0 && langs.length <= 4) {
            subInfo += ` (${langs.join(', ')})`;
        } else if (langs.length > 4) {
            subInfo += ` (${langs.slice(0, 3).join(', ')}...)`;
        }
        parts.push(subInfo);
    }

    return parts.join(' | ');
}

/**
 * Parse raw MediaInfo text and generate summary
 */
export function parseAndSummarize(rawText: string): {
    parsed: MediaInfoParsed;
    structured: MediaInfoStructured;
    summary: string;
} {
    const parsed = parseMediaInfo(rawText);
    const structured = toStructured(parsed);
    const summary = generateSummary(structured);
    return { parsed, structured, summary };
}
