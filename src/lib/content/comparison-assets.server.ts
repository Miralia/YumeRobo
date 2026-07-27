interface StoredComparisonAsset {
  schemaVersion: number;
  source?: {
    provider?: string;
    key?: string;
    url?: string;
  };
}

export interface ComparisonAssetReference {
  assetUrl: string;
  sourceUrl: string;
  sourceKey: string;
}

const metadataModules = import.meta.glob<StoredComparisonAsset>(
  "./comparisons/*.json",
  { eager: true, import: "default" },
);
const assetUrls = import.meta.glob<string>(
  "./comparisons/*.json",
  { eager: true, import: "default", query: "?url&no-inline" },
);

export function getComparisonAsset(slug: string): ComparisonAssetReference | null {
  const modulePath = `./comparisons/${slug}.json`;
  const metadata = metadataModules[modulePath];
  const assetUrl = assetUrls[modulePath];
  if (
    !metadata ||
    !assetUrl ||
    metadata.schemaVersion !== 1 ||
    metadata.source?.provider !== "slowpics" ||
    !metadata.source.key ||
    !metadata.source.url
  ) {
    return null;
  }

  return {
    assetUrl,
    sourceUrl: metadata.source.url,
    sourceKey: metadata.source.key,
  };
}
