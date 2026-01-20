<script lang="ts">
    import ReleaseCard from "$lib/components/ReleaseCard.svelte";
    import { getAllReleases, searchReleases } from "$lib/content/loader";
    import { t } from "$lib/stores/locale";
    import { page } from "$app/stores";
    import { browser } from "$app/environment";
    import { env } from "$env/dynamic/public";
    import { tick } from "svelte";

    const SITE_URL = env.PUBLIC_SITE_URL || "https://yumerobo.moe";

    const allReleases = getAllReleases();

    /**
     * Search state (client-side only for SSG).
     * Initialize directly from URL if in browser to avoid effect triggering reset.
     */
    const initialQuery = browser ? $page.url.searchParams.get("q") || "" : "";
    let searchQuery = $state(initialQuery);

    $effect(() => {
        if (browser) {
            const urlQuery = $page.url.searchParams.get("q") || "";
            if (searchQuery !== urlQuery) {
                // Only update if truly different (avoids loop)
                searchQuery = urlQuery;
            }
        }
    });

    let filteredReleases = $derived(
        searchQuery.trim() ? searchReleases(searchQuery) : allReleases,
    );

    /** Pagination limit */
    let displayCount = $state(10);

    /** Track count of items restored from snapshot to skip their entrance animation */
    let restoredCount = $state(0);

    /**
     * Reset pagination ONLY when search query changes.
     * We use a tracked/untracked pattern or explicit check to avoid reset on mount.
     */
    let previousQuery = initialQuery;

    $effect(() => {
        if (searchQuery !== previousQuery) {
            displayCount = 10;
            restoredCount = 0; // Reset animation state on new search
            previousQuery = searchQuery;
        }
    });

    /**
     * Preserve scroll position and display count during navigation.
     */
    export const snapshot = {
        capture: () => ({ displayCount, scrollY: window.scrollY }),
        restore: (value: { displayCount: number; scrollY: number }) => {
            displayCount = value.displayCount;
            restoredCount = value.displayCount; // Skip animation for restored items
            // Manually restore scroll position after DOM update
            if (browser) {
                tick().then(() => {
                    window.scrollTo(0, value.scrollY);
                });
            }
        },
    };

    let displayedReleases = $derived(filteredReleases.slice(0, displayCount));
    let hasMore = $derived(filteredReleases.length > displayCount);

    function loadMore() {
        displayCount += 10;
    }

    // Listen for scroll-to-load-more event from boundary indicator
    $effect(() => {
        if (!browser) return;

        function handleBoundaryLoadMore() {
            if (hasMore) {
                loadMore();
            }
        }

        window.addEventListener("boundary-loadmore", handleBoundaryLoadMore);
        return () => {
            window.removeEventListener(
                "boundary-loadmore",
                handleBoundaryLoadMore,
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
                <ReleaseCard
                    {release}
                    {index}
                    animate={index >= restoredCount}
                />
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

    .load-more-button:active {
        transform: scale(0.97);
    }
</style>
