import test from "node:test";
import assert from "node:assert/strict";

import { formatDateTime, normalizeOffset } from "./date.ts";

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

test("returns a placeholder for an unparseable date instead of throwing", () => {
    assert.deepEqual(formatDateTime("not a date"), {
        dateTime: "",
        label: "Unknown date",
    });
    assert.deepEqual(formatDateTime(new Date(Number.NaN)), {
        dateTime: "",
        label: "Unknown date",
    });
});

test("normalises the ICU offset forms seen across engines", () => {
    assert.equal(normalizeOffset(undefined), "+00:00");
    assert.equal(normalizeOffset(""), "+00:00");
    assert.equal(normalizeOffset("GMT"), "+00:00");
    assert.equal(normalizeOffset("UTC"), "+00:00");
    assert.equal(normalizeOffset("GMT+5"), "+05:00");
    assert.equal(normalizeOffset("UTC-5"), "-05:00");
    assert.equal(normalizeOffset("GMT+08:00"), "+08:00");
    assert.equal(normalizeOffset("UTC-05:30"), "-05:30");
    assert.equal(normalizeOffset("GMT+0530"), "+05:30");
    // Some ICU builds emit U+2212 MINUS SIGN rather than ASCII hyphen-minus.
    assert.equal(normalizeOffset("UTC\u221205:30"), "-05:30");
    assert.throws(() => normalizeOffset("Central European Time"), RangeError);
});

test("keeps cached formatters keyed per requested time zone", () => {
    const first = formatDateTime(instant, "Asia/Shanghai");
    const other = formatDateTime(instant, "America/New_York");
    const repeat = formatDateTime(instant, "Asia/Shanghai");

    assert.deepEqual(first, repeat);
    assert.notDeepEqual(first, other);
});
