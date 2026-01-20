<script lang="ts">
    import { spring } from "svelte/motion";
    import { type Release, getReleaseBadges } from "$lib/content/schema";
    import { formatDateTime } from "$lib/utils/date";
    import { locale, getLocalizedTitle } from "$lib/stores/locale";
    import { springPresets, stagger } from "$lib/utils/animation";

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

    // Stagger delay for CSS animation
    const animDelay = `${stagger(index)}ms`;
</script>

<a
    href="/{release.slug}"
    class="release-card"
    class:animate-fade-up={animate}
    style:animation-delay={animDelay}
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
            src={release.poster}
            alt={release.title}
            class="poster"
            loading="lazy"
        />
        <div class="poster-overlay"></div>
    </div>

    <!-- Info -->
    <div class="info">
        <!-- Localized title (switches based on locale) -->
        <h2 class="title" style:view-transition-name="title-{release.slug}">
            {getLocalizedTitle(
                $locale,
                release.title,
                release.title_en,
                release.title_zh,
            )}
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
                {formatDateTime(release.date, "medium", $locale)}
            </time>
        </div>
    </div>
</a>

<style>
    .release-card {
        display: flex;
        gap: var(--space-4);
        padding: var(--space-3);
        background: var(--color-background-secondary);
        border-radius: var(--radius-lg);
        text-decoration: none;
        color: inherit;
        transition:
            transform var(--duration-fast) var(--ease-spring),
            box-shadow var(--duration-normal) var(--ease-out),
            background var(--duration-fast) var(--ease-out);
    }

    .release-card:hover {
        background: var(--color-background-tertiary);
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
        font-size: var(--text-base);
        font-weight: 600;
        line-height: var(--leading-tight);
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
        color: var(--color-label-secondary);
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
        font-size: var(--text-xs);
        color: var(--color-label-tertiary);
        white-space: nowrap;
    }
</style>
