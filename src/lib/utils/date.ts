const DEFAULT_TIME_ZONE = "UTC";
const ISO_PARTS_LOCALE = "en-CA-u-ca-iso8601-nu-latn";

/**
 * `Intl.DateTimeFormat` construction is comparatively expensive and list views
 * format the same handful of zones over and over, so instances are reused per
 * IANA zone instead of rebuilt for every item.
 */
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
    const cached = formatterCache.get(timeZone);
    if (cached) return cached;

    const formatter = new Intl.DateTimeFormat(ISO_PARTS_LOCALE, {
        timeZone,
        calendar: "iso8601",
        numberingSystem: "latn",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZoneName: "longOffset",
    });
    formatterCache.set(timeZone, formatter);
    return formatter;
}

/** Resolve the browser's current IANA time zone, with an SSR-safe fallback. */
export function getUserTimezone(): string {
    if (typeof Intl === "undefined") return DEFAULT_TIME_ZONE;
    return (
        Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE
    );
}

/**
 * Normalise an ICU `timeZoneName` part to `±HH:MM`.
 *
 * ICU output is not uniform across engines and locales: it can be `GMT+5`,
 * `UTC-05:30`, use a Unicode minus sign (U+2212), or be missing entirely when
 * the offset is zero. A missing part therefore means UTC. Exported for tests.
 */
export function normalizeOffset(timeZoneName: string | undefined): string {
    if (!timeZoneName) return "+00:00";

    const name = timeZoneName.trim().replace(/\u2212/gu, "-");
    if (/^(?:GMT|UTC)$/iu.test(name)) return "+00:00";

    const match = /^(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?$/iu.exec(name);
    if (!match) {
        throw new RangeError(`Unsupported time-zone offset: ${timeZoneName}`);
    }

    const [, sign, hours, minutes = "00"] = match;
    return `${sign}${hours.padStart(2, "0")}:${minutes}`;
}

export interface FormattedDateTime {
    /** Strict ISO 8601 value for the semantic `datetime` attribute. */
    dateTime: string;
    /** Human-readable, minute-precision label with an explicit UTC offset. */
    label: string;
}

/** Format an instant for display and semantic markup in an IANA time zone. */
export function formatDateTime(
    date: string | Date,
    timeZone: string = getUserTimezone(),
): FormattedDateTime {
    const dateObject = typeof date === "string" ? new Date(date) : date;

    // This runs inside `$derived` on the detail page, so one unparseable value
    // must degrade to a placeholder instead of throwing away the whole render.
    if (Number.isNaN(dateObject.getTime())) {
        return { dateTime: "", label: "Unknown date" };
    }

    const parts = getFormatter(timeZone).formatToParts(dateObject);
    const values = Object.fromEntries(
        parts.map(({ type, value }) => [type, value]),
    );

    const datePart = `${values.year}-${values.month}-${values.day}`;
    const timePart = `${values.hour}:${values.minute}`;
    const offset = normalizeOffset(values.timeZoneName);

    return {
        dateTime: `${datePart}T${timePart}${offset}`,
        label: `${datePart} ${timePart} UTC${offset}`,
    };
}
