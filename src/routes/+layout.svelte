<script lang="ts">
	import "$lib/styles/design-system.css";
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import { onNavigate } from "$app/navigation";
	import { tick } from "svelte";
	import { prefersReducedMotion } from "svelte/motion";
	import { boundaryIndicator } from "$lib/utils/overscroll";
	import { cardTransition } from "$lib/utils/card-transition.svelte";
	import {
		POSTER_TILT_RESET_EVENT,
		POSTER_TILT_TRANSITION_END_EVENT,
	} from "$lib/utils/poster-tilt";

	let { children } = $props();

	onNavigate(async (navigation) => {
		if (!document.startViewTransition) return;
		if (prefersReducedMotion.current) return;
		// Query-only navigations (debounced search keystrokes) must not
		// trigger a full-page transition — Magic Move is for route changes.
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;
		if (
			navigation.from?.route.id === "/[slug]/comparisons" ||
			navigation.to?.route.id === "/[slug]/comparisons"
		) return;

		// Name only the card involved in this navigation, then let the
		// DOM update before the old state is captured.
		const slug =
			(navigation.to?.params?.slug as string | undefined) ??
			(navigation.from?.params?.slug as string | undefined) ??
			null;
		cardTransition.slug = slug;
		window.dispatchEvent(new Event(POSTER_TILT_RESET_EVENT));
		await tick();

		return new Promise((resolve) => {
			const transition = document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
			const finishPosterHandoff = () => {
				window.dispatchEvent(
					new Event(POSTER_TILT_TRANSITION_END_EVENT),
				);
			};
			transition.finished.then(
				finishPosterHandoff,
				finishPosterHandoff,
			);
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
