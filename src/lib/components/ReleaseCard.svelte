<script lang="ts">
    import type { ReleaseCardData } from "$lib/content/cards";
    import LocalDateTime from "$lib/components/LocalDateTime.svelte";
    import { cardTransition } from "$lib/utils/card-transition.svelte";
    import { getPosterLoadingAttributes } from "$lib/utils/poster-loading";
    import { posterTilt } from "$lib/utils/poster-tilt";

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

<a
    href="/{card.slug}"
    class="release-card"
    style:--pc={card.accent ?? "var(--color-accent)"}
>
    <!-- Poster -->
    <div
        class="poster-transition-shell"
        style:view-transition-name={isTransitioning
            ? `poster-${card.slug}`
            : undefined}
    >
        <div
            class="poster-container poster-motion"
            use:posterTilt
            data-poster-id={card.slug}
        >
            <img
                src={getCardPosterPath(card.poster)}
                srcset={`${getCardPosterPath(card.poster)} 200w, ${card.poster} 500w`}
                sizes="(min-width: 640px) 176px, 44vw"
                alt="{card.title} poster"
                class="poster"
                width="200"
                height="300"
                loading={posterLoading.loading}
                fetchpriority={posterLoading.fetchpriority}
                decoding={posterLoading.decoding}
            />
            {#if card.badges.length > 0}
                <span
                    class="badge-chip"
                    style:view-transition-name={isTransitioning
                        ? `badge-${card.slug}`
                        : undefined}
                >{card.badges.join(" · ")}</span>
            {/if}
        </div>
    </div>

    <!-- Caption -->
    <div class="meta">
        <h2
            class="title"
            style:view-transition-name={isTransitioning
                ? `title-${card.slug}`
                : undefined}
        >
            {card.title}
        </h2>
        <p
            class="sub"
            style:view-transition-name={isTransitioning
                ? `timing-${card.slug}`
                : undefined}
        >
            {#if card.year}<span class="release-year"
                    >{card.year}<span class="sep" aria-hidden="true"
                        >·</span
                    ></span
                >{/if}<LocalDateTime value={card.date} />
        </p>
    </div>
</a>

<style>
    /* No content-visibility here: Chromium can miss repainting images
       that finish decoding while the element is in the skipped state,
       leaving loaded posters stuck on their placeholder. loading=lazy
       already keeps offscreen image work off the critical path. */
    .release-card {
        display: flex;
        flex-direction: column;
        text-decoration: none;
        color: inherit;
    }

    .release-card:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 3px;
        border-radius: var(--radius-poster);
    }

    .poster-transition-shell {
        --poster-shadow-color: var(--pc);
        position: relative;
        aspect-ratio: 2 / 3;
        border-radius: var(--radius-poster);
        view-transition-class: poster;
    }

    .poster-container {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        overflow: hidden;
        /* Dominant color doubles as the loading placeholder */
        background: color-mix(in srgb, var(--pc) 55%, var(--color-background-secondary));
    }

    .release-card:focus-visible .poster-container {
        box-shadow: var(--poster-shadow-hover);
    }

    .poster {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .badge-chip {
        position: absolute;
        left: 8px;
        bottom: 8px;
        font-family: var(--font-sans);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.04em;
        line-height: 1;
        padding: 4px 7px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.92);
        color: #1a1a24;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
        view-transition-class: badge;
    }

    .meta {
        padding: 8px 2px 0;
        min-width: 0;
    }

    .title {
        font-family: var(--font-sans);
        font-size: var(--text-sm);
        font-weight: 600;
        line-height: 1.35;
        letter-spacing: 0;
        color: var(--color-label);
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: color var(--duration-fast) var(--ease-out);
        view-transition-class: title;
    }

    .release-card:hover .title {
        color: var(--color-accent);
    }

    .sub {
        font-size: var(--text-xs);
        color: var(--color-label-secondary);
        margin: 2px 0 0;
        font-variant-numeric: tabular-nums;
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        column-gap: 5px;
        view-transition-class: timing;
    }

    .sep {
        margin-inline-start: 5px;
        color: var(--color-label-tertiary);
    }
</style>
