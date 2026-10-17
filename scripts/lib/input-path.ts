/**
 * Normalize a path typed or dragged into a CLI prompt.
 *
 * Terminal emulators do not insert a path verbatim when a file is dropped:
 * they insert it *shell-escaped* (`/Users/me/My\ File.torrent`, `~/Downloads/…`)
 * and some wrap the whole thing in quotes (`'/Users/me/My File.torrent'`).
 * A previous version undid that escaping inline at each prompt, which broke
 * drag-and-drop as soon as one of those call sites was removed, so the rules
 * live in one place now.
 *
 * Escaping is only undone before a character a shell would actually escape,
 * and the literal interpretation is preferred whenever it exists on disk. That
 * keeps a path which legitimately contains backslashes — a Windows-style
 * `C:\Users\me\x.torrent` — intact.
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/** Characters a POSIX shell requires to be backslash-escaped. */
const SHELL_ESCAPABLE = new Set([
    ' ',
    '\t',
    "'",
    '"',
    '`',
    '(',
    ')',
    '[',
    ']',
    '{',
    '}',
    '&',
    ';',
    '|',
    '<',
    '>',
    '*',
    '?',
    '$',
    '!',
    '#',
    '~',
    '^',
    '\\',
]);

export function stripSurroundingQuotes(value: string): string {
    if (value.length >= 2) {
        const first = value[0];
        if ((first === "'" || first === '"') && value.endsWith(first)) {
            return value.slice(1, -1);
        }
    }
    return value;
}

/** Undo shell escaping: `\X` becomes `X` for escapable `X`, everything else is kept. */
export function unescapeShellPath(value: string): string {
    let result = '';
    for (let index = 0; index < value.length; index += 1) {
        const char = value[index];
        const next = value[index + 1];
        if (char === '\\' && next !== undefined && SHELL_ESCAPABLE.has(next)) {
            result += next;
            index += 1;
            continue;
        }
        result += char;
    }
    return result;
}

export function expandHome(value: string): string {
    if (value === '~') return os.homedir();
    if (value.startsWith('~/')) return path.join(os.homedir(), value.slice(2));
    return value;
}

/**
 * Every interpretation of the input, most literal first.
 */
export function inputPathCandidates(raw: string): string[] {
    const trimmed = raw.trim();
    if (!trimmed) return [];

    const unquoted = stripSurroundingQuotes(trimmed);
    const candidates = [
        trimmed,
        unquoted,
        unescapeShellPath(trimmed),
        unescapeShellPath(unquoted),
        expandHome(trimmed),
        expandHome(unquoted),
        expandHome(unescapeShellPath(unquoted)),
    ];

    return [...new Set(candidates)].filter((value) => value.length > 0);
}

async function exists(candidate: string): Promise<boolean> {
    try {
        await fs.access(candidate);
        return true;
    } catch {
        return false;
    }
}

/**
 * Resolve the input to a usable path: the literal interpretation when it
 * exists, otherwise the unescaped/unquoted one (which is what a dropped file
 * produces). When nothing exists the trimmed input is returned, so the error
 * the caller raises names what the user actually typed.
 */
export async function resolveInputPath(raw: string): Promise<string> {
    const candidates = inputPathCandidates(raw);
    if (candidates.length === 0) return '';

    for (const candidate of candidates) {
        if (await exists(candidate)) return candidate;
    }

    return candidates[0];
}

/** True when any interpretation ends with `extension`, case-insensitively. */
export function hasExtension(raw: string, extension: string): boolean {
    const suffix = extension.toLowerCase();
    return inputPathCandidates(raw).some((candidate) =>
        candidate.toLowerCase().endsWith(suffix),
    );
}
