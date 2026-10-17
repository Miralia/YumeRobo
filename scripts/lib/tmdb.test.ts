import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
    getMetadataById,
    getMovieMetadata,
    getTVMetadata,
    searchMulti,
    TmdbApiError,
    TmdbPayloadError,
} from "./tmdb";

const originalFetch = globalThis.fetch;

function stubFetch(handler: (url: string) => Response): string[] {
    const urls: string[] = [];
    globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
        const url = String(input);
        urls.push(url);
        return handler(url);
    }) as typeof fetch;
    return urls;
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
    });
}

beforeEach(() => {
    process.env.TMDB_API_KEY = "test-key-12345678";
});

afterEach(() => {
    globalThis.fetch = originalFetch;
});

describe("searchMulti", () => {
    test("keeps only typed results with a display title", async () => {
        stubFetch(() => jsonResponse({
            results: [
                { id: 1, media_type: "movie", title: "A Movie", release_date: "2010-01-01" },
                { id: 2, media_type: "tv", name: "A Show", first_air_date: "2011-01-01" },
                { id: 3, media_type: "person", name: "Someone" },
                { id: 4, media_type: "movie", title: "   " },
                { id: 5, media_type: "movie" },
            ],
        }));

        const results = await searchMulti("query");
        expect(results.map((r) => r.id)).toEqual([1, 2]);
    });

    test("throws when results is not an array", async () => {
        stubFetch(() => jsonResponse({ results: "nope" }));
        await expect(searchMulti("query")).rejects.toThrow(TmdbPayloadError);
    });
});

describe("getMovieMetadata", () => {
    test("throws instead of writing NaN when the release date is empty", async () => {
        stubFetch(() => jsonResponse({ id: 42, title: "A Movie", release_date: "" }));

        const error = await getMovieMetadata(42).catch((e: unknown) => e);
        expect(error).toBeInstanceOf(TmdbPayloadError);
        expect(String((error as Error).message)).toContain("no release date");
    });

    test("throws on an unusable release date", async () => {
        stubFetch(() => jsonResponse({ id: 42, title: "A Movie", release_date: "TBD" }));
        await expect(getMovieMetadata(42)).rejects.toThrow(/unusable release date/);
    });

    test("parses a valid date", async () => {
        stubFetch(() => jsonResponse({ id: 42, title: "A Movie", release_date: "1999-03-31" }));
        expect(await getMovieMetadata(42)).toEqual({
            tmdb_id: 42,
            title: "A Movie",
            year: 1999,
            media_type: "movie",
        });
    });

    test("rejects a missing title", async () => {
        stubFetch(() => jsonResponse({ id: 42, release_date: "1999-03-31" }));
        await expect(getMovieMetadata(42)).rejects.toThrow(/has no title/);
    });

    test("maps a non-OK response to TmdbApiError with the status", async () => {
        stubFetch(() => jsonResponse({ status_message: "Invalid API key" }, 401));

        const error = await getMovieMetadata(42).catch((e: unknown) => e);
        expect(error).toBeInstanceOf(TmdbApiError);
        expect((error as TmdbApiError).status).toBe(401);
        // The key travels in the query string, so it must not appear in errors.
        expect(String((error as Error).message)).not.toContain("test-key-12345678");
    });
});

describe("getTVMetadata", () => {
    test("parses a valid first air date and season count", async () => {
        stubFetch(() => jsonResponse({ id: 7, name: "A Show", first_air_date: "2011-05-02", number_of_seasons: 3 }));
        expect(await getTVMetadata(7)).toEqual({
            tmdb_id: 7,
            title: "A Show",
            year: 2011,
            media_type: "tv",
            number_of_seasons: 3,
        });
    });

    test("throws when the first air date is missing", async () => {
        stubFetch(() => jsonResponse({ id: 7, name: "A Show" }));
        await expect(getTVMetadata(7)).rejects.toThrow(/no release date/);
    });
});

describe("getMetadataById", () => {
    test("rethrows an auth failure instead of reporting no results", async () => {
        stubFetch(() => jsonResponse({}, 401));
        await expect(getMetadataById(42, "movie")).rejects.toThrow(TmdbApiError);
        await expect(getMetadataById(42)).rejects.toThrow(TmdbApiError);
    });

    test("rethrows a rate limit instead of reporting no results", async () => {
        stubFetch(() => jsonResponse({}, 429));
        await expect(getMetadataById(42, "tv")).rejects.toThrow(TmdbApiError);
    });

    test("treats a 404 as no results", async () => {
        stubFetch(() => jsonResponse({}, 404));
        expect(await getMetadataById(42, "movie")).toEqual([]);
        expect(await getMetadataById(42)).toEqual([]);
    });

    test("returns whichever type resolves when both are tried", async () => {
        stubFetch((url) => url.includes("/movie/")
            ? jsonResponse({}, 404)
            : jsonResponse({ id: 42, name: "A Show", first_air_date: "2020-01-01" }));

        const results = await getMetadataById(42);
        expect(results).toHaveLength(1);
        expect(results[0].media_type).toBe("tv");
    });
});
