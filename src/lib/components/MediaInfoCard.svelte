<script lang="ts">
    import { slide } from "svelte/transition";
    import { slideParams } from "$lib/utils/animation";
    import {
        parseMediaInfo,
        toStructured,
        type MediaInfoParsed,
        type MediaInfoStructured,
    } from "$lib/utils/mediainfo-parser";
    import {
        getLanguageFlag,
        getUniqueLanguageFlags,
    } from "$lib/utils/language-flags";

    interface Props {
        filename: string;
        rawHash: string;
        rawContent: string | null;
        /** True when fetching the raw MediaInfo definitively failed */
        hasFailed?: boolean;
        /** Invoked when the user expands the raw view before content arrived */
        onexpand?: () => void;
    }

    let {
        filename,
        rawHash,
        rawContent,
        hasFailed = false,
        onexpand,
    }: Props = $props();

    // Toggle state: false = show structured view, true = show raw MediaInfo
    let showRaw = $state(false);

    // Parse MediaInfo when content is available
    let parsed = $derived<MediaInfoParsed | null>(
        rawContent ? parseMediaInfo(rawContent) : null,
    );

    let structured = $derived<MediaInfoStructured | null>(
        parsed ? toStructured(parsed) : null,
    );

    // Get general info
    let general = $derived(structured?.general);
    let video = $derived(structured?.video?.[0]);
    let audios = $derived(structured?.audio ?? []);
    let texts = $derived(structured?.text ?? []);

    // Get unique subtitle languages with flags
    let subtitleFlags = $derived(
        getUniqueLanguageFlags(
            texts.map((t) => t.language ?? "").filter(Boolean),
        ),
    );

    // Get encoding settings from parsed data
    let encodingSettings = $derived.by(() => {
        if (!parsed?.["Video"]?.[0]) return null;
        const data = parsed["Video"][0].data;
        const settings = data["Encoding settings"];
        if (!settings) return null;
        return Array.isArray(settings) ? settings[0] : settings;
    });

    // Format bitrate nicely
    function formatBitrate(bitrate?: string): string {
        if (!bitrate) return "";
        return bitrate.replace(/\s+/g, "");
    }

    // Get resolution string
    function getResolution(): string {
        if (!video?.width || !video?.height) return "";
        const w = video.width.replace(/[^\d]/g, "");
        const h = video.height.replace(/[^\d]/g, "");
        return `${w} × ${h}`;
    }

    // Get audio format display
    function getAudioFormat(audio: (typeof audios)[0]): string {
        let parts: string[] = [];

        if (audio.commercial_name) {
            parts.push(audio.commercial_name);
        } else if (audio.format) {
            parts.push(audio.format);
        }

        if (audio.channels) {
            const ch = audio.channels.replace(/[^\d.]/g, "");
            const num = parseInt(ch);
            let chStr = ch;
            if (num === 6) chStr = "5.1ch";
            else if (num === 8) chStr = "7.1ch";
            else if (num === 2) chStr = "2.0ch";
            else if (num === 1) chStr = "1.0ch";
            else chStr = `${num}ch`;
            parts.push(chStr);
        }

        if (audio.bit_rate) {
            parts.push(formatBitrate(audio.bit_rate));
        }

        return parts.join(" / ");
    }

    function toggleView() {
        showRaw = !showRaw;
        if (showRaw && !rawContent) {
            onexpand?.();
        }
    }
</script>

<div class="mediainfo-card">
    <!-- Header: toggle button and raw link are siblings (a link may not
         live inside a button) -->
    <div class="card-header">
        <h3 class="card-heading">
            <button
                class="card-toggle"
                onclick={toggleView}
                aria-expanded={showRaw}
                aria-controls="mediainfo-panel-{rawHash}"
            >
                <span class="filename">{filename}</span>
                <span class="header-actions">
                    <span class="toggle-hint" aria-hidden="true"
                        >{showRaw ? "Hide" : "Expand"}</span
                    >
                    <svg
                        class="chevron"
                        class:expanded={showRaw}
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
                </span>
            </button>
        </h3>
        <a
            href="/mediainfo/{rawHash}"
            class="raw-link"
            target="_blank"
            rel="noopener"
            aria-label="Open raw MediaInfo in new tab"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path
                    d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" x2="21" y1="14" y2="3" />
            </svg>
        </a>
    </div>

    <div id="mediainfo-panel-{rawHash}">
        {#if showRaw && rawContent}
            <!-- Raw MediaInfo view -->
            <div class="raw-view" transition:slide={slideParams()}>
                <pre class="raw-content">{rawContent}</pre>
            </div>
        {:else if structured}
            <!-- Structured view (columns) -->
            <div class="card-body">
                <div class="columns">
                    <!-- General -->
                    <div class="column">
                        <h4 class="column-title">GENERAL</h4>
                        <dl class="info-list">
                            {#if general?.format}
                                <div class="info-row">
                                    <dt>Format</dt>
                                    <dd>{general.format}</dd>
                                </div>
                            {/if}
                            {#if general?.duration}
                                <div class="info-row">
                                    <dt>Duration</dt>
                                    <dd>{general.duration}</dd>
                                </div>
                            {/if}
                            {#if general?.bit_rate}
                                <div class="info-row">
                                    <dt>Bitrate</dt>
                                    <dd>{formatBitrate(general.bit_rate)}</dd>
                                </div>
                            {/if}
                            {#if general?.file_size}
                                <div class="info-row">
                                    <dt>Size</dt>
                                    <dd>{general.file_size}</dd>
                                </div>
                            {/if}
                        </dl>
                    </div>

                    <!-- Video -->
                    <div class="column">
                        <h4 class="column-title">VIDEO</h4>
                        <dl class="info-list">
                            {#if video?.format}
                                <div class="info-row">
                                    <dt>Format</dt>
                                    <dd>
                                        {video.format}
                                        {video.bit_depth
                                            ? `(${video.bit_depth})`
                                            : ""}
                                    </dd>
                                </div>
                            {/if}
                            {#if getResolution()}
                                <div class="info-row">
                                    <dt>Resolution</dt>
                                    <dd>{getResolution()}</dd>
                                </div>
                            {/if}
                            {#if video?.frame_rate}
                                <div class="info-row">
                                    <dt>Frame rate</dt>
                                    <dd>{video.frame_rate}</dd>
                                </div>
                            {/if}
                            {#if video?.bit_rate}
                                <div class="info-row">
                                    <dt>Bit rate</dt>
                                    <dd>{formatBitrate(video.bit_rate)}</dd>
                                </div>
                            {/if}
                        </dl>
                    </div>

                    <!-- Audio -->
                    <div class="column audio-column">
                        <h4 class="column-title">AUDIO</h4>
                        <div class="audio-list">
                            {#each audios as audio, i}
                                <div class="audio-item">
                                    <span class="audio-index" aria-hidden="true"
                                        >{i + 1}.</span
                                    >
                                    {#if audio.language}
                                        <span
                                            class="audio-flag"
                                            role="img"
                                            aria-label={audio.language}
                                            >{getLanguageFlag(
                                                audio.language,
                                            )}</span
                                        >
                                    {:else}
                                        <span class="audio-flag" aria-hidden="true"
                                            >{getLanguageFlag("")}</span
                                        >
                                    {/if}
                                    <span class="audio-info"
                                        >{getAudioFormat(audio)}</span
                                    >
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>

                <!-- Subtitles (flags only, deduplicated) -->
                {#if subtitleFlags.length > 0}
                    <div class="subtitles-section">
                        <h4 class="section-title">SUBTITLES</h4>
                        <div class="flag-list">
                            {#each subtitleFlags as { flag, language }}
                                <span
                                    class="flag"
                                    role="img"
                                    aria-label="{language} subtitles"
                                    title={language}>{flag}</span
                                >
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Encode Settings -->
                {#if encodingSettings}
                    <div class="encode-section">
                        <h4 class="section-title">ENCODE SETTINGS</h4>
                        <pre class="encode-settings">{encodingSettings}</pre>
                    </div>
                {/if}
            </div>
        {:else if hasFailed}
            <div class="loading">No MediaInfo available</div>
        {:else}
            <!-- Prerendered + loading state: skeleton mirrors the
                 structured layout to avoid a jump when content lands -->
            <div class="card-body skeleton-body" aria-hidden="true">
                <div class="columns">
                    {#each [0, 1, 2] as column (column)}
                        <div class="column">
                            <div class="skeleton skeleton-title"></div>
                            <div class="skeleton skeleton-row"></div>
                            <div class="skeleton skeleton-row"></div>
                            <div class="skeleton skeleton-row short"></div>
                        </div>
                    {/each}
                </div>
            </div>
            <p class="visually-hidden">Loading MediaInfo</p>
        {/if}
    </div>
</div>

<style>
    .mediainfo-card {
        background: var(--color-background-secondary);
        border-radius: var(--radius-md);
        overflow: hidden;
    }

    .card-header {
        display: flex;
        align-items: stretch;
        background: var(--color-background-tertiary);
        border-bottom: 1px solid var(--color-separator);
    }

    .card-heading {
        flex: 1;
        min-width: 0;
        margin: 0;
        font-size: inherit;
        font-weight: inherit;
        display: flex;
    }

    .card-toggle {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        background: transparent;
        border: none;
        cursor: pointer;
        text-align: left;
        transition: background var(--duration-fast) var(--ease-out);
    }

    .card-toggle:hover {
        background: var(--color-fill);
    }

    .card-toggle:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: -2px;
    }

    .filename {
        flex: 1;
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        font-weight: 500;
        /* Accent variant tuned for the tertiary header surface */
        color: var(--color-accent-on-tertiary);
        word-break: break-all;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        flex-shrink: 0;
    }

    .toggle-hint {
        font-family: var(--font-sans);
        font-size: var(--text-xs);
        color: var(--color-label-secondary);
    }

    .chevron {
        /* State-bearing graphic: needs ≥3:1, tertiary is decorative-only */
        color: var(--color-label-secondary);
        transition: transform var(--duration-normal) var(--ease-spring);
    }

    .chevron.expanded {
        transform: rotate(180deg);
    }

    .raw-link {
        display: flex;
        align-items: center;
        justify-content: center;
        align-self: center;
        width: 28px;
        height: 28px;
        margin-right: var(--space-3);
        color: var(--color-label-secondary);
        border-radius: var(--radius-sm);
        transition:
            background-color var(--duration-fast) var(--ease-out),
            color var(--duration-fast) var(--ease-out);
    }

    .raw-link:hover {
        background: var(--color-fill-secondary);
        color: var(--color-accent);
    }

    .card-body {
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .raw-view {
        padding: var(--space-4);
    }

    .raw-content {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        line-height: var(--leading-relaxed);
        color: var(--color-label-secondary);
        background: var(--color-background-tertiary);
        padding: var(--space-4);
        border-radius: var(--radius-md);
        overflow-x: auto;
        white-space: pre;
        margin: 0;
        max-height: 500px;
        overflow-y: auto;
    }

    .loading {
        font-family: var(--font-sans);
        padding: var(--space-4);
        font-size: var(--text-sm);
        color: var(--color-label-secondary);
    }

    /* Skeleton */
    /* Approximates the typical structured view height (three columns
       plus subtitles row) to keep the content swap from shifting layout */
    .skeleton-body {
        min-height: 150px;
    }

    .skeleton-title {
        width: 40%;
        height: 12px;
        margin-bottom: var(--space-2);
    }

    .skeleton-row {
        width: 90%;
        height: 10px;
        margin-bottom: var(--space-1);
    }

    .skeleton-row.short {
        width: 60%;
    }

    /* Columns */
    .columns {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: var(--space-6);
    }

    .column-title {
        font-family: var(--font-sans);
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--color-label-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0 0 var(--space-2) 0;
    }

    .info-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .info-row {
        display: flex;
        gap: var(--space-2);
        font-size: var(--text-xs);
    }

    .info-row dt {
        font-family: var(--font-sans);
        color: var(--color-label-secondary);
        min-width: 70px;
        flex-shrink: 0;
    }

    .info-row dd {
        color: var(--color-label);
        margin: 0;
        font-family: var(--font-mono);
    }

    /* Audio */
    .audio-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .audio-item {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-xs);
    }

    .audio-index {
        font-family: var(--font-sans);
        color: var(--color-label-secondary);
        min-width: 16px;
    }

    .audio-flag {
        font-size: var(--text-sm);
    }

    .audio-info {
        font-family: var(--font-mono);
        color: var(--color-label);
    }

    /* Subtitles */
    .subtitles-section {
        border-top: 1px solid var(--color-separator);
        padding-top: var(--space-3);
    }

    .section-title {
        font-family: var(--font-sans);
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--color-label-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0 0 var(--space-2) 0;
    }

    .flag-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
    }

    .flag {
        font-size: var(--text-lg);
        cursor: default;
    }

    /* Encode Settings */
    .encode-section {
        border-top: 1px solid var(--color-separator);
        padding-top: var(--space-3);
    }

    .encode-settings {
        font-family: var(--font-mono);
        font-size: 10px;
        line-height: 1.6;
        color: var(--color-label-secondary);
        background: var(--color-background-tertiary);
        padding: var(--space-3);
        border-radius: var(--radius-sm);
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
        margin: 0;
        font-variant-numeric: tabular-nums;
    }
</style>
