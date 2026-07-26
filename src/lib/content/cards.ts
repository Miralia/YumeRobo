/**
 * Card projection consumed by the home page list.
 *
 * This module is imported by client code, so it must stay free of
 * runtime imports from the zod schema module — top-level schema
 * construction is not tree-shakeable and would drag zod into the
 * client bundle. The projection itself lives in `cards.server.ts`.
 */

export interface ReleaseCardData {
	slug: string;
	title: string;
	poster: string;
	date: string;
	badges: string[];
	torrentNames: string[];
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
