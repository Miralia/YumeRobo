<script lang="ts">
    import { spring } from "svelte/motion";
    import { locale, t, type Locale } from "$lib/stores/locale";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { debounce } from "$lib/utils/debounce";
    import { springPresets } from "$lib/utils/animation";

    /** Theme state */
    type ThemeMode = "auto" | "light" | "dark";
    let themeMode = $state<ThemeMode>("auto");
    let isThemeMenuOpen = $state(false);

    /** Language dropdown state */
    let isLangMenuOpen = $state(false);

    /** Search state */
    let searchQuery = $state("");
    let isSearchFocused = $state(false);
    let isTyping = false;
    let isComposing = false;
    let originUrl: string | null = null;

    /**
     * Syncs search input with URL query parameters.
     * Prevents overwriting user input while typing.
     */
    $effect(() => {
        const urlQuery = $page.url.searchParams.get("q") || "";
        if (!isTyping && searchQuery !== urlQuery) {
            searchQuery = urlQuery;
        }
        if (!urlQuery && originUrl !== null && !isTyping) {
            originUrl = null;
        }
    });

    /**
     * Navigates to the search URL with debouncing.
     */
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

    // IME composition handlers
    function handleCompositionStart() {
        isComposing = true;
        isTyping = true;
    }

    function handleCompositionEnd(event: CompositionEvent) {
        isComposing = false;
        const target = event.target as HTMLInputElement;
        const value = target.value.trim();
        if (value) {
            searchQuery = target.value;
            navigateToSearch(searchQuery);
        }
    }

    function handleSearchInput(event: Event) {
        const target = event.target as HTMLInputElement;
        searchQuery = target.value;
        isTyping = true;
        if (!isComposing) {
            navigateToSearch(searchQuery);
        }
    }

    // Mobile menu
    let isMobileMenuOpen = $state(false);

    // Spring animation for logo
    const logoScale = spring(1, springPresets.snappy);

    // Initialize theme from localStorage
    $effect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("theme") as ThemeMode | null;
            if (saved && ["auto", "light", "dark"].includes(saved)) {
                themeMode = saved;
            }
            applyTheme(themeMode);
        }
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

    function setLocale(newLocale: Locale) {
        locale.set(newLocale);
        isLangMenuOpen = false;
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
        if (!target.closest(".theme-dropdown")) isThemeMenuOpen = false;
        if (!target.closest(".lang-dropdown")) isLangMenuOpen = false;
    }

    $effect(() => {
        if (typeof window !== "undefined") {
            window.addEventListener("click", handleClickOutside);
            return () =>
                window.removeEventListener("click", handleClickOutside);
        }
    });
</script>

<header class="header glass" style:view-transition-name="app-header">
    <div class="header-content container">
        <!-- Logo -->
        <a
            href="/"
            class="logo"
            style:transform="scale({$logoScale})"
            onmouseenter={() => handleLogoHover(true)}
            onmouseleave={() => handleLogoHover(false)}
        >
            <img src="/icon.svg" alt="YumeRobo" class="logo-icon" />
        </a>

        <!-- Search Bar -->
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
                placeholder={$t.search}
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

        <!-- Desktop Navigation -->
        <nav class="nav-desktop">
            <!-- Theme Toggle -->
            <div class="theme-dropdown">
                <button
                    class="nav-button"
                    onclick={(e) => {
                        e.stopPropagation();
                        isThemeMenuOpen = !isThemeMenuOpen;
                        isLangMenuOpen = false;
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
                                <span class="dropdown-icon"
                                    >{getThemeIcon(mode)}</span
                                >
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

            <!-- Language Toggle -->
            <div class="lang-dropdown">
                <button
                    class="nav-button"
                    onclick={(e) => {
                        e.stopPropagation();
                        isLangMenuOpen = !isLangMenuOpen;
                        isThemeMenuOpen = false;
                    }}
                    aria-label="Toggle language"
                >
                    <span class="lang-label"
                        >{$locale === "en" ? "EN" : "中"}</span
                    >
                </button>
                {#if isLangMenuOpen}
                    <div class="dropdown-menu">
                        <button
                            class="dropdown-item"
                            class:active={$locale === "en"}
                            onclick={() => setLocale("en")}
                        >
                            English
                        </button>
                        <button
                            class="dropdown-item"
                            class:active={$locale === "zh"}
                            onclick={() => setLocale("zh")}
                        >
                            中文
                        </button>
                    </div>
                {/if}
            </div>
        </nav>

        <!-- Mobile Menu Button -->
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

    <!-- Mobile Menu -->
    {#if isMobileMenuOpen}
        <nav class="nav-mobile">
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
                    placeholder={$t.search}
                    value={searchQuery}
                    oninput={handleSearchInput}
                    oncompositionstart={handleCompositionStart}
                    oncompositionend={handleCompositionEnd}
                />
            </div>

            <div class="mobile-controls">
                <div class="control-group">
                    <span class="control-label">{$t.theme}</span>
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
                <div class="control-group">
                    <span class="control-label">{$t.language}</span>
                    <div class="control-buttons">
                        <button
                            class="control-btn"
                            class:active={$locale === "en"}
                            onclick={() => setLocale("en")}
                        >
                            EN
                        </button>
                        <button
                            class="control-btn"
                            class:active={$locale === "zh"}
                            onclick={() => setLocale("zh")}
                        >
                            中
                        </button>
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
        height: 56px;
    }

    .logo {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        font-weight: 600;
        font-size: var(--text-lg);
        color: var(--color-label);
        text-decoration: none;
    }

    .logo-icon {
        height: 28px;
        width: auto;
    }

    .search-wrapper {
        flex: 1;
        max-width: 480px;
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
        box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
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
        gap: var(--space-1);
    }

    @media (min-width: 640px) {
        .nav-desktop {
            display: flex;
        }
        .mobile-menu-button {
            display: none !important;
        }
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

    .lang-label {
        font-size: var(--text-sm);
        font-weight: 600;
    }

    .theme-dropdown,
    .lang-dropdown {
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

    @media (max-width: 480px) {
        .search-wrapper {
            display: none;
        }
    }
</style>
