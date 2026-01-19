import type { PageServerLoad } from './$types';
import { getAllReleases, getReleaseBySlug } from '$lib/content/loader';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    const release = getReleaseBySlug(params.slug);

    if (!release) {
        throw error(404, {
            message: 'Release not found'
        });
    }

    return {
        release
    };
};

// Generate all release pages at build time
export const entries = () => {
    const releases = getAllReleases();
    return releases.map(r => ({ slug: r.slug }));
};
