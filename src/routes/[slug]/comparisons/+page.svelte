<script lang="ts">
    import { goto } from "$app/navigation";
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
        returnScrollY > 0 ? `calc(100vh + ${returnScrollY}px)` : undefined,
    );

    async function closeToDetail() {
        if (leaving) return;
        leaving = true;
        if (page.state.openedComparisonsFromDetail) {
            history.back();
            return;
        }
        await goto(detailPath, { replaceState: true });
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
        const previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        void openViewer();
        return () => {
            leaving = true;
            viewerHandle?.close();
            viewerHandle = null;
            document.body.style.overflow = previousBodyOverflow;
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
    <div class="viewer-overlay">
        {#if errorMessage}
            <div class="viewer-error" role="alert">
                <p>Comparison viewer could not be opened.</p>
                <button class="retry liquid-control" type="button" onclick={openViewer}>Try Again</button>
            </div>
        {:else if loading}
            <div class="loading-indicator" role="status" aria-label="Opening comparisons">
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
