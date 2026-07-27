import type { PageServerLoad } from './$types';
import { getAllReleases } from '$lib/content/loader';
import { toCardData } from '$lib/content/cards.server';
import { getPosterMeta } from '$lib/content/poster-meta';

export const prerender = true;

/**
 * Serve the home page a trimmed card projection instead of the full
 * release modules. This keeps the client bundle free of release data,
 * specs, and the zod schema — search runs over this same projection.
 */
export const load: PageServerLoad = async () => {
	return {
		cards: getAllReleases().map((release) =>
			toCardData(release, getPosterMeta(release.poster)?.accent)
		)
	};
};
