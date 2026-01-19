/**
 * Global locale store for i18n
 * Reactive store that all components can subscribe to
 */
import { writable, derived } from 'svelte/store';

export type Locale = 'en' | 'zh';

// Create the locale store with default value
function createLocaleStore() {
    // Initialize from localStorage if available
    let initial: Locale = 'en';
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('locale') as Locale | null;
        if (saved && ['en', 'zh'].includes(saved)) {
            initial = saved;
        }
    }

    const { subscribe, set, update } = writable<Locale>(initial);

    return {
        subscribe,
        set: (locale: Locale) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('locale', locale);
            }
            set(locale);
        },
        toggle: () => {
            update((current) => {
                const next = current === 'en' ? 'zh' : 'en';
                if (typeof window !== 'undefined') {
                    localStorage.setItem('locale', next);
                }
                return next;
            });
        }
    };
}

export const locale = createLocaleStore();

/**
 * Get localized title based on current locale
 */
export function getLocalizedTitle(
    locale: Locale,
    title: string,
    title_en?: string,
    title_zh?: string
): string {
    if (locale === 'zh') {
        return title_zh || title_en || title;
    }
    return title_en || title;
}

/**
 * UI translations
 */
export const translations = {
    en: {
        search: 'Search releases...',
        backToReleases: 'Back to Releases',
        mediaInfo: 'MediaInfo',
        viewRaw: 'View Raw MediaInfo',
        torrents: 'Torrents',
        expandFiles: 'Show Files',
        collapseFiles: 'Hide Files',

        noResults: 'No results found',
        noResultsFor: 'No releases match',
        loadMore: 'Load More',
        theme: 'Theme',
        language: 'Language'
    },
    zh: {
        search: '搜索发布...',
        backToReleases: '返回列表',
        mediaInfo: '媒体信息',
        viewRaw: '查看原始 MediaInfo',
        torrents: '种子文件',
        expandFiles: '展开文件',
        collapseFiles: '收起文件',

        noResults: '未找到结果',
        noResultsFor: '没有匹配的发布',
        loadMore: '加载更多',
        theme: '主题',
        language: '语言'
    }
};

/**
 * Derived store for translations
 */
export const t = derived(locale, ($locale) => translations[$locale]);
