import test from "node:test";
import assert from "node:assert/strict";

import { formatDateTime } from "./date.ts";

const instant = "2026-07-27T09:03:38.626Z";

test("formats ISO 8601 at minute precision in a positive-offset time zone", () => {
    assert.deepEqual(
        formatDateTime(instant, "Asia/Shanghai"),
        {
            dateTime: "2026-07-27T17:03+08:00",
            label: "2026-07-27 17:03 UTC+08:00",
        },
    );
});

test("uses a 24-hour clock and the active daylight-saving offset", () => {
    assert.deepEqual(
        formatDateTime(instant, "America/New_York"),
        {
            dateTime: "2026-07-27T05:03-04:00",
            label: "2026-07-27 05:03 UTC-04:00",
        },
    );
});

test("preserves fractional-hour offsets", () => {
    assert.deepEqual(
        formatDateTime(instant, "Asia/Kathmandu"),
        {
            dateTime: "2026-07-27T14:48+05:45",
            label: "2026-07-27 14:48 UTC+05:45",
        },
    );
});

test("renders UTC as an explicit numeric offset", () => {
    assert.deepEqual(
        formatDateTime(instant, "UTC"),
        {
            dateTime: "2026-07-27T09:03+00:00",
            label: "2026-07-27 09:03 UTC+00:00",
        },
    );
});
