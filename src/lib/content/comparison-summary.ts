export interface ComparisonImageSummarySource {
    name?: string;
    width?: number | null;
    height?: number | null;
}

export interface ComparisonSummaryComparison {
    images?: Array<ComparisonImageSummarySource | null> | null;
}

export interface ComparisonCollectionSummarySource {
    comparisons?: Array<ComparisonSummaryComparison | null> | null;
}

export interface ComparisonSummary {
    nodes: string[];
    comparisonCount: number;
    maxResolution: string | null;
}

/**
 * Strips any number of leading/trailing `(B)`/`(I)`/`(P)` variant markers
 * ("(P) (B) JPN BD" -> "JPN BD").
 */
export function normalizeComparisonNode(value: string): string {
    return value
        .replace(/^(?:\s*\([BIP]\)\s*)+/i, "")
        .replace(/(?:\s*\([BIP]\)\s*)+$/i, "")
        .trim();
}

function getImages(
    comparison: ComparisonSummaryComparison | null | undefined
): Array<ComparisonImageSummarySource | null> {
    if (!comparison || typeof comparison !== "object") return [];
    return Array.isArray(comparison.images) ? comparison.images : [];
}

/**
 * Resolutions come from unvalidated JSON, so only real finite numbers count:
 * `Number()` coercion used to turn `true` and numeric strings into sizes.
 */
function toDimension(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

export function getComparisonSummary(
    collection: ComparisonCollectionSummarySource,
): ComparisonSummary {
    const comparisons = Array.isArray(collection?.comparisons)
        ? collection.comparisons
        : [];

    // Node labels come from every comparison (first-seen order), not just the
    // first one: `comparisonCount` counts them all, so reading only
    // `comparisons[0]` could make the "A vs B" caption contradict the count.
    const nodes: string[] = [];
    let largest: { width: number; height: number; area: number } | null = null;

    for (const comparison of comparisons) {
        for (const image of getImages(comparison)) {
            const name = normalizeComparisonNode(typeof image?.name === "string" ? image.name : "");
            if (name && !nodes.includes(name)) nodes.push(name);

            const width = toDimension(image?.width);
            const height = toDimension(image?.height);
            if (width === null || height === null) continue;

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
