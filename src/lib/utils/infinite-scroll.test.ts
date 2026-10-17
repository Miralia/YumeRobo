import test from "node:test";
import assert from "node:assert/strict";

import {
	HOME_RELEASE_BATCH_SIZE,
	getNextDisplayCount,
} from "./infinite-scroll.ts";

test("advances by the batch size and stops at the total", () => {
	assert.equal(getNextDisplayCount(0, 100), HOME_RELEASE_BATCH_SIZE);
	assert.equal(getNextDisplayCount(90, 100), 100);
	assert.equal(getNextDisplayCount(100, 100), 100);
});

test("a zero step still advances by one instead of deadlocking", () => {
	assert.equal(getNextDisplayCount(0, 100, 0), 1);
	assert.equal(getNextDisplayCount(5, 100, -10), 6);
});

test("negative counts are clamped to zero", () => {
	assert.equal(getNextDisplayCount(-5, 100, 24), 24);
	assert.equal(getNextDisplayCount(0, -100, 24), 0);
	assert.equal(getNextDisplayCount(3, -100, 24), 0);
});

test("non-finite inputs fall back to the default batch size", () => {
	assert.equal(
		getNextDisplayCount(0, 100, Number.NaN),
		HOME_RELEASE_BATCH_SIZE,
	);
	assert.equal(getNextDisplayCount(Number.NaN, 100, 24), 24);
	assert.equal(getNextDisplayCount(0, Number.NaN, 24), 0);
});
