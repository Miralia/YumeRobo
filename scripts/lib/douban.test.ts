import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getRexxarDelayMs, searchDoubanRaw } from "./douban";

const originalFetch = globalThis.fetch;

function stubFetch(handler: () => Response): void {
    globalThis.fetch = (async () => handler()) as typeof fetch;
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
    });
}

const originalDelay = process.env.DOUBAN_REQUEST_DELAY_MS;

beforeEach(() => {
    delete process.env.DOUBAN_REQUEST_DELAY_MS;
});

afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalDelay === undefined) delete process.env.DOUBAN_REQUEST_DELAY_MS;
    else process.env.DOUBAN_REQUEST_DELAY_MS = originalDelay;
});

describe("getRexxarDelayMs", () => {
    test("defaults to one second and honours an override", () => {
        expect(getRexxarDelayMs()).toBe(1000);
        process.env.DOUBAN_REQUEST_DELAY_MS = "0";
        expect(getRexxarDelayMs()).toBe(0);
        process.env.DOUBAN_REQUEST_DELAY_MS = "250";
        expect(getRexxarDelayMs()).toBe(250);
        process.env.DOUBAN_REQUEST_DELAY_MS = "not-a-number";
        expect(getRexxarDelayMs()).toBe(1000);
        process.env.DOUBAN_REQUEST_DELAY_MS = "-5";
        expect(getRexxarDelayMs()).toBe(1000);
    });
});

describe("searchDoubanRaw", () => {
    test("maps subject hits", async () => {
        stubFetch(() => jsonResponse({
            items: [
                { layout: "subject", target: { id: "3541415", title: "盗梦空间", year: "2010" } },
                { layout: "ad", target: { id: "1", title: "ad" } },
                { layout: "subject", target: {} },
            ],
        }));

        expect(await searchDoubanRaw("tt1375666")).toEqual([
            { id: "3541415", title: "盗梦空间", year: "2010" },
        ]);
    });

    test("treats a rate-limit payload as a failure, not an empty result", async () => {
        stubFetch(() => jsonResponse({ r: 1, msg: "rate limited" }));
        await expect(searchDoubanRaw("tt1375666")).rejects.toThrow(/r=1.*rate limited/);
    });

    test("treats a payload without an items array as a failure", async () => {
        stubFetch(() => jsonResponse({ r: 0 }));
        await expect(searchDoubanRaw("tt1375666")).rejects.toThrow(/unexpected payload/);
    });

    test("treats an HTTP error as a failure", async () => {
        stubFetch(() => jsonResponse({}, 503));
        await expect(searchDoubanRaw("tt1375666")).rejects.toThrow(/HTTP 503/);
    });

    test("an empty item list is a genuine no-match", async () => {
        stubFetch(() => jsonResponse({ items: [] }));
        expect(await searchDoubanRaw("tt1375666")).toEqual([]);
    });
});
