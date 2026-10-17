<script lang="ts">
    import { env } from "$env/dynamic/public";

    interface SocialImage {
        path: string;
        alt: string;
        /**
         * Declared pixel dimensions of the asset. Optional: Open Graph's
         * recommended 1.91:1 preview size is assumed when omitted, so a
         * caller that knows the real asset size should always pass it.
         */
        width?: number;
        height?: number;
    }

    interface Props {
        title: string;
        socialTitle?: string;
        description: string;
        pathname: string;
        image?: SocialImage;
    }

    let {
        title,
        socialTitle = title,
        description,
        pathname,
        image,
    }: Props = $props();

    /** Open Graph's recommended preview size, used when the caller does not
     *  declare the real asset dimensions. */
    const DEFAULT_OG_IMAGE_WIDTH = 1200;
    const DEFAULT_OG_IMAGE_HEIGHT = 630;

    /** Media types for the image formats the site can publish. */
    const IMAGE_MEDIA_TYPES: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        avif: "image/avif",
        gif: "image/gif",
        svg: "image/svg+xml",
    };

    /**
     * Derive `og:image:type` from the asset extension. An unknown extension
     * returns null so the tag is omitted rather than declaring a lie.
     */
    function getImageMediaType(path: string): string | null {
        const extension = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(path)?.[1];
        if (!extension) return null;
        return IMAGE_MEDIA_TYPES[extension.toLowerCase()] ?? null;
    }

    const siteUrl = (env.PUBLIC_SITE_URL || "https://yumerobo.moe").replace(/\/$/, "");

    /**
     * Resolve a path against the configured site URL. A malformed
     * `PUBLIC_SITE_URL` must not throw during render, so the relative path
     * is kept as the fallback.
     */
    function toAbsoluteUrl(path: string): string {
        try {
            return new URL(path, `${siteUrl}/`).href;
        } catch {
            return path;
        }
    }

    let canonicalUrl = $derived(toAbsoluteUrl(pathname));
    let imageUrl = $derived(image ? toAbsoluteUrl(image.path) : null);
    let imageMediaType = $derived(image ? getImageMediaType(image.path) : null);
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalUrl} />

    <meta property="og:title" content={socialTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="夢みる機械" />
    <meta property="og:url" content={canonicalUrl} />

    <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
    <meta name="twitter:title" content={socialTitle} />
    <meta name="twitter:description" content={description} />

    {#if image && imageUrl}
        <meta property="og:image" content={imageUrl} />
        {#if imageMediaType}
            <meta property="og:image:type" content={imageMediaType} />
        {/if}
        <meta
            property="og:image:width"
            content={String(image.width ?? DEFAULT_OG_IMAGE_WIDTH)}
        />
        <meta
            property="og:image:height"
            content={String(image.height ?? DEFAULT_OG_IMAGE_HEIGHT)}
        />
        <meta property="og:image:alt" content={image.alt} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content={image.alt} />
    {/if}
</svelte:head>
