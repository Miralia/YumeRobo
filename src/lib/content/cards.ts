/**
 * Card projection for the home page list.
 *
 * The home route must not import full release modules on the client:
 * shipping every release (specs, torrent trees, mediainfo hashes) costs
 * hundreds of KB of JS. Instead the server load projects each release
 * down to exactly what a list card renders, and the client receives it
 * as prerendered data.
 */
import { getReleaseBadges, type Release } from './schema';

export interface ReleaseCardData {
	slug: string;
	title: string;
	poster: string;
	date: string;
	badges: string[];
	torrentNames: string[];
}

/**
 * Project a full release down to list-card data.
 * Badges are precomputed here so the client never imports the zod schema.
 */
export function toCardData(release: Release): ReleaseCardData {
	return {
		slug: release.slug,
		title: release.title,
		poster: release.poster,
		date: release.date,
		badges: getReleaseBadges(release),
		torrentNames: release.torrents.map((t) => t.name)
	};
}

/**
 * Case-insensitive title search over card data.
 * Mirrors the previous `searchReleases` behaviour, but runs on the
 * trimmed projection the client already holds.
 */
export function filterCards(cards: ReleaseCardData[], query: string): ReleaseCardData[] {
	const q = query.trim().toLowerCase();
	if (!q) return cards;
	return cards.filter((card) => card.title.toLowerCase().includes(q));
}
