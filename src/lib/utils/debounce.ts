/**
 * Creates a debounced version of a function.
 * The debounced function delays invoking the provided function until
 * after the specified delay has elapsed since the last invocation.
 *
 * The returned function exposes `cancel()` to drop a pending invocation
 * (e.g. when the user navigates away before a debounced action fires).
 *
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function with a `cancel` method
 */
export interface Debounced<Args extends unknown[]> {
    (...args: Args): void;
    cancel(): void;
}

export function debounce<Args extends unknown[]>(
    fn: (...args: Args) => void,
    delay: number
): Debounced<Args> {
    let timeoutId: ReturnType<typeof setTimeout>;
    const debounced = (...args: Args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
    debounced.cancel = () => clearTimeout(timeoutId);
    return debounced;
}
