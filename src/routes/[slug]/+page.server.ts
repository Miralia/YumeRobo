import type { PageServerLoad } from './$types';
import { getAllReleases, getReleaseBySlug } from '$lib/content/loader';
import { getReleaseBadges } from '$lib/content/schema';
import { getPosterMeta } from '$lib/content/poster-meta';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    const release = getReleaseBySlug(params.slug);

    if (!release) {
        throw error(404, {
            message: 'Release not found'
        });
    }

    const meta = getPosterMeta(release.poster);

    return {
        release,
        // Precomputed so the client never imports the zod schema module
        badges: getReleaseBadges(release),
        // Build-time dynamic color data (Ginmaku): dominant accent +
        // micro blur thumb replacing runtime poster blurring
        accent: meta?.accent ?? null,
        posterBlur: meta?.blur ?? null
    };
};

// Generate all release pages at build time
export const entries = () => {
    const releases = getAllReleases();
    return releases.map(r => ({ slug: r.slug }));
};
