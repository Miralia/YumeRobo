<script lang="ts">
	import { goto, beforeNavigate } from "$app/navigation";
	import { page } from "$app/state";
	import { tick } from "svelte";
	import { scale, slide } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { prefersReducedMotion } from "svelte/motion";
	import { debounce } from "$lib/utils/debounce";

	type ThemeMode = "auto" | "light" | "dark";

	const TELEGRAM_URL = "https://t.me/YumeRobo_Channel";
	const THEME_MODES: ThemeMode[] = ["auto", "light", "dark"];

	let themeMode = $state<ThemeMode>("auto");
	let isThemeMenuOpen = $state(false);
	let isSearchFocused = $state(false);
	let isTyping = false;
	let isComposing = false;
	let originUrl: string | null = null;
	let searchQuery = $state("");
	let isMobileMenuOpen = $state(false);

	let themeButton = $state<HTMLButtonElement | null>(null);
	let themeMenu = $state<HTMLDivElement | null>(null);
	let mobileMenuButton = $state<HTMLButtonElement | null>(null);

	let menuTransition = $derived({
		duration: prefersReducedMotion.current ? 0 : 150,
		start: 0.95,
		easing: cubicOut,
	});
	let slideTransition = $derived({
		duration: prefersReducedMotion.current ? 0 : 250,
		easing: cubicOut,
	});

	$effect(() => {
		const urlQuery = page.url.searchParams.get("q") || "";
		if (!isTyping && searchQuery !== urlQuery) {
			searchQuery = urlQuery;
		}
		if (!urlQuery && originUrl !== null && !isTyping) {
			originUrl = null;
		}
	});

	const navigateToSearch = debounce((query: string) => {
		if (isComposing) return;
		performSearch(query);
	}, 300);

	function performSearch(query: string) {
		const trimmed = query.trim();
		if (trimmed) {
			const isFirstSearch = !page.url.searchParams.has("q");
			if (originUrl === null && isFirstSearch) {
				originUrl = page.url.pathname;
			}
			goto(`/?q=${encodeURIComponent(trimmed)}`, {
				replaceState: !isFirstSearch,
				keepFocus: true,
			});
		} else if (page.url.searchParams.has("q")) {
			const returnUrl = originUrl || "/";
			originUrl = null;
			goto(returnUrl, { replaceState: true, keepFocus: true });
		}
		isTyping = false;
	}

	// A pending debounced search must not fire after the user has
	// already navigated somewhere else (e.g. clicked a release card).
	beforeNavigate((navigation) => {
		if (navigation.to?.url.pathname !== "/") {
			navigateToSearch.cancel();
			isTyping = false;
		}
	});

	function clearSearch() {
		navigateToSearch.cancel();
		searchQuery = "";
		isTyping = false;
		const returnUrl = originUrl || "/";
		originUrl = null;
		goto(returnUrl, { replaceState: true });
	}

	function handleCompositionStart() {
		isComposing = true;
		isTyping = true;
	}

	function handleCompositionEnd(event: CompositionEvent) {
		isComposing = false;
		const target = event.target as HTMLInputElement;
		const value = target.value.trim();
		if (!value) return;

		searchQuery = target.value;
		navigateToSearch(searchQuery);
	}

	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
		isTyping = true;
		if (!isComposing) {
			navigateToSearch(searchQuery);
		}
	}

	function handleSearchSubmit(event: SubmitEvent) {
		event.preventDefault();
		navigateToSearch.cancel();
		performSearch(searchQuery);
	}

	function handleSearchKeydown(event: KeyboardEvent) {
		if (event.key !== "Escape") return;
		event.preventDefault();
		if (searchQuery) {
			clearSearch();
		} else {
			(event.target as HTMLInputElement).blur();
		}
	}

	$effect(() => {
		const saved = localStorage.getItem("theme") as ThemeMode | null;
		if (saved && THEME_MODES.includes(saved)) {
			themeMode = saved;
		}
	});

	function applyTheme(mode: ThemeMode) {
		const root = document.documentElement;
		if (mode === "auto") {
			root.removeAttribute("data-theme");
		} else {
			root.setAttribute("data-theme", mode);
		}
		localStorage.setItem("theme", mode);
	}

	function setTheme(mode: ThemeMode) {
		themeMode = mode;
		closeThemeMenu();
		// Cross-fade the recolor with the same primitive Magic Move uses
		if (document.startViewTransition && !prefersReducedMotion.current) {
			document.startViewTransition(() => applyTheme(mode));
		} else {
			applyTheme(mode);
		}
	}

	async function openThemeMenu() {
		isThemeMenuOpen = true;
		await tick();
		focusThemeItem(THEME_MODES.indexOf(themeMode));
	}

	function closeThemeMenu(returnFocus = false) {
		if (!isThemeMenuOpen) return;
		isThemeMenuOpen = false;
		if (returnFocus) {
			themeButton?.focus();
		}
	}

	function focusThemeItem(index: number) {
		const items = themeMenu?.querySelectorAll<HTMLButtonElement>(
			'[role="menuitemradio"]',
		);
		if (!items || items.length === 0) return;
		const clamped = ((index % items.length) + items.length) % items.length;
		items[clamped]?.focus();
	}

	function handleThemeButtonKeydown(event: KeyboardEvent) {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			if (!isThemeMenuOpen) {
				openThemeMenu();
			}
		}
	}

	function handleThemeMenuKeydown(event: KeyboardEvent, index: number) {
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				focusThemeItem(index + 1);
				break;
			case "ArrowUp":
				event.preventDefault();
				focusThemeItem(index - 1);
				break;
			case "Home":
				event.preventDefault();
				focusThemeItem(0);
				break;
			case "End":
				event.preventDefault();
				focusThemeItem(THEME_MODES.length - 1);
				break;
			case "Escape":
				event.preventDefault();
				closeThemeMenu(true);
				break;
		}
	}

	function handleThemeFocusOut(event: FocusEvent) {
		const container = event.currentTarget as HTMLElement;
		if (!container.contains(event.relatedTarget as Node | null)) {
			closeThemeMenu();
		}
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === "Escape" && isMobileMenuOpen) {
			event.preventDefault();
			isMobileMenuOpen = false;
			mobileMenuButton?.focus();
		}
	}

	function themeLabel(mode: ThemeMode): string {
		switch (mode) {
			case "auto":
				return "Auto";
			case "light":
				return "Light";
			case "dark":
				return "Dark";
		}
	}

	function getThemeIcon(mode: ThemeMode): string {
		switch (mode) {
			case "auto":
				return "◐";
			case "light":
				return "☀";
			case "dark":
				return "☾";
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest(".theme-dropdown")) {
			closeThemeMenu();
		}
	}

	$effect(() => {
		window.addEventListener("click", handleClickOutside);
		return () => window.removeEventListener("click", handleClickOutside);
	});
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<header class="header glass" style:view-transition-name="app-header">
	<div class="header-content container">
		<a href="/" class="logo" aria-label="YumeRobo home">
			<img src="/icon.svg" alt="" class="logo-icon" />
		</a>

		<form
			class="search-wrapper"
			class:focused={isSearchFocused}
			role="search"
			onsubmit={handleSearchSubmit}
		>
			<svg
				class="search-icon"
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
				<circle cx="11" cy="11" r="8"></circle>
				<path d="m21 21-4.3-4.3"></path>
			</svg>
			<input
				type="search"
				class="search-input"
				placeholder="Search releases..."
				aria-label="Search releases"
				value={searchQuery}
				oninput={handleSearchInput}
				onkeydown={handleSearchKeydown}
				oncompositionstart={handleCompositionStart}
				oncompositionend={handleCompositionEnd}
				onfocus={() => (isSearchFocused = true)}
				onblur={() => (isSearchFocused = false)}
			/>
			{#if searchQuery}
				<button
					type="button"
					class="clear-btn"
					onclick={clearSearch}
					aria-label="Clear search"
					transition:scale={{
						duration: prefersReducedMotion.current ? 0 : 120,
						start: 0.5,
						easing: cubicOut,
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M18 6 6 18"></path>
						<path d="m6 6 12 12"></path>
					</svg>
				</button>
			{/if}
		</form>

		<nav class="nav-desktop" aria-label="Primary">
			<a
				href={TELEGRAM_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="telegram-button"
				aria-label="Telegram channel"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
					/>
				</svg>
			</a>
			<div class="theme-dropdown" onfocusout={handleThemeFocusOut}>
				<button
					class="nav-button"
					bind:this={themeButton}
					onclick={(event) => {
						event.stopPropagation();
						if (isThemeMenuOpen) {
							closeThemeMenu();
						} else {
							openThemeMenu();
						}
					}}
					onkeydown={handleThemeButtonKeydown}
					aria-label="Theme: {themeLabel(themeMode)}"
					aria-haspopup="menu"
					aria-expanded={isThemeMenuOpen}
					aria-controls="theme-menu"
				>
					<span class="theme-icon" aria-hidden="true"
						>{getThemeIcon(themeMode)}</span
					>
				</button>
				{#if isThemeMenuOpen}
					<div
						class="dropdown-menu"
						id="theme-menu"
						role="menu"
						aria-label="Theme"
						bind:this={themeMenu}
						transition:scale={menuTransition}
					>
						{#each THEME_MODES as mode, index}
							<button
								class="dropdown-item"
								class:active={themeMode === mode}
								role="menuitemradio"
								aria-checked={themeMode === mode}
								tabindex="-1"
								onclick={() => setTheme(mode)}
								onkeydown={(event) =>
									handleThemeMenuKeydown(event, index)}
							>
								<span class="dropdown-icon" aria-hidden="true"
									>{getThemeIcon(mode)}</span
								>
								<span>{themeLabel(mode)}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</nav>

		<button
			class="mobile-menu-button"
			bind:this={mobileMenuButton}
			onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
			aria-label="Menu"
			aria-expanded={isMobileMenuOpen}
			aria-controls="mobile-menu"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				{#if isMobileMenuOpen}
					<path d="M18 6 6 18"></path>
					<path d="m6 6 12 12"></path>
				{:else}
					<line x1="4" x2="20" y1="12" y2="12"></line>
					<line x1="4" x2="20" y1="6" y2="6"></line>
					<line x1="4" x2="20" y1="18" y2="18"></line>
				{/if}
			</svg>
		</button>
	</div>

	{#if isMobileMenuOpen}
		<nav
			class="nav-mobile"
			id="mobile-menu"
			aria-label="Mobile menu"
			transition:slide={slideTransition}
		>
			<form class="mobile-search-wrapper" role="search" onsubmit={handleSearchSubmit}>
				<svg
					class="search-icon"
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
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.3-4.3"></path>
				</svg>
				<input
					type="search"
					class="search-input mobile"
					placeholder="Search releases..."
					aria-label="Search releases"
					value={searchQuery}
					oninput={handleSearchInput}
					onkeydown={handleSearchKeydown}
					oncompositionstart={handleCompositionStart}
					oncompositionend={handleCompositionEnd}
				/>
			</form>

			<a
				href={TELEGRAM_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="telegram-button mobile"
				aria-label="Telegram channel"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
					/>
				</svg>
			</a>

			<div class="mobile-controls">
				<div class="control-group">
					<span class="control-label" id="mobile-theme-label">Theme</span>
					<div
						class="control-buttons"
						role="group"
						aria-labelledby="mobile-theme-label"
					>
						{#each THEME_MODES as mode}
							<button
								class="control-btn"
								class:active={themeMode === mode}
								aria-label={themeLabel(mode)}
								aria-pressed={themeMode === mode}
								onclick={() => setTheme(mode)}
							>
								<span aria-hidden="true">{getThemeIcon(mode)}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</nav>
	{/if}
</header>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 100;
		border-bottom: 1px solid var(--color-separator);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		height: 64px;
	}

	.logo {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		color: var(--color-label);
		text-decoration: none;
	}

	.logo-icon {
		height: 28px;
		width: auto;
		transition: transform var(--duration-normal) var(--ease-spring);
	}

	.logo:hover .logo-icon,
	.logo:focus-visible .logo-icon {
		transform: scale(1.06);
	}

	.search-wrapper {
		flex: 1;
		max-width: 520px;
		margin: 0 auto;
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: var(--space-3);
		color: var(--color-label-tertiary);
		pointer-events: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.search-wrapper.focused .search-icon {
		color: var(--color-accent);
	}

	.search-input {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		padding-left: calc(var(--space-3) + 18px + var(--space-2));
		padding-right: var(--space-8);
		font-size: var(--text-sm);
		font-family: var(--font-sans);
		color: var(--color-label);
		background: var(--color-fill);
		border: 1px solid transparent;
		border-radius: var(--radius-lg);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.search-input::-webkit-search-cancel-button {
		-webkit-appearance: none;
		display: none;
	}

	.search-input:focus {
		outline: none;
		background: var(--color-background);
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 18%, transparent);
	}

	.search-input::placeholder {
		color: var(--color-label-secondary);
	}

	.clear-btn {
		position: absolute;
		right: var(--space-2);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		padding: 0;
		background: var(--color-fill-secondary);
		border: none;
		border-radius: var(--radius-full);
		color: var(--color-label-secondary);
		cursor: pointer;
		opacity: 0.7;
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.clear-btn:hover {
		opacity: 1;
	}

	.nav-desktop {
		display: none;
		align-items: center;
		gap: var(--space-2);
	}

	.telegram-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 0;
		border-radius: var(--radius-md);
		color: var(--color-label-secondary);
		text-decoration: none;
		transition:
			color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.telegram-button:hover {
		background: var(--color-fill);
		color: var(--color-accent);
	}

	.nav-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		background: transparent;
		color: var(--color-label-secondary);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.nav-button:hover {
		background: var(--color-fill);
		color: var(--color-label);
	}

	.theme-icon {
		font-size: var(--text-lg);
	}

	.theme-dropdown {
		position: relative;
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + var(--space-1));
		right: 0;
		min-width: 120px;
		padding: var(--space-1);
		background: var(--color-background);
		border: 1px solid var(--color-separator);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		z-index: 50;
		transform-origin: top right;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		font-family: var(--font-sans);
		color: var(--color-label);
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: background var(--duration-fast) var(--ease-out);
		text-align: left;
	}

	.dropdown-item:hover,
	.dropdown-item:focus-visible {
		background: var(--color-fill);
	}

	.dropdown-item.active {
		color: var(--color-accent);
		font-weight: 500;
	}

	.dropdown-icon {
		width: 20px;
		text-align: center;
	}

	.mobile-menu-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: none;
		background: transparent;
		color: var(--color-label);
		cursor: pointer;
		flex-shrink: 0;
	}

	.nav-mobile {
		padding: var(--space-4);
		border-top: 1px solid var(--color-separator);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.mobile-search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.mobile-search-wrapper .search-icon {
		position: absolute;
		left: var(--space-3);
	}

	.search-input.mobile {
		width: 100%;
		padding: var(--space-3);
		padding-left: calc(var(--space-3) + 18px + var(--space-2));
		background: var(--color-fill);
	}

	.telegram-button.mobile {
		width: 36px;
		height: 36px;
	}

	.mobile-controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.control-group {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.control-label {
		font-size: var(--text-sm);
		color: var(--color-label-secondary);
	}

	.control-buttons {
		display: flex;
		gap: var(--space-1);
		background: var(--color-fill);
		padding: var(--space-1);
		border-radius: var(--radius-md);
	}

	.control-btn {
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-sm);
		font-family: var(--font-sans);
		color: var(--color-label-secondary);
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.control-btn:hover {
		color: var(--color-label);
	}

	.control-btn.active {
		background: var(--color-background);
		color: var(--color-accent);
		box-shadow: var(--shadow-sm);
	}

	@media (min-width: 640px) {
		.nav-desktop {
			display: flex;
		}

		.mobile-menu-button {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.search-wrapper {
			display: none;
		}
	}
</style>
