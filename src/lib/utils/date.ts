const DEFAULT_TIME_ZONE = "UTC";
const ISO_PARTS_LOCALE = "en-CA-u-ca-iso8601-nu-latn";

/** Resolve the browser's current IANA time zone, with an SSR-safe fallback. */
export function getUserTimezone(): string {
    if (typeof Intl === "undefined") return DEFAULT_TIME_ZONE;
    return (
        Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE
    );
}

function normalizeOffset(timeZoneName: string): string {
    if (/^(?:GMT|UTC)$/u.test(timeZoneName)) return "+00:00";

    const match = /^(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?$/u.exec(
        timeZoneName,
    );
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
    const parts = new Intl.DateTimeFormat(ISO_PARTS_LOCALE, {
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
    }).formatToParts(dateObject);
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
