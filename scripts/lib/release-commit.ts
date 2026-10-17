/**
 * Finish writing a release.
 *
 * A release write is a two-step commit: the staged slow.pics sidecar is copied
 * into `static/comparisons/`, and the draft is cleared. The order is not
 * interchangeable — clearing a draft also deletes the staged sidecar it points
 * at, so publishing first is required. Doing it the other way round fails with
 * ENOENT *after* the release file has already been replaced, which is how
 * `aq8ufjon` lost its comparison sidecar.
 *
 * The sequence lives here, rather than inline in the wizard, so the invariant
 * can be tested without driving the interactive prompts.
 */
import type { DraftComparison } from './drafts';

export interface ReleaseCommitSteps {
    slug: string;
    comparison: DraftComparison | undefined;
    /** Copy the staged sidecar to its published location. */
    publishComparison: (
        slug: string,
        comparison: DraftComparison | undefined,
    ) => Promise<void>;
    /** Delete the draft, including the staged sidecar. */
    clearDraft: () => Promise<void>;
}

export async function commitReleaseSidecars({
    slug,
    comparison,
    publishComparison,
    clearDraft,
}: ReleaseCommitSteps): Promise<void> {
    await publishComparison(slug, comparison);
    await clearDraft();
}
