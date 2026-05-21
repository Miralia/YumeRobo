import test from "node:test";
import assert from "node:assert/strict";

import { getPosterLoadingAttributes } from "./poster-loading.ts";

test("promotes the first card poster for LCP", () => {
	assert.deepEqual(getPosterLoadingAttributes(0), {
		loading: "eager",
		fetchpriority: "high",
	});
});

test("keeps non-LCP card posters lazy", () => {
	assert.deepEqual(getPosterLoadingAttributes(1), {
		loading: "lazy",
		fetchpriority: "auto",
	});
});
