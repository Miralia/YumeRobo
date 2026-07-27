interface LiquidGlassOptions {
    interactive?: boolean;
    refraction?: number;
}

let filterSequence = 0;

function smoothstep(edge0: number, edge1: number, value: number): number {
    const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

function roundedRectDistance(
    x: number,
    y: number,
    halfWidth: number,
    halfHeight: number,
    radius: number,
): number {
    const qx = Math.abs(x) - halfWidth + radius;
    const qy = Math.abs(y) - halfHeight + radius;
    return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - radius;
}

function supportsLiveBackdropRefraction(): boolean {
    // backdrop-filter:url() currently bends live DOM only in Chromium.
    return (
        /Chrome|Chromium|Edg\//.test(navigator.userAgent) &&
        !/OPR\//.test(navigator.userAgent) &&
        !matchMedia("(prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)").matches
    );
}

/**
 * Generates an edge-only displacement map from a rounded-rectangle SDF.
 * Inspired by the MIT-licensed shuding/liquid-glass approach, adapted so the
 * map is rebuilt only when an actual control changes size.
 */
function displacementMap(width: number, height: number, radius: number): string | null {
    const scale = Math.min(1, 240 / Math.max(width, height));
    const mapWidth = Math.max(2, Math.round(width * scale));
    const mapHeight = Math.max(2, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    const context = canvas.getContext("2d");
    if (!context) return null;

    const pixels = context.createImageData(mapWidth, mapHeight);
    const halfWidth = mapWidth / 2;
    const halfHeight = mapHeight / 2;
    const scaledRadius = Math.min(radius * scale, halfWidth, halfHeight);
    const rim = Math.max(5, Math.min(mapWidth, mapHeight) * 0.22);

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            const localX = x + 0.5 - halfWidth;
            const localY = y + 0.5 - halfHeight;
            const signedDistance = roundedRectDistance(
                localX,
                localY,
                halfWidth,
                halfHeight,
                scaledRadius,
            );
            const insideDistance = Math.max(0, -signedDistance);
            const rimStrength = smoothstep(rim, 0, insideDistance);
            const length = Math.max(1, Math.hypot(localX, localY));
            const index = (y * mapWidth + x) * 4;

            pixels.data[index] = 128 + Math.round((localX / length) * rimStrength * 127);
            pixels.data[index + 1] = 128 + Math.round((localY / length) * rimStrength * 127);
            pixels.data[index + 2] = 128;
            pixels.data[index + 3] = signedDistance <= 0 ? 255 : 0;
        }
    }

    context.putImageData(pixels, 0, 0);
    return canvas.toDataURL("image/png");
}

export function liquidGlass(
    node: HTMLElement,
    initialOptions: LiquidGlassOptions = {},
) {
    let options = initialOptions;
    let frame = 0;
    let svg: SVGSVGElement | null = null;
    let image: SVGFEImageElement | null = null;
    let displacement: SVGFEDisplacementMapElement | null = null;
    const filterId = `liquid-refraction-${++filterSequence}`;
    const canRefract = supportsLiveBackdropRefraction();

    function ensureFilter() {
        if (!canRefract || svg) return;
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("aria-hidden", "true");
        svg.style.cssText = "position:fixed;width:0;height:0;pointer-events:none";
        svg.innerHTML = `<defs><filter id="${filterId}" x="-12%" y="-20%" width="124%" height="140%" color-interpolation-filters="sRGB"><feImage x="0" y="0" width="100%" height="100%" result="map" preserveAspectRatio="none"/><feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`;
        document.body.appendChild(svg);
        image = svg.querySelector("feImage");
        displacement = svg.querySelector("feDisplacementMap");
    }

    function updatePointer(event: PointerEvent) {
        if (!options.interactive || event.pointerType === "touch") return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            const rect = node.getBoundingClientRect();
            node.style.setProperty("--liquid-pointer-x", `${event.clientX - rect.left}px`);
            node.style.setProperty("--liquid-pointer-y", `${event.clientY - rect.top}px`);
            node.dataset.liquidActive = "";
        });
    }

    function clearPointer() {
        cancelAnimationFrame(frame);
        delete node.dataset.liquidActive;
    }

    function updateFilter() {
        if (!canRefract) return;
        const rect = node.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        ensureFilter();
        if (!image || !displacement) return;
        const radius = Number.parseFloat(getComputedStyle(node).borderTopLeftRadius) || 0;
        const map = displacementMap(rect.width, rect.height, radius);
        if (!map) return;
        image.setAttribute("href", map);
        displacement.setAttribute("scale", String(options.refraction ?? 10));
        node.style.setProperty("--liquid-refraction-filter", `url(#${filterId})`);
        node.dataset.liquidRefraction = "";
    }

    const resizeObserver = new ResizeObserver(updateFilter);
    resizeObserver.observe(node);
    node.addEventListener("pointermove", updatePointer, { passive: true });
    node.addEventListener("pointerleave", clearPointer);
    updateFilter();

    return {
        update(nextOptions: LiquidGlassOptions) {
            options = nextOptions;
            if (!options.interactive) clearPointer();
            updateFilter();
        },
        destroy() {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            node.removeEventListener("pointermove", updatePointer);
            node.removeEventListener("pointerleave", clearPointer);
            svg?.remove();
            node.style.removeProperty("--liquid-refraction-filter");
            delete node.dataset.liquidActive;
            delete node.dataset.liquidRefraction;
        },
    };
}
