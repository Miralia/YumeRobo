<script lang="ts">
	import { cubicOut } from "svelte/easing";
	import { fly } from "svelte/transition";

	const currentYear = new Date().getFullYear();
</script>

<footer class="footer" in:fly={{ y: 20, duration: 400, easing: cubicOut }}>
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
        color: inherit;
        text-decoration: none;
        transition: color var(--duration-fast) var(--ease-out);
    }

    .repo-link:hover {
        color: var(--color-accent);
    }
</style>
