<script lang="ts">
    import { spring } from "svelte/motion";
    import { type Release, getReleaseBadges } from "$lib/content/schema";
    import { formatDateTime } from "$lib/utils/date";
    import { springPresets, stagger } from "$lib/utils/animation";
    import { getPosterLoadingAttributes } from "$lib/utils/poster-loading";

    interface Props {
        /** The release data to display */
        release: Release;
        /** Index for staggered animation delay */
        index?: number;
        /** Whether to play the entrance animation */
        animate?: boolean;
    }

    let { release, index = 0, animate = true }: Props = $props();

    // Hover animation
    const scale = spring(1, springPresets.snappy);

    function handleHover(hovering: boolean) {
        scale.set(hovering ? 1.02 : 1);
    }

    function getTorrentNames(): string[] {
        return release.torrents.map((t) => t.name);
    }

    function getCardPosterPath(posterPath: string): string {
        return posterPath.replace(/\.avif$/i, ".card.avif");
    }

    // Stagger delay for CSS animation
    let animDelay = $derived(`${stagger(index)}ms`);
    let posterLoading = $derived(getPosterLoadingAttributes(index));
</script>

<div class:animate-fade-up={animate} style:animation-delay={animDelay}>
    <a
        href="/{release.slug}"
        class="release-card"
        style:transform="scale({$scale})"
        onmouseenter={() => handleHover(true)}
        onmouseleave={() => handleHover(false)}
    >
        <!-- Poster -->
        <div
            class="poster-container"
            style:view-transition-name="poster-{release.slug}"
        >
            <img
                src={getCardPosterPath(release.poster)}
                srcset={`${getCardPosterPath(release.poster)} 200w, ${release.poster} 500w`}
                sizes="(min-width: 640px) 100px, 80px"
                alt={release.title}
                class="poster"
                width="200"
                height="300"
                loading={posterLoading.loading}
                fetchpriority={posterLoading.fetchpriority}
                decoding="async"
            />
            <div class="poster-overlay"></div>
        </div>

        <!-- Info -->
        <div class="info">
            <h2 class="title" style:view-transition-name="title-{release.slug}">
                {release.title}
            </h2>

            <!-- Torrent release names -->
            <div class="release-names">
                {#each getTorrentNames() as name}
                    <p class="release-name">{name}</p>
                {/each}
            </div>

            <!-- Footer: Badges (left) and Date (right) -->
            <div class="card-footer">
                <div class="badges">
                    {#each getReleaseBadges(release) as badge}
                        <span class="badge {badge === 'Fin' ? 'badge-fin' : ''}"
                            >{badge}</span
                        >
                    {/each}
                </div>
                <time class="date" datetime={release.date}>
                    {formatDateTime(release.date, "medium")}
                </time>
            </div>
        </div>
    </a>
</div>

<style>
    .animate-fade-up {
        display: block;
    }

    .release-card {
        display: flex;
        gap: var(--space-4);
        padding: var(--space-3);
        background: var(--color-background-secondary);
        border: 1px solid color-mix(
            in srgb,
            var(--color-label) 8%,
            transparent
        );
        border-radius: var(--radius-lg);
        text-decoration: none;
        color: inherit;
        transition:
            transform var(--duration-fast) var(--ease-spring),
            border-color var(--duration-fast) var(--ease-out),
            box-shadow var(--duration-normal) var(--ease-out),
            background var(--duration-fast) var(--ease-out);
    }

    .release-card:hover {
        background: var(--color-background-tertiary);
        border-color: color-mix(
            in srgb,
            var(--color-label) 12%,
            transparent
        );
        box-shadow: var(--shadow-md);
    }

    .poster-container {
        position: relative;
        flex-shrink: 0;
        width: 80px;
        aspect-ratio: 2/3;
        border-radius: var(--radius-md);
        overflow: hidden;
        background: var(--color-fill);
    }

    @media (min-width: 640px) {
        .poster-container {
            width: 100px;
        }
    }

    .poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    /* Gradient overlay */
    .poster-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.4) 0%,
            transparent 30%
        );
    }

    .info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .title {
        font-family: var(--font-display);
        font-size: var(--text-base);
        font-weight: 700;
        line-height: var(--leading-tight);
        letter-spacing: var(--tracking-tight);
        color: var(--color-label);
        margin: 0;
    }

    @media (min-width: 640px) {
        .title {
            font-size: var(--text-lg);
        }
    }

    .release-names {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-bottom: var(--space-2);
    }

    .release-name {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: color-mix(
            in srgb,
            var(--color-label) 64%,
            var(--color-background-secondary)
        );
        line-height: var(--leading-normal);
        word-break: break-all;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .card-footer {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: var(--space-2);
        margin-top: auto;
    }

    .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .badge {
        font-family: var(--font-sans);
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        background: var(--color-accent);
        color: white;
        border-radius: var(--radius-sm);
        line-height: 1;
        letter-spacing: 0.02em;
    }

    .badge-fin {
        background: var(--color-success, #10b981);
    }

    .date {
        font-family: var(--font-sans);
        font-size: var(--text-sm);
        color: color-mix(
            in srgb,
            var(--color-label) 68%,
            var(--color-background-secondary)
        );
        line-height: 1.35;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }
</style>
