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
        void openViewer();
        return () => {
            leaving = true;
            viewerHandle?.close();
            viewerHandle = null;
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
    style:min-height={routeMinHeight}
>
    <div class="comparisons-content">
        <h1 id="comparisons-title">{socialTitle}</h1>
        <p class="nodes">{data.comparison.summary.nodes.join(" vs ")}</p>
        <p class="metrics">
            {data.comparison.summary.comparisonCount}
            {data.comparison.summary.comparisonCount === 1 ? "comparison" : "comparisons"}
            {#if data.comparison.summary.maxResolution}
                <span aria-hidden="true">·</span>
                {data.comparison.summary.maxResolution}
            {/if}
        </p>
        {#if errorMessage}
            <p class="error" role="alert">{errorMessage}</p>
            <button class="retry liquid-control" type="button" onclick={openViewer}>Try Again</button>
        {:else if loading}
            <p class="status" role="status">Opening comparisons…</p>
        {/if}
    </div>
</section>

<style>
    .comparisons-page {
        display: grid;
        min-height: min(62vh, 560px);
        place-items: center;
    }

    .comparisons-content {
        max-width: 760px;
        text-align: center;
    }

    h1 {
        margin: 0;
        color: var(--color-label);
        font-family: var(--font-display);
        font-size: var(--text-3xl);
        line-height: var(--leading-tight);
        letter-spacing: 0;
    }

    .nodes {
        margin: var(--space-4) 0 0;
        color: var(--color-label);
        font-size: var(--text-lg);
    }

    .metrics,
    .status,
    .error {
        margin: var(--space-2) 0 0;
        color: var(--color-label-secondary);
    }

    .metrics span {
        margin: 0 var(--space-2);
    }

    .retry {
        min-height: 42px;
        margin-top: var(--space-4);
        padding: var(--space-2) var(--space-4);
        color: var(--color-label);
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        border-radius: 999px;
    }

    @media (max-width: 639px) {
        h1 {
            font-size: var(--text-2xl);
        }

        .nodes {
            font-size: var(--text-base);
        }
    }
</style>
