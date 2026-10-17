import { describe, expect, test } from "bun:test";
import { parseBBCodeSpecs } from "./bbcode";

function specContent(bbcode: string): string {
	const specs = parseBBCodeSpecs(bbcode);
	return specs.map((spec) => spec.content).join("\n");
}

function countDivs(html: string): { open: number; close: number } {
	return {
		open: html.match(/<div\b/g)?.length ?? 0,
		close: html.match(/<\/div>/g)?.length ?? 0,
	};
}

describe("parseBBCodeSpecs", () => {
	test("escapes markup instead of passing it through", () => {
		const html = specContent("[quote=Info]\n<script>alert(1)</script> A < B\n[/quote]");
		expect(html).toBe("&lt;script&gt;alert(1)&lt;/script&gt; A &lt; B");
	});

	test("drops javascript: link targets but keeps the label", () => {
		const html = specContent("[quote=Info]\n[url=javascript:alert(1)]click[/url]\n[/quote]");
		expect(html).toBe("click");
	});

	test("cannot be broken out of via a quote in the href", () => {
		const html = specContent(
			'[quote=Info]\n[url=https://x.test/a" onmouseover="alert(1)]t[/url]\n[/quote]',
		);
		// The quote is escaped, so it stays inside the href value instead of
		// terminating the attribute and adding a handler.
		expect(html).toContain("&quot;");
		expect(html).not.toContain('" onmouseover="');
		expect(html).toBe(
			'<a href="https://x.test/a&quot; onmouseover=&quot;alert(1)" target="_blank" rel="noopener" class="spec-link">t</a>',
		);
	});

	test("renders a valid http(s) link", () => {
		const html = specContent("[quote=Info]\n[url=https://slow.pics/c/abc]JPN vs US[/url]\n[/quote]");
		expect(html).toBe(
			'<a href="https://slow.pics/c/abc" target="_blank" rel="noopener" class="spec-link">JPN vs US</a>',
		);
	});

	test("balances a bare [quote] instead of emitting stray closing tags", () => {
		const html = specContent("[quote=Info]\nhello\n[quote]\ninner\n[/quote]\n[/quote]");
		const divs = countDivs(html);
		// The outer block becomes the spec itself; only the nested bare quote
		// renders divs — and it must render an open and a close.
		expect(divs.open).toBe(2);
		expect(divs.close).toBe(2);
		expect(html).not.toContain("[quote]");
		expect(html).not.toContain("[/quote]");
	});

	test("keeps [code] bodies literal and unparsed", () => {
		const html = specContent("[quote=Log]\n[code][b]not bold[/b] <tag>[/code]\n[/quote]");
		expect(html).toBe("[b]not bold[/b] &lt;tag&gt;");
	});

	test("handles nested inline tags inside a link label", () => {
		const html = specContent("[quote=Info]\n[url=https://x.test/][b]bold[/b][/url]\n[/quote]");
		expect(html).toBe(
			'<a href="https://x.test/" target="_blank" rel="noopener" class="spec-link"><strong>bold</strong></a>',
		);
	});

	test("keeps the block title as data and escapes nested titles", () => {
		// The outer block's title becomes `spec.title`, which Svelte escapes at
		// render time; nested titles are interpolated into HTML here.
		const specs = parseBBCodeSpecs("[quote=<img src=x>]\nbody\n[/quote]");
		expect(specs[0].title).toBe("<img src=x>");
		expect(specs[0].content).toBe("body");

		const nested = specContent(
			"[quote=Outer]\n[quote=<b>inner</b>]\nx\n[/quote]\n[/quote]",
		);
		expect(nested).toContain(
			'<div class="inner-quote-title">&lt;b&gt;inner&lt;/b&gt;</div>',
		);
	});

	test("omits the nested title when a spoiler has none", () => {
		const specs = parseBBCodeSpecs("[spoiler]\nbody\n[/spoiler]");
		expect(specs[0].title).toBe("");
		expect(specs[0].content).toBe("body");
	});

	test("removes [img] and keeps a standalone [url] label as the target", () => {
		expect(specContent("[quote=Info]\n[img]https://x.test/a.png[/img]\n[/quote]")).toBe("");
		expect(specContent("[quote=Info]\n[url]https://x.test/b[/url]\n[/quote]")).toContain(
			'href="https://x.test/b"',
		);
	});

	test("ignores unknown tags and returns nothing without a quote block", () => {
		expect(parseBBCodeSpecs("no quotes here")).toEqual([]);
		expect(specContent("[quote=Info]\n[unknown]x[/unknown]\n[/quote]")).toBe("[unknown]x[/unknown]");
	});
});
