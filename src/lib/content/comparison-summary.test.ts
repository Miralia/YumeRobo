import test from "node:test";
import assert from "node:assert/strict";
import {
    getComparisonSocialDescription,
    getComparisonSummary,
    normalizeComparisonNode,
} from "./comparison-summary";

test("comparison summary normalizes nodes and uses the largest real image", () => {
    const summary = getComparisonSummary({
        comparisons: [
            {
                images: [
                    { name: "(P) JPN BD", width: 1920, height: 1080 },
                    { name: "Kawatare (B)", width: 3840, height: 1600 },
                ],
            },
            {
                images: [
                    { name: "(I) JPN BD", width: 2048, height: 1556 },
                    { name: "Kawatare (I)", width: 3840, height: 2160 },
                ],
            },
        ],
    });

    assert.deepEqual(summary, {
        nodes: ["JPN BD", "Kawatare"],
        comparisonCount: 2,
        maxResolution: "3840 × 2160",
    });
    assert.equal(
        getComparisonSocialDescription(summary),
        "JPN BD vs Kawatare\n2 comparisons · 3840 × 2160",
    );
    assert.equal(normalizeComparisonNode("Tasokare (P)"), "Tasokare");
});
