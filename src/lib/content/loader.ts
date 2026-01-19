import type { Release } from './schema';

/**
 * Retrieves all release data from the file system.
 * 
 * Uses Vite's `import.meta.glob` with `{ eager: true }` to bundle all `.ts` files 
 * in the `releases/` directory at build time. This enables Static Site Generation (SSG)
 * without an external database.
 * 
 * @returns {Release[]} List of releases sorted by date (descending)
 */
export function getAllReleases(): Release[] {
    const modules = import.meta.glob('./releases/*.ts', { eager: true });

    const releases: Release[] = [];

    for (const path in modules) {
        const mod = modules[path] as { release: Release };
        if (mod.release) {
            releases.push(mod.release);
        }
    }

    return releases.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

/**
 * Searches releases by title (original, English, or Chinese).
 * Case-insensitive substring match.
 * 
 * @param {string} query - Search term
 * @returns {Release[]} Filtered list of releases
 */
export function searchReleases(query: string): Release[] {
    const q = query.toLowerCase();
    return getAllReleases().filter(
        (r) =>
            r.title.toLowerCase().includes(q) ||
            (r.title_en?.toLowerCase().includes(q) ?? false) ||
            (r.title_zh?.toLowerCase().includes(q) ?? false),
    );
}

/**
 * Retrieves a single release by its unique slug.
 * 
 * @param {string} slug - Content ID (e.g., 'cil8cybx')
 * @returns {Release | undefined} The release object or undefined if not found
 */
export function getReleaseBySlug(slug: string): Release | undefined {
    // In SSG context, iterating the array is performant enough for <1000 items.
    // For larger datasets, consider a slug-to-path map optimization.
    return getAllReleases().find((r) => r.slug === slug);
}
