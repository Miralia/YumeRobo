/**
 * BBCode to HTML converter for Tech Info specs.
 *
 * Forum posts are an untrusted author's markup that ends up in the release
 * file and is injected with `{@html}`, so this converter is a parser rather
 * than a chain of regex replacements:
 *
 *  - every text node and attribute value is HTML-escaped,
 *  - link targets must be absolute http(s) URLs (no `javascript:`/`data:`),
 *  - opening and closing tags are matched, so a bare `[quote]` can never emit
 *    an unbalanced `</div>`,
 *  - `[code]`/`[pre]` bodies are emitted as literal escaped text and are not
 *    re-parsed as BBCode.
 */
import type { SpecEntry } from './types';

type BbNode =
    | { type: 'text'; value: string }
    | { type: 'tag'; tag: string; value?: string; children: BbNode[] };

interface BbFrame {
    tag: string;
    value?: string;
    children: BbNode[];
}

/** Tags this converter understands; anything else is left as literal text. */
const KNOWN_TAGS = new Set([
    'b', 'strong', 'i', 'em', 'u', 's', 'strike',
    'url', 'email', 'img',
    'quote', 'spoiler',
    'code', 'pre',
    'color', 'size', 'font',
    'list', '*', 'hr',
]);

/** `[tag]`, `[tag=value]` and `[/tag]`. Attribute values cannot contain `]`. */
const TAG_RE = /\[(\/?)([a-zA-Z*]+)(?:=([^\]]*))?\]/g;

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Only absolute http(s) links are renderable. A rejected target keeps the
 * link text but drops the anchor, so `[url=javascript:...]click[/url]`
 * degrades to plain "click".
 */
function sanitizeHref(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
        return trimmed;
    } catch {
        return null;
    }
}

function parseNodes(input: string): BbNode[] {
    const root: BbNode[] = [];
    const stack: BbFrame[] = [];
    const sink = (): BbNode[] => (stack.length > 0 ? stack[stack.length - 1].children : root);

    let lastIndex = 0;
    let match: RegExpExecArray | null;
    TAG_RE.lastIndex = 0;

    while ((match = TAG_RE.exec(input)) !== null) {
        const [raw, closing, rawTag, value] = match;
        const tag = rawTag.toLowerCase();
        if (!KNOWN_TAGS.has(tag)) continue;

        if (match.index > lastIndex) {
            sink().push({ type: 'text', value: input.slice(lastIndex, match.index) });
        }
        lastIndex = match.index + raw.length;

        if (!closing) {
            if (tag === 'code' || tag === 'pre') {
                // Code bodies are literal: capture the raw source up to the
                // matching close tag instead of parsing BBCode inside it, so
                // `[code][b]x[/b][/code]` keeps its brackets.
                const closeToken = `[/${tag}]`;
                const closeIndex = input.toLowerCase().indexOf(closeToken, lastIndex);
                const end = closeIndex === -1 ? input.length : closeIndex;
                if (end > lastIndex) {
                    sink().push({ type: 'text', value: input.slice(lastIndex, end) });
                }
                lastIndex = closeIndex === -1 ? input.length : closeIndex + closeToken.length;
                TAG_RE.lastIndex = lastIndex;
                continue;
            }

            stack.push({ tag, value, children: [] });
            continue;
        }

        const openIndex = stack.findLastIndex((frame) => frame.tag === tag);
        if (openIndex === -1) continue; // stray closing tag: drop it

        // Implicitly close anything left open inside the matched element.
        while (stack.length > openIndex) {
            const frame = stack.pop()!;
            sink().push({
                type: 'tag',
                tag: frame.tag,
                value: frame.value,
                children: frame.children,
            });
        }
    }

    if (lastIndex < input.length) {
        sink().push({ type: 'text', value: input.slice(lastIndex) });
    }
    while (stack.length > 0) {
        const frame = stack.pop()!;
        sink().push({
            type: 'tag',
            tag: frame.tag,
            value: frame.value,
            children: frame.children,
        });
    }

    return root;
}

/** Raw text of a subtree, used for `[code]`/`[pre]` bodies and link labels. */
function collectText(nodes: BbNode[]): string {
    return nodes
        .map((node) => (node.type === 'text' ? node.value : collectText(node.children)))
        .join('');
}

function renderNodes(nodes: BbNode[]): string {
    return nodes.map(renderNode).join('');
}

function renderNode(node: BbNode): string {
    if (node.type === 'text') return escapeHtml(node.value);

    switch (node.tag) {
        case 'b':
        case 'strong':
            return `<strong>${renderNodes(node.children)}</strong>`;
        case 'i':
        case 'em':
            return `<em>${renderNodes(node.children)}</em>`;
        case 'u':
            return `<u>${renderNodes(node.children)}</u>`;
        case 's':
        case 'strike':
            return `<s>${renderNodes(node.children)}</s>`;
        case 'code':
        case 'pre':
            // Only reachable for an unbalanced `[code]`; balanced bodies are
            // captured as literal text by the tokenizer.
            return escapeHtml(collectText(node.children));
        case 'img':
            return '';
        case 'url': {
            const label = collectText(node.children).trim();
            const href = sanitizeHref(node.value ?? label);
            const inner = renderNodes(node.children) || escapeHtml(label);
            if (!href) return inner;
            return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener" class="spec-link">${inner}</a>`;
        }
        case 'email':
            return renderNodes(node.children);
        case 'quote':
        case 'spoiler': {
            const title = node.value?.trim()
                ? `<div class="inner-quote-title">${escapeHtml(node.value.trim())}</div>`
                : '';
            return `<div class="inner-quote">${title}<div class="inner-quote-content">${renderNodes(node.children)}</div></div>`;
        }
        case 'color':
        case 'size':
        case 'font':
            return renderNodes(node.children);
        case '*':
            return `• ${renderNodes(node.children)}`;
        case 'list':
        case 'hr':
            return renderNodes(node.children);
        default:
            return renderNodes(node.children);
    }
}

/**
 * Parse BBCode input and extract the outermost `[quote=Title]` / `[spoiler]`
 * blocks as spec entries. Text outside those blocks is ignored, matching the
 * "paste a forum post" workflow.
 */
export function parseBBCodeSpecs(input: string): SpecEntry[] {
    const specs: SpecEntry[] = [];

    for (const node of parseNodes(input)) {
        if (node.type !== 'tag') continue;
        if (node.tag !== 'quote' && node.tag !== 'spoiler') continue;

        specs.push({
            title: (node.value ?? '').trim(),
            content: renderNodes(node.children).trim(),
        });
    }

    return specs;
}
