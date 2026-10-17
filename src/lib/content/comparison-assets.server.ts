import fs from "node:fs";
import path from "node:path";

interface StoredComparisonAsset {
  schemaVersion: number;
  source?: {
    provider?: string;
    key?: string;
    url?: string;
  };
  collection?: {
    comparisons?: Array<{
      images?: Array<{
        name?: string;
        width?: number | null;
        height?: number | null;
      }>;
    }>;
  };
}

export interface ComparisonAssetReference {
  assetUrl: string;
  sourceUrl: string;
  sourceKey: string;
  collection: NonNullable<StoredComparisonAsset["collection"]>;
}

const SLUG_PATTERN = /^[a-z0-9]+$/;

let warnedMissingDirectory = false;

/**
 * Per-process cache keyed by slug. `getComparisonAsset` is called once per
 * release from `entries()` and again per page, and the build process is
 * short-lived, so the sidecars never change underneath it.
 */
const cache = new Map<string, ComparisonAssetReference | null>();

function getComparisonsDirectory(): string {
  return path.join(process.cwd(), "static", "comparisons");
}

function getComparisonStaticPath(slug: string): string | null {
  if (!SLUG_PATTERN.test(slug)) return null;
  return path.join(getComparisonsDirectory(), `${slug}.json`);
}

/**
 * Warns once when the comparisons directory itself is absent. Without this,
 * a wrong working directory makes every comparison silently `null` and every
 * comparison page 404 with no diagnostic at all.
 */
function warnIfComparisonsDirectoryMissing(): void {
  if (warnedMissingDirectory) return;
  if (fs.existsSync(getComparisonsDirectory())) return;

  warnedMissingDirectory = true;
  console.warn(
    `[content] Comparison assets directory not found: ${getComparisonsDirectory()}. ` +
    "Comparison pages will be skipped. Run the build from the project root."
  );
}

export function getComparisonAsset(slug: string): ComparisonAssetReference | null {
  if (cache.has(slug)) return cache.get(slug) ?? null;

  const resolved = readComparisonAsset(slug);
  cache.set(slug, resolved);
  return resolved;
}

function readComparisonAsset(slug: string): ComparisonAssetReference | null {
  const filePath = getComparisonStaticPath(slug);
  if (!filePath) return null;

  let metadata: StoredComparisonAsset;
  try {
    metadata = JSON.parse(fs.readFileSync(filePath, "utf8")) as StoredComparisonAsset;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      warnIfComparisonsDirectoryMissing();
      return null;
    }
    throw new Error(
      `Failed to read comparison sidecar ${filePath}: ${(error as Error).message}`,
      { cause: error }
    );
  }

  const collection = metadata.collection;
  if (
    metadata.schemaVersion !== 1 ||
    metadata.source?.provider !== "slowpics" ||
    typeof metadata.source.key !== "string" ||
    metadata.source.key.length === 0 ||
    typeof metadata.source.url !== "string" ||
    metadata.source.url.length === 0 ||
    // A bare truthiness check let a string through, which then broke the
    // comparison summary downstream.
    !collection ||
    !Array.isArray(collection.comparisons)
  ) {
    return null;
  }

  return {
    assetUrl: `/comparisons/${slug}.json`,
    sourceUrl: metadata.source.url,
    sourceKey: metadata.source.key,
    collection,
  };
}
