<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { spring } from "svelte/motion";
	import { debounce } from "$lib/utils/debounce";
	import { springPresets } from "$lib/utils/animation";

	type ThemeMode = "auto" | "light" | "dark";

	const TELEGRAM_URL = "https://t.me/YumeRobo_Channel";

	let themeMode = $state<ThemeMode>("auto");
	let isThemeMenuOpen = $state(false);
	let isSearchFocused = $state(false);
	let isTyping = false;
	let isComposing = false;
	let originUrl: string | null = null;
	let searchQuery = $state("");
	let isMobileMenuOpen = $state(false);

	const logoScale = spring(1, springPresets.snappy);

	$effect(() => {
		const urlQuery = $page.url.searchParams.get("q") || "";
		if (!isTyping && searchQuery !== urlQuery) {
			searchQuery = urlQuery;
		}
		if (!urlQuery && originUrl !== null && !isTyping) {
			originUrl = null;
		}
	});

	const navigateToSearch = debounce((query: string) => {
		if (isComposing) return;

		const trimmed = query.trim();
		if (trimmed) {
			const isFirstSearch = !$page.url.searchParams.has("q");
			if (originUrl === null && isFirstSearch) {
				originUrl = $page.url.pathname;
			}
			goto(`/?q=${encodeURIComponent(trimmed)}`, {
				replaceState: !isFirstSearch,
				keepFocus: true,
			});
		} else if ($page.url.searchParams.has("q")) {
			const returnUrl = originUrl || "/";
			originUrl = null;
			goto(returnUrl, { replaceState: true, keepFocus: true });
		}
		isTyping = false;
	}, 300);

	function clearSearch() {
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

	$effect(() => {
		if (typeof window === "undefined") return;

		const saved = localStorage.getItem("theme") as ThemeMode | null;
		if (saved && ["auto", "light", "dark"].includes(saved)) {
			themeMode = saved;
		}
		applyTheme(themeMode);
	});

	function applyTheme(mode: ThemeMode) {
		if (typeof document === "undefined") return;
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
		applyTheme(mode);
		isThemeMenuOpen = false;
	}

	function handleLogoHover(hovering: boolean) {
		logoScale.set(hovering ? 1.05 : 1);
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
			isThemeMenuOpen = false;
		}
	}

	$effect(() => {
		if (typeof window === "undefined") return;

		window.addEventListener("click", handleClickOutside);
		return () => window.removeEventListener("click", handleClickOutside);
	});
</script>

<header class="header glass" style:view-transition-name="app-header">
	<div class="header-content container">
		<a
			href="/"
			class="logo"
			onmouseenter={() => handleLogoHover(true)}
			onmouseleave={() => handleLogoHover(false)}
		>
			<span class="logo-scale" style:transform="scale({$logoScale})">
				<img src="/icon.svg" alt="YumeRobo" class="logo-icon" />
			</span>
		</a>

		<div class="search-wrapper" class:focused={isSearchFocused}>
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
			>
				<circle cx="11" cy="11" r="8"></circle>
				<path d="m21 21-4.3-4.3"></path>
			</svg>
			<input
				type="text"
				class="search-input"
				placeholder="Search releases..."
				value={searchQuery}
				oninput={handleSearchInput}
				oncompositionstart={handleCompositionStart}
				oncompositionend={handleCompositionEnd}
				onfocus={() => (isSearchFocused = true)}
				onblur={() => (isSearchFocused = false)}
			/>
			{#if searchQuery}
				<button
					class="clear-btn"
					onclick={clearSearch}
					aria-label="Clear search"
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
					>
						<path d="M18 6 6 18"></path>
						<path d="m6 6 12 12"></path>
					</svg>
				</button>
			{/if}
		</div>

		<nav class="nav-desktop" aria-label="Primary">
			<a
				href={TELEGRAM_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="telegram-button"
				aria-label="Telegram"
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
			<div class="theme-dropdown">
				<button
					class="nav-button"
					onclick={(event) => {
						event.stopPropagation();
						isThemeMenuOpen = !isThemeMenuOpen;
					}}
					aria-label="Toggle theme"
				>
					<span class="theme-icon">{getThemeIcon(themeMode)}</span>
				</button>
				{#if isThemeMenuOpen}
					<div class="dropdown-menu">
						{#each ["auto", "light", "dark"] as const as mode}
							<button
								class="dropdown-item"
								class:active={themeMode === mode}
								onclick={() => setTheme(mode)}
							>
								<span class="dropdown-icon">{getThemeIcon(mode)}</span>
								<span
									>{mode === "auto"
										? "Auto"
										: mode === "light"
											? "Light"
											: "Dark"}</span
								>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</nav>

		<button
			class="mobile-menu-button"
			onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
			aria-label="Toggle menu"
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
		<nav class="nav-mobile" aria-label="Mobile menu">
			<div class="mobile-search-wrapper">
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
				>
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.3-4.3"></path>
				</svg>
				<input
					type="text"
					class="search-input mobile"
					placeholder="Search releases..."
					value={searchQuery}
					oninput={handleSearchInput}
					oncompositionstart={handleCompositionStart}
					oncompositionend={handleCompositionEnd}
				/>
			</div>

			<a
				href={TELEGRAM_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="telegram-button mobile"
				aria-label="Telegram"
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
					<span class="control-label">Theme</span>
					<div class="control-buttons">
						{#each ["auto", "light", "dark"] as const as mode}
							<button
								class="control-btn"
								class:active={themeMode === mode}
								onclick={() => setTheme(mode)}
							>
								{getThemeIcon(mode)}
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

	.logo-scale {
		display: inline-flex;
	}

	.logo-icon {
		height: 28px;
		width: auto;
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

	.search-input:focus {
		outline: none;
		background: var(--color-background);
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 18%, transparent);
	}

	.search-input::placeholder {
		color: var(--color-label-tertiary);
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

	.dropdown-item:hover {
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
		transition: all var(--duration-fast) var(--ease-out);
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
