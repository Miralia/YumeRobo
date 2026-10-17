/**
 * Tracks which release card participates in the current Magic Move.
 *
 * Only the card actually navigating may carry view-transition-names:
 * if every card is named, the ~9 unmatched cards each get an old-only
 * snapshot group which — under the `animation: none` morph rules —
 * never fades out and lingers over the detail page until the longest
 * transition animation ends.
 *
 * The layout's onNavigate sets the slug (from the target or source
 * route) before the old-state capture; the home list reads it to name
 * exactly one card in both directions.
 */
export const cardTransition = $state<{ slug: string | null }>({ slug: null });

/**
 * Point the Magic Move at a single card. `null` names no card, which is the
 * correct state outside an in-flight navigation.
 */
export function setCardTransition(slug: string | null): void {
    cardTransition.slug = slug;
}

/**
 * Drop any stale slug (aborted navigation, cancelled transition) so no card
 * keeps carrying a `view-transition-name` after the fact.
 */
export function clearCardTransition(): void {
    setCardTransition(null);
}
