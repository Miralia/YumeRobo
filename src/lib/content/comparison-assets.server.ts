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

function getComparisonStaticPath(slug: string): string | null {
  if (!/^[a-z0-9]+$/.test(slug)) return null;
  return path.join(process.cwd(), "static", "comparisons", `${slug}.json`);
}

export function getComparisonAsset(slug: string): ComparisonAssetReference | null {
  const filePath = getComparisonStaticPath(slug);
  if (!filePath) return null;

  let metadata: StoredComparisonAsset;
  try {
    metadata = JSON.parse(fs.readFileSync(filePath, "utf8")) as StoredComparisonAsset;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }

  if (
    metadata.schemaVersion !== 1 ||
    metadata.source?.provider !== "slowpics" ||
    !metadata.source.key ||
    !metadata.source.url
    || !metadata.collection
  ) {
    return null;
  }

  return {
    assetUrl: `/comparisons/${slug}.json`,
    sourceUrl: metadata.source.url,
    sourceKey: metadata.source.key,
    collection: metadata.collection,
  };
}
