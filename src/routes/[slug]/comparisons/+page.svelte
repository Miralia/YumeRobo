<script lang="ts">
    import { beforeNavigate, goto } from "$app/navigation";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import SocialMeta from "$lib/components/SocialMeta.svelte";
    import { getComparisonSocialDescription } from "$lib/content/comparison-summary";
    import { YACOMP_WEB_ASSET_URL } from "$lib/config/yacomp-web";
    import type { PageProps } from "./$types";

    interface ComparisonCollection {
        comparisons: Array<{
            images: Array<{
                name: string;
                publicFileName: string;
                width?: number | null;
                height?: number | null;
            }>;
        }>;
        [key: string]: unknown;
    }

    interface ComparisonSidecar {
        schemaVersion: number;
        collection: ComparisonCollection;
    }

    interface ViewerHandle {
        close(): void;
    }

    interface YacompWebModule {
        openSlowPicsCollection(
            collection: ComparisonCollection,
            options?: { onClose?: () => void },
        ): ViewerHandle;
    }

    let { data }: PageProps = $props();
    let viewerHandle: ViewerHandle | null = null;
    let loading = $state(true);
    let errorMessage = $state("");
    let leaving = false;
    let overlayElement: HTMLElement | null = null;
    let navigationStarted = false;

    // Lets `closeToDetail` tell a real history traversal from a `history.back()`
    // that silently did nothing.
    beforeNavigate(() => {
        navigationStarted = true;
    });

    const detailPath = $derived(`/${data.release.slug}`);
    const socialTitle = $derived(
        `${data.release.title}${data.release.year ? ` (${data.release.year})` : ""}`,
    );
    const socialDescription = $derived(
        getComparisonSocialDescription(data.comparison.summary),
    );
    const returnScrollY = $derived(
        Number.isFinite(page.state.comparisonsReturnScrollY)
            ? Math.max(0, page.state.comparisonsReturnScrollY ?? 0)
            : 0,
    );
    const routeMinHeight = $derived(
        returnScrollY > 0 ? `calc(100dvh + ${returnScrollY}px)` : undefined,
    );

    /**
     * The overlay is nested inside <main>, so no single ancestor can be made
     * inert without disabling the overlay too. Hide the persistent layout
     * chrome instead: it is what would otherwise stay tabbable behind the
     * full-screen viewer.
     */
    const BACKGROUND_SELECTOR =
        ".app-shell > .skip-link, .app-shell > header, .app-shell > footer";

    function setBackgroundInert(inert: boolean) {
        for (const element of document.querySelectorAll<HTMLElement>(
            BACKGROUND_SELECTOR,
        )) {
            element.inert = inert;
            if (inert) {
                element.setAttribute("aria-hidden", "true");
            } else {
                element.removeAttribute("aria-hidden");
            }
        }
    }

    /**
     * iOS Safari ignores `overflow: hidden` on the body scroller, so the body
     * is pinned out of flow instead. The returned callback restores the
     * previous inline styles and the scroll offset.
     */
    function lockBodyScroll(): () => void {
        const scrollY = window.scrollY;
        const { style } = document.body;
        const previous = {
            position: style.position,
            top: style.top,
            left: style.left,
            right: style.right,
            width: style.width,
            overflow: style.overflow,
        };

        style.position = "fixed";
        style.top = `-${scrollY}px`;
        style.left = "0";
        style.right = "0";
        style.width = "100%";
        style.overflow = "hidden";

        return () => {
            style.position = previous.position;
            style.top = previous.top;
            style.left = previous.left;
            style.right = previous.right;
            style.width = previous.width;
            style.overflow = previous.overflow;
            window.scrollTo(0, scrollY);
        };
    }

    async function closeToDetail() {
        if (leaving) return;
        leaving = true;

        if (page.state.openedComparisonsFromDetail) {
            navigationStarted = false;
            history.back();
            // `history.back()` does nothing when this entry is the first in the
            // session (a reloaded comparisons URL keeps the state), so fall
            // back to an explicit navigation instead of leaving the close
            // affordances stuck in their disabled state.
            await new Promise((resolve) => setTimeout(resolve, 300));
            if (navigationStarted) return;
            leaving = false;
        }

        try {
            await goto(detailPath, { replaceState: true });
        } catch (error) {
            leaving = false;
            console.error("Failed to return to the release page:", error);
        }
    }

    async function openViewer() {
        if (viewerHandle) return;
        loading = true;
        errorMessage = "";
        try {
            const [viewer, response] = await Promise.all([
                import(/* @vite-ignore */ YACOMP_WEB_ASSET_URL) as Promise<YacompWebModule>,
                fetch(data.comparison.assetUrl),
            ]);
            if (!response.ok) throw new Error(`Comparison metadata returned ${response.status}`);
            const sidecar = await response.json() as ComparisonSidecar;
            if (sidecar.schemaVersion !== 1 || !Array.isArray(sidecar.collection?.comparisons)) {
                throw new Error("Comparison metadata is invalid");
            }
            if (leaving) return;
            viewerHandle = viewer.openSlowPicsCollection(sidecar.collection, {
                onClose: () => {
                    viewerHandle = null;
                    void closeToDetail();
                },
            });
        } catch (error) {
            console.error("Failed to open comparison viewer:", error);
            errorMessage = "Comparison viewer could not be opened.";
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        const previouslyFocused =
            document.activeElement instanceof HTMLElement &&
            document.activeElement !== document.body
                ? document.activeElement
                : null;

        const unlockBodyScroll = lockBodyScroll();
        setBackgroundInert(true);
        // Move focus into the overlay so the tab order never starts on the
        // hidden page behind it.
        overlayElement?.focus();

        void openViewer();

        return () => {
            leaving = true;
            viewerHandle?.close();
            viewerHandle = null;
            setBackgroundInert(false);
            unlockBodyScroll();
            if (previouslyFocused?.isConnected) previouslyFocused.focus();
        };
    });
</script>

<SocialMeta
    title="{socialTitle} Comparisons | 夢みる機械"
    {socialTitle}
    description={socialDescription}
    pathname="/{data.release.slug}/comparisons"
/>

<section
    class="comparisons-page container"
    aria-labelledby="comparisons-title"
    aria-busy={loading}
    style:min-height={routeMinHeight}
>
    <h1 id="comparisons-title" class="visually-hidden">{socialTitle} Comparisons</h1>
    <div
        class="viewer-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Comparison viewer"
        tabindex="-1"
        bind:this={overlayElement}
    >
        {#if errorMessage}
            <div class="viewer-error" role="alert">
                <p>Comparison viewer could not be opened.</p>
                <button class="retry liquid-control" type="button" onclick={openViewer}>Try Again</button>
            </div>
        {:else if loading}
            <div class="loading-indicator" role="status">
                <span class="loading-spinner" aria-hidden="true"></span>
                <span class="visually-hidden">Opening comparisons</span>
            </div>
        {/if}
    </div>
</section>

<style>
    .comparisons-page {
        min-height: min(62vh, 560px);
    }

    .viewer-overlay {
        position: fixed;
        z-index: 1100;
        inset: 0;
        display: grid;
        place-items: center;
        background: #000;
    }

    /* Programmatic focus target for the dialog, not a control. */
    .viewer-overlay:focus {
        outline: none;
    }

    .loading-indicator {
        display: grid;
        place-items: center;
    }

    .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgb(255 255 255 / 15%);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 700ms linear infinite;
    }

    .viewer-error {
        color: rgb(255 255 255 / 88%);
        text-align: center;
    }

    .viewer-error p {
        margin: 0;
    }

    .retry {
        min-height: 42px;
        margin-top: var(--space-4);
        padding: var(--space-2) var(--space-4);
        color: #fff;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid rgb(255 255 255 / 18%);
        background: rgb(12 12 12 / 82%);
        border-radius: 999px;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .loading-spinner {
            animation: none;
        }
    }
</style>
