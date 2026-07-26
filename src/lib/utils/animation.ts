import { cubicOut } from "svelte/easing";
import { prefersReducedMotion } from "svelte/motion";

/**
 * Duration presets (synced with the --duration-* tokens in design-system.css)
 */
export const duration = {
    fast: 150,
    normal: 250,
    slow: 400,
    entrance: 450,
} as const;

/**
 * Calculate stagger delay for index-based animations
 */
export function stagger(index: number, base = 50): number {
    return index * base;
}

/**
 * Section-based stagger delays for detail page
 * Provides consistent timing across all page sections
 */
export const sections = {
    breadcrumb: { base: 0 },
    hero: { base: 120 },
    specs: { base: 200, offset: 60 },
    mediainfo: { base: 300, offset: 60 },
    torrents: { base: 400, offset: 60 },
} as const;

/**
 * Calculate delay for section-based animations
 * @param section - Section name from sections config
 * @param index - Item index within section (for stagger effect)
 */
export function sectionDelay(section: keyof typeof sections, index = 0): number {
    const config = sections[section];
    const offset = "offset" in config ? config.offset : 0;
    return config.base + index * offset;
}

/**
 * Svelte's fly/slide transitions run through WAAPI, which the global
 * CSS reduced-motion clamp cannot reach — every JS-driven duration must
 * flow through here so the preference is honoured.
 */
export function motionSafe(ms: number): number {
    return prefersReducedMotion.current ? 0 : ms;
}

/**
 * Entrance fly config for detail-page sections: section-timed,
 * reduced-motion aware, on the shared easing family.
 */
export function entranceFly(
    section: keyof typeof sections,
    index = 0,
    options: { axis?: "x" | "y"; offset?: number; lead?: number } = {}
) {
    const { axis = "y", offset = 15, lead = 0 } = options;
    return {
        [axis]: offset,
        duration: motionSafe(duration.entrance),
        delay: motionSafe(Math.max(0, sectionDelay(section, index) - lead)),
        easing: cubicOut,
    };
}

/**
 * Shared accordion slide config (reduced-motion aware).
 */
export function slideParams() {
    return {
        duration: motionSafe(duration.normal),
        easing: cubicOut,
    };
}
