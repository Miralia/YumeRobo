<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import { env } from "$env/dynamic/public";
	import { tick } from "svelte";
	import ReleaseCard from "$lib/components/ReleaseCard.svelte";
	import { getAllReleases, searchReleases } from "$lib/content/loader";
	import {
		HOME_RELEASE_BATCH_SIZE,
		getNextDisplayCount,
	} from "$lib/utils/infinite-scroll";

	const SITE_URL = env.PUBLIC_SITE_URL || "https://yumerobo.moe";
	const allReleases = getAllReleases();
	const initialQuery = browser ? $page.url.searchParams.get("q") || "" : "";

	let searchQuery = $state(initialQuery);
	let displayCount = $state(HOME_RELEASE_BATCH_SIZE);
	let restoredCount = $state(0);
	let sentinel = $state<HTMLDivElement | null>(null);
	let previousQuery = initialQuery;

	$effect(() => {
		if (!browser) return;

		const urlQuery = $page.url.searchParams.get("q") || "";
		if (searchQuery !== urlQuery) {
			searchQuery = urlQuery;
		}
	});

	let filteredReleases = $derived(
		searchQuery.trim() ? searchReleases(searchQuery) : allReleases,
	);
	let displayedReleases = $derived(filteredReleases.slice(0, displayCount));
	let hasMore = $derived(displayCount < filteredReleases.length);

	$effect(() => {
		if (searchQuery === previousQuery) return;

		displayCount = HOME_RELEASE_BATCH_SIZE;
		restoredCount = 0;
		previousQuery = searchQuery;
	});

	$effect(() => {
		if (displayCount > filteredReleases.length) {
			displayCount = filteredReleases.length || HOME_RELEASE_BATCH_SIZE;
		}
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
		displayCount = getNextDisplayCount(displayCount, filteredReleases.length);
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
</script>

<svelte:head>
    <title>夢みる機械</title>
    <meta name="description" content="Latest release" />

    <!-- Open Graph -->
    <meta property="og:title" content="夢みる機械" />
    <meta property="og:description" content="Latest release" />
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
    <meta name="twitter:description" content="Latest release" />
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
                <p class="empty-title">No results found</p>
                <p class="empty-desc">No releases match "{searchQuery}"</p>
            </div>
        {:else}
            <div class="empty-state">
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
