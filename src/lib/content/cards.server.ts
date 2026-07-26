/**
 * Server-side card projection.
 *
 * The home route must not import full release modules on the client:
 * shipping every release (specs, torrent trees, mediainfo hashes) costs
 * hundreds of KB of JS. The server load projects each release down to
 * exactly what a list card renders, and the client receives it as
 * prerendered data.
 *
 * Kept as a `.server` module so an accidental client import fails the
 * build instead of silently reintroducing zod to the bundle.
 */
import { getReleaseBadges, type Release } from './schema';
import type { ReleaseCardData } from './cards';

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
