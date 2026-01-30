/**
 * BBCode to HTML parser for specs content
 * Handles nested [quote=] blocks - only extracts outermost layer
 */
import type { SpecEntry } from './types';

/**
 * Parse BBCode inner content to HTML
 */
function parseInnerBBCode(input: string): string {
    let result = input;

    // [url=...]...[/url] -> <a href="..." class="spec-link">...</a>
    result = result.replace(
        /\[url=([^\]]+)\]([^\[]*)\[\/url\]/gi,
        '<a href="$1" target="_blank" rel="noopener" class="spec-link">$2</a>'
    );

    // [url]...[/url] -> <a href="..." class="spec-link">...</a>
    result = result.replace(
        /\[url\]([^\[]*)\[\/url\]/gi,
        '<a href="$1" target="_blank" rel="noopener" class="spec-link">$1</a>'
    );

    // Nested [quote=...]...[/quote] -> <div class="inner-quote">...</div>
    // We treat them as simple blocks. Note: this simple regex replacement works for balanced structure 
    // because we operate on the inner content of an already extracted block.
    // However, since regex is non-recursive, we need to handle it carefully or assume standard nesting.

    // Replace [quote=Title] with opening divs
    result = result.replace(/\[quote=([^\]]+)\]/gi, '<div class="inner-quote"><div class="inner-quote-title">$1</div><div class="inner-quote-content">');
    // Replace [/quote] with closing divs
    result = result.replace(/\[\/quote\]/gi, '</div></div>');

    // [pre]...[/pre] -> keep content
    result = result.replace(/\[pre\]/gi, '');
    result = result.replace(/\[\/pre\]/gi, '');

    // [b]...[/b] -> <strong>...</strong>
    result = result.replace(/\[b\]([^\[]*)\[\/b\]/gi, '<strong>$1</strong>');

    // [i]...[/i] -> <em>...</em>
    result = result.replace(/\[i\]([^\[]*)\[\/i\]/gi, '<em>$1</em>');

    // [code]...[/code] -> keep content
    result = result.replace(/\[code\]/gi, '');
    result = result.replace(/\[\/code\]/gi, '');

    // [img]...[/img] -> remove
    result = result.replace(/\[img\][^\[]*\[\/img\]/gi, '');

    // [color=...]...[/color] -> remove tags
    result = result.replace(/\[color=[^\]]*\]/gi, '');
    result = result.replace(/\[\/color\]/gi, '');

    // [size=...]...[/size] -> remove tags
    result = result.replace(/\[size=[^\]]*\]/gi, '');
    result = result.replace(/\[\/size\]/gi, '');

    // [spoiler=Title]...[/spoiler] -> divs
    result = result.replace(/\[spoiler=([^\]]+)\]/gi, '<div class="inner-quote"><div class="inner-quote-title">$1</div><div class="inner-quote-content">');
    result = result.replace(/\[\/spoiler\]/gi, '</div></div>');

    return result.trim();
}

/**
 * Extract outermost [quote=Title] or [spoiler=Title] blocks only
 * Handles nested quotes/spoilers by counting open/close tags
 */
function extractOutermostQuotes(input: string): Array<{ title: string; content: string }> {
    const results: Array<{ title: string; content: string }> = [];
    let remaining = input;

    while (true) {
        // Find next [quote=Title] or [spoiler=Title]
        const openMatch = remaining.match(/\[(quote|spoiler)=([^\]]+)\]/i);
        if (!openMatch || openMatch.index === undefined) break;

        const tagName = openMatch[1].toLowerCase(); // 'quote' or 'spoiler'
        const title = openMatch[2].trim();
        const startIndex = openMatch.index + openMatch[0].length;

        // Define tags based on what we found
        const openTagStr = `[${tagName}`;
        const closeTagStr = `[/${tagName}]`;

        // Find matching closing tag by counting nested tags of the SAME type
        let depth = 1;
        let pos = startIndex;
        let endIndex = -1;

        while (pos < remaining.length && depth > 0) {
            const nextOpen = remaining.toLowerCase().indexOf(openTagStr, pos);
            const nextClose = remaining.toLowerCase().indexOf(closeTagStr, pos);

            if (nextClose === -1) break;

            if (nextOpen !== -1 && nextOpen < nextClose) {
                // Found another opening tag before closing
                depth++;
                pos = nextOpen + openTagStr.length;
            } else {
                // Found closing tag
                depth--;
                if (depth === 0) {
                    endIndex = nextClose;
                }
                pos = nextClose + closeTagStr.length;
            }
        }

        if (endIndex !== -1) {
            const content = remaining.substring(startIndex, endIndex);
            results.push({ title, content });
            remaining = remaining.substring(pos);
        } else {
            // Unbalanced or broken, skip this start and try to find next
            remaining = remaining.substring(startIndex);
        }
    }

    return results;
}

/**
 * Parse BBCode input and extract outermost [quote=Title]...[/quote] blocks as spec entries
 */
export function parseBBCodeSpecs(input: string): SpecEntry[] {
    const blocks = extractOutermostQuotes(input);

    return blocks.map(block => ({
        title: block.title,
        content: parseInnerBBCode(block.content)
    }));
}
