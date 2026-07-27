<script lang="ts">
	import { page } from "$app/state";

	let heading = $derived(
		page.status === 404 ? "Page not found" : "Something went wrong",
	);
	let description = $derived(
		page.status === 404
			? "This release may have been moved or never existed."
			: page.error?.message || "An unexpected error occurred.",
	);
</script>

<svelte:head>
	<title>{page.status} | 夢みる機械</title>
</svelte:head>

<div class="error-page container">
	<p class="error-code" aria-hidden="true">{page.status}</p>
	<h1 class="error-title">{heading}</h1>
	<p class="error-desc">{description}</p>
	<a href="/" class="home-link liquid-control">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="m15 18-6-6 6-6" />
		</svg>
		Back to releases
	</a>
</div>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding-top: var(--space-16);
		padding-bottom: var(--space-16);
		gap: var(--space-3);
	}

	.error-code {
		font-family: var(--font-display);
		font-size: clamp(4rem, 12vw, 7rem);
		font-weight: 700;
		line-height: 1;
		margin: 0;
		color: transparent;
		background: linear-gradient(
			135deg,
			var(--color-accent),
			var(--color-accent-hover)
		);
		background-clip: text;
		-webkit-background-clip: text;
	}

	.error-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 700;
		letter-spacing: var(--tracking-tight);
		color: var(--color-label);
		margin: 0;
	}

	.error-desc {
		font-size: var(--text-base);
		color: var(--color-label-secondary);
		max-width: 40ch;
		margin: 0;
	}

	.home-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		margin-top: var(--space-4);
		padding: var(--space-2) var(--space-5);
		min-height: 44px;
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-label);
		border-radius: var(--radius-full);
	}

	.home-link:hover,
	.home-link:focus-visible {
		color: var(--badge-fg);
		background: var(--badge-bg);
		border-color: var(--badge-bg);
		transform: translateY(-1px);
	}

	.home-link:active {
		transform: scale(0.96);
	}

	.home-link svg {
		transition: transform var(--duration-fast) var(--ease-spring);
	}

	.home-link:hover svg,
	.home-link:focus-visible svg {
		transform: translateX(-3px);
	}

	@media (forced-colors: active) {
		.home-link:hover,
		.home-link:focus-visible {
			color: HighlightText;
			background: Highlight;
			border-color: Highlight;
		}
	}
</style>
