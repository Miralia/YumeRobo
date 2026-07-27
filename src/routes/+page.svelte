<script lang="ts">
    import type { PageProps } from "./$types";
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import { env } from "$env/dynamic/public";
    import { tick } from "svelte";
    import { flip } from "svelte/animate";
    import { fade } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { prefersReducedMotion } from "svelte/motion";
    import ReleaseCard from "$lib/components/ReleaseCard.svelte";
    import { filterCards } from "$lib/content/cards";
    import { stagger } from "$lib/utils/animation";
    import {
        HOME_RELEASE_BATCH_SIZE,
        getNextDisplayCount,
    } from "$lib/utils/infinite-scroll";

    const SITE_URL = env.PUBLIC_SITE_URL || "https://yumerobo.moe";

    let { data }: PageProps = $props();

    // Starts empty to match the prerendered document; the URL sync effect
    // below applies ?q= after hydration, avoiding a server/client
    // first-render divergence.
    let searchQuery = $state("");
    let displayCount = $state(HOME_RELEASE_BATCH_SIZE);
    // Cards below this index play the entrance animation. The initial
    // batch is exempt: prerendered HTML must paint cards immediately
    // (the fade-up's backwards fill would hold the LCP poster at
    // opacity 0 through its stagger delay), so only content mounted
    // later — infinite-scroll batches — animates in.
    let restoredCount = $state(HOME_RELEASE_BATCH_SIZE);
    let sentinel = $state<HTMLDivElement | null>(null);
    let previousQuery = "";

    $effect(() => {
        const urlQuery = page.url.searchParams.get("q") || "";
        if (searchQuery !== urlQuery) {
            searchQuery = urlQuery;
        }
    });

    let filteredCards = $derived(filterCards(data.cards, searchQuery));
    let displayedCards = $derived(filteredCards.slice(0, displayCount));
    let hasMore = $derived(displayCount < filteredCards.length);
    let isSearching = $derived(searchQuery.trim().length > 0);

    $effect(() => {
        if (searchQuery === previousQuery) return;

        displayCount = HOME_RELEASE_BATCH_SIZE;
        // Surviving cards glide via flip; replaying the staggered
        // entrance on them would blank the list, so the first batch
        // stays exempt from the entrance animation.
        restoredCount = HOME_RELEASE_BATCH_SIZE;
        previousQuery = searchQuery;
    });

    export const snapshot = {
        capture: () => ({ displayCount, scrollY: window.scrollY }),
        restore: (value: { displayCount: number; scrollY: number }) => {
            displayCount = value.displayCount;
            restoredCount = value.displayCount;
            if (browser) {
                tick().then(() => {
                    window.scrollTo(0, value.scrollY);
                });
            }
        },
    };

    function loadMore() {
        displayCount = getNextDisplayCount(displayCount, filteredCards.length);
    }

    $effect(() => {
        if (!browser || !sentinel || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    loadMore();
                }
            },
            { rootMargin: "320px 0px" },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    });

    /**
     * Entrance delay relative to the batch a card arrived in, so cards
     * appended by infinite scroll animate immediately instead of waiting
     * out an absolute-index stagger.
     */
    function entranceDelay(index: number): string {
        return `${stagger(index % HOME_RELEASE_BATCH_SIZE)}ms`;
    }

    let flipParams = $derived({
        duration: prefersReducedMotion.current ? 0 : 250,
        easing: cubicOut,
    });
    let fadeParams = $derived({
        duration: prefersReducedMotion.current ? 0 : 150,
    });
</script>

<svelte:head>
    <title>夢みる機械</title>
    <meta name="description" content="Latest release" />

    <!-- Open Graph -->
    <meta property="og:title" content="夢みる機械" />
    <meta property="og:description" content="Latest release" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="夢みる機械" />
    {#if data.cards.length > 0}
        <meta
            property="og:image"
            content="{SITE_URL}{data.cards[0].poster
                .replace('.avif', '.jpg')
                .replace('/posters/', '/og/')}"
        />
    {/if}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="夢みる機械" />
    <meta name="twitter:description" content="Latest release" />
</svelte:head>

<div class="home-page container">
    <!-- Search result announcement for assistive tech. Permanently
         mounted: newly inserted live regions aren't reliably announced,
         so only the text content changes. -->
    <p class="visually-hidden" role="status">
        {#if isSearching}
            {filteredCards.length === 0
                ? `No releases match “${searchQuery}”`
                : `${filteredCards.length} release${filteredCards.length === 1 ? "" : "s"} match “${searchQuery}”`}
        {/if}
    </p>

    <!-- Release List -->
    <section class="release-list" aria-label="Releases">
        {#if displayedCards.length > 0}
            {#each displayedCards as card, index (card.slug)}
                <!-- flip (WAAPI) and the entrance animation (CSS) both
                     drive transform, so they live on separate elements -->
                <div animate:flip={flipParams}>
                    <div
                        class:animate-fade-up={index >= restoredCount}
                        style:animation-delay={entranceDelay(index)}
                    >
                        <ReleaseCard {card} {index} />
                    </div>
                </div>
            {/each}
        {:else if isSearching}
            <div class="empty-state" in:fade={fadeParams}>
                <p class="empty-title">No results found</p>
                <p class="empty-desc">No releases match "{searchQuery}"</p>
            </div>
        {:else}
            <div class="empty-state" in:fade={fadeParams}>
                <p class="empty-title">No results found</p>
                <p class="empty-desc">Check back soon for new content</p>
            </div>
        {/if}
    </section>

    {#if hasMore}
        <div class="scroll-sentinel" bind:this={sentinel} aria-hidden="true"></div>
    {/if}
</div>

<style>
    .home-page {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    /* Release List */
    .release-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }

    /* Empty State */
    .empty-state {
        text-align: center;
        padding: var(--space-16) 0;
    }

    .empty-title {
        font-size: var(--text-lg);
        font-weight: 500;
        color: var(--color-label);
        margin: 0 0 var(--space-2) 0;
    }

    .empty-desc {
        font-size: var(--text-sm);
        color: var(--color-label-secondary);
        margin: 0;
    }

    .scroll-sentinel {
        height: 1px;
        margin-top: var(--space-6);
    }
</style>
