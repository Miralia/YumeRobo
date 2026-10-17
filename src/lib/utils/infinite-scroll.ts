/* Divisible by 2, 3, 4, 6 and 8 so grid rows fill evenly at every column count */
export const HOME_RELEASE_BATCH_SIZE = 24;

export function getNextDisplayCount(
	currentCount: number,
	totalCount: number,
	step: number = HOME_RELEASE_BATCH_SIZE,
): number {
	// A non-positive step would deadlock "load more" at its current count, and
	// negative counts (stale store, removed items) would otherwise yield a
	// nonsensical target.
	const safeStep = Number.isFinite(step) ? Math.max(1, step) : HOME_RELEASE_BATCH_SIZE;
	const safeTotal = Number.isFinite(totalCount) ? Math.max(0, totalCount) : 0;
	const safeCurrent = Number.isFinite(currentCount) ? Math.max(0, currentCount) : 0;

	if (safeCurrent >= safeTotal) {
		return safeTotal;
	}

	return Math.min(safeCurrent + safeStep, safeTotal);
}
