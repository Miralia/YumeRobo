<script lang="ts">
    import type { ReleaseCardData } from "$lib/content/cards";
    import { cardTransition } from "$lib/utils/card-transition.svelte";
    import { formatDateTime } from "$lib/utils/date";
    import { getPosterLoadingAttributes } from "$lib/utils/poster-loading";

    interface Props {
        /** Trimmed card projection of the release */
        card: ReleaseCardData;
        /** Index in the visible list, used for image loading priority */
        index?: number;
    }

    let { card, index = 0 }: Props = $props();

    function getCardPosterPath(posterPath: string): string {
        return posterPath.replace(/\.avif$/i, ".card.avif");
    }

    let posterLoading = $derived(getPosterLoadingAttributes(index));

    // Only the navigating card carries view-transition-names; naming
    // every card leaves old-only snapshots of the other cards floating
    // over the destination page for the length of the transition.
    let isTransitioning = $derived(cardTransition.slug === card.slug);
</script>

<a href="/{card.slug}" class="release-card">
    <!-- Poster -->
    <div
        class="poster-container"
        style:view-transition-name={isTransitioning
            ? `poster-${card.slug}`
            : undefined}
    >
        <img
            src={getCardPosterPath(card.poster)}
            alt="{card.title} poster"
            class="poster"
            width="200"
            height="300"
            loading={posterLoading.loading}
            fetchpriority={posterLoading.fetchpriority}
            decoding="async"
        />
    </div>

    <!-- Info -->
    <div class="info">
        <h2
            class="title"
            style:view-transition-name={isTransitioning
                ? `title-${card.slug}`
                : undefined}
        >
            {card.title}
        </h2>

        <!-- Torrent release names -->
        <div class="release-names">
            {#each card.torrentNames as name}
                <p class="release-name">{name}</p>
            {/each}
        </div>

        <!-- Footer: Badges (left) and Date (right) -->
        <div class="card-footer">
            <div class="badges">
                {#each card.badges as badge}
                    <span class="badge {badge === 'Fin' ? 'badge-fin' : ''}"
                        >{badge}</span
                    >
                {/each}
            </div>
            <time class="date" datetime={card.date}>
                {formatDateTime(card.date, "medium")}
            </time>
        </div>
    </div>
</a>

<style>
    .release-card {
        display: flex;
        gap: var(--space-4);
        padding: var(--space-3);
        background: var(--color-background-secondary);
        border: 1px solid color-mix(
            in srgb,
            var(--color-label) 8%,
            transparent
        );
        border-radius: var(--radius-lg);
        text-decoration: none;
        color: inherit;
        transition:
            transform var(--duration-normal) var(--ease-spring),
            border-color var(--duration-fast) var(--ease-out),
            box-shadow var(--duration-normal) var(--ease-out),
            background var(--duration-fast) var(--ease-out);
    }

    .release-card:hover {
        background: var(--color-background-tertiary);
        border-color: color-mix(
            in srgb,
            var(--color-label) 12%,
            transparent
        );
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
    }

    .release-card:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
        border-radius: var(--radius-lg);
    }

    .poster-container {
        position: relative;
        flex-shrink: 0;
        width: 80px;
        aspect-ratio: 2/3;
        border-radius: var(--radius-poster);
        overflow: hidden;
        background: var(--color-fill);
        view-transition-class: poster;
    }

    @media (min-width: 640px) {
        .poster-container {
            width: 100px;
        }
    }

    .poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--duration-slow) var(--ease-out);
    }

    .release-card:hover .poster {
        transform: scale(1.05);
    }

    .info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .title {
        font-family: var(--font-display);
        font-size: var(--text-base);
        font-weight: 700;
        line-height: var(--leading-tight);
        letter-spacing: var(--tracking-tight);
        color: var(--color-label);
        margin: 0;
        view-transition-class: title;
    }

    @media (min-width: 640px) {
        .title {
            font-size: var(--text-lg);
        }
    }

    .release-names {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-bottom: var(--space-2);
    }

    .release-name {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: color-mix(
            in srgb,
            var(--color-label) 64%,
            var(--color-background-secondary)
        );
        line-height: var(--leading-normal);
        word-break: break-all;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .card-footer {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: var(--space-2);
        margin-top: auto;
    }

    .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .badge {
        font-family: var(--font-sans);
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        background: var(--badge-bg);
        color: var(--badge-fg);
        border-radius: var(--radius-sm);
        line-height: 1;
        letter-spacing: 0.02em;
    }

    .badge-fin {
        background: var(--badge-fin-bg);
        color: var(--badge-fin-fg);
    }

    .date {
        font-family: var(--font-sans);
        font-size: var(--text-sm);
        color: color-mix(
            in srgb,
            var(--color-label) 68%,
            var(--color-background-secondary)
        );
        line-height: 1.35;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }
</style>
