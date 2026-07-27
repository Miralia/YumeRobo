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

function nodeText(node: HtmlNode): string {
  if (node.nodeName === "#text") return node.value ?? "";
  return (node.childNodes ?? []).map(nodeText).join("");
}

function candidateFromAnchor(node: HtmlNode): SlowPicsCandidate | null {
  if (node.nodeName !== "a") return null;
  const href = node.attrs?.find((attr) => attr.name === "href")?.value;
  if (!href) return null;

  try {
    const url = new URL(href);
    if (url.protocol !== "https:" || url.hostname !== "slow.pics") return null;
    const match = /^\/c\/([A-Za-z0-9]+)\/?$/.exec(url.pathname);
    if (!match) return null;
    return {
      key: match[1],
      url: `https://slow.pics/c/${match[1]}`,
      label: nodeText(node).replace(/\s+/g, " ").trim() || match[1],
    };
  } catch {
    return null;
  }
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

export function extractSlowPicsCandidates(specs: ComparisonSpec[] | undefined): SlowPicsCandidate[] {
  const unique = new Map<string, SlowPicsCandidate>();
  for (const spec of specs ?? []) {
    for (const html of [spec.content, ...(spec.subitems ?? []).map((item) => item.content)]) {
      if (!html) continue;
      for (const candidate of candidatesFromHtml(html)) unique.set(candidate.key, candidate);
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
    if (!Array.isArray(comparison.images) || comparison.images.length !== numCols) {
      throw new TypeError("slow.pics collection rows have inconsistent column counts");
    }
    for (const image of comparison.images) {
      if (
        !image ||
        typeof image.name !== "string" ||
        !image.name.trim() ||
        typeof image.publicFileName !== "string" ||
        !/^[A-Za-z0-9._-]+$/.test(image.publicFileName)
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
  if (!SLOWPICS_KEY_RE.test(candidate.key)) throw new TypeError("Invalid slow.pics key");
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
  return path.join(rootDir, "src", "lib", "content", "comparisons", `${slug}.json`);
}

export async function readStoredComparison(
  slug: string,
  rootDir: string = process.cwd(),
): Promise<StoredComparison | null> {
  try {
    const raw = await fs.readFile(getComparisonFilePath(slug, rootDir), "utf8");
    const parsed = JSON.parse(raw) as StoredComparison;
    if (parsed.schemaVersion !== 1 || parsed.source?.provider !== "slowpics") {
      throw new TypeError("Unsupported comparison sidecar schema");
    }
    return createStoredComparison(
      { key: parsed.source.key, url: parsed.source.url, label: parsed.collection.name ?? parsed.source.key },
      parsed.collection,
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function writeStoredComparison(
  slug: string,
  comparison: StoredComparison,
  rootDir: string = process.cwd(),
): Promise<string> {
  const target = getComparisonFilePath(slug, rootDir);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(comparison, null, 2) + "\n", "utf8");
  return target;
}

export function getComparisonDeepLink(siteUrl: string, slug: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/${slug}/comparisons`;
}
