import { safeValidateRelease, type Release } from './schema';

let cachedReleases: Release[] | null = null;
let releasesBySlug: Map<string, Release> | null = null;

/**
 * Shape of one `./releases/*.ts` module as seen by `import.meta.glob`.
 */
interface ReleaseModule {
    release?: unknown;
}

/**
 * Orders releases newest-first.
 *
 * An unparsable date yields `NaN`, which would make `b - a` return `NaN` and
 * leave the whole order implementation-defined; those releases are pushed to
 * the end instead, with a slug tiebreak so the result stays deterministic.
 * (Exported so the ordering rule is testable without the bundler.)
 */
export function compareReleasesByDateDesc(
    a: Pick<Release, 'date' | 'slug'>,
    b: Pick<Release, 'date' | 'slug'>
): number {
    const aEpoch = new Date(a.date).getTime();
    const bEpoch = new Date(b.date).getTime();
    const aValid = Number.isFinite(aEpoch);
    const bValid = Number.isFinite(bEpoch);

    if (aValid && bValid && aEpoch !== bEpoch) return bEpoch - aEpoch;
    if (aValid !== bValid) return aValid ? -1 : 1;

    return a.slug.localeCompare(b.slug);
}

/**
 * Builds the validated, sorted release list from a module map.
 *
 * Kept separate from `getAllReleases` so the ordering/validation rules are
 * testable without Vite's `import.meta.glob` (which only exists in the
 * bundler).
 *
 * Validation is loud on purpose: content is authored by a CLI, so a broken
 * release must fail the build instead of shipping half-valid data.
 *
 * - invalid content throws with the offending file and the zod issue paths
 * - duplicate slugs throw naming the slug and both files
 * - zero releases only warns: `releases/` is gitignored, so a fresh clone
 *   and CI legitimately have no content and must still build
 *
 * @param {Record<string, unknown>} modules - Map of file path to module exports
 * @returns {Release[]} Validated releases sorted by date (descending)
 */
export function buildReleaseIndex(modules: Record<string, unknown>): Release[] {
    const releases: Release[] = [];
    const slugSources = new Map<string, string>();

    for (const path in modules) {
        const mod = modules[path] as ReleaseModule | undefined;
        if (!mod || mod.release === undefined) continue;

        const result = safeValidateRelease(mod.release);
        if (!result.success) {
            const issues = result.error.issues
                .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
                .join('; ');
            throw new Error(`Invalid release content in ${path}: ${issues}`);
        }

        const release = result.data;

        const previousPath = slugSources.get(release.slug);
        if (previousPath !== undefined) {
            throw new Error(
                `Duplicate release slug "${release.slug}" in ${path} (already defined in ${previousPath})`
            );
        }
        slugSources.set(release.slug, path);

        releases.push(release);
    }

    releases.sort(compareReleasesByDateDesc);

    if (releases.length === 0) {
        console.warn(
            '[content] No releases found in src/lib/content/releases/. ' +
            'That directory is gitignored, so this is expected on a fresh clone or CI ' +
            'run without content. Continuing with an empty release list.'
        );
    }

    return releases;
}

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
    cachedReleases = buildReleaseIndex(modules);
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
