import test from "node:test";
import assert from "node:assert/strict";

import { debounce } from "./debounce.ts";

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

test("a pending invocation still fires after the delay", async () => {
    const calls: number[] = [];
    const debounced = debounce((value: number) => calls.push(value), 20);

    debounced(1);
    debounced(2);
    assert.deepEqual(calls, []);

    await sleep(60);
    assert.deepEqual(calls, [2]);
});

test("cancel drops the pending invocation", async () => {
    const calls: number[] = [];
    const debounced = debounce((value: number) => calls.push(value), 20);

    debounced(1);
    debounced.cancel();

    await sleep(60);
    assert.deepEqual(calls, []);
});

test("flush runs the pending invocation immediately, once", async () => {
    const calls: number[] = [];
    const debounced = debounce((value: number) => calls.push(value), 30);

    debounced(1);
    debounced(2);
    debounced.flush();

    assert.deepEqual(calls, [2]);

    await sleep(60);
    assert.deepEqual(calls, [2]);
});

test("flush without a pending invocation is a no-op", () => {
    const calls: number[] = [];
    const debounced = debounce((value: number) => calls.push(value), 30);

    debounced.flush();
    debounced.flush();

    assert.deepEqual(calls, []);
});
