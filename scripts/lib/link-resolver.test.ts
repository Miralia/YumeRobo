import { describe, expect, test } from 'bun:test';
import {
    buildImdbUrl,
    buildLetterboxdUrl,
    buildRottenTomatoesUrl,
    buildRtSearchUrl,
    formatImdbNumber,
    lookupAnimeMappings,
    normalizeRottenTomatoesPath,
    parseMappingDescriptor,
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
    test('encodes a UNIT3D-style site-scoped query', () => {
        const url = buildRtSearchUrl('Some Title', 2010);
        expect(url).toContain('site%3Arottentomatoes.com');
        expect(decodeURIComponent(url)).toContain('"Some Title (2010) site:rottentomatoes.com"');
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

    test('defaults tv season to s1', () => {
        expect(lookupAnimeMappings(mappings, 284445, 'tv')).toEqual({
            anidb: '19038',
            anilist: '185407',
            mal: '60489',
        });
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
