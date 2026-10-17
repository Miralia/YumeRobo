/**
 * Creates a debounced version of a function.
 * The debounced function delays invoking the provided function until
 * after the specified delay has elapsed since the last invocation.
 *
 * The returned function exposes `cancel()` to drop a pending invocation
 * (e.g. when the user navigates away before a debounced action fires) and
 * `flush()` to run a pending invocation immediately (e.g. on teardown, so a
 * queued write is not silently lost).
 *
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function with `cancel` and `flush`
 */
export interface Debounced<Args extends unknown[]> {
    (...args: Args): void;
    cancel(): void;
    flush(): void;
}

export function debounce<Args extends unknown[]>(
    fn: (...args: Args) => void,
    delay: number
): Debounced<Args> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let pending: (() => void) | null = null;

    function run() {
        clearTimeout(timeoutId);
        timeoutId = undefined;
        const invocation = pending;
        pending = null;
        invocation?.();
    }

    const debounced = (...args: Args) => {
        clearTimeout(timeoutId);
        pending = () => fn(...args);
        timeoutId = setTimeout(run, delay);
    };

    debounced.cancel = () => {
        clearTimeout(timeoutId);
        timeoutId = undefined;
        pending = null;
    };

    debounced.flush = () => {
        if (pending) run();
    };

    return debounced;
}
