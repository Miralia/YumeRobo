
import { getAllReleases } from '$lib/content/loader';
import { env } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async ({ url }) => {
    const releases = getAllReleases();
    // Prefer environment variable, fallback to origin (dev) or default
    const siteUrl = env.PUBLIC_SITE_URL || url.origin || 'https://yumerobo.moe';

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>YumeRobo Releases</title>
        <description>Latest media releases from YumeRobo</description>
        <link>${siteUrl}</link>
        <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
        <language>en-us</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${releases
            .map((release) => {
                return `
        <item>
            <title><![CDATA[${release.title}]]></title>
            <link>${siteUrl}/${release.slug}</link>
            <guid isPermaLink="true">${siteUrl}/${release.slug}</guid>
            <pubDate>${new Date(release.date).toUTCString()}</pubDate>
            <category>${release.media_type}</category>
            <description><![CDATA[
                <img src="${siteUrl}${release.poster}" alt="${release.title}" style="max-width: 200px; display: block; margin-bottom: 10px;" />
                <p><strong>${release.title}</strong> (${release.year})</p>
                <p>Type: ${release.media_type}</p>
                
                <h3>Releases</h3>
                <ul>
                    ${release.torrents.map(t => `<li>${t.name}</li>`).join('')}
                </ul>
            ]]></description>
        </item>`;
            })
            .join('')}
    </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'max-age=0, s-maxage=3600',
        },
    });
};
