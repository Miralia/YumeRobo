export interface PosterLoadingAttributes {
	loading: "eager" | "lazy";
	fetchpriority: "high" | "auto";
	decoding: "auto" | "async";
}

/**
 * First-row grid posters load eagerly (up to the widest column count),
 * with the very first card promoted as the likely LCP element.
 *
 * Eager posters decode synchronously: Chromium can miss the repaint
 * for an async decode that completes after the page goes frame-idle,
 * leaving a loaded poster stuck on its placeholder until the next
 * scroll. Lazy posters keep async decode — they load during scrolling,
 * which produces frames anyway.
 */
const EAGER_COUNT = 8;

export function getPosterLoadingAttributes(index: number): PosterLoadingAttributes {
	if (index === 0) {
		return {
			loading: "eager",
			fetchpriority: "high",
			decoding: "auto",
		};
	}

	if (index < EAGER_COUNT) {
		return {
			loading: "eager",
			fetchpriority: "auto",
			decoding: "auto",
		};
	}

	return {
		loading: "lazy",
		fetchpriority: "auto",
		decoding: "async",
	};
}
