export type TooltipPlacement = "top" | "bottom";

export interface AccessibleTooltipOptions {
    text: string;
    placement?: TooltipPlacement;
}

let tooltipSequence = 0;

/**
 * Adds a body-level tooltip without changing the geometry or overflow of the
 * control it describes. Touch pointers are excluded because they have no
 * stable hover state; keyboard focus remains fully supported.
 */
export function accessibleTooltip(
    node: HTMLElement,
    initialOptions: AccessibleTooltipOptions,
) {
    let options = initialOptions;
    let showTimer = 0;
    let frame = 0;
    let isOpen = false;
    const id = `accessible-tooltip-${++tooltipSequence}`;
    const tooltip = document.createElement("div");

    tooltip.id = id;
    tooltip.className = "accessible-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.textContent = options.text;
    document.body.appendChild(tooltip);

    const describedBy = node.getAttribute("aria-describedby")
        ?.split(/\s+/)
        .filter(Boolean) ?? [];
    node.setAttribute(
        "aria-describedby",
        [...new Set([...describedBy, id])].join(" "),
    );

    function positionTooltip() {
        if (!isOpen) return;

        const anchor = node.getBoundingClientRect();
        const tip = tooltip.getBoundingClientRect();
        const gap = 8;
        const edge = 8;
        const preferred = options.placement ?? "top";
        const hasTopSpace = anchor.top >= tip.height + gap + edge;
        const hasBottomSpace =
            window.innerHeight - anchor.bottom >= tip.height + gap + edge;
        const side =
            preferred === "top"
                ? hasTopSpace || !hasBottomSpace
                    ? "top"
                    : "bottom"
                : hasBottomSpace || !hasTopSpace
                  ? "bottom"
                  : "top";
        const centeredLeft = anchor.left + (anchor.width - tip.width) / 2;
        const left = Math.min(
            window.innerWidth - tip.width - edge,
            Math.max(edge, centeredLeft),
        );
        const top =
            side === "top"
                ? anchor.top - tip.height - gap
                : anchor.bottom + gap;

        tooltip.dataset.side = side;
        tooltip.style.left = `${Math.round(left)}px`;
        tooltip.style.top = `${Math.round(top)}px`;
    }

    function show(immediate = false) {
        window.clearTimeout(showTimer);
        const open = () => {
            isOpen = true;
            tooltip.dataset.open = "";
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(positionTooltip);
        };

        if (immediate) {
            open();
        } else {
            showTimer = window.setTimeout(open, 300);
        }
    }

    function hide() {
        window.clearTimeout(showTimer);
        cancelAnimationFrame(frame);
        isOpen = false;
        delete tooltip.dataset.open;
    }

    function handlePointerEnter(event: PointerEvent) {
        if (
            event.pointerType === "touch" ||
            !matchMedia("(hover: hover) and (pointer: fine)").matches
        ) {
            return;
        }
        show();
    }

    function handleFocus() {
        if (node.matches(":focus-visible")) show(true);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") hide();
    }

    node.addEventListener("pointerenter", handlePointerEnter);
    node.addEventListener("pointerleave", hide);
    node.addEventListener("focus", handleFocus);
    node.addEventListener("blur", hide);
    node.addEventListener("click", hide);
    node.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", positionTooltip);
    window.addEventListener("scroll", positionTooltip, true);

    return {
        update(nextOptions: AccessibleTooltipOptions) {
            options = nextOptions;
            tooltip.textContent = options.text;
            if (isOpen) positionTooltip();
        },
        destroy() {
            hide();
            node.removeEventListener("pointerenter", handlePointerEnter);
            node.removeEventListener("pointerleave", hide);
            node.removeEventListener("focus", handleFocus);
            node.removeEventListener("blur", hide);
            node.removeEventListener("click", hide);
            node.removeEventListener("keydown", handleKeydown);
            window.removeEventListener("resize", positionTooltip);
            window.removeEventListener("scroll", positionTooltip, true);
            tooltip.remove();

            const remainingIds =
                node
                    .getAttribute("aria-describedby")
                    ?.split(/\s+/)
                    .filter((token) => token && token !== id) ?? [];
            if (remainingIds.length > 0) {
                node.setAttribute("aria-describedby", remainingIds.join(" "));
            } else {
                node.removeAttribute("aria-describedby");
            }
        },
    };
}
