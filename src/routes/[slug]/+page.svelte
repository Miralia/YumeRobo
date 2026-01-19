<script lang="ts">
    import { fly, fade } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { slide } from "svelte/transition";
    import { formatDateTime } from "$lib/utils/date";
    import { locale, t, getLocalizedTitle } from "$lib/stores/locale";
    import MediaInfoCard from "$lib/components/MediaInfoCard.svelte";
    import { type Release, getReleaseBadges } from "$lib/content/schema";
    import { externalIcons } from "$lib/utils/icons";
    import { env } from "$env/dynamic/public";

    const SITE_URL = env.PUBLIC_SITE_URL || "https://yumerobo.moe";

    interface Props {
        data: {
            release: Release;
        };
    }

    let { data }: Props = $props();

    // Animation constants
    const staggerBase = 80;
    const animDuration = 500;
    const animY = 15;
    const animEasing = cubicOut;

    // Tech Specs expansion state
    // Default: Collapse if title contains x264, x265, or AV1 (case insensitive)
    let expandedSpecs = $state<Set<number>>(new Set());

    $effect(() => {
        if (data.release.specs) {
            const initialSet = new Set<number>();
            const collapseKeywords = ["x264", "x265", "av1"];
            data.release.specs.forEach((spec, i) => {
                const titleLower = spec.title.toLowerCase();
                const shouldCollapse = collapseKeywords.some((kw) =>
                    titleLower.includes(kw),
                );
                if (!shouldCollapse) {
                    initialSet.add(i);
                }
            });
            expandedSpecs = initialSet;
        }
    });

    function toggleSpec(index: number) {
        const newSet = new Set(expandedSpecs);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        expandedSpecs = newSet;
    }

    // Torrent expansion state
    let expandedTorrents = $state<Set<number>>(new Set());

    function toggleTorrent(index: number) {
        const newSet = new Set(expandedTorrents);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        expandedTorrents = newSet;
    }

    // MediaInfo state - stores raw text
    let loadedMediaInfo = $state<Map<string, string>>(new Map());
    let loadingMediaInfo = $state<Set<string>>(new Set());

    async function loadMediaInfoContent(hash: string) {
        if (loadedMediaInfo.has(hash) || loadingMediaInfo.has(hash)) return;

        loadingMediaInfo = new Set(loadingMediaInfo).add(hash);

        try {
            const response = await fetch(`/mediainfo/${hash}`);
            if (response.ok) {
                const rawText = await response.text();
                loadedMediaInfo = new Map(loadedMediaInfo).set(hash, rawText);
            }
        } catch (e) {
            console.error("Failed to load MediaInfo:", e);
        } finally {
            const newLoading = new Set(loadingMediaInfo);
            newLoading.delete(hash);
            loadingMediaInfo = newLoading;
        }
    }

    // Pre-load all MediaInfo on mount (from embedded torrent.mediainfo)
    $effect(() => {
        for (const torrent of data.release.torrents) {
            for (const mi of torrent.mediainfo) {
                loadMediaInfoContent(mi.raw_hash);
            }
        }
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
    <title
        >{getLocalizedTitle(
            $locale,
            data.release.title,
            data.release.title_en,
            data.release.title_zh,
        )} | 夢みる機械</title
    >
    <meta
        name="description"
        content="{data.release.year} · {data.release.media_type === 'movie'
            ? 'Movie'
            : 'TV'}"
    />

    <!-- Open Graph -->
    <meta
        property="og:title"
        content={getLocalizedTitle(
            $locale,
            data.release.title,
            data.release.title_en,
            data.release.title_zh,
        )}
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
        content={getLocalizedTitle(
            $locale,
            data.release.title,
            data.release.title_en,
            data.release.title_zh,
        )}
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
    <!-- Back Button -->
    <nav
        class="breadcrumb"
        in:fly={{
            y: -animY,
            duration: animDuration,
            delay: 0,
            easing: animEasing,
        }}
    >
        <a href="/" class="back-link">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="m15 18-6-6 6-6" />
            </svg>
            {$t.backToReleases}
        </a>
    </nav>

    <!-- Hero Section -->
    <header class="hero">
        <!-- Poster -->
        <div class="poster-container">
            <img
                src={data.release.poster}
                alt={data.release.title}
                class="poster"
                fetchpriority="high"
                decoding="sync"
            />
            <div class="poster-overlay">
                {#each getReleaseBadges(data.release) as badge}
                    <span class="badge {badge === 'Fin' ? 'badge-fin' : ''}"
                        >{badge}</span
                    >
                {/each}
            </div>
        </div>

        <!-- Info -->
        <div
            class="info"
            in:fly={{
                x: animY,
                duration: animDuration,
                delay: staggerBase * 2,
                easing: animEasing,
            }}
        >
            <!-- Single localized title -->
            <h1 class="title">
                {getLocalizedTitle(
                    $locale,
                    data.release.title,
                    data.release.title_en,
                    data.release.title_zh,
                )}
            </h1>

            <div class="meta-row">
                {#if data.release.year}
                    <span class="meta-item">{data.release.year}</span>
                {/if}
                {#if (data.release.media_type === "tv" || data.release.media_type === "tva") && data.release.season}
                    <span class="meta-item">Season {data.release.season}</span>
                {/if}
                <span class="meta-item"
                    >{formatDateTime(
                        data.release.date,
                        "medium",
                        $locale,
                    )}</span
                >
            </div>

            <!-- Action Buttons -->
            <div class="actions">
                <!-- External Links -->
                {#if data.release.links}
                    {@const links = data.release.links}

                    {#snippet linkButton(
                        url: string,
                        label: string,
                        color: string,
                        iconKey: string,
                    )}
                        <a
                            href={url}
                            class="action-button external-link"
                            style:--link-color={color}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {#if externalIcons[iconKey]}
                                {@const icon = externalIcons[iconKey]}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox={typeof icon === "string"
                                        ? "0 0 24 24"
                                        : icon.viewBox}
                                    fill="currentColor"
                                >
                                    <path
                                        d={typeof icon === "string"
                                            ? icon
                                            : icon.d}
                                    />
                                </svg>
                            {/if}
                            {label}
                        </a>
                    {/snippet}

                    {#if links.tmdb}<div class="link-group">
                            {@render linkButton(
                                links.tmdb,
                                "TMDB",
                                "#01b4e4",
                                "tmdb",
                            )}
                        </div>{/if}
                    {#if links.imdb}<div class="link-group">
                            {@render linkButton(
                                links.imdb,
                                "IMDb",
                                "#f5c518",
                                "imdb",
                            )}
                        </div>{/if}
                    {#if links.douban}<div class="link-group">
                            {@render linkButton(
                                links.douban,
                                "Douban",
                                "#007722",
                                "douban",
                            )}
                        </div>{/if}
                    {#if links.bangumi}<div class="link-group">
                            {@render linkButton(
                                links.bangumi,
                                "Bangumi",
                                "#f09199",
                                "bangumi",
                            )}
                        </div>{/if}
                    {#if links.letterboxd}<div class="link-group">
                            {@render linkButton(
                                links.letterboxd,
                                "Letterboxd",
                                "#40bcf4",
                                "letterboxd",
                            )}
                        </div>{/if}
                    {#if links.rotten_tomatoes}<div class="link-group">
                            {@render linkButton(
                                links.rotten_tomatoes,
                                "Rotten Tomatoes",
                                "#fa320a",
                                "rotten_tomatoes",
                            )}
                        </div>{/if}
                    {#if links.anidb}<div class="link-group">
                            {@render linkButton(
                                links.anidb,
                                "AniDB",
                                "#000000",
                                "anidb",
                            )}
                        </div>{/if}
                    {#if links.anilist}<div class="link-group">
                            {@render linkButton(
                                links.anilist,
                                "AniList",
                                "#02a9ff",
                                "anilist",
                            )}
                        </div>{/if}
                    {#if links.myanimelist}<div class="link-group">
                            {@render linkButton(
                                links.myanimelist,
                                "MAL",
                                "#2e51a2",
                                "myanimelist",
                            )}
                        </div>{/if}
                    {#if links.tvdb}<div class="link-group">
                            {@render linkButton(
                                links.tvdb,
                                "TVDB",
                                "#3bb300",
                                "tvdb",
                            )}
                        </div>{/if}
                {/if}
            </div>
        </div>
    </header>

    <!-- Tech Info Section -->
    {#if data.release.specs && data.release.specs.length > 0}
        <section
            class="specs-section"
            in:fly={{
                y: animY,
                duration: animDuration,
                delay: staggerBase * 3,
                easing: animEasing,
            }}
        >
            {#each data.release.specs as spec, i}
                <div
                    class="spec-block"
                    in:fly={{
                        y: 20,
                        duration: 400,
                        delay: staggerBase * 3 + i * 50,
                        easing: cubicOut,
                    }}
                >
                    <button
                        class="spec-header"
                        onclick={() => toggleSpec(i)}
                        aria-expanded={expandedSpecs.has(i)}
                    >
                        <h2 class="spec-title">{spec.title}</h2>
                        <svg
                            class="chevron"
                            class:expanded={expandedSpecs.has(i)}
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </button>

                    {#if expandedSpecs.has(i)}
                        <div class="spec-body" transition:slide>
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

    <!-- MediaInfo Section (grouped by torrent) -->
    <section
        class="mediainfo-section"
        in:fly={{
            y: animY,
            duration: animDuration,
            delay: staggerBase * 4,
            easing: animEasing,
        }}
    >
        <h2 class="section-title">{$t.mediaInfo}</h2>
        <div class="mediainfo-list">
            {#each data.release.torrents as torrent, tIndex}
                {#each torrent.mediainfo as mi, miIndex}
                    {@const rawContent =
                        loadedMediaInfo.get(mi.raw_hash) ?? null}
                    {@const isLoading = loadingMediaInfo.has(mi.raw_hash)}
                    <div
                        class="mediainfo-wrapper"
                        in:fly={{
                            y: 20,
                            duration: 400,
                            delay:
                                staggerBase * 4 +
                                (tIndex * torrent.mediainfo.length + miIndex) *
                                    50,
                            easing: cubicOut,
                        }}
                    >
                        <MediaInfoCard
                            filename={mi.filename}
                            rawHash={mi.raw_hash}
                            {rawContent}
                            {isLoading}
                        />
                    </div>
                {/each}
            {/each}
        </div>
    </section>

    <!-- Torrents Section -->
    <section
        class="torrents-section"
        in:fly={{
            y: animY,
            duration: animDuration,
            delay: staggerBase * 5,
            easing: animEasing,
        }}
    >
        <h2 class="section-title">{$t.torrents}</h2>
        <div class="torrent-list">
            {#each data.release.torrents as torrent, index}
                <div
                    class="torrent-item"
                    in:fly={{
                        y: 20,
                        duration: 400,
                        delay: staggerBase * 5 + index * 50,
                        easing: cubicOut,
                    }}
                >
                    <button
                        class="torrent-header"
                        onclick={() => toggleTorrent(index)}
                        aria-expanded={expandedTorrents.has(index)}
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
                            class:expanded={expandedTorrents.has(index)}
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
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </button>

                    {#if expandedTorrents.has(index)}
                        <div class="torrent-files">
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
        will-change: transform, opacity;
        padding-bottom: var(--space-16);
    }

    /* Breadcrumb */
    .breadcrumb {
        margin-bottom: var(--space-2);
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: var(--space-1);
        font-size: var(--text-sm);
        color: var(--color-label-secondary);
        text-decoration: none;
        transition: color var(--duration-fast) var(--ease-out);
    }

    .back-link:hover {
        color: var(--color-accent);
    }

    /* Hero */
    .hero {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
    }

    @media (min-width: 640px) {
        .hero {
            flex-direction: row;
            align-items: flex-start;
        }
    }

    .poster-container {
        position: relative;
        flex-shrink: 0;
        width: 180px;
        aspect-ratio: 2/3;
        border-radius: var(--radius-lg);
        background: var(--color-fill);
        box-shadow: var(--shadow-lg);
        overflow: hidden;
    }

    @media (min-width: 640px) {
        .poster-container {
            width: 220px;
        }
    }

    .poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: var(--radius-lg);
    }

    /* Sheen Effect */

    .poster-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: flex-start;
        padding: var(--space-2);
        background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.6) 0%,
            transparent 50%
        );
        gap: 4px;
    }

    .badge {
        font-size: 14px;
        font-weight: 700;
        padding: 6px 12px;
        background: var(--color-accent);
        color: white;
        border-radius: var(--radius-sm);
        line-height: 1;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        will-change: transform;
    }

    .badge:hover {
        transform: scale(1.05);
    }

    .badge-fin {
        background: var(--color-success, #10b981);
    }

    .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }

    .title {
        font-size: var(--text-2xl);
        font-weight: 700;
        letter-spacing: var(--tracking-tight);
        color: var(--color-label);
        margin: 0;
    }

    @media (min-width: 640px) {
        .title {
            font-size: var(--text-3xl);
        }
    }

    .meta-row {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-3);
    }

    .meta-item {
        font-size: var(--text-sm);
        color: var(--color-label-secondary);
    }

    .meta-item:not(:last-child)::after {
        content: "•";
        margin-left: var(--space-3);
        color: var(--color-label-tertiary);
    }

    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
        margin-top: var(--space-2);
    }

    .action-button {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-4);
        font-size: var(--text-sm);
        font-weight: 500;
        text-decoration: none;
        border-radius: var(--radius-md);
        transition: all var(--duration-fast) var(--ease-out);
    }

    .external-link {
        color: var(--color-label-secondary);
        background: var(--color-fill);
        font-weight: 600;
        letter-spacing: 0.02em;
        border: 1px solid transparent;
    }

    .external-link:hover {
        color: white;
        background: var(--link-color, var(--color-accent));
        border-color: var(--link-color, var(--color-accent));
    }

    /* Sections */
    .section-title {
        font-size: var(--text-lg);
        font-weight: 600;
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
        transition: background var(--duration-fast) var(--ease-out);
    }

    .spec-header:hover {
        background: var(--color-fill);
    }

    .spec-title {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--color-label);
        margin: 0;
        /* text-transform: uppercase; removed to preserve original case */
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

    /* Use global styles for spec links to ensure they work even with @html */
    :global(.spec-link) {
        color: var(--color-accent);
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 2px;
    }

    :global(.spec-link:hover) {
        color: var(--color-accent-hover);
        text-decoration: none;
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
        transition: background var(--duration-fast) var(--ease-out);
    }

    .torrent-header:hover {
        background: var(--color-fill);
    }

    .torrent-header:active {
        transform: scale(0.99);
    }

    .torrent-name {
        flex: 1;
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--color-label);
        word-break: break-all;
    }

    .file-count {
        font-size: var(--text-xs);
        color: var(--color-label-tertiary);
        white-space: nowrap;
    }

    .chevron {
        flex-shrink: 0;
        color: var(--color-label-tertiary);
        transition: transform var(--duration-fast) var(--ease-out);
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
        color: var(--color-label-tertiary);
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
        color: var(--color-label-tertiary);
        white-space: pre-wrap;
    }

    /* MediaInfo */
    .mediainfo-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }
</style>
