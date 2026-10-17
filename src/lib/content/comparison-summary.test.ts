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

test("comparison summary unions node labels across every comparison", () => {
    const summary = getComparisonSummary({
        comparisons: [
            { images: [{ name: "JPN BD", width: 1920, height: 1080 }] },
            {
                images: [
                    { name: "(P) JPN BD", width: 1920, height: 1080 },
                    { name: "Kawatare", width: 3840, height: 2160 },
                ],
            },
        ],
    });

    assert.deepEqual(summary.nodes, ["JPN BD", "Kawatare"]);
    assert.equal(summary.comparisonCount, 2);
    assert.equal(
        getComparisonSocialDescription(summary),
        "JPN BD vs Kawatare\n2 comparisons · 3840 × 2160",
    );
});

test("comparison summary tolerates a null or absent first comparison", () => {
    const withNull = getComparisonSummary({
        comparisons: [
            null,
            { images: [{ name: "Encode", width: 1280, height: 720 }] },
        ],
    });
    assert.deepEqual(withNull.nodes, ["Encode"]);
    assert.equal(withNull.maxResolution, "1280 × 720");
    assert.equal(withNull.comparisonCount, 2);

    const withEmptyFirst = getComparisonSummary({
        comparisons: [
            {},
            { images: [{ name: "Encode", width: 1280, height: 720 }] },
        ],
    });
    assert.deepEqual(withEmptyFirst.nodes, ["Encode"]);

    assert.deepEqual(getComparisonSummary({}), { nodes: [], comparisonCount: 0, maxResolution: null });
});

test("comparison summary de-duplicates repeated node labels", () => {
    const summary = getComparisonSummary({
        comparisons: [
            { images: [{ name: "(P) JPN BD" }, { name: "(B) JPN BD" }] },
            { images: [{ name: "JPN BD" }, { name: "Kawatare (B)" }] },
        ],
    });

    assert.deepEqual(summary.nodes, ["JPN BD", "Kawatare"]);
});

test("comparison summary requires finite numeric dimensions", () => {
    const summary = getComparisonSummary({
        comparisons: [
            { images: [{ name: "Source", width: true as unknown as number, height: 1080 }] },
            { images: [{ name: "Encode", width: "1920" as unknown as number, height: 1080 }] },
        ],
    });

    assert.equal(summary.maxResolution, null);
    assert.deepEqual(summary.nodes, ["Source", "Encode"]);
});

test("normalizeComparisonNode strips repeated variant markers", () => {
    assert.equal(normalizeComparisonNode("(P) (B) JPN BD"), "JPN BD");
    assert.equal(normalizeComparisonNode("Kawatare (B) (I)"), "Kawatare");
    assert.equal(normalizeComparisonNode("(P)(B)JPN BD"), "JPN BD");
    assert.equal(normalizeComparisonNode("(B)"), "");
});
