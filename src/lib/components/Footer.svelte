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
        <div class="footer-links">
            <a
                href="https://t.me/YumeRobo"
                class="footer-link"
                aria-label="Telegram"
                target="_blank"
                rel="noopener noreferrer"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path
                        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                    />
                </svg>
                <span>Telegram</span>
            </a>
            <a
                href="/rss.xml"
                class="footer-link"
                aria-label="RSS Feed"
                data-sveltekit-reload
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
                >
                    <path d="M4 11a9 9 0 0 1 9 9"></path>
                    <path d="M4 4a16 16 0 0 1 16 16"></path>
                    <circle cx="5" cy="19" r="1"></circle>
                </svg>
                <span>RSS</span>
            </a>
        </div>
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
        flex-direction: column;
        align-items: center;
        gap: var(--space-3);
        text-align: center;
    }

    @media (min-width: 640px) {
        .footer-content {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
        }
    }

    .copyright {
        font-size: var(--text-sm);
        color: var(--color-label-secondary);
    }

    .footer-links {
        display: flex;
        gap: var(--space-4);
    }

    .footer-link {
        display: flex;
        align-items: center;
        gap: var(--space-1);
        font-size: var(--text-sm);
        color: var(--color-label-secondary);
        transition: color var(--duration-fast) var(--ease-out);
    }

    .footer-link:hover {
        color: var(--color-accent);
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
