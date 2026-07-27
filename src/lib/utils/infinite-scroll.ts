/* Divisible by 2, 3, 4, 6 and 8 so grid rows fill evenly at every column count */
export const HOME_RELEASE_BATCH_SIZE = 24;

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
