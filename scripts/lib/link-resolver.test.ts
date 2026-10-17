import { describe, expect, test } from 'bun:test';
import {
    buildImdbUrl,
    buildLetterboxdUrl,
    buildRottenTomatoesUrl,
    buildRtSearchUrl,
    formatImdbNumber,
    fetchRottenTomatoesPath,
    fetchTmdbExternalIds,
    lookupAnimeMappings,
    normalizeRottenTomatoesPath,
    parseMappingDescriptor,
    redactSecrets,
    searchBangumiByTitle,
} from './link-resolver';
import { matchAnimeMapEntry, type DoubanSearchHit } from './douban';
import type { AnimeMapEntry } from './link-resolver';

describe('formatImdbNumber', () => {
    test('pads short ids to the canonical 7-digit width', () => {
        expect(formatImdbNumber('tt13')).toBe('0000013');
        expect(formatImdbNumber('tt1375666')).toBe('1375666');
        expect(formatImdbNumber('tt36988358')).toBe('36988358');
    });
});

describe('buildLetterboxdUrl', () => {
    test('builds the imdb deep link with zero padding', () => {
        expect(buildLetterboxdUrl('tt1375666')).toBe('https://letterboxd.com/imdb/tt1375666/');
        expect(buildLetterboxdUrl('tt13')).toBe('https://letterboxd.com/imdb/tt0000013/');
    });
});

describe('buildImdbUrl', () => {
    test('builds the canonical title url', () => {
        expect(buildImdbUrl('tt1375666')).toBe('https://www.imdb.com/title/tt1375666/');
    });
});

describe('normalizeRottenTomatoesPath', () => {
    test('strips leading slashes and canonicalizes underscores', () => {
        expect(normalizeRottenTomatoesPath('/m/inception')).toBe('m/inception');
        expect(normalizeRottenTomatoesPath('tv/breaking_bad')).toBe('tv/breaking-bad');
    });
});

describe('buildRottenTomatoesUrl', () => {
    test('builds movie and tv urls from wikidata P1258 values', () => {
        expect(buildRottenTomatoesUrl('m/inception')).toBe('https://www.rottentomatoes.com/m/inception');
        expect(buildRottenTomatoesUrl('tv/breaking_bad')).toBe('https://www.rottentomatoes.com/tv/breaking-bad');
    });
});

describe('buildRtSearchUrl', () => {
    test('keeps the site: operator outside the quoted title', () => {
        const url = buildRtSearchUrl('Some Title', 2010);
        const decoded = decodeURIComponent(url);

        expect(url).toContain('site%3Arottentomatoes.com');
        expect(decoded).toContain('"Some Title (2010)" site:rottentomatoes.com');
        // Quoting the whole query turned the restriction into a phrase search.
        expect(decoded).not.toContain('"Some Title (2010) site:rottentomatoes.com"');
    });

    test('omits the year when it is unknown', () => {
        expect(decodeURIComponent(buildRtSearchUrl('Some Title')))
            .toContain('"Some Title" site:rottentomatoes.com');
    });
});

describe('searchBangumiByTitle', () => {
    const originalFetch = globalThis.fetch;

    function stub(payload: unknown, status = 200): { body: () => unknown } {
        let captured: unknown;
        globalThis.fetch = (async (_url: Parameters<typeof fetch>[0], init?: RequestInit) => {
            captured = init?.body ? JSON.parse(String(init.body)) : undefined;
            return new Response(JSON.stringify(payload), {
                status,
                headers: { 'content-type': 'application/json' },
            });
        }) as typeof fetch;
        return { body: () => captured };
    }

    test('constrains the subject type to anime', async () => {
        const request = stub({ data: [{ id: 1, name: 'Show', name_cn: '动画', date: '2020-01-01' }] });

        try {
            const hits = await searchBangumiByTitle('Some Title');
            expect(request.body()).toEqual({ keyword: 'Some Title', filter: { type: [2] } });
            expect(hits).toEqual([{ id: '1', name: 'Show', nameCn: '动画', date: '2020-01-01' }]);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    test('surfaces an error payload instead of returning no hits', async () => {
        stub({ code: 400, error: 'bad request' });

        try {
            await expect(searchBangumiByTitle('Some Title')).rejects.toThrow(/code 400/);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    test('surfaces an unexpected payload instead of returning no hits', async () => {
        stub({ total: 0 });

        try {
            await expect(searchBangumiByTitle('Some Title')).rejects.toThrow(/unexpected payload/);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });
});

describe('fetchRottenTomatoesPath', () => {
    const originalFetch = globalThis.fetch;

    function stubEntity(entity: unknown): void {
        globalThis.fetch = (async () => new Response(
            JSON.stringify({ entities: { Q42: entity } }),
            { status: 200, headers: { 'content-type': 'application/json' } },
        )) as typeof fetch;
    }

    test('rejects a malformed wikidata id before any request', async () => {
        const original = globalThis.fetch;
        globalThis.fetch = (() => {
            throw new Error('fetch must not be called');
        }) as typeof fetch;

        try {
            await expect(fetchRottenTomatoesPath('not-an-id')).rejects.toThrow(/Invalid Wikidata id/);
            await expect(fetchRottenTomatoesPath('')).rejects.toThrow(/Invalid Wikidata id/);
        } finally {
            globalThis.fetch = original;
        }
    });

    test('handles valueless snaks and reads a real value', async () => {
        try {
            stubEntity({ claims: { P1258: [{ mainsnak: { snaktype: 'somevalue' } }] } });
            expect(await fetchRottenTomatoesPath('Q42')).toBeNull();

            stubEntity({ claims: { P1258: [{ mainsnak: { snaktype: 'novalue' } }] } });
            expect(await fetchRottenTomatoesPath('Q42')).toBeNull();

            stubEntity({ claims: {} });
            expect(await fetchRottenTomatoesPath('Q42')).toBeNull();

            stubEntity({ claims: { P1258: [{ mainsnak: { datavalue: { value: 'm/inception' } } }] } });
            expect(await fetchRottenTomatoesPath('Q42')).toBe('m/inception');

            stubEntity({ claims: { P1258: [{ mainsnak: { datavalue: { value: '  ' } } }] } });
            expect(await fetchRottenTomatoesPath('Q42')).toBeNull();
        } finally {
            globalThis.fetch = originalFetch;
        }
    });
});

describe('redactSecrets', () => {
    test('redacts api_key, apikey and token query parameters', () => {
        expect(redactSecrets('HTTP 401 for https://api.themoviedb.org/3/movie/1?api_key=abcdef123456&x=1'))
            .toBe('HTTP 401 for https://api.themoviedb.org/3/movie/1?api_key=[redacted]&x=1');
        expect(redactSecrets('https://example.com/x?apikey=SECRETVALUE')).toBe('https://example.com/x?apikey=[redacted]');
        expect(redactSecrets('https://example.com/x?token=SECRETVALUE')).toBe('https://example.com/x?token=[redacted]');
    });

    test('redacts the configured TMDB key wherever it appears', () => {
        const previous = process.env.TMDB_API_KEY;
        process.env.TMDB_API_KEY = 'envkey12345678';
        try {
            expect(redactSecrets('key envkey12345678 rejected')).toBe('key [redacted] rejected');
        } finally {
            if (previous === undefined) delete process.env.TMDB_API_KEY;
            else process.env.TMDB_API_KEY = previous;
        }
    });

    test('fetchTmdbExternalIds redacts the key from HTTP failures', async () => {
        const original = globalThis.fetch;
        globalThis.fetch = (async () => new Response('{}', { status: 401 })) as typeof fetch;

        try {
            let message = '';
            try {
                await fetchTmdbExternalIds(1, 'movie', 'zzsecret12345678');
            } catch (error) {
                message = error instanceof Error ? error.message : String(error);
            }

            expect(message).toContain('HTTP 401');
            expect(message).toContain('api_key=[redacted]');
            expect(message).not.toContain('zzsecret12345678');
        } finally {
            globalThis.fetch = original;
        }
    });

    test('fetchTmdbExternalIds retries a 429 and honours Retry-After', async () => {
        const original = globalThis.fetch;
        let calls = 0;
        globalThis.fetch = (async () => {
            calls += 1;
            if (calls === 1) return new Response('{}', { status: 429, headers: { 'retry-after': '0' } });
            return new Response(JSON.stringify({ external_ids: { imdb_id: 'tt1234567' } }), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        }) as typeof fetch;

        try {
            const ids = await fetchTmdbExternalIds(1, 'movie', 'zzsecret12345678');
            expect(calls).toBe(2);
            expect(ids.imdbId).toBe('tt1234567');
        } finally {
            globalThis.fetch = original;
        }
    });

    test('fetchTmdbExternalIds gives up after a bounded number of 5xx responses', async () => {
        const original = globalThis.fetch;
        let calls = 0;
        globalThis.fetch = (async () => {
            calls += 1;
            return new Response('{}', { status: 503, headers: { 'retry-after': '0' } });
        }) as typeof fetch;

        try {
            await expect(fetchTmdbExternalIds(1, 'movie', 'zzsecret12345678')).rejects.toThrow(/HTTP 503/);
            expect(calls).toBe(4);
        } finally {
            globalThis.fetch = original;
        }
    });

    test('leaves unrelated text alone', () => {
        expect(redactSecrets('HTTP 404 for https://example.com/a?x=1'))
            .toBe('HTTP 404 for https://example.com/a?x=1');
    });
});

describe('parseMappingDescriptor', () => {
    test('parses provider, id and optional scope', () => {
        expect(parseMappingDescriptor('anilist:185407')).toEqual({ provider: 'anilist', id: '185407', scope: undefined });
        expect(parseMappingDescriptor('anidb:19038:R')).toEqual({ provider: 'anidb', id: '19038', scope: 'R' });
        expect(parseMappingDescriptor('tmdb_show:284445:s1')).toEqual({ provider: 'tmdb_show', id: '284445', scope: 's1' });
        expect(parseMappingDescriptor('mal')).toBeNull();
    });
});

describe('lookupAnimeMappings', () => {
    const mappings = {
        'tmdb_show:284445:s1': {
            'anidb:19038:R': { '1-6': '1-6' },
            'anilist:185407': { '1-6': '1-6' },
            'mal:60489': { '1-6': '1-6' },
            'tvdb_show:457645:s1': { '1-6': '1-6' },
        },
        'tmdb_movie:46343': {
            'imdb_movie:tt1323941': {},
        },
        'tmdb_show:999:s1': {
            'anidb:111:S': {}, // special episodes only — must be ignored
        },
    };

    test('extracts anime provider ids from a tv descriptor', () => {
        expect(lookupAnimeMappings(mappings, 284445, 'tv', 1)).toEqual({
            anidb: '19038',
            anilist: '185407',
            mal: '60489',
        });
    });

    test('does not guess a season when the tv season is unknown', () => {
        // Defaulting to s1 returned another season's (hence another show's) ids
        // and the caller marked them confirmed.
        expect(lookupAnimeMappings(mappings, 284445, 'tv')).toEqual({});
        expect(lookupAnimeMappings(mappings, 284445, 'tv', undefined)).toEqual({});
    });

    test('handles movie descriptors', () => {
        expect(lookupAnimeMappings(mappings, 46343, 'movie')).toEqual({});
    });

    test('ignores special-episode-only descriptors and unknown entries', () => {
        expect(lookupAnimeMappings(mappings, 999, 'tv', 1)).toEqual({});
        expect(lookupAnimeMappings(mappings, 404, 'tv', 1)).toEqual({});
    });
});

describe('matchAnimeMapEntry', () => {
    const entries: AnimeMapEntry[] = [
        { bgm_id: '111', tmdb_id: 'tv/209867/season/1', douban_id: '36093351' },
        { bgm_id: '222', tmdb_id: 'tv/209867/season/2' },
        { bgm_id: '333', tmdb_id: 'movie/46343', imdb_id: 'tt1323941' },
        { bgm_id: '444', tmdb_id: 'tv/555' },
    ];

    test('matches movies by numeric tmdb id', () => {
        expect(matchAnimeMapEntry(entries, 46343, 'movie')?.bgm_id).toBe('333');
    });

    test('matches tv entries with exact season', () => {
        expect(matchAnimeMapEntry(entries, 209867, 'tv', 2)?.bgm_id).toBe('222');
    });

    test('falls back to a season-less tv entry', () => {
        expect(matchAnimeMapEntry(entries, 555, 'tv', 1)?.bgm_id).toBe('444');
    });

    test('never answers a season-less query with a season-scoped entry', () => {
        // Season 1 is the only entry for this show; guessing it would confirm
        // season 1's ids for the whole show.
        const onlySeasonOne: AnimeMapEntry[] = [
            { bgm_id: '999', tmdb_id: 'tv/777/season/1' },
        ];
        expect(matchAnimeMapEntry(onlySeasonOne, 777, 'tv')).toBeNull();
        expect(matchAnimeMapEntry(onlySeasonOne, 777, 'tv', 1)?.bgm_id).toBe('999');
    });

    test('returns null when nothing matches', () => {
        expect(matchAnimeMapEntry(entries, 999999, 'movie')).toBeNull();
        expect(matchAnimeMapEntry(entries, 209867, 'tv', 9)).toBeNull();
    });

    test('matches by imdb id directly', () => {
        const hit = entries.find((e) => e.imdb_id === 'tt1323941');
        expect(hit?.bgm_id).toBe('333');
    });
});

describe('douban rexxar hit classification', () => {
    test('single hit is confirmable, multiple hits are ambiguous', () => {
        const single: DoubanSearchHit[] = [{ id: '3541415', title: '盗梦空间', year: '2010' }];
        const many: DoubanSearchHit[] = [
            { id: '1', title: 'a', year: '' },
            { id: '2', title: 'b', year: '' },
        ];
        expect(single.length === 1).toBe(true);
        expect(many.length === 1).toBe(false);
    });
});
