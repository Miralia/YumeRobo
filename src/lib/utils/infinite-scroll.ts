export const HOME_RELEASE_BATCH_SIZE = 10;

export function getNextDisplayCount(
	currentCount: number,
	totalCount: number,
	step: number = HOME_RELEASE_BATCH_SIZE,
): number {
	if (currentCount >= totalCount) {
		return totalCount;
	}

	return Math.min(currentCount + step, totalCount);
}
