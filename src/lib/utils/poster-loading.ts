export interface PosterLoadingAttributes {
	loading: "eager" | "lazy";
	fetchpriority: "high" | "auto";
}

/**
 * First-row grid posters load eagerly (up to the widest column count),
 * with the very first card promoted as the likely LCP element.
 */
const EAGER_COUNT = 8;

export function getPosterLoadingAttributes(index: number): PosterLoadingAttributes {
	if (index === 0) {
		return {
			loading: "eager",
			fetchpriority: "high",
		};
	}

	if (index < EAGER_COUNT) {
		return {
			loading: "eager",
			fetchpriority: "auto",
		};
	}

	return {
		loading: "lazy",
		fetchpriority: "auto",
	};
}
