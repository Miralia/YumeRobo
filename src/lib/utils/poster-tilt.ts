export interface PosterTiltOptions {
    /** Maximum rotation, in degrees, at the poster edge. */
    maxTilt?: number;
    /** Upward travel, in pixels, while engaged. */
    lift?: number;
    /** Engaged scale factor. */
    scale?: number;
    /** Maximum glare opacity. */
    glareOpacity?: number;
}

export const POSTER_TILT_RESET_EVENT = "yumerobo:poster-tilt-reset";

const DEFAULTS: Required<PosterTiltOptions> = {
    maxTilt: 5,
    lift: 3,
    scale: 1.012,
    glareOpacity: 0.24,
};

interface SpringValue {
    value: number;
    velocity: number;
    target: number;
}

/**
 * Pointer-driven poster tilt shared by cards and the detail hero.
 *
 * Pointer events only update spring targets. A single animation frame loop
 * writes CSS variables directly, keeping high-frequency motion out of Svelte's
 * reactive graph and avoiding layout reads during pointermove.
 */
export function posterTilt(node: HTMLElement, options: PosterTiltOptions = {}) {
    let opts = { ...DEFAULTS, ...options };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia(
        "(any-hover: hover) and (any-pointer: fine)",
    );

    const rotateX: SpringValue = { value: 0, velocity: 0, target: 0 };
    const rotateY: SpringValue = { value: 0, velocity: 0, target: 0 };
    const glareX: SpringValue = { value: 0, velocity: 0, target: 0 };
    const glareY: SpringValue = { value: 0, velocity: 0, target: 0 };
    const engagement: SpringValue = { value: 0, velocity: 0, target: 0 };
    const springs = [rotateX, rotateY, glareX, glareY, engagement];

    let bounds: DOMRect | null = null;
    let frame: number | null = null;
    let previousTime = 0;

    function supportsInteraction(event?: PointerEvent): boolean {
        return (
            !reducedMotion.matches &&
            finePointer.matches &&
            event?.pointerType !== "touch"
        );
    }

    function render() {
        const engaged = Math.max(0, Math.min(1, engagement.value));
        node.style.setProperty(
            "--poster-tilt-x",
            `${rotateX.value.toFixed(3)}deg`,
        );
        node.style.setProperty(
            "--poster-tilt-y",
            `${rotateY.value.toFixed(3)}deg`,
        );
        node.style.setProperty(
            "--poster-lift",
            `${(-opts.lift * engaged).toFixed(3)}px`,
        );
        node.style.setProperty(
            "--poster-scale",
            `${(1 + (opts.scale - 1) * engaged).toFixed(4)}`,
        );
        node.style.setProperty(
            "--poster-glare-x",
            `${glareX.value.toFixed(2)}px`,
        );
        node.style.setProperty(
            "--poster-glare-y",
            `${glareY.value.toFixed(2)}px`,
        );
        node.style.setProperty(
            "--poster-glare-opacity",
            `${(opts.glareOpacity * engaged).toFixed(3)}`,
        );
    }

    function integrate(spring: SpringValue, delta: number) {
        const stiffness = 180;
        const damping = 18;
        spring.velocity +=
            (spring.target - spring.value) * stiffness * delta;
        spring.velocity *= Math.exp(-damping * delta);
        spring.value += spring.velocity * delta;
    }

    function isSettled(): boolean {
        return springs.every(
            (spring) =>
                Math.abs(spring.target - spring.value) < 0.01 &&
                Math.abs(spring.velocity) < 0.01,
        );
    }

    function animate(time: number) {
        const delta = previousTime
            ? Math.min((time - previousTime) / 1000, 0.032)
            : 1 / 60;
        previousTime = time;

        for (const spring of springs) integrate(spring, delta);
        render();

        if (isSettled()) {
            for (const spring of springs) {
                spring.value = spring.target;
                spring.velocity = 0;
            }
            render();
            frame = null;
            previousTime = 0;
            if (engagement.target === 0) {
                node.removeAttribute("data-poster-active");
            }
            return;
        }

        frame = requestAnimationFrame(animate);
    }

    function schedule() {
        if (frame === null) frame = requestAnimationFrame(animate);
    }

    function updateTargets(event: PointerEvent) {
        if (!bounds) return;
        const x = Math.max(
            -1,
            Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1),
        );
        const y = Math.max(
            -1,
            Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1),
        );

        rotateX.target = -y * opts.maxTilt;
        rotateY.target = x * opts.maxTilt;
        glareX.target = x * bounds.width * 0.28;
        glareY.target = y * bounds.height * 0.22;
        engagement.target = 1;
        schedule();
    }

    function handlePointerEnter(event: PointerEvent) {
        if (!supportsInteraction(event)) return;
        bounds = node.getBoundingClientRect();
        node.setAttribute("data-poster-active", "");
        updateTargets(event);
    }

    function handlePointerMove(event: PointerEvent) {
        if (!supportsInteraction(event) || !bounds) return;
        updateTargets(event);
    }

    function settle() {
        bounds = null;
        rotateX.target = 0;
        rotateY.target = 0;
        glareX.target = 0;
        glareY.target = 0;
        engagement.target = 0;
        schedule();
    }

    function resetImmediately() {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        previousTime = 0;
        bounds = null;
        for (const spring of springs) {
            spring.value = 0;
            spring.velocity = 0;
            spring.target = 0;
        }
        node.removeAttribute("data-poster-active");
        render();
    }

    function handleCapabilityChange() {
        if (reducedMotion.matches || !finePointer.matches) resetImmediately();
    }

    node.addEventListener("pointerenter", handlePointerEnter);
    node.addEventListener("pointermove", handlePointerMove);
    node.addEventListener("pointerleave", settle);
    node.addEventListener("pointercancel", settle);
    window.addEventListener("blur", resetImmediately);
    window.addEventListener(POSTER_TILT_RESET_EVENT, resetImmediately);
    reducedMotion.addEventListener("change", handleCapabilityChange);
    finePointer.addEventListener("change", handleCapabilityChange);
    render();

    return {
        update(nextOptions: PosterTiltOptions = {}) {
            opts = { ...DEFAULTS, ...nextOptions };
            render();
        },
        destroy() {
            if (frame !== null) cancelAnimationFrame(frame);
            node.removeEventListener("pointerenter", handlePointerEnter);
            node.removeEventListener("pointermove", handlePointerMove);
            node.removeEventListener("pointerleave", settle);
            node.removeEventListener("pointercancel", settle);
            window.removeEventListener("blur", resetImmediately);
            window.removeEventListener(
                POSTER_TILT_RESET_EVENT,
                resetImmediately,
            );
            reducedMotion.removeEventListener("change", handleCapabilityChange);
            finePointer.removeEventListener("change", handleCapabilityChange);
        },
    };
}
