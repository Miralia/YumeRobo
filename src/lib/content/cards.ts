/**
 * Card projection consumed by the home page grid.
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
	year?: number;
	badges: string[];
	/** Build-time dominant poster color; drives hover glow + placeholder */
	accent?: string;
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
