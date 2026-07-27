<script lang="ts">
	let {
		mode,
		size = 20,
	}: {
		mode: "auto" | "light" | "dark";
		size?: number;
	} = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if mode === "auto"}
		<circle cx="12" cy="12" r="8" />
		<path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none" />
	{:else if mode === "light"}
		<circle cx="12" cy="12" r="3.5" />
		<path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
	{:else}
		<path d="M20.5 15.1A8.5 8.5 0 0 1 8.9 3.5a8.5 8.5 0 1 0 11.6 11.6Z" />
	{/if}
</svg>

<style>
	svg {
		display: block;
		flex: none;
	}
</style>
