<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="footer-content container">
		<p class="copyright">
			© {currentYear}
			<a
				href="https://github.com/Miralia/YumeRobo"
				target="_blank"
				rel="noopener noreferrer"
				class="repo-link">YumeRobo</a
			>. All rights reserved.
		</p>
	</div>
</footer>

<style>
    .footer {
        margin-top: auto;
        padding: var(--space-6) 0;
        border-top: 1px solid var(--color-separator);
        background: var(--color-background-secondary);
        /* A visible footer below an expanding detail card would otherwise be
           selected as the replacement scroll anchor. */
        overflow-anchor: none;
    }

    .footer-content {
        display: flex;
        justify-content: center;
        text-align: center;
    }

    .copyright {
        font-size: var(--text-sm);
        color: var(--color-label-secondary);
    }

    .repo-link {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        color: inherit;
        text-decoration: underline;
        text-decoration-color: color-mix(in srgb, currentColor 48%, transparent);
        text-underline-offset: 2px;
        transition:
            color var(--duration-fast) var(--ease-out),
            text-decoration-color var(--duration-fast) var(--ease-out);
    }

    .repo-link:hover,
    .repo-link:focus-visible {
        color: var(--color-accent);
        text-decoration-color: currentColor;
    }
</style>
