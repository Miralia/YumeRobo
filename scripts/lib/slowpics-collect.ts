/**
 * Slow.pics collection collector.
 *
 * slow.pics serves the entire comparison collection as `var collection = {...};`
 * embedded in the server-rendered HTML. Headless-Chromium requests are detected
 * and get the source IP banned, so instead of driving a browser we fetch the
 * document with real-browser request headers and parse the embedded JSON out of
 * the page. No browser process, no automation fingerprint.
 *
 * Override the presented browser identity with SLOWPICS_USER_AGENT if you want
 * the requests to look exactly like your daily browser.
 */

import { validateSlowPicsCollection, type SlowPicsCollection } from "./comparisons";

export interface SlowPicsCollector {
  collect(url: string, expectedKey: string): Promise<SlowPicsCollection>;
  close(): Promise<void>;
}

/** Default identity: current stable Chrome on macOS. */
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function simulatedChromeHeaders(): Record<string, string> {
  return {
    "User-Agent": process.env.SLOWPICS_USER_AGENT || DEFAULT_USER_AGENT,
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "max-age=0",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="131", "Google Chrome";v="131"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
  };
}

/** Script markers that introduce the embedded collection JSON. */
const COLLECTION_MARKERS = ["var collection = ", "window.collection = "];

/** Only the canonical slow.pics hosts may be fetched. */
const SLOWPICS_HOSTS = new Set(["slow.pics", "www.slow.pics"]);

/** Upper bound on the fetched document, so a hostile/huge page cannot exhaust memory. */
const MAX_HTML_BYTES = 8 * 1024 * 1024;

/**
 * Raised when the page carries the collection marker but the payload is not
 * valid JSON — a parse failure, not a blocked/challenged request.
 */
export class SlowPicsPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SlowPicsPayloadError";
  }
}

/**
 * Extract the `collection` JSON object from a slow.pics document.
 * Uses brace matching that skips string literals (single/double quotes and
 * backticks) plus line and block comments, so braces in either cannot shift
 * the depth. Returns null when the page does not carry the collection payload
 * (missing/blocked/challenged) and throws `SlowPicsPayloadError` when the
 * payload is present but unparseable.
 */
export function extractCollectionFromHtml(html: string): unknown {
  const marker = COLLECTION_MARKERS.find((candidate) => html.includes(candidate));
  if (!marker) return null;

  const braceStart = html.indexOf("{", html.indexOf(marker));
  if (braceStart === -1) return null;

  let depth = 0;
  let quote: '"' | "'" | "`" | null = null;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = braceStart; i < html.length; i++) {
    const ch = html[i];
    const next = html[i + 1];

    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "/" && next === "/") {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        const json = html.slice(braceStart, i + 1);
        try {
          return JSON.parse(json);
        } catch (error) {
          throw new SlowPicsPayloadError(
            `embedded slow.pics collection is not valid JSON: ${error instanceof Error ? error.message : error}`,
          );
        }
      }
    }
  }
  return null;
}

/** Reject anything that is not an https slow.pics URL. */
function assertSlowPicsUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid slow.pics URL: ${url}`);
  }
  if (parsed.protocol !== "https:" || !SLOWPICS_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw new Error(`Refusing to fetch a non-slow.pics URL: ${url}`);
  }
  return parsed;
}

/** Read a response body as text, aborting past `maxBytes`. */
async function readCappedText(response: Response, maxBytes: number): Promise<string> {
  const body = response.body;
  if (!body) return "";

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error(`slow.pics response exceeds ${maxBytes} bytes`);
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }

  return text + decoder.decode();
}

export async function createSlowPicsCollector(): Promise<SlowPicsCollector> {
  return {
    async collect(url: string, expectedKey: string): Promise<SlowPicsCollection> {
      const target = assertSlowPicsUrl(url);
      const response = await fetch(target, {
        redirect: "follow",
        headers: simulatedChromeHeaders(),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new Error(`slow.pics returned HTTP ${response.status} for ${url}`);
      }

      const declaredLength = Number(response.headers.get("content-length"));
      if (Number.isFinite(declaredLength) && declaredLength > MAX_HTML_BYTES) {
        throw new Error(`slow.pics response exceeds ${MAX_HTML_BYTES} bytes`);
      }

      const html = await readCappedText(response, MAX_HTML_BYTES);

      let collection: unknown;
      try {
        collection = extractCollectionFromHtml(html);
      } catch (error) {
        if (error instanceof SlowPicsPayloadError) {
          throw new Error(`slow.pics returned an unparseable comparison payload for ${url}: ${error.message}`);
        }
        throw error;
      }

      if (collection === null) {
        throw new Error(
          `slow.pics did not include comparison data for ${url} — the request was probably blocked. Open the URL in your browser to confirm it is reachable.`,
        );
      }
      return validateSlowPicsCollection(collection, expectedKey);
    },

    async close(): Promise<void> {
      // Nothing to tear down: collection is a plain HTTP request.
    },
  };
}
