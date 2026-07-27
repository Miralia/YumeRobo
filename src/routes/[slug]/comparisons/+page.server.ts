import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getAllReleases, getReleaseBySlug } from "$lib/content/loader";
import { getComparisonAsset } from "$lib/content/comparison-assets.server";
import { getComparisonSummary } from "$lib/content/comparison-summary";

export const load: PageServerLoad = async ({ params }) => {
    const release = getReleaseBySlug(params.slug);
    if (!release) throw error(404, { message: "Release not found" });

    const comparison = getComparisonAsset(release.slug);
    if (!comparison) throw error(404, { message: "Comparisons not found" });

    return {
        release: {
            slug: release.slug,
            title: release.title,
            year: release.year,
        },
        comparison: {
            assetUrl: comparison.assetUrl,
            summary: getComparisonSummary(comparison.collection),
        },
    };
};

export const entries = () => getAllReleases()
    .filter((release) => getComparisonAsset(release.slug))
    .map((release) => ({ slug: release.slug }));
