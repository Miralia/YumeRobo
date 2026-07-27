import test from "node:test";
import assert from "node:assert/strict";

import { getPosterLoadingAttributes } from "./poster-loading.ts";

test("promotes the first grid poster for LCP", () => {
	assert.deepEqual(getPosterLoadingAttributes(0), {
		loading: "eager",
		fetchpriority: "high",
		decoding: "auto",
	});
});

test("loads the rest of the first row eagerly without priority", () => {
	assert.deepEqual(getPosterLoadingAttributes(5), {
		loading: "eager",
		fetchpriority: "auto",
		decoding: "auto",
	});
});

test("keeps below-the-fold posters lazy", () => {
	assert.deepEqual(getPosterLoadingAttributes(8), {
		loading: "lazy",
		fetchpriority: "auto",
		decoding: "async",
	});
});
