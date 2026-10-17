/**
 * Poster path derivations shared by every surface that renders a poster.
 *
 * Posters are always stored as `/posters/<assetId>.avif` with a card-sized
 * sibling `/posters/<assetId>.card.avif`, so the card path must be derived
 * with an anchored, case-insensitive suffix match. A bare
 * `posterPath.replace(".avif", ".card.avif")` silently produces a broken URL
 * for any other casing or extension, and behaves differently per call site.
 */

/**
 * Derive the card-sized poster path from a full poster path.
 * Returns the input unchanged when it is not an `.avif` poster path.
 */
export function getCardPosterPath(posterPath: string): string {
	return posterPath.replace(/\.avif$/i, ".card.avif");
}
