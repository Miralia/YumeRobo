<script lang="ts">
    import { fly, slide } from "svelte/transition";
    import { untrack } from "svelte";
    import { formatDateTime } from "$lib/utils/date";
    import MediaInfoCard from "$lib/components/MediaInfoCard.svelte";
    import type { Release, ExternalLinks } from "$lib/content/schema";
    import { externalIcons } from "$lib/utils/icons";
    import { env } from "$env/dynamic/public";
    import { entranceFly, slideParams } from "$lib/utils/animation";
    import { posterTilt } from "$lib/utils/poster-tilt";

    const SITE_URL = env.PUBLIC_SITE_URL || "https://yumerobo.moe";

    interface Props {
        data: {
            release: Release;
            badges: string[];
            accent: string | null;
            posterBlur: string | null;
        };
    }

    let { data }: Props = $props();

    /**
     * External link metadata. `darkText` flips the hover ink for bright
     * brand colors where white text would fail contrast.
     */
    const LINK_DEFS: Array<{
        key: keyof ExternalLinks;
        label: string;
        color: string;
        darkText: boolean;
    }> = [
        { key: "tmdb", label: "TMDB", color: "#01b4e4", darkText: true },
        { key: "imdb", label: "IMDb", color: "#f5c518", darkText: true },
        { key: "douban", label: "Douban", color: "#007722", darkText: false },
        { key: "bangumi", label: "Bangumi", color: "#f09199", darkText: true },
        { key: "letterboxd", label: "Letterboxd", color: "#40bcf4", darkText: true },
        { key: "rotten_tomatoes", label: "Rotten Tomatoes", color: "#fa320a", darkText: true },
        { key: "anidb", label: "AniDB", color: "#000000", darkText: false },
        { key: "anilist", label: "AniList", color: "#02a9ff", darkText: true },
        { key: "myanimelist", label: "MAL", color: "#2e51a2", darkText: false },
        { key: "tvdb", label: "TVDB", color: "#3bb300", darkText: true },
    ];

    let availableLinks = $derived(
        LINK_DEFS.filter((def) => data.release.links?.[def.key]),
    );

    /*
     * Expanded state is derived from defaults plus explicit user
     * overrides keyed by slug, so prerendered HTML ships the sections
     * open (no post-hydration expand flash) and client-side navigation
     * between releases resets cleanly.
     */
    const collapseKeywords = ["x264", "x265", "av1"];

    let specOverrides = $state<Record<string, boolean>>({});
    let torrentOverrides = $state<Record<string, boolean>>({});

    function specDefault(title: string): boolean {
        const titleLower = title.toLowerCase();
        return !collapseKeywords.some((kw) => titleLower.includes(kw));
    }

    function isSpecExpanded(index: number): boolean {
        const spec = data.release.specs?.[index];
        if (!spec) return false;
        return (
            specOverrides[`${data.release.slug}:${index}`] ??
            specDefault(spec.title)
        );
    }

    function toggleSpec(index: number) {
        specOverrides[`${data.release.slug}:${index}`] = !isSpecExpanded(index);
    }

    function isTorrentExpanded(index: number): boolean {
        return torrentOverrides[`${data.release.slug}:${index}`] ?? false;
    }

    function toggleTorrent(index: number) {
        torrentOverrides[`${data.release.slug}:${index}`] =
            !isTorrentExpanded(index);
    }

    // MediaInfo state - stores raw text
    let loadedMediaInfo = $state<Map<string, string>>(new Map());
    let loadingMediaInfo = $state<Set<string>>(new Set());
    let failedMediaInfo = $state<Set<string>>(new Set());

    // Flattened so entrance stagger runs on a true running index
    let mediaInfoEntries = $derived(
        data.release.torrents.flatMap((torrent) =>
            torrent.mediainfo.map((mi) => mi),
        ),
    );

    async function loadMediaInfoContent(hash: string) {
        const alreadyHandled = untrack(
            () => loadedMediaInfo.has(hash) || loadingMediaInfo.has(hash),
        );
        if (alreadyHandled) return;

        loadingMediaInfo = new Set(untrack(() => loadingMediaInfo)).add(hash);

        try {
            const response = await fetch(`/mediainfo/${hash}`);
            if (response.ok) {
                const rawText = await response.text();
                loadedMediaInfo = new Map(untrack(() => loadedMediaInfo)).set(
                    hash,
                    rawText,
                );
            } else {
                failedMediaInfo = new Set(untrack(() => failedMediaInfo)).add(
                    hash,
                );
            }
        } catch (e) {
            console.error("Failed to load MediaInfo:", e);
            failedMediaInfo = new Set(untrack(() => failedMediaInfo)).add(hash);
        } finally {
            const newLoading = new Set(untrack(() => loadingMediaInfo));
            newLoading.delete(hash);
            loadingMediaInfo = newLoading;
        }
    }

    /*
     * Prefetch raw MediaInfo once the browser is idle so the requests
     * never compete with the LCP poster or the entrance choreography.
     */
    $effect(() => {
        const torrents = data.release.torrents;

        // The 800ms ceiling keeps the fetch out of the Magic Move +
        // entrance window (Safari lacks requestIdleCallback and would
        // otherwise fire mid-choreography) without stalling long enough
        // for the skeleton swap to drift far down the visit.
        const idle = window.requestIdleCallback
            ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: 800 })
            : (cb: () => void) => window.setTimeout(cb, 800);
        const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;

        const handle = idle(() => {
            for (const torrent of torrents) {
                for (const mi of torrent.mediainfo) {
                    loadMediaInfoContent(mi.raw_hash);
                }
            }
        });

        return () => cancelIdle(handle);
    });

    function formatSize(bytes: number): string {
        if (!bytes) return "";
        const units = ["B", "KiB", "MiB", "GiB", "TiB"];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
</script>

<svelte:head>
    <title>{data.release.title} | 夢みる機械</title>
    <meta
        name="description"
        content="{data.release.year} · {data.release.media_type === 'movie'
            ? 'Movie'
            : 'TV'}"
    />

    <!-- Open Graph -->
    <meta
        property="og:title"
        content={data.release.title}
    />
    <meta
        property="og:description"
        content="{data.release.year} · {data.release.media_type === 'movie'
            ? 'Movie'
            : 'TV'}"
    />
    <meta
        property="og:image"
        content="{SITE_URL}{data.release.poster
            .replace('.avif', '.jpg')
            .replace('/posters/', '/og/')}"
    />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="夢みる機械" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta
        name="twitter:title"
        content={data.release.title}
    />
    <meta
        name="twitter:description"
        content="{data.release.year} · {data.release.media_type === 'movie'
            ? 'Movie'
            : 'TV'}"
    />
    <meta
        name="twitter:image"
        content="{SITE_URL}{data.release.poster
            .replace('.avif', '.jpg')
            .replace('/posters/', '/og/')}"
    />
</svelte:head>

<article class="detail-page container">
    <!-- Hero Section -->
    <header
        class="hero poster-grid-layout"
        style:--dyn={data.accent ?? "var(--color-accent)"}
    >
        {#if data.posterBlur}
            <div
                class="hero-ambient"
                aria-hidden="true"
                style:background-image="url({data.posterBlur})"
            ></div>
        {:else}
            <div class="hero-ambient hero-ambient-flat" aria-hidden="true"></div>
        {/if}

        <!-- Poster -->
        <div
            class="poster-container poster-hero poster-motion"
            use:posterTilt
            style:view-transition-name="poster-{data.release.slug}"
        >
            <!-- The grid already cached the 200w card variant; painting
                 it underneath keeps the Magic Move landing sharp while
                 the full poster decodes -->
            <img
                src={data.release.poster}
                alt="{data.release.title} poster"
                class="poster"
                width="500"
                height="750"
                fetchpriority="high"
                decoding="async"
                style:background-image="url({data.release.poster.replace(
                    '.avif',
                    '.card.avif',
                )})"
            />
            {#if data.badges.length > 0}
                <span
                    class="badge-chip"
                    style:view-transition-name="badge-{data.release.slug}"
                >{data.badges.join(" · ")}</span>
            {/if}
        </div>

        <!-- Info -->
        <div
            class="info"
            in:fly={entranceFly("hero", 0, { axis: "x" })}
        >
            <h1
                class="title"
                style:view-transition-name="title-{data.release.slug}"
            >
                {data.release.title}
            </h1>

            <div class="meta-row">
                {#if data.release.year}
                    <span class="meta-item">{data.release.year}</span>
                {/if}
                {#if (data.release.media_type === "tv" || data.release.media_type === "tva") && data.release.season}
                    <span class="meta-item">Season {data.release.season}</span>
                {/if}
                <span class="meta-item"
                    >{formatDateTime(data.release.date, "medium")}</span
                >
            </div>

            <!-- External Links -->
            {#if availableLinks.length > 0}
                <ul class="actions" aria-label="External links">
                    {#each availableLinks as def (def.key)}
                        {@const url = data.release.links?.[def.key]}
                        {@const icon = externalIcons[def.key]}
                        <li>
                            <a
                                href={url}
                                class="action-button external-link liquid-control"
                                class:dark-text={def.darkText}
                                style:--link-color={def.color}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {#if icon}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox={typeof icon === "string"
                                            ? "0 0 24 24"
                                            : icon.viewBox}
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d={typeof icon === "string"
                                                ? icon
                                                : icon.d}
                                        />
                                    </svg>
                                {/if}
                                {def.label}
                            </a>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </header>

    <!-- Tech Info Section -->
    {#if data.release.specs && data.release.specs.length > 0}
        <section class="specs-section" aria-label="Technical information">
            {#each data.release.specs as spec, i}
                <div
                    class="spec-block"
                    in:fly={entranceFly("specs", i)}
                >
                    <h2 class="spec-heading">
                        <button
                            class="spec-header"
                            onclick={() => toggleSpec(i)}
                            aria-expanded={isSpecExpanded(i)}
                            aria-controls="spec-panel-{i}"
                        >
                            <span class="spec-title">{spec.title}</span>
                            <svg
                                class="chevron"
                                class:expanded={isSpecExpanded(i)}
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </button>
                    </h2>

                    {#if isSpecExpanded(i)}
                        <div
                            class="spec-body"
                            id="spec-panel-{i}"
                            transition:slide={slideParams()}
                        >
                            {#if spec.content}
                                <div class="spec-content">
                                    {@html spec.content}
                                </div>
                            {/if}

                            {#if spec.subitems && spec.subitems.length > 0}
                                <div class="spec-subitems">
                                    {#each spec.subitems as subitem}
                                        <div class="subitem">
                                            <h3 class="subitem-title">
                                                {subitem.title}
                                            </h3>
                                            <div class="spec-content">
                                                {@html subitem.content}
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            {/each}
        </section>
    {/if}

    <!-- MediaInfo Section -->
    <section class="mediainfo-section" aria-label="MediaInfo">
        <h2
            class="section-title"
            in:fly={entranceFly("mediainfo", 0, { lead: 60 })}
        >
            MediaInfo
        </h2>
        <div class="mediainfo-list">
            {#each mediaInfoEntries as mi, flatIndex}
                <div
                    class="mediainfo-wrapper"
                    in:fly={entranceFly("mediainfo", flatIndex)}
                >
                    <MediaInfoCard
                        filename={mi.filename}
                        rawHash={mi.raw_hash}
                        rawContent={loadedMediaInfo.get(mi.raw_hash) ?? null}
                        hasFailed={failedMediaInfo.has(mi.raw_hash)}
                        onexpand={() => loadMediaInfoContent(mi.raw_hash)}
                    />
                </div>
            {/each}
        </div>
    </section>

    <!-- Torrents Section -->
    <section class="torrents-section" aria-label="Torrents">
        <h2
            class="section-title"
            in:fly={entranceFly("torrents", 0, { lead: 60 })}
        >
            Torrents
        </h2>
        <div class="torrent-list">
            {#each data.release.torrents as torrent, index}
                <div
                    class="torrent-item"
                    in:fly={entranceFly("torrents", index)}
                >
                    <button
                        class="torrent-header"
                        onclick={() => toggleTorrent(index)}
                        aria-expanded={isTorrentExpanded(index)}
                        aria-controls="torrent-panel-{index}"
                    >
                        <span class="torrent-name">{torrent.name}</span>
                        <span class="file-count"
                            >{torrent.files.length} file{torrent.files
                                .length !== 1
                                ? "s"
                                : ""}</span
                        >
                        <svg
                            class="chevron"
                            class:expanded={isTorrentExpanded(index)}
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
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </button>

                    {#if isTorrentExpanded(index)}
                        <div
                            class="torrent-files"
                            id="torrent-panel-{index}"
                            transition:slide={slideParams()}
                        >
                            {#each torrent.files as file}
                                <div class="file-item">
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
                                        class="file-icon"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
                                        /><path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                    </svg>
                                    {#if typeof file === "string"}
                                        <span class="file-name">{file}</span>
                                    {:else}
                                        <span class="file-name"
                                            >{file.name}</span
                                        >
                                        {#if file.size}
                                            <span class="file-size"
                                                >{formatSize(file.size)}</span
                                            >
                                        {/if}
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </section>
</article>

<style>
    .detail-page {
        display: flex;
        flex-direction: column;
        gap: var(--space-8);
        padding-bottom: var(--space-16);
    }

    /* Hero */
    .hero {
        position: relative;
        align-items: start;
        row-gap: var(--space-6);
    }

    /* Poster-derived glow behind the hero: a build-time 24px micro
       thumb upscaled by CSS — naturally soft, no runtime blur() cost.
       Horizontal inset stays at 0 (a wider box overflows the page and
       creates horizontal scroll); the radial mask fades every edge so
       the glow dissolves into the page background with no boundary. */
    .hero-ambient {
        position: absolute;
        inset: -20% 0;
        background-size: cover;
        background-position: center;
        filter: saturate(1.35);
        opacity: var(--hero-ambient-opacity, 0.16);
        pointer-events: none;
        z-index: -1;
        mask-image: radial-gradient(
            ellipse 70% 62% at 50% 42%,
            black 30%,
            transparent 74%
        );
        -webkit-mask-image: radial-gradient(
            ellipse 70% 62% at 50% 42%,
            black 30%,
            transparent 74%
        );
    }

    /* Fallback when no micro thumb exists: dominant-color wash */
    .hero-ambient-flat {
        background-image: radial-gradient(
            ellipse 60% 70% at 30% 35%,
            var(--dyn),
            transparent 75%
        );
        filter: none;
    }

    @media (prefers-reduced-transparency: reduce), (forced-colors: active) {
        .hero-ambient {
            display: none;
        }
    }

    .poster-container {
        position: relative;
        width: 100%;
        aspect-ratio: 2/3;
        border-radius: var(--radius-poster);
        /* Dominant color doubles as the loading placeholder */
        background: color-mix(in srgb, var(--dyn) 55%, var(--color-background-secondary));
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
        overflow: hidden;
        view-transition-class: poster;
        /* Lets the shadow settle in after the Magic Move lands */
        transition: box-shadow var(--duration-normal) var(--ease-out);
    }

    .poster-container:global([data-poster-hover]) {
        box-shadow: 0 24px 52px -14px color-mix(in srgb, var(--dyn) 55%, rgba(0, 0, 0, 0.5));
    }

    .poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: var(--radius-poster);
        background-size: cover;
        background-position: center;
    }

    .badge-chip {
        position: absolute;
        left: 8px;
        bottom: 8px;
        font-family: var(--font-sans);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.04em;
        line-height: 1;
        padding: 4px 7px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.92);
        color: #1a1a24;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
        view-transition-class: badge;
    }

    .info {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        min-width: 0;
    }

    @media (min-width: 640px) {
        .info {
            grid-column: 2 / -1;
        }
    }

    .title {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: 700;
        letter-spacing: var(--tracking-tight);
        color: var(--color-label);
        margin: 0;
        text-wrap: pretty;
        line-height: 1.25;
        /* Forward morphs take the class list from the NEW element —
           without this the list→detail title morph falls back to UA
           defaults while detail→list stays styled */
        view-transition-class: title;
    }

    @media (min-width: 640px) {
        .title {
            font-size: var(--text-3xl);
        }
    }

    .meta-row {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
        max-width: 500px;
    }

    .meta-item {
        font-family: var(--font-sans);
        font-size: var(--text-sm);
        color: var(--color-label-secondary);
        font-variant-numeric: tabular-nums;
        line-height: 1.4;
    }

    .meta-item:not(:last-child)::after {
        content: "•";
        margin-left: var(--space-2);
        color: var(--color-label-tertiary);
    }

    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
        margin-top: var(--space-2);
        list-style: none;
        padding: 0;
    }

    .actions li {
        display: flex;
    }

    .action-button {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        min-height: 44px;
        padding: var(--space-2) var(--space-3);
        font-size: var(--text-sm);
        font-weight: 600;
        line-height: 1;
        text-decoration: none;
        border-radius: 999px;
        transition:
            color var(--duration-fast) var(--ease-out),
            background-color var(--duration-fast) var(--ease-out),
            border-color var(--duration-fast) var(--ease-out),
            transform var(--duration-fast) var(--ease-spring);
    }

    .external-link {
        color: var(--color-label);
    }

    .external-link svg {
        flex-shrink: 0;
    }

    .external-link:hover,
    .external-link:focus-visible {
        color: #ffffff;
        background: var(--link-color, var(--color-accent));
        border-color: var(--link-color, var(--color-accent));
        transform: translateY(-1px);
    }

    .external-link.dark-text:hover,
    .external-link.dark-text:focus-visible {
        color: rgba(0, 0, 0, 0.88);
    }

    .external-link:active {
        transform: scale(0.96);
    }

    @media (min-width: 640px) {
        .action-button {
            min-height: 38px;
        }
    }

    @media (forced-colors: active) {
        .external-link:hover,
        .external-link:focus-visible {
            color: HighlightText;
            background: Highlight;
            border-color: Highlight;
        }
    }

    /* Sections */
    .section-title {
        font-family: var(--font-sans);
        font-size: var(--text-lg);
        font-weight: 600;
        letter-spacing: 0.01em;
        color: var(--color-label);
        margin: 0 0 var(--space-3) 0;
    }

    /* Tech Specs (NFO) */
    .specs-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
    }

    .spec-block {
        display: flex;
        flex-direction: column;
        background: var(--color-background-secondary);
        border-radius: var(--radius-md);
        overflow: hidden;
    }

    .spec-heading {
        margin: 0;
        font-size: inherit;
    }

    .spec-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-3) var(--space-4);
        background: transparent;
        border: none;
        cursor: pointer;
        text-align: left;
        transition:
            background var(--duration-fast) var(--ease-out),
            transform var(--duration-fast) var(--ease-out);
    }

    .spec-header:hover {
        background: var(--color-fill);
    }

    .spec-header:active {
        transform: scale(0.995);
    }

    .spec-header:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: -2px;
        border-radius: var(--radius-md);
    }

    .spec-title {
        font-family: var(--font-sans);
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--color-label);
        letter-spacing: 0.05em;
    }

    .spec-body {
        padding: 0 var(--space-4) var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .spec-subitems {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        padding-left: var(--space-2);
        border-left: 2px solid var(--color-separator);
    }

    .subitem {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    .subitem-title {
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--color-label-secondary);
        font-family: var(--font-mono);
    }

    .spec-content {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        line-height: var(--leading-relaxed);
        color: var(--color-label-secondary);
        background: var(--color-background-tertiary);
        padding: var(--space-4);
        border-radius: var(--radius-md);
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
        margin: 0;
    }

    /* Use global styles for spec links to ensure they work even with @html.
       The tertiary surface needs the surface-tuned accent, and hover keeps
       the underline — color alone at hover contrast is not a reliable cue. */
    :global(.spec-link) {
        color: var(--color-accent-on-tertiary);
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 2px;
    }

    :global(.spec-link:hover) {
        text-decoration-thickness: 2px;
    }

    /* Torrents */
    .torrent-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    .torrent-item {
        background: var(--color-background-secondary);
        border-radius: var(--radius-md);
        overflow: hidden;
    }

    .torrent-header {
        width: 100%;
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-4);
        background: transparent;
        border: none;
        cursor: pointer;
        text-align: left;
        transition:
            background var(--duration-fast) var(--ease-out),
            transform var(--duration-fast) var(--ease-out);
    }

    .torrent-header:hover {
        background: var(--color-fill);
    }

    .torrent-header:active {
        transform: scale(0.995);
    }

    .torrent-header:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: -2px;
        border-radius: var(--radius-md);
    }

    .torrent-name {
        flex: 1;
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--color-label);
        word-break: break-all;
    }

    .file-count {
        font-family: var(--font-sans);
        font-size: var(--text-xs);
        color: var(--color-label-secondary);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }

    .chevron {
        flex-shrink: 0;
        /* State-bearing graphic: needs ≥3:1, tertiary is decorative-only */
        color: var(--color-label-secondary);
        transition: transform var(--duration-normal) var(--ease-spring);
    }

    .chevron.expanded {
        transform: rotate(180deg);
    }

    .torrent-files {
        padding: 0 var(--space-4) var(--space-3);
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .file-item {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-1) var(--space-2);
        margin-left: var(--space-4);
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-label-secondary);
        background: var(--color-fill);
        border-radius: var(--radius-sm);
    }

    .file-icon {
        flex-shrink: 0;
    }

    .file-name {
        flex: 1;
        word-break: break-all;
    }

    .file-size {
        font-size: var(--text-xs);
        color: var(--color-label-secondary);
        white-space: nowrap;
        font-feature-settings: "tnum";
    }

    /* Inner Quote (BBCode) */
    :global(.inner-quote) {
        margin: var(--space-2) 0;
        background: var(--color-background-secondary);
        border-left: 2px solid var(--color-separator);
        border-radius: var(--radius-sm);
        overflow: hidden;
    }

    :global(.inner-quote-title) {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--color-label-secondary);
        padding: var(--space-1) var(--space-2);
        background: rgba(0, 0, 0, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    :global(.inner-quote-content) {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        padding: var(--space-2);
        color: var(--color-label-secondary);
        white-space: pre-wrap;
    }

    /* MediaInfo */
    .mediainfo-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }
</style>
