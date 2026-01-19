<script lang="ts">
	import "$lib/styles/design-system.css";
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import { onNavigate } from "$app/navigation";

	let { children } = $props();

	// Enable View Transitions API for smooth page navigation
	onNavigate((navigation) => {
		// Progressive enhancement: only use if browser supports View Transitions
		if (!document.startViewTransition) return;

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

<div class="app-shell">
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
