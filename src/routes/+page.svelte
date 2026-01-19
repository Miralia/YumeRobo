<script lang="ts">
    import ReleaseCard from "$lib/components/ReleaseCard.svelte";
    import { getAllReleases, searchReleases } from "$lib/content/loader";
    import { t } from "$lib/stores/locale";
    import { onMount } from "svelte";
    import { env } from "$env/dynamic/public";

    const SITE_URL = env.PUBLIC_SITE_URL || "https://yumerobo.moe";

    // Get all releases
    const allReleases = getAllReleases();

    // Search state - listens to header search event
    let searchQuery = $state("");
    let filteredReleases = $derived(
        searchQuery.trim() ? searchReleases(searchQuery) : allReleases,
    );

    // Infinite scroll state
    let displayCount = $state(10);
    let displayedReleases = $derived(filteredReleases.slice(0, displayCount));
    let hasMore = $derived(filteredReleases.length > displayCount);

    function loadMore() {
        displayCount += 10;
    }

    // Infinite scroll trigger removed in favor of manual load more

    onMount(() => {
        function handleHeaderSearch(event: CustomEvent<string>) {
            searchQuery = event.detail;
            displayCount = 10; // Reset pagination on new search
        }

        window.addEventListener(
            "header-search",
            handleHeaderSearch as EventListener,
        );

        return () => {
            window.removeEventListener(
                "header-search",
                handleHeaderSearch as EventListener,
            );
        };
    });
</script>

<svelte:head>
    <title>夢みる機械</title>
    <meta name="description" content="Latest media releases" />

    <!-- Open Graph -->
    <meta property="og:title" content="夢みる機械" />
    <meta property="og:description" content="Latest media releases" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="夢みる機械" />
    {#if allReleases.length > 0}
        <meta
            property="og:image"
            content="{SITE_URL}{allReleases[0].poster
                .replace('.avif', '.jpg')
                .replace('/posters/', '/og/')}"
        />
    {/if}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="夢みる機械" />
    <meta name="twitter:description" content="Latest media releases" />
</svelte:head>

<div class="home-page container">
    <!-- Release List -->
    <section class="release-list">
        {#if displayedReleases.length > 0}
            {#each displayedReleases as release, index (release.slug)}
                <ReleaseCard {release} {index} />
            {/each}
        {:else if searchQuery}
            <div class="empty-state">
                <p class="empty-title">{$t.noResults}</p>
                <p class="empty-desc">{$t.noResultsFor} "{searchQuery}"</p>
            </div>
        {:else}
            <div class="empty-state">
                <p class="empty-title">{$t.noResults}</p>
                <p class="empty-desc">Check back soon for new content</p>
            </div>
        {/if}
    </section>

    <!-- Load More -->
    {#if hasMore}
        <div class="load-more-container">
            <button class="load-more-button" onclick={loadMore}>
                {$t.loadMore}
            </button>
        </div>
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

    /* Load More */
    .load-more-container {
        display: flex;
        justify-content: center;
        padding: var(--space-8) 0;
        margin-top: var(--space-4);
    }

    .load-more-button {
        padding: var(--space-2) var(--space-6);
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--color-accent);
        background: transparent;
        border: 1px solid var(--color-separator);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-out);
    }

    .load-more-button:hover {
        background: var(--color-fill);
        border-color: var(--color-accent);
    }
</style>
