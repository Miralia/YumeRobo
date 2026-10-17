/**
 * Code template generation for release entries.
 *
 * The generated module is written straight into `src/lib/content/releases/`,
 * so the emitter has to be both escaping-correct and syntactically exact:
 * a single unescaped line terminator or an unquoted key turns the release
 * file into a module that no longer parses, and the CLI overwrites the
 * previous file in place.
 */
import type { ReleaseData, SpecEntry } from './types';

/** Bare keys are only safe for real JavaScript identifiers. */
const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const INDENT = '    ';

function indent(level: number): string {
    return INDENT.repeat(level);
}

/** Join `entries` with commas inside an opening/closing line pair. */
function block(open: string, entries: string[], close: string): string {
    return [open, entries.join(',\n'), close].join('\n');
}

export function generateReleaseCode(data: ReleaseData): string {
    const fields: string[] = [];

    fields.push(`${indent(2)}slug: '${escapeString(data.slug)}'`);
    fields.push(`${indent(2)}title: '${escapeString(data.title)}'`);
    fields.push(`${indent(2)}date: '${escapeString(data.date)}'`);
    fields.push(`${indent(2)}tmdb_id: ${formatNumber(data.tmdb_id, 0)}`);
    fields.push(`${indent(2)}media_type: '${escapeString(data.media_type)}'`);

    if (data.special_type) {
        fields.push(`${indent(2)}special_type: '${escapeString(data.special_type)}'`);
    }

    // Season 0 is a real value (specials), so presence is tested by type
    // rather than truthiness.
    if (typeof data.season === 'number' && Number.isFinite(data.season)) {
        fields.push(`${indent(2)}season: ${data.season}`);
    }
    if (typeof data.badge_label === 'string' && data.badge_label) {
        fields.push(`${indent(2)}badge_label: '${escapeString(data.badge_label)}'`);
    }
    if (typeof data.is_complete === 'boolean') {
        fields.push(`${indent(2)}is_complete: ${data.is_complete}`);
    }

    fields.push(`${indent(2)}year: ${formatNumber(data.year, 0)}`);
    fields.push(`${indent(2)}poster: '${escapeString(data.poster)}'`);
    fields.push(renderTorrents(data.torrents));

    if (data.specs.length > 0) {
        fields.push(renderSpecs(data.specs));
    }

    const linkEntries = Object.entries(data.links);
    if (linkEntries.length > 0) {
        fields.push(
            block(
                `${indent(2)}links: {`,
                linkEntries.map(
                    ([key, value]) =>
                        `${indent(3)}${renderKey(key)}: '${escapeString(value)}'`,
                ),
                `${indent(2)}}`,
            ),
        );
    }

    // No trailing comma: the module is spliced directly into an assignment.
    return [`${INDENT}{`, fields.join(',\n'), `${INDENT}}`].join('\n');
}

function renderTorrents(torrents: ReleaseData['torrents']): string {
    const rendered = torrents.map((torrent) => {
        const torrentFields: string[] = [
            `${indent(4)}name: '${escapeString(torrent.name)}'`,
        ];

        if (torrent.telegram_label) {
            torrentFields.push(
                `${indent(4)}telegram_label: '${escapeString(torrent.telegram_label)}'`,
            );
        } else if (torrent.display_name) {
            // Preserve legacy data when an existing release is edited.
            torrentFields.push(
                `${indent(4)}display_name: '${escapeString(torrent.display_name)}'`,
            );
        }

        const files = torrent.files.map((file) => {
            if (typeof file === 'string') return `'${escapeString(file)}'`;
            const size = Number.isFinite(file.size)
                ? `, size: ${Math.trunc(file.size as number)}`
                : '';
            return `{ name: '${escapeString(torrentFileName(file))}'${size} }`;
        });
        torrentFields.push(`${indent(4)}files: [${files.join(', ')}]`);

        torrentFields.push(
            block(
                `${indent(4)}mediainfo: [`,
                torrent.mediainfo.map(
                    (entry) =>
                        `${indent(5)}{ filename: '${escapeString(entry.filename)}', raw_hash: '${escapeString(entry.raw_hash)}' }`,
                ),
                `${indent(4)}]`,
            ),
        );

        return block(`${indent(3)}{`, torrentFields, `${indent(3)}}`);
    });

    return block(`${indent(2)}torrents: [`, rendered, `${indent(2)}]`);
}

function renderSpecs(specs: SpecEntry[]): string {
    const rendered = specs.map((spec) => {
        const specFields = [
            `${indent(4)}title: '${escapeString(spec.title)}'`,
            `${indent(4)}content: \`${escapeTemplateString(spec.content)}\``,
        ];

        // `subitems` is consumed by the detail page and by the comparison
        // extractor, so dropping it here would silently destroy data on any
        // edit that does not touch the specs.
        if (spec.subitems && spec.subitems.length > 0) {
            specFields.push(
                block(
                    `${indent(4)}subitems: [`,
                    spec.subitems.map(
                        (item) =>
                            `${indent(5)}{ title: '${escapeString(item.title)}', content: \`${escapeTemplateString(item.content)}\` }`,
                    ),
                    `${indent(4)}]`,
                ),
            );
        }

        return block(`${indent(3)}{`, specFields, `${indent(3)}}`);
    });

    return block(`${indent(2)}specs: [`, rendered, `${indent(2)}]`);
}

function renderKey(key: string): string {
    return IDENTIFIER_RE.test(key) ? key : `'${escapeString(key)}'`;
}

/**
 * `name` is the persisted shape; drafts written by an older CLI version stored
 * the same value under `path`, so accept both rather than emitting an empty
 * file name.
 */
function torrentFileName(file: { name?: string }): string {
    return file.name ?? (file as { path?: string }).path ?? '';
}

function formatNumber(value: number, fallback: number): string {
    return Number.isFinite(value) ? String(value) : String(fallback);
}

/**
 * Escape a value for a single-quoted TypeScript string literal.
 *
 * Line terminators matter here: a raw CR/LF (or U+2028/U+2029) inside a
 * quoted literal is a syntax error, and the generated module replaces the
 * previous release file on disk.
 */
function escapeString(str: string | undefined | null): string {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
}

function escapeTemplateString(str: string | undefined | null): string {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$\{/g, '\\${');
}
