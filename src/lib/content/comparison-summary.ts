export interface ComparisonImageSummarySource {
    name?: string;
    width?: number | null;
    height?: number | null;
}

export interface ComparisonCollectionSummarySource {
    comparisons?: Array<{
        images?: ComparisonImageSummarySource[];
    }>;
}

export interface ComparisonSummary {
    nodes: string[];
    comparisonCount: number;
    maxResolution: string | null;
}

export function normalizeComparisonNode(value: string): string {
    return value
        .replace(/^\s*\([BIP]\)\s*/i, "")
        .replace(/\s*\([BIP]\)\s*$/i, "")
        .trim();
}

export function getComparisonSummary(
    collection: ComparisonCollectionSummarySource,
): ComparisonSummary {
    const comparisons = Array.isArray(collection.comparisons)
        ? collection.comparisons
        : [];
    const nodes = (comparisons[0]?.images ?? [])
        .map((image) => normalizeComparisonNode(image.name ?? ""))
        .filter(Boolean);

    let largest: { width: number; height: number; area: number } | null = null;
    for (const comparison of comparisons) {
        for (const image of comparison.images ?? []) {
            const width = Number(image.width);
            const height = Number(image.height);
            if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
                continue;
            }
            const area = width * height;
            if (!largest || area > largest.area) largest = { width, height, area };
        }
    }

    return {
        nodes,
        comparisonCount: comparisons.length,
        maxResolution: largest ? `${largest.width} × ${largest.height}` : null,
    };
}

export function getComparisonSocialDescription(summary: ComparisonSummary): string {
    const countLabel = `${summary.comparisonCount} comparison${summary.comparisonCount === 1 ? "" : "s"}`;
    const metrics = [countLabel, summary.maxResolution].filter(Boolean).join(" · ");
    return [summary.nodes.join(" vs "), metrics].filter(Boolean).join("\n");
}
