/**
 * Smart date/time formatting utilities
 * Uses Intl.DateTimeFormat for locale-aware formatting
 */

export type DateFormatStyle = 'short' | 'medium' | 'long' | 'full';

/**
 * Get user's preferred locale (from browser or default to 'en-US')
 */
export function getUserLocale(): string {
    if (typeof navigator !== 'undefined') {
        return navigator.language || 'en-US';
    }
    return 'en-US';
}

/**
 * Get user's timezone (from browser or default to 'UTC')
 */
export function getUserTimezone(): string {
    if (typeof Intl !== 'undefined') {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return 'UTC';
}

/**
 * Format a date string or Date object to a localized string
 */
export function formatDate(
    date: string | Date,
    style: DateFormatStyle = 'medium',
    locale?: string
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const userLocale = locale || getUserLocale();

    const options: Intl.DateTimeFormatOptions = {
        timeZone: getUserTimezone(),
        ...(style === 'short' && { year: '2-digit', month: 'numeric', day: 'numeric' }),
        ...(style === 'medium' && { year: 'numeric', month: 'short', day: 'numeric' }),
        ...(style === 'long' && { year: 'numeric', month: 'long', day: 'numeric' }),
        ...(style === 'full' && { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
    };

    return new Intl.DateTimeFormat(userLocale, options).format(dateObj);
}

/**
 * Format a date to relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date: string | Date, locale?: string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const userLocale = locale || getUserLocale();
    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat(userLocale, { numeric: 'auto' });

    if (Math.abs(diffDays) >= 1) {
        return rtf.format(diffDays, 'day');
    } else if (Math.abs(diffHours) >= 1) {
        return rtf.format(diffHours, 'hour');
    } else if (Math.abs(diffMinutes) >= 1) {
        return rtf.format(diffMinutes, 'minute');
    } else {
        return rtf.format(diffSeconds, 'second');
    }
}

/**
 * Format date and time together
 */
export function formatDateTime(
    date: string | Date,
    style: DateFormatStyle = 'medium',
    locale?: string
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Map internal locale codes to full BCP 47 codes
    let userLocale = locale || getUserLocale();
    if (userLocale === 'en') userLocale = 'en-US';
    if (userLocale === 'zh') userLocale = 'zh-CN';

    const options: Intl.DateTimeFormatOptions = {
        timeZone: getUserTimezone(),
        year: 'numeric',
        month: style === 'short' ? 'numeric' : 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short' // Added timezone display (e.g., GMT+8, PST)
    };

    return new Intl.DateTimeFormat(userLocale, options).format(dateObj);
}
