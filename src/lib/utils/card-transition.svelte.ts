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
