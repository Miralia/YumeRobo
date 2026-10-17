import { describe, expect, test } from 'bun:test';
import { collectExternalLinks, detectPlatform, isValidUrl } from './links';

describe('collectExternalLinks', () => {
    test('collects supported URLs from editor lines and ignores unusable lines', () => {
        const result = collectExternalLinks(
            { tmdb: 'https://www.themoviedb.org/tv/123' },
            [
                '# One URL per line',
                ' https://www.imdb.com/title/tt123/ ',
                '',
                'not a URL',
                'https://example.com/title/123',
                'https://www.themoviedb.org/tv/456',
                'https://anilist.co/anime/123\r',
            ].join('\n'),
        );

        expect(result.links).toEqual({
            tmdb: 'https://www.themoviedb.org/tv/123',
            imdb: 'https://www.imdb.com/title/tt123/',
            anilist: 'https://anilist.co/anime/123',
        });
        expect(result.added).toEqual(['imdb', 'anilist']);
        expect(result.skipped).toBe(3);
    });

    test('rejects non-http schemes', () => {
        expect(isValidUrl('javascript:alert("imdb.com")')).toBe(false);
        expect(isValidUrl('mailto:a@themoviedb.org')).toBe(false);
        expect(isValidUrl('data:text/html,<script>')).toBe(false);
        expect(detectPlatform('javascript:alert("imdb.com")')).toBeNull();
    });

    test('rejects hostnames that merely contain a platform name', () => {
        expect(detectPlatform('https://imdb.com.evil.tld/x')).toBeNull();
        expect(detectPlatform('https://evil.tld/?u=imdb.com')).toBeNull();
        expect(detectPlatform('https://evil-imdb.com/x')).toBeNull();
    });

    test('accepts platform subdomains', () => {
        expect(detectPlatform('https://m.imdb.com/title/tt1/')).toBe('imdb');
        expect(detectPlatform('https://www.themoviedb.org/movie/1')).toBe('tmdb');
    });

    test('never stores a bypass attempt as a platform link', () => {
        const result = collectExternalLinks(
            {},
            ['javascript:alert("imdb.com")', 'https://evil.tld/?u=imdb.com'].join('\n'),
        );

        expect(result.links).toEqual({});
        expect(result.added).toEqual([]);
        expect(result.skipped).toBe(2);
    });
});
