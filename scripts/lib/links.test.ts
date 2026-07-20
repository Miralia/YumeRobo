import { describe, expect, test } from 'bun:test';
import { collectExternalLinks } from './links';

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
});
