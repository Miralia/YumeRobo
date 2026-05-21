export interface PosterLoadingAttributes {
	loading: "eager" | "lazy";
	fetchpriority: "high" | "auto";
}

export function getPosterLoadingAttributes(index: number): PosterLoadingAttributes {
	if (index === 0) {
		return {
			loading: "eager",
			fetchpriority: "high",
		};
	}

	return {
		loading: "lazy",
		fetchpriority: "auto",
	};
}
