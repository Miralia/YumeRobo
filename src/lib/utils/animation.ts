import { cubicOut } from "svelte/easing";

/**
 * Duration presets (synced with CSS variables in design-system.css)
 */
export const duration = {
    fast: 150,
    normal: 250,
    slow: 400,
    entrance: 500,
} as const;

/**
 * Spring presets for svelte/motion
 */
export const springPresets = {
    gentle: { stiffness: 0.1, damping: 0.8 },
    snappy: { stiffness: 0.3, damping: 0.7 },
    bouncy: { stiffness: 0.4, damping: 0.5 },
} as const;

/**
 * Calculate stagger delay for index-based animations
 */
export function stagger(index: number, base = 50): number {
    return index * base;
}

/**
 * Fly transition config factory
 */
export function flyConfig(
    index = 0,
    options: {
        direction?: "up" | "down" | "left" | "right";
        offset?: number;
        staggerBase?: number;
    } = {}
) {
    const { direction = "up", offset = 15, staggerBase = 80 } = options;

    const axis = direction === "left" || direction === "right" ? "x" : "y";
    const sign = direction === "down" || direction === "right" ? 1 : -1;

    return {
        [axis]: offset * sign,
        duration: duration.entrance,
        delay: stagger(index, staggerBase),
        easing: cubicOut,
    };
}

/**
 * Section-based stagger delays for detail page
 * Provides consistent timing across all page sections
 */
export const sections = {
    breadcrumb: { base: 0 },
    hero: { base: 160 },
    specs: { base: 240, offset: 50 },
    mediainfo: { base: 320, offset: 50 },
    torrents: { base: 400, offset: 50 },
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
