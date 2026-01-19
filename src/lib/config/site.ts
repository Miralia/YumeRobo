/**
 * Site configuration
 * Central place for site-wide settings
 */

export const siteConfig = {
    name: 'YumeRobo',
    description: 'Release announcements and media information',
    url: 'https://yumerobo.example.com',

    // Pagination
    postsPerPage: 10,

    // Default locale
    defaultLocale: 'en-US',
    supportedLocales: ['en-US', 'zh-CN'] as const,

    // API keys (loaded from environment in production)
    tmdb: {
        apiBaseUrl: 'https://api.themoviedb.org/3',
        imageBaseUrl: 'https://image.tmdb.org/t/p'
    },

    // Telegram (for CLI tool)
    telegram: {
        channelId: '', // Set via environment variable
        botToken: ''   // Set via environment variable
    }
} as const;

export type Locale = typeof siteConfig.supportedLocales[number];
