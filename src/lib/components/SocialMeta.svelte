<script lang="ts">
    import { env } from "$env/dynamic/public";

    interface SocialImage {
        path: string;
        alt: string;
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

    const siteUrl = (env.PUBLIC_SITE_URL || "https://yumerobo.moe").replace(/\/$/, "");
    let canonicalUrl = $derived(new URL(pathname, `${siteUrl}/`).href);
    let imageUrl = $derived(image ? new URL(image.path, `${siteUrl}/`).href : null);
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
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content={String(image.width ?? 1200)} />
        <meta property="og:image:height" content={String(image.height ?? 630)} />
        <meta property="og:image:alt" content={image.alt} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content={image.alt} />
    {/if}
</svelte:head>
