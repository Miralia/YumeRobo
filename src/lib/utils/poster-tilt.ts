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
export const POSTER_TILT_TRANSITION_END_EVENT =
    "yumerobo:poster-tilt-transition-end";

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

interface PreservedPosterInteraction {
    id: string;
    clientX: number;
    clientY: number;
    rotateX: number;
    rotateY: number;
    engagement: number;
    glareStrength: number;
    glareXRatio: number;
    glareYRatio: number;
    glareLevel: number;
    glareAngle: number;
    expiresAt: number;
}

const PRESERVED_INTERACTION_TTL = 2000;
let preservedPosterInteraction: PreservedPosterInteraction | null = null;
let latestPointerPosition: {
    clientX: number;
    clientY: number;
    pointerType: string;
} | null = null;
let pointerTrackingConsumers = 0;

function trackPointerPosition(event: PointerEvent) {
    latestPointerPosition = {
        clientX: event.clientX,
        clientY: event.clientY,
        pointerType: event.pointerType,
    };
}

function startPointerTracking() {
    if (pointerTrackingConsumers === 0) {
        window.addEventListener("pointermove", trackPointerPosition, {
            capture: true,
            passive: true,
        });
    }
    pointerTrackingConsumers += 1;
}

function stopPointerTracking() {
    pointerTrackingConsumers -= 1;
    if (pointerTrackingConsumers === 0) {
        window.removeEventListener("pointermove", trackPointerPosition, true);
    }
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
    const glareStrength: SpringValue = { value: 0, velocity: 0, target: 0 };
    const motionSprings = [rotateX, rotateY, engagement];
    const glarePosition = [glareX, glareY];
    const springs = [...motionSprings, ...glarePosition, glareStrength];

    let bounds: DOMRect | null = null;
    let frame: number | null = null;
    let previousTime = 0;
    let suspended = false;
    let pointerX = 0;
    let pointerY = 0;
    let lastClientX: number | null = null;
    let lastClientY: number | null = null;
    let awaitingTransitionHandoff = false;
    let glareLevel = 0.32;
    let glareAngle = -18;

    function supportsInteraction(event?: PointerEvent): boolean {
        return (
            !reducedMotion.matches &&
            finePointer.matches &&
            !suspended &&
            event?.pointerType !== "touch"
        );
    }

    function render() {
        const engaged = Math.max(0, Math.min(1, engagement.value));
        const glare = Math.max(0, Math.min(1, glareStrength.value));
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
            `${(opts.glareOpacity * glare * glareLevel).toFixed(3)}`,
        );
        node.style.setProperty(
            "--poster-glare-angle",
            `${glareAngle.toFixed(2)}deg`,
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

    function integrateGlare(delta: number) {
        // Light intensity should follow quickly without the overshoot and
        // long tail that make physical rotation feel natural.
        const response = 1 - Math.exp(-24 * delta);
        glareStrength.value +=
            (glareStrength.target - glareStrength.value) * response;
        glareStrength.velocity = 0;
    }

    function integrateGlarePosition(delta: number) {
        // Keep the reflection responsive without making it jump between
        // pointer samples or inherit the rotational spring's long tail.
        const response = 1 - Math.exp(-36 * delta);
        for (const spring of glarePosition) {
            spring.value += (spring.target - spring.value) * response;
            spring.velocity = 0;
        }
    }

    function updateGlarePose() {
        if (!bounds) return;

        // Most of the reflection follows the rendered surface normal. A small
        // pointer lead keeps it responsive while the poster catches up.
        const tiltRange = Math.max(Math.abs(opts.maxTilt), 0.001);
        const poseX = Math.max(-1, Math.min(1, rotateY.value / tiltRange));
        const poseY = Math.max(-1, Math.min(1, -rotateX.value / tiltRange));
        const lightX = poseX * 0.7 + pointerX * 0.3;
        const lightY = poseY * 0.7 + pointerY * 0.3;
        const magnitude = Math.min(1, Math.hypot(lightX, lightY));

        glareX.target = lightX * bounds.width * 0.32;
        glareY.target = lightY * bounds.height * 0.24;
        glareLevel = 0.32 + magnitude * 0.68;
        glareAngle = -18 + lightX * 10 - lightY * 6;
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

        for (const spring of motionSprings) integrate(spring, delta);
        updateGlarePose();
        integrateGlarePosition(delta);
        integrateGlare(delta);
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

    function updateTargets(clientX: number, clientY: number) {
        if (!bounds) return;
        lastClientX = clientX;
        lastClientY = clientY;
        const x = Math.max(
            -1,
            Math.min(1, ((clientX - bounds.left) / bounds.width) * 2 - 1),
        );
        const y = Math.max(
            -1,
            Math.min(1, ((clientY - bounds.top) / bounds.height) * 2 - 1),
        );

        rotateX.target = -y * opts.maxTilt;
        rotateY.target = x * opts.maxTilt;
        pointerX = x;
        pointerY = y;
        engagement.target = 1;
        glareStrength.target = 1;
        schedule();
    }

    function handlePointerEnter(event: PointerEvent) {
        if (!supportsInteraction(event)) return;
        latestPointerPosition = {
            clientX: event.clientX,
            clientY: event.clientY,
            pointerType: event.pointerType,
        };
        if (awaitingTransitionHandoff && bounds) {
            node.setAttribute("data-poster-hover", "");
            updateTargets(event.clientX, event.clientY);
            return;
        }
        bounds = node.getBoundingClientRect();
        node.setAttribute("data-poster-active", "");
        node.setAttribute("data-poster-hover", "");
        updateTargets(event.clientX, event.clientY);
    }

    function handlePointerMove(event: PointerEvent) {
        if (!supportsInteraction(event) || !bounds) return;
        updateTargets(event.clientX, event.clientY);
    }

    function settle() {
        suspended = false;
        awaitingTransitionHandoff = false;
        bounds = null;
        pointerX = 0;
        pointerY = 0;
        lastClientX = null;
        lastClientY = null;
        glareLevel = 0.32;
        glareAngle = -18;
        node.removeAttribute("data-poster-handoff");
        node.removeAttribute("data-poster-hover");
        rotateX.target = 0;
        rotateY.target = 0;
        glareX.target = 0;
        glareY.target = 0;
        engagement.target = 0;
        glareStrength.target = 0;
        glareStrength.velocity = 0;
        schedule();
    }

    function resetImmediately() {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        previousTime = 0;
        bounds = null;
        pointerX = 0;
        pointerY = 0;
        lastClientX = null;
        lastClientY = null;
        glareLevel = 0.32;
        glareAngle = -18;
        for (const spring of springs) {
            spring.value = 0;
            spring.velocity = 0;
            spring.target = 0;
        }
        awaitingTransitionHandoff = false;
        node.removeAttribute("data-poster-handoff");
        node.removeAttribute("data-poster-active");
        node.removeAttribute("data-poster-hover");
        render();
    }

    function handleCapabilityChange() {
        if (reducedMotion.matches || !finePointer.matches) resetImmediately();
    }

    function handleNavigationReset() {
        const posterId = node.dataset.posterId;
        if (
            posterId &&
            node.hasAttribute("data-poster-hover") &&
            bounds &&
            bounds.width > 0 &&
            bounds.height > 0 &&
            lastClientX !== null &&
            lastClientY !== null
        ) {
            preservedPosterInteraction = {
                id: posterId,
                clientX: lastClientX,
                clientY: lastClientY,
                rotateX: rotateX.value,
                rotateY: rotateY.value,
                engagement: engagement.value,
                glareStrength: glareStrength.value,
                glareXRatio: glareX.value / bounds.width,
                glareYRatio: glareY.value / bounds.height,
                glareLevel,
                glareAngle,
                expiresAt: performance.now() + PRESERVED_INTERACTION_TTL,
            };
        }

        // Freeze the live pose while the static transition shell is captured.
        // The shell owns Magic Move geometry, so the inner poster can retain
        // its tilt and glare without distorting the shared-element bounds.
        suspended = true;
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        previousTime = 0;
    }

    function restorePreservedInteraction() {
        const preserved = preservedPosterInteraction;
        const posterId = node.dataset.posterId;

        // Other cards mount at the same time as the matching destination and
        // must leave its one-shot interaction state untouched.
        if (!preserved || !posterId || preserved.id !== posterId) return;

        if (
            performance.now() > preserved.expiresAt ||
            reducedMotion.matches ||
            !finePointer.matches
        ) {
            preservedPosterInteraction = null;
            return;
        }

        const nextBounds = node.getBoundingClientRect();
        const currentPointer = latestPointerPosition ?? {
            clientX: preserved.clientX,
            clientY: preserved.clientY,
            pointerType: "mouse",
        };
        const pointerIsInside =
            currentPointer.clientX >= nextBounds.left &&
            currentPointer.clientX <= nextBounds.right &&
            currentPointer.clientY >= nextBounds.top &&
            currentPointer.clientY <= nextBounds.bottom;

        // During destination capture the View Transition overlay temporarily
        // makes :hover false. Global pointer coordinates remain authoritative
        // until hit testing returns to the live page.
        if (!pointerIsInside || currentPointer.pointerType === "touch") {
            preservedPosterInteraction = null;
            return;
        }

        preservedPosterInteraction = null;
        suspended = false;
        awaitingTransitionHandoff = true;
        bounds = nextBounds;
        node.setAttribute("data-poster-active", "");
        node.setAttribute("data-poster-hover", "");
        node.setAttribute("data-poster-handoff", "");

        rotateX.value = preserved.rotateX;
        rotateY.value = preserved.rotateY;
        engagement.value = preserved.engagement;
        glareStrength.value = preserved.glareStrength;
        glareX.value = preserved.glareXRatio * nextBounds.width;
        glareY.value = preserved.glareYRatio * nextBounds.height;
        glareLevel = preserved.glareLevel;
        glareAngle = preserved.glareAngle;
        updateTargets(currentPointer.clientX, currentPointer.clientY);
        render();
        schedule();
    }

    function handleTransitionEnd() {
        if (!awaitingTransitionHandoff) return;
        awaitingTransitionHandoff = false;
        node.removeAttribute("data-poster-handoff");

        const currentPointer = latestPointerPosition;
        const pointerIsInside =
            bounds &&
            currentPointer &&
            currentPointer.clientX >= bounds.left &&
            currentPointer.clientX <= bounds.right &&
            currentPointer.clientY >= bounds.top &&
            currentPointer.clientY <= bounds.bottom;

        if (
            !pointerIsInside ||
            currentPointer.pointerType === "touch" ||
            !node.matches(":hover")
        ) {
            settle();
            return;
        }

        node.setAttribute("data-poster-hover", "");
        updateTargets(currentPointer.clientX, currentPointer.clientY);
    }

    startPointerTracking();
    node.addEventListener("pointerenter", handlePointerEnter);
    node.addEventListener("pointermove", handlePointerMove);
    node.addEventListener("pointerleave", settle);
    node.addEventListener("pointercancel", settle);
    window.addEventListener("blur", resetImmediately);
    window.addEventListener(POSTER_TILT_RESET_EVENT, handleNavigationReset);
    window.addEventListener(
        POSTER_TILT_TRANSITION_END_EVENT,
        handleTransitionEnd,
    );
    reducedMotion.addEventListener("change", handleCapabilityChange);
    finePointer.addEventListener("change", handleCapabilityChange);
    render();
    if (preservedPosterInteraction) {
        // Restore before the destination snapshot. The untransformed outer
        // shell keeps Magic Move geometry stable while both snapshots carry
        // the same inner visual pose.
        restorePreservedInteraction();
    }

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
                handleNavigationReset,
            );
            window.removeEventListener(
                POSTER_TILT_TRANSITION_END_EVENT,
                handleTransitionEnd,
            );
            reducedMotion.removeEventListener("change", handleCapabilityChange);
            finePointer.removeEventListener("change", handleCapabilityChange);
            stopPointerTracking();
        },
    };
}
