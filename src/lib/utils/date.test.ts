import test from "node:test";
import assert from "node:assert/strict";

import { formatDateTime } from "./date.ts";

const instant = "2026-07-27T09:03:38.626Z";

test("formats ISO 8601 at minute precision in a positive-offset time zone", () => {
    assert.equal(
        formatDateTime(instant, "Asia/Shanghai"),
        "2026-07-27T17:03+08:00",
    );
});

test("uses a 24-hour clock and the active daylight-saving offset", () => {
    assert.equal(
        formatDateTime(instant, "America/New_York"),
        "2026-07-27T05:03-04:00",
    );
});

test("preserves fractional-hour offsets", () => {
    assert.equal(
        formatDateTime(instant, "Asia/Kathmandu"),
        "2026-07-27T14:48+05:45",
    );
});

test("renders UTC as an explicit numeric offset", () => {
    assert.equal(
        formatDateTime(instant, "UTC"),
        "2026-07-27T09:03+00:00",
    );
});
