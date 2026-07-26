<script lang="ts">
	import "$lib/styles/design-system.css";
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import { onNavigate } from "$app/navigation";
	import { prefersReducedMotion } from "svelte/motion";
	import { boundaryIndicator } from "$lib/utils/overscroll";

	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (prefersReducedMotion.current) return;
		// Query-only navigations (debounced search keystrokes) must not
		// trigger a full-page transition — Magic Move is for route changes.
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<title>夢みる機械</title>
</svelte:head>

<div class="app-shell" use:boundaryIndicator>
	<a href="#main" class="skip-link">Skip to content</a>
	<Header />
	<main id="main" tabindex="-1" class="main-content">
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

	.main-content:focus {
		outline: none;
	}
</style>
