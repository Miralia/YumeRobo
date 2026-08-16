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

/**
 * Extract the `collection` JSON object from a slow.pics document.
 * Uses brace matching that skips string literals, so embedded quotes/braces
 * inside image names cannot break the parse. Returns null when the page does
 * not carry the collection payload (missing/blocked/challenged).
 */
export function extractCollectionFromHtml(html: string): unknown {
  const marker = COLLECTION_MARKERS.find((candidate) => html.includes(candidate));
  if (!marker) return null;

  const braceStart = html.indexOf("{", html.indexOf(marker));
  if (braceStart === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = braceStart; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(braceStart, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

export async function createSlowPicsCollector(): Promise<SlowPicsCollector> {
  return {
    async collect(url: string, expectedKey: string): Promise<SlowPicsCollection> {
      const response = await fetch(url, {
        redirect: "follow",
        headers: simulatedChromeHeaders(),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new Error(`slow.pics returned HTTP ${response.status} for ${url}`);
      }

      const html = await response.text();
      const collection = extractCollectionFromHtml(html);
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
