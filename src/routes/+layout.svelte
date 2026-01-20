<script lang="ts">
	import "$lib/styles/design-system.css";
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import { onNavigate } from "$app/navigation";
	import { page } from "$app/stores";
	import {
		boundaryIndicator,
		type BoundaryIndicatorOptions,
	} from "$lib/utils/overscroll";

	let { children } = $props();

	// Only enable load more on homepage
	let indicatorOptions = $derived<BoundaryIndicatorOptions>({
		enableLoadMore: $page.url.pathname === "/",
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (navigation.from?.url.href === navigation.to?.url.href) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>夢みる機械</title>
</svelte:head>

<div class="app-shell" use:boundaryIndicator={indicatorOptions}>
	<Header />
	<main class="main-content">
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.main-content {
		flex: 1;
		padding: var(--space-6) 0;
	}
</style>
