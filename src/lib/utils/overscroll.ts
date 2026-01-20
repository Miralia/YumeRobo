/**
 * Scroll Boundary Indicator with Load More Trigger
 * 
 * Shows a subtle glow when user reaches top/bottom of page.
 * Dispatches 'boundary-loadmore' event when user intentionally over-scrolls at bottom.
 * 
 * @example
 * ```svelte
 * <div use:boundaryIndicator>...</div>
 * <div use:boundaryIndicator={{ enableLoadMore: false }}>...</div>
 * ```
 */

export interface BoundaryIndicatorOptions {
    /** Glow color (CSS value) */
    color?: string;
    /** Maximum glow opacity (0-1) */
    maxOpacity?: number;
    /** Glow gradient height in pixels */
    size?: number;
    /** Enable load more trigger at bottom */
    enableLoadMore?: boolean;
    /** Cumulative scroll threshold to trigger load more */
    loadMoreThreshold?: number;
    /** Cooldown after triggering load more (ms) */
    loadMoreCooldown?: number;
    /** Time to wait before considering scroll "settled" (ms) */
    settleDelay?: number;
}

const defaultOptions: Required<BoundaryIndicatorOptions> = {
    color: "var(--color-accent)",
    maxOpacity: 0.08,
    size: 60,
    enableLoadMore: true,
    loadMoreThreshold: 400,
    loadMoreCooldown: 1000,
    settleDelay: 200,
};

/**
 * Svelte Action for scroll boundary indicator.
 * Apply to the root scrollable container.
 */
export function boundaryIndicator(node: HTMLElement, options: BoundaryIndicatorOptions = {}) {
    const opts = { ...defaultOptions, ...options };

    const topIndicator = document.createElement("div");
    const bottomIndicator = document.createElement("div");

    const baseStyle = `
        position: fixed;
        left: 0;
        right: 0;
        height: ${opts.size}px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s ease-out;
        z-index: 9999;
    `;

    topIndicator.style.cssText = baseStyle + `
        top: 0;
        background: linear-gradient(to bottom, ${opts.color}, transparent);
    `;

    bottomIndicator.style.cssText = baseStyle + `
        bottom: 0;
        background: linear-gradient(to top, ${opts.color}, transparent);
    `;

    document.body.appendChild(topIndicator);
    document.body.appendChild(bottomIndicator);

    let topGlow = 0;
    let bottomGlow = 0;
    let fadeFrame: number | null = null;

    let cumulativeScroll = 0;
    let isInCooldown = false;
    let resetTimeout: number | null = null;
    let settledAtBottom = false;
    let scrollSettleTimeout: number | null = null;

    const isAtTop = () => window.scrollY <= 0;
    const isAtBottom = () =>
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;

    function updateIndicators() {
        topIndicator.style.opacity = String(topGlow * opts.maxOpacity);

        const loadMoreProgress = opts.enableLoadMore && settledAtBottom
            ? Math.min(1, cumulativeScroll / opts.loadMoreThreshold)
            : 0;
        const bottomOpacity = Math.max(bottomGlow, loadMoreProgress) * opts.maxOpacity;
        bottomIndicator.style.opacity = String(bottomOpacity);
    }

    function triggerLoadMore() {
        if (isInCooldown) return;

        isInCooldown = true;
        cumulativeScroll = 0;
        settledAtBottom = false;

        bottomIndicator.style.opacity = String(opts.maxOpacity * 1.5);
        setTimeout(() => {
            bottomIndicator.style.opacity = "0";
        }, 120);

        window.dispatchEvent(new CustomEvent("boundary-loadmore"));

        setTimeout(() => {
            isInCooldown = false;
        }, opts.loadMoreCooldown);
    }

    function resetCumulativeScroll() {
        cumulativeScroll = 0;
        updateIndicators();
    }

    function checkScrollSettle() {
        if (scrollSettleTimeout) clearTimeout(scrollSettleTimeout);

        if (isAtBottom()) {
            scrollSettleTimeout = window.setTimeout(() => {
                if (isAtBottom()) {
                    settledAtBottom = true;
                }
            }, opts.settleDelay);
        } else {
            settledAtBottom = false;
        }
    }

    function fadeOut() {
        topGlow = Math.max(0, topGlow - 0.08);
        bottomGlow = Math.max(0, bottomGlow - 0.08);
        updateIndicators();

        if (topGlow > 0 || bottomGlow > 0) {
            fadeFrame = requestAnimationFrame(fadeOut);
        } else {
            fadeFrame = null;
        }
    }

    function startFadeOut() {
        if (fadeFrame === null) {
            fadeFrame = requestAnimationFrame(fadeOut);
        }
    }

    function handleWheel(e: WheelEvent) {
        if (fadeFrame) {
            cancelAnimationFrame(fadeFrame);
            fadeFrame = null;
        }

        const atBottom = isAtBottom();
        const atTop = isAtTop();

        if (atTop && e.deltaY < 0) {
            topGlow = Math.min(1, topGlow + 0.2);
            updateIndicators();
        } else if (atBottom && e.deltaY > 0) {
            bottomGlow = Math.min(1, bottomGlow + 0.2);

            if (opts.enableLoadMore && !isInCooldown && settledAtBottom) {
                cumulativeScroll += Math.abs(e.deltaY);

                if (resetTimeout) clearTimeout(resetTimeout);
                resetTimeout = window.setTimeout(resetCumulativeScroll, 500);

                if (cumulativeScroll >= opts.loadMoreThreshold) {
                    triggerLoadMore();
                }
            }

            updateIndicators();
        } else {
            cumulativeScroll = 0;
            settledAtBottom = false;
        }

        checkScrollSettle();
        startFadeOut();
    }

    let touchStartY = 0;
    let touchSettledAtBottom = false;

    function handleTouchStart(e: TouchEvent) {
        touchStartY = e.touches[0].clientY;
        touchSettledAtBottom = settledAtBottom && isAtBottom();
    }

    function handleTouchMove(e: TouchEvent) {
        if (fadeFrame) {
            cancelAnimationFrame(fadeFrame);
            fadeFrame = null;
        }

        const currentY = e.touches[0].clientY;
        const deltaY = touchStartY - currentY;

        if (isAtTop() && deltaY < 0) {
            topGlow = Math.min(1, Math.abs(deltaY) / 120);
            updateIndicators();
        } else if (isAtBottom() && deltaY > 0) {
            bottomGlow = Math.min(1, Math.abs(deltaY) / 120);

            if (opts.enableLoadMore && !isInCooldown && touchSettledAtBottom) {
                cumulativeScroll = Math.abs(deltaY);

                if (cumulativeScroll >= opts.loadMoreThreshold) {
                    triggerLoadMore();
                }
            }

            updateIndicators();
        }
    }

    function handleTouchEnd() {
        startFadeOut();
        cumulativeScroll = 0;
        checkScrollSettle();
    }

    function handleScroll() {
        checkScrollSettle();
    }

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return {
        destroy() {
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
            window.removeEventListener("scroll", handleScroll);
            if (fadeFrame) cancelAnimationFrame(fadeFrame);
            if (resetTimeout) clearTimeout(resetTimeout);
            if (scrollSettleTimeout) clearTimeout(scrollSettleTimeout);
            topIndicator.remove();
            bottomIndicator.remove();
        },
        update(newOptions: BoundaryIndicatorOptions) {
            Object.assign(opts, newOptions);
        },
    };
}
