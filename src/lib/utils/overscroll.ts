/**
 * Scroll Boundary Indicator
 *
 * Shows a subtle glow when the user over-scrolls at the top/bottom of
 * the page. Built to be invisible in profiles:
 * - scrollHeight/innerHeight are cached (ResizeObserver + resize) so
 *   wheel/touch handlers never force layout
 * - indicator elements are created lazily on the first boundary hit
 * - fade-out is delegated to a CSS transition instead of a rAF loop
 * - honours prefers-reduced-motion
 *
 * @example
 * ```svelte
 * <div use:boundaryIndicator>...</div>
 * ```
 */

export interface BoundaryIndicatorOptions {
    /** Glow color (CSS value) */
    color?: string;
    /** Maximum glow opacity (0-1) */
    maxOpacity?: number;
    /** Glow gradient height in pixels */
    size?: number;
}

const defaultOptions: Required<BoundaryIndicatorOptions> = {
    color: "var(--color-accent)",
    maxOpacity: 0.08,
    size: 60,
};

/**
 * Svelte Action for scroll boundary indicator.
 * Apply to the root scrollable container.
 */
export function boundaryIndicator(node: HTMLElement, options: BoundaryIndicatorOptions = {}) {
    const opts = { ...defaultOptions, ...options };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let topIndicator: HTMLDivElement | null = null;
    let bottomIndicator: HTMLDivElement | null = null;

    let cachedScrollHeight = document.documentElement.scrollHeight;
    let cachedInnerHeight = window.innerHeight;

    // Track content growth (infinite scroll, accordions) without forcing
    // layout from inside scroll-linked handlers.
    const resizeObserver = new ResizeObserver(() => {
        cachedScrollHeight = document.documentElement.scrollHeight;
    });
    resizeObserver.observe(document.body);

    function handleResize() {
        cachedInnerHeight = window.innerHeight;
        cachedScrollHeight = document.documentElement.scrollHeight;
    }

    const isAtTop = () => window.scrollY <= 0;
    const isAtBottom = () =>
        window.scrollY + cachedInnerHeight >= cachedScrollHeight - 1;

    function createIndicator(edge: "top" | "bottom"): HTMLDivElement {
        const el = document.createElement("div");
        el.style.cssText = `
            position: fixed;
            left: 0;
            right: 0;
            ${edge}: 0;
            height: ${opts.size}px;
            pointer-events: none;
            opacity: 0;
            z-index: 9999;
            background: linear-gradient(to ${edge === "top" ? "bottom" : "top"}, ${opts.color}, transparent);
            transition: opacity 100ms ease-out;
        `;
        document.body.appendChild(el);
        return el;
    }

    let topGlow = 0;
    let bottomGlow = 0;
    let hideTimer: number | null = null;

    function showGlow(edge: "top" | "bottom", strength: number) {
        if (reducedMotion.matches) return;

        if (edge === "top") {
            topIndicator ??= createIndicator("top");
            topGlow = Math.min(1, strength);
            topIndicator.style.transition = "opacity 100ms ease-out";
            topIndicator.style.opacity = String(topGlow * opts.maxOpacity);
        } else {
            bottomIndicator ??= createIndicator("bottom");
            bottomGlow = Math.min(1, strength);
            bottomIndicator.style.transition = "opacity 100ms ease-out";
            bottomIndicator.style.opacity = String(bottomGlow * opts.maxOpacity);
        }

        if (hideTimer !== null) clearTimeout(hideTimer);
        hideTimer = window.setTimeout(fadeOut, 160);
    }

    function fadeOut() {
        hideTimer = null;
        topGlow = 0;
        bottomGlow = 0;
        for (const el of [topIndicator, bottomIndicator]) {
            if (!el) continue;
            el.style.transition = "opacity 350ms cubic-bezier(0.22, 1, 0.36, 1)";
            el.style.opacity = "0";
        }
    }

    function handleWheel(e: WheelEvent) {
        if (isAtTop() && e.deltaY < 0) {
            showGlow("top", topGlow + 0.2);
        } else if (isAtBottom() && e.deltaY > 0) {
            showGlow("bottom", bottomGlow + 0.2);
        }
    }

    let touchStartY = 0;

    function handleTouchStart(e: TouchEvent) {
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e: TouchEvent) {
        const deltaY = touchStartY - e.touches[0].clientY;

        if (isAtTop() && deltaY < 0) {
            showGlow("top", Math.abs(deltaY) / 120);
        } else if (isAtBottom() && deltaY > 0) {
            showGlow("bottom", Math.abs(deltaY) / 120);
        }
    }

    function handleTouchEnd() {
        if (hideTimer !== null) clearTimeout(hideTimer);
        fadeOut();
    }

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return {
        destroy() {
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
            window.removeEventListener("resize", handleResize);
            resizeObserver.disconnect();
            if (hideTimer !== null) clearTimeout(hideTimer);
            topIndicator?.remove();
            bottomIndicator?.remove();
        },
    };
}
