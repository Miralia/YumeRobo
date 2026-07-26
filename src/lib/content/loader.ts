import type { Release } from './schema';

let cachedReleases: Release[] | null = null;
let releasesBySlug: Map<string, Release> | null = null;

/**
 * Retrieves all release data from the file system.
 *
 * Uses Vite's `import.meta.glob` with `{ eager: true }` to bundle all `.ts` files
 * in the `releases/` directory at build time. This enables Static Site Generation (SSG)
 * without an external database.
 *
 * The sorted list is memoized: repeated lookups run against the same array
 * instead of re-globbing and re-sorting on every call.
 *
 * @returns {Release[]} List of releases sorted by date (descending)
 */
export function getAllReleases(): Release[] {
    if (cachedReleases) return cachedReleases;

    const modules = import.meta.glob('./releases/*.ts', { eager: true });

    const withEpoch: Array<{ release: Release; epoch: number }> = [];

    for (const path in modules) {
        const mod = modules[path] as { release: Release };
        if (mod.release) {
            withEpoch.push({
                release: mod.release,
                epoch: new Date(mod.release.date).getTime()
            });
        }
    }

    withEpoch.sort((a, b) => b.epoch - a.epoch);
    cachedReleases = withEpoch.map((entry) => entry.release);
    return cachedReleases;
}

/**
 * Retrieves a single release by its unique slug.
 *
 * @param {string} slug - Content ID (e.g., 'cil8cybx')
 * @returns {Release | undefined} The release object or undefined if not found
 */
export function getReleaseBySlug(slug: string): Release | undefined {
    if (!releasesBySlug) {
        releasesBySlug = new Map(getAllReleases().map((r) => [r.slug, r]));
    }
    return releasesBySlug.get(slug);
}
