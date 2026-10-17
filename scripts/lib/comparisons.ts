import fs from "node:fs/promises";
import path from "node:path";
import { parseFragment } from "parse5";

export interface ComparisonSpec {
  content?: string;
  subitems?: Array<{ content?: string }>;
}

export interface SlowPicsCandidate {
  key: string;
  url: string;
  label: string;
}

export interface SlowPicsImage {
  name: string;
  publicFileName: string;
  width?: number | null;
  height?: number | null;
}

export interface SlowPicsComparison {
  key?: string;
  name?: string;
  images: SlowPicsImage[];
}

export interface SlowPicsCollection {
  key?: string;
  name?: string;
  comparisons: SlowPicsComparison[];
  [key: string]: unknown;
}

export interface StoredComparison {
  schemaVersion: 1;
  source: {
    provider: "slowpics";
    key: string;
    url: string;
  };
  collection: SlowPicsCollection;
}

interface HtmlNode {
  nodeName?: string;
  value?: string;
  attrs?: Array<{ name: string; value: string }>;
  childNodes?: HtmlNode[];
}

const SLOWPICS_KEY_RE = /^[A-Za-z0-9]+$/;
const SLOWPICS_BASE_URL = "https://slow.pics";
const SLOWPICS_HOSTS = new Set(["slow.pics", "www.slow.pics"]);

/** A file name that cannot escape its directory: no separators, no dot segments. */
function isSafePublicFileName(name: string): boolean {
  if (!name || name === "." || name === "..") return false;
  return !name.includes("/") && !name.includes("\\");
}

function nodeText(node: HtmlNode): string {
  if (node.nodeName === "#text") return node.value ?? "";
  return (node.childNodes ?? []).map(nodeText).join("");
}

/** Parse an href against slow.pics, accepting absolute, protocol-relative, root-relative and bare-host forms. */
function toSlowPicsUrl(href: string): URL | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  // `www.slow.pics/c/x` (no scheme) is a host, not a relative path.
  const candidate = /^(?:www\.)?slow\.pics\//i.test(trimmed) ? `https://${trimmed}` : trimmed;
  try {
    return new URL(candidate, SLOWPICS_BASE_URL);
  } catch {
    return null;
  }
}

function candidateFromAnchor(node: HtmlNode): SlowPicsCandidate | null {
  if (node.nodeName !== "a") return null;
  const href = node.attrs?.find((attr) => attr.name === "href")?.value;
  if (!href) return null;

  const url = toSlowPicsUrl(href);
  if (!url) return null;
  if (url.protocol !== "https:") return null;
  if (!SLOWPICS_HOSTS.has(url.hostname.toLowerCase())) return null;

  const match = /^\/c\/([A-Za-z0-9]+)\/?$/.exec(url.pathname);
  if (!match) return null;
  return {
    key: match[1],
    url: `${SLOWPICS_BASE_URL}/c/${match[1]}`,
    label: nodeText(node).replace(/\s+/g, " ").trim() || match[1],
  };
}

function candidatesFromHtml(html: string): SlowPicsCandidate[] {
  const root = parseFragment(html) as unknown as HtmlNode;
  const candidates: SlowPicsCandidate[] = [];

  function visit(node: HtmlNode): void {
    const candidate = candidateFromAnchor(node);
    if (candidate) candidates.push(candidate);
    for (const child of node.childNodes ?? []) visit(child);
  }

  visit(root);
  return candidates;
}

/**
 * Matches a slow.pics comparison URL anywhere in the spec source, not just in
 * an `href`. A spec pasted as raw BBCode can reach the release file with its
 * markup intact, and a hand-written spec may contain a bare URL; either way the
 * link must still be discoverable. The lookbehind stops a lookalike host such
 * as `notslow.pics` from matching, and an explicit `http://` prefix is rejected
 * like it is for anchors.
 */
const SLOWPICS_URL_RE =
  /(?<![\w.-])(https?:\/\/)?(?:www\.)?slow\.pics\/c\/([A-Za-z0-9]+)/gi;

function candidatesFromSource(source: string): SlowPicsCandidate[] {
  const candidates: SlowPicsCandidate[] = [];
  for (const match of source.matchAll(SLOWPICS_URL_RE)) {
    const scheme = match[1];
    if (scheme && scheme.toLowerCase() !== "https://") continue;
    candidates.push({
      key: match[2],
      url: `${SLOWPICS_BASE_URL}/c/${match[2]}`,
      label: match[2],
    });
  }
  return candidates;
}

export function extractSlowPicsCandidates(specs: ComparisonSpec[] | undefined): SlowPicsCandidate[] {
  const unique = new Map<string, SlowPicsCandidate>();
  for (const spec of specs ?? []) {
    for (const html of [spec.content, ...(spec.subitems ?? []).map((item) => item.content)]) {
      if (!html) continue;
      // Anchors first: they carry the human-readable label and define the
      // order the operator sees. The source scan only appends links the anchor
      // walk cannot see, so nothing that already worked changes position.
      for (const candidate of candidatesFromHtml(html)) unique.set(candidate.key, candidate);
      for (const candidate of candidatesFromSource(html)) {
        if (!unique.has(candidate.key)) unique.set(candidate.key, candidate);
      }
    }
  }
  return [...unique.values()];
}

export function validateSlowPicsCollection(
  value: unknown,
  expectedKey?: string,
): SlowPicsCollection {
  if (!value || typeof value !== "object") throw new TypeError("slow.pics collection is missing");
  const collection = value as SlowPicsCollection;
  if (!Array.isArray(collection.comparisons) || collection.comparisons.length === 0) {
    throw new TypeError("slow.pics collection has no comparison rows");
  }
  if (
    expectedKey &&
    collection.key !== expectedKey &&
    !collection.comparisons.some((comparison) => comparison?.key === expectedKey)
  ) {
    throw new TypeError(`slow.pics collection key mismatch: expected ${expectedKey}, received ${collection.key ?? "missing"}`);
  }

  const numCols = collection.comparisons[0]?.images?.length ?? 0;
  if (numCols === 0) throw new TypeError("slow.pics collection has no images");

  for (const comparison of collection.comparisons) {
    if (comparison == null) {
      throw new TypeError("slow.pics collection contains an empty comparison row");
    }
    if (!Array.isArray(comparison.images) || comparison.images.length !== numCols) {
      throw new TypeError("slow.pics collection rows have inconsistent column counts");
    }
    for (const image of comparison.images) {
      if (
        !image ||
        typeof image.name !== "string" ||
        !image.name.trim() ||
        typeof image.publicFileName !== "string" ||
        !isSafePublicFileName(image.publicFileName)
      ) {
        throw new TypeError("slow.pics collection contains malformed image metadata");
      }
      if (image.width != null && (!Number.isFinite(image.width) || image.width <= 0)) {
        throw new TypeError("slow.pics collection contains an invalid image width");
      }
      if (image.height != null && (!Number.isFinite(image.height) || image.height <= 0)) {
        throw new TypeError("slow.pics collection contains an invalid image height");
      }
    }
  }

  return collection;
}

export function createStoredComparison(
  candidate: SlowPicsCandidate,
  collection: unknown,
): StoredComparison {
  if (typeof candidate.key !== "string" || !SLOWPICS_KEY_RE.test(candidate.key)) {
    throw new TypeError("Invalid slow.pics key");
  }
  return {
    schemaVersion: 1,
    source: {
      provider: "slowpics",
      key: candidate.key,
      url: candidate.url,
    },
    collection: validateSlowPicsCollection(collection, candidate.key),
  };
}

export function getComparisonFilePath(slug: string, rootDir: string = process.cwd()): string {
  if (!/^[a-z0-9]+$/.test(slug)) throw new TypeError("Invalid release slug");
  return path.join(rootDir, "static", "comparisons", `${slug}.json`);
}

export async function readStoredComparison(
  slug: string,
  rootDir: string = process.cwd(),
): Promise<StoredComparison | null> {
  try {
    return await readStoredComparisonFile(getComparisonFilePath(slug, rootDir));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function readStoredComparisonFile(filePath: string): Promise<StoredComparison> {
  const raw = await fs.readFile(filePath, "utf8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new TypeError(
      `Invalid comparison sidecar JSON at ${filePath}: ${error instanceof Error ? error.message : error}`,
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new TypeError(`Unsupported comparison sidecar schema at ${filePath}`);
  }

  const stored = parsed as Partial<StoredComparison>;
  if (stored.schemaVersion !== 1 || stored.source?.provider !== "slowpics") {
    throw new TypeError(`Unsupported comparison sidecar schema at ${filePath}`);
  }
  if (typeof stored.source.key !== "string" || typeof stored.source.url !== "string") {
    throw new TypeError(`Unsupported comparison sidecar schema at ${filePath}`);
  }

  const collection = stored.collection as SlowPicsCollection | undefined;
  return createStoredComparison(
    { key: stored.source.key, url: stored.source.url, label: collection?.name ?? stored.source.key },
    collection,
  );
}

export async function writeStoredComparisonFile(
  filePath: string,
  comparison: StoredComparison,
): Promise<string> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs.writeFile(tempPath, JSON.stringify(comparison, null, 2) + "\n", "utf8");
    await fs.rename(tempPath, filePath);
  } catch (error) {
    await fs.rm(tempPath, { force: true }).catch(() => {});
    throw error;
  }
  return filePath;
}

export async function writeStoredComparison(
  slug: string,
  comparison: StoredComparison,
  rootDir: string = process.cwd(),
): Promise<string> {
  const target = getComparisonFilePath(slug, rootDir);
  return writeStoredComparisonFile(target, comparison);
}

export async function deleteStoredComparison(
  slug: string,
  rootDir: string = process.cwd(),
): Promise<boolean> {
  try {
    await fs.unlink(getComparisonFilePath(slug, rootDir));
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export function getComparisonDeepLink(siteUrl: string, slug: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/${slug}/comparisons`;
}
