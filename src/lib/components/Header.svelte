<script lang="ts">
	import { goto, beforeNavigate } from "$app/navigation";
	import { page } from "$app/state";
	import { tick } from "svelte";
	import { scale, slide } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { prefersReducedMotion } from "svelte/motion";
	import { debounce } from "$lib/utils/debounce";
	import { accessibleTooltip } from "$lib/utils/accessible-tooltip";
	import { liquidGlass } from "$lib/utils/liquid-glass";
	import ContactConfirmDialog from "$lib/components/ContactConfirmDialog.svelte";
	import TelegramIcon from "$lib/components/TelegramIcon.svelte";
	import ThemeIcon from "$lib/components/ThemeIcon.svelte";

	type ThemeMode = "auto" | "light" | "dark";
	type ContactKind = "telegram" | "email";
	type PendingContact = {
		kind: ContactKind;
		url: string;
		opener: HTMLButtonElement;
	};

	const TELEGRAM_URL = "https://t.me/YumeRobo_Channel";
	const EMAIL_URL = "mailto:YumeRobo@proton.me";
	const THEME_MODES: ThemeMode[] = ["auto", "light", "dark"];

	let themeMode = $state<ThemeMode>("auto");
	let isThemeMenuOpen = $state(false);
	let isSearchFocused = $state(false);
	let isTyping = false;
	let isComposing = false;
	let originUrl: string | null = null;
	let canReturnToHomeThroughHistory = false;
	let searchQuery = $state("");
	let isMobileMenuOpen = $state(false);
	let pendingContact = $state<PendingContact | null>(null);
	let isDetailPage = $derived(Boolean(page.params.slug));

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

	// A pending debounced search must not fire after any navigation the
	// user initiated elsewhere (card click, back/forward, clear). Only
	// one timer is ever pending, and the search's own goto fires after
	// its timer has been consumed, so cancelling unconditionally is safe.
	beforeNavigate(({ from, to }) => {
		navigateToSearch.cancel();
		isTyping = false;
		// The persistent layout header survives route changes. Dismiss its modal
		// before a navigation snapshot so dialogs never travel with page history.
		pendingContact = null;

		// The home snapshot (including its loaded card count and scroll
		// position) is restored only when revisiting its history entry.
		// Remember when the detail entry was reached directly from home so
		// the header control can use history.back() instead of creating a
		// fresh home entry at scroll position zero.
		if (to?.route.id === "/[slug]") {
			canReturnToHomeThroughHistory = from?.route.id === "/";
		}
	});

	function handleBackToHome(event: MouseEvent) {
		// Preserve native modified/middle-click behavior and retain href="/"
		// as the safe fallback for directly opened detail pages.
		if (
			!canReturnToHomeThroughHistory ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}

		event.preventDefault();
		history.back();
	}

	function clearSearch() {
		navigateToSearch.cancel();
		searchQuery = "";
		isTyping = false;
		// Only navigate when a search is actually applied to the URL;
		// clearing an uncommitted query must not yank the user off the
		// page they're on (or erase it from history via replaceState).
		if (page.url.searchParams.has("q")) {
			const returnUrl = originUrl || "/";
			originUrl = null;
			goto(returnUrl, { replaceState: true, keepFocus: true });
		}
	}

	function handleCompositionStart() {
		isComposing = true;
		isTyping = true;
	}

	function handleCompositionEnd(event: CompositionEvent) {
		isComposing = false;
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;

		if (!target.value.trim()) {
			// Composition cancelled/deleted: release the typing flag so
			// URL sync resumes, and clear an applied search if present.
			isTyping = false;
			if (page.url.searchParams.has("q")) {
				navigateToSearch(searchQuery);
			}
			return;
		}

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
		// Escape during IME composition dismisses the candidate window —
		// it must never clear the search or navigate.
		if (event.isComposing || isComposing) return;
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
		closeThemeMenu(true);
		// Cross-fade the recolor with the same primitive Magic Move uses.
		// The .theme-vt class scopes out navigation-only choreography
		// (badge fly-in, hero shadow settle) during the recolor.
		if (document.startViewTransition && !prefersReducedMotion.current) {
			const root = document.documentElement;
			root.classList.add("theme-vt");
			const transition = document.startViewTransition(() =>
				applyTheme(mode),
			);
			transition.finished.finally(() =>
				root.classList.remove("theme-vt"),
			);
		} else {
			applyTheme(mode);
		}
	}

	async function openThemeMenu(focusItem: boolean) {
		isThemeMenuOpen = true;
		if (focusItem) {
			await tick();
			focusThemeItem(THEME_MODES.indexOf(themeMode));
		}
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
			if (isThemeMenuOpen) {
				focusThemeItem(THEME_MODES.indexOf(themeMode));
			} else {
				openThemeMenu(true);
			}
		} else if (event.key === "Escape" && isThemeMenuOpen) {
			event.preventDefault();
			closeThemeMenu(false);
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
		if (pendingContact) return;
		if (event.key === "Escape" && isMobileMenuOpen) {
			event.preventDefault();
			isMobileMenuOpen = false;
			mobileMenuButton?.focus();
		}
	}

	function requestContact(event: MouseEvent, kind: ContactKind, url: string) {
		pendingContact = {
			kind,
			url,
			opener: event.currentTarget as HTMLButtonElement,
		};
		isThemeMenuOpen = false;
		isMobileMenuOpen = false;
	}

	async function cancelContact() {
		const opener = pendingContact?.opener;
		pendingContact = null;
		await tick();
		opener?.focus();
	}

	function confirmContact() {
		const contact = pendingContact;
		if (!contact) return;

		pendingContact = null;
		if (contact.kind === "telegram") {
			window.open(contact.url, "_blank", "noopener,noreferrer");
		} else {
			window.location.href = contact.url;
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

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest(".header")) {
			closeThemeMenu();
		}
	}

	$effect(() => {
		window.addEventListener("click", handleClickOutside);
		return () => window.removeEventListener("click", handleClickOutside);
	});
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<header
	class="header"
	style:view-transition-name="app-header"
	onfocusout={handleThemeFocusOut}
>
	<div class="header-bar">
		<div class="header-content">
			{#if isDetailPage}
				<a
					href="/"
					class="header-leading leading-control context-back liquid-surface"
					use:liquidGlass={{ interactive: false, refraction: 8 }}
					use:accessibleTooltip={{
						text: "Back to releases",
						placement: "bottom",
					}}
					aria-label="Back to releases"
					onclick={handleBackToHome}
				>
					<svg
						style:view-transition-name="header-leading"
						xmlns="http://www.w3.org/2000/svg"
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M19 12H5m7-7-7 7 7 7" />
					</svg>
				</a>
			{:else}
				<a
					href="/"
					class="header-leading leading-control home-button liquid-surface"
					use:liquidGlass={{ interactive: false, refraction: 8 }}
					use:accessibleTooltip={{
						text: "Go to home",
						placement: "bottom",
					}}
					aria-label="Go to home"
				>
					<svg
						style:view-transition-name="header-leading"
						xmlns="http://www.w3.org/2000/svg"
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="m3 11 9-8 9 8" />
						<path d="M5 10v10h14V10" />
						<path d="M9 20v-6h6v6" />
					</svg>
				</a>
			{/if}

		<form
			class="search-wrapper liquid-surface"
			use:liquidGlass={{ interactive: true, refraction: 10 }}
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
					use:accessibleTooltip={{
						text: "Clear search",
						placement: "bottom",
					}}
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
			<div
				class="contact-group liquid-surface"
				use:liquidGlass={{ interactive: true, refraction: 9 }}
			>
				<button
					type="button"
					class="contact-button"
					use:accessibleTooltip={{
						text: "Open Telegram channel",
						placement: "bottom",
					}}
					aria-label="Open Telegram channel"
					onclick={(event) => requestContact(event, "telegram", TELEGRAM_URL)}
				>
					<TelegramIcon size={20} />
				</button>
				<button
					type="button"
					class="contact-button"
					use:accessibleTooltip={{
						text: "Email YumeRobo",
						placement: "bottom",
					}}
					aria-label="Email YumeRobo"
					onclick={(event) => requestContact(event, "email", EMAIL_URL)}
				>
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
					<rect width="20" height="16" x="2" y="4" rx="2" />
					<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
				</svg>
				</button>
			</div>
			<div class="theme-dropdown">
				<button
					class="nav-button liquid-surface"
					use:liquidGlass={{ interactive: true, refraction: 8 }}
					use:accessibleTooltip={{
						text: `Change theme (${themeLabel(themeMode)})`,
						placement: "bottom",
					}}
					bind:this={themeButton}
					onclick={(event) => {
						event.stopPropagation();
						if (isThemeMenuOpen) {
							closeThemeMenu();
						} else {
							// detail === 0 → keyboard-originated click:
							// move focus into the menu; mouse keeps it here
							openThemeMenu(event.detail === 0);
						}
					}}
					onkeydown={handleThemeButtonKeydown}
					aria-label="Theme: {themeLabel(themeMode)}"
					aria-haspopup="menu"
					aria-expanded={isThemeMenuOpen}
					aria-controls="theme-menu"
				>
					<span class="theme-icon" aria-hidden="true">
						<ThemeIcon mode={themeMode} />
					</span>
				</button>
			</div>
		</nav>

		<button
			class="mobile-menu-button liquid-surface"
			use:liquidGlass={{ interactive: true, refraction: 8 }}
			use:accessibleTooltip={{
				text: isMobileMenuOpen ? "Close menu" : "Open menu",
				placement: "bottom",
			}}
			bind:this={mobileMenuButton}
			onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
			aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
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
	</div>

	{#if isThemeMenuOpen}
		<div
			class="dropdown-menu liquid-surface liquid-surface--elevated"
			use:liquidGlass={{ interactive: true, refraction: 7 }}
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
					onmousedown={(event) =>
						// Safari doesn't focus buttons on mousedown;
						// keep focus stable until the click lands
						event.preventDefault()}
					onclick={() => setTheme(mode)}
					onkeydown={(event) => handleThemeMenuKeydown(event, index)}
				>
					<span class="dropdown-icon" aria-hidden="true">
						<ThemeIcon {mode} size={18} />
					</span>
					<span>{themeLabel(mode)}</span>
				</button>
			{/each}
		</div>
	{/if}

	{#if isMobileMenuOpen}
		<nav
			class="nav-mobile liquid-surface liquid-surface--elevated"
			use:liquidGlass={{ interactive: true, refraction: 7 }}
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

			<div class="mobile-links">
				<button
					type="button"
					class="contact-button mobile"
					aria-label="Telegram channel"
					onclick={(event) => requestContact(event, "telegram", TELEGRAM_URL)}
				>
					<TelegramIcon size={20} />
					<span class="mobile-contact-label">Telegram</span>
				</button>
				<button
					type="button"
					class="contact-button mobile"
					aria-label="Email YumeRobo@proton.me"
					onclick={(event) => requestContact(event, "email", EMAIL_URL)}
				>
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
						<rect width="20" height="16" x="2" y="4" rx="2" />
						<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
					</svg>
					<span class="mobile-contact-label">Email</span>
				</button>
			</div>

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
								<span class="control-theme-icon" aria-hidden="true">
									<ThemeIcon {mode} size={18} />
								</span>
								<span>{themeLabel(mode)}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</nav>
		{/if}
	</header>

	{#if pendingContact}
		<ContactConfirmDialog
			kind={pendingContact.kind}
			oncancel={cancelContact}
			onconfirm={confirmContact}
		/>
	{/if}

<style>
	.header {
		--header-control-size: 44px;
		--header-control-radius: calc(var(--header-control-size) / 2);
		--header-control-icon-size: 20px;
		--header-control-accent-shadow:
			inset 0 1px 0 var(--liquid-highlight),
			inset 0 0 0 1px
				color-mix(in srgb, var(--color-accent) 24%, transparent),
			var(--liquid-shadow);

		position: sticky;
		top: var(--space-2);
		z-index: 100;
		width: calc(100% - 2 * var(--space-2));
		max-width: 960px;
		margin-inline: auto;
	}

	.header-content {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr) 44px;
		column-gap: var(--space-2);
		align-items: center;
		height: 60px;
		padding-inline: var(--space-4);
	}

	.header-leading {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		justify-self: start;
		width: var(--header-control-size);
		height: var(--header-control-size);
		padding: 0;
	}

	.leading-control svg {
		width: var(--header-control-icon-size);
		height: var(--header-control-icon-size);
		view-transition-class: header-leading;
	}

	.leading-control {
		color: var(--color-label-secondary);
		text-decoration: none;
		border-color: var(--liquid-border);
		border-radius: var(--header-control-radius);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.home-button:hover,
	.home-button:focus-visible,
	.context-back:hover,
	.context-back:focus-visible {
		color: var(--color-accent);
		background-color: var(--liquid-control-hover);
		border-color: color-mix(
			in srgb,
			var(--color-accent) 36%,
			var(--liquid-border)
		);
		box-shadow: var(--header-control-accent-shadow);
	}

	.home-button:active,
	.context-back:active {
		transform: none;
	}

	.search-wrapper {
		grid-column: 2;
		justify-self: center;
		width: 100%;
		max-width: 520px;
		margin: 0;
		position: relative;
		display: flex;
		align-items: center;
		height: var(--header-control-size);
		border-radius: var(--header-control-radius);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.search-wrapper.focused {
		border-color: var(--color-accent);
		box-shadow:
			inset 0 1px 0 var(--liquid-highlight),
			var(--liquid-shadow),
			0 0 0 3px color-mix(in srgb, var(--color-accent) 18%, transparent);
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
		height: 100%;
		padding: var(--space-2) var(--space-3);
		padding-left: calc(var(--space-3) + 18px + var(--space-2));
		padding-right: var(--space-8);
		font-size: var(--text-sm);
		font-family: var(--font-sans);
		color: var(--color-label);
		background: transparent;
		border: none;
		border-radius: inherit;
	}

	.search-input::-webkit-search-cancel-button {
		-webkit-appearance: none;
		display: none;
	}

	.search-input:focus {
		outline: none;
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
		width: 28px;
		height: 28px;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: var(--radius-full);
		color: var(--color-label-secondary);
		cursor: pointer;
		opacity: 0.7;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			opacity var(--duration-fast) var(--ease-out);
	}

	.clear-btn:hover,
	.clear-btn:focus-visible {
		background-color: var(--liquid-control-hover);
		opacity: 1;
	}

	.nav-desktop {
		grid-column: 3;
		justify-self: end;
		display: none;
		align-items: center;
		gap: var(--space-2);
	}

	.contact-group {
		display: flex;
		align-items: center;
		height: var(--header-control-size);
		border-radius: var(--header-control-radius);
		overflow: hidden;
	}

	.contact-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--header-control-size);
		height: calc(var(--header-control-size) - 2px);
		padding: 0;
		font: inherit;
		background: transparent;
		border: 0;
		border-radius: var(--header-control-radius);
		color: var(--color-label-secondary);
		text-decoration: none;
		cursor: pointer;
		transition:
			color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.contact-button:hover {
		background-color: var(--liquid-control-hover);
		color: var(--color-accent);
	}

	/* The contact capsule clips at its glass edge, so keep the keyboard
	   indicator inside each button instead of losing the outer outline. */
	.contact-button:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: -3px;
		background-color: var(--liquid-control-hover);
		color: var(--color-accent);
	}

	.contact-button svg,
	.mobile-menu-button svg {
		width: var(--header-control-icon-size);
		height: var(--header-control-icon-size);
	}

	.nav-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--header-control-size);
		height: var(--header-control-size);
		color: var(--color-label-secondary);
		border-radius: var(--header-control-radius);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.nav-button:hover,
	.nav-button:focus-visible,
	.nav-button[aria-expanded="true"] {
		background-color: var(--liquid-control-hover);
		border-color: color-mix(
			in srgb,
			var(--color-accent) 36%,
			var(--liquid-border)
		);
		box-shadow: var(--header-control-accent-shadow);
		color: var(--color-accent);
	}

	.theme-icon {
		display: inline-grid;
		place-items: center;
		width: var(--header-control-icon-size);
		height: var(--header-control-icon-size);
		line-height: 0;
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
		border-radius: var(--radius-md);
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
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-spring);
		text-align: left;
	}

	.dropdown-item:hover,
	.dropdown-item:focus-visible {
		background-color: var(--liquid-control-hover);
	}

	.dropdown-item.active {
		color: var(--color-accent);
		font-weight: 500;
	}

	.dropdown-icon {
		display: inline-grid;
		place-items: center;
		width: 20px;
		height: 20px;
		flex: 0 0 20px;
	}

	.mobile-menu-button {
		grid-column: 3;
		justify-self: end;
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--header-control-size);
		height: var(--header-control-size);
		color: var(--color-label);
		border-radius: var(--header-control-radius);
		cursor: pointer;
		flex-shrink: 0;
	}

	.nav-mobile {
		padding: var(--space-4);
		position: absolute;
		top: calc(100% + var(--space-2));
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		border-radius: calc(var(--radius-lg) + 6px);
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
		background: var(--liquid-control);
		border: 1px solid transparent;
		border-radius: var(--radius-lg);
	}

	.mobile-links {
		display: flex;
		width: 100%;
		height: var(--header-control-size);
		background: var(--liquid-control);
		border: 1px solid transparent;
		border-radius: var(--header-control-radius);
		overflow: hidden;
	}

	/* Between 481-639px the header search is already visible; the
	   mobile menu would otherwise show a redundant second search box */
	@media (min-width: 481px) {
		.mobile-search-wrapper {
			display: none;
		}
	}

	.contact-button.mobile {
		width: auto;
		min-width: 0;
		flex: 1 1 50%;
		height: var(--header-control-size);
		gap: var(--space-2);
		padding-inline: var(--space-3);
		font-size: var(--text-sm);
		font-weight: 500;
	}

	.contact-button.mobile:first-child {
		border-right: 1px solid var(--liquid-border);
	}

	.mobile-contact-label {
		white-space: nowrap;
	}

	.mobile-controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.control-group {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--space-2);
	}

	.control-label {
		font-size: var(--text-sm);
		color: var(--color-label-secondary);
	}

	.control-buttons {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-1);
		background: var(--liquid-control);
		border: 1px solid var(--liquid-border);
		padding: var(--space-1);
		border-radius: var(--radius-md);
	}

	.control-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		min-width: 0;
		min-height: 44px;
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

	.control-theme-icon {
		display: inline-grid;
		place-items: center;
		width: 20px;
		height: 20px;
	}

	.control-btn:hover,
	.control-btn:focus-visible {
		color: var(--color-accent);
	}

	.control-btn.active {
		background: var(--liquid-control-hover);
		color: var(--color-accent);
	}

	@media (min-width: 640px) {
		.header {
			top: var(--space-3);
			width: calc(100% - 2 * var(--space-4));
		}

		.header-content {
			grid-template-columns:
				minmax(148px, 1fr)
				minmax(0, 520px)
				minmax(148px, 1fr);
		}

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

	@media (min-width: 768px) {
		.header-content {
			padding-inline: var(--space-6);
		}
	}

	@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
		.control-buttons {
			background: var(--color-background-secondary);
			border-color: var(--color-separator-opaque);
		}
	}

	@media (forced-colors: active) {
		.search-wrapper,
		.contact-group,
		.search-input,
		.clear-btn,
		.contact-button,
		.nav-button,
		.mobile-menu-button,
		.context-back,
		.dropdown-item,
		.control-buttons,
		.control-btn {
			background: ButtonFace;
			border-color: ButtonBorder;
			box-shadow: none;
		}
	}
</style>
