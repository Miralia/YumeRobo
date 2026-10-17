import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, test } from "bun:test";
import { generateReleaseCode } from "./templates";
import type { ReleaseData } from "./types";

function makeRelease(overrides: Partial<ReleaseData> = {}): ReleaseData {
	return {
		slug: "abc12345",
		title: "Example",
		date: "2026-01-01T00:00:00.000Z",
		tmdb_id: 1,
		media_type: "movie",
		year: 2026,
		poster: "/posters/abc12345.avif",
		torrents: [
			{
				name: "Example.2026.mkv",
				files: [{ name: "Example.2026.mkv", size: 1024 }],
				mediainfo: [{ filename: "Example.2026.mkv", raw_hash: "h1" }],
			},
		],
		specs: [{ title: "Info", content: "Source: BD" }],
		links: { tmdb: "https://www.themoviedb.org/movie/1" },
		...overrides,
	};
}

function moduleSource(release: ReleaseData): string {
	return `export const release = ${generateReleaseCode(release)};`;
}

/** The generated module is written into the repo, so it must really parse. */
async function importGenerated(source: string): Promise<{ release: ReleaseData }> {
	const directory = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-templates-"));
	const filePath = path.join(directory, "release.ts");
	try {
		await fs.writeFile(filePath, source, "utf8");
		return (await import(pathToFileURL(filePath).href)) as { release: ReleaseData };
	} finally {
		await fs.rm(directory, { recursive: true, force: true });
	}
}

describe("generateReleaseCode", () => {
	test("emits a module that parses and round-trips line terminators", async () => {
		// A raw CR or LF inside a single-quoted literal is a syntax error, and
		// the CLI overwrites the previous release file with this output.
		const release = makeRelease({
			title: "Line\r\nbreak's \\ slash",
			specs: [{ title: "Log", content: "a `tick` and ${not} interpolation" }],
		});

		const { release: parsed } = await importGenerated(moduleSource(release));

		expect(parsed.title).toBe("Line\r\nbreak's \\ slash");
		expect(parsed.specs[0].content).toBe("a `tick` and ${not} interpolation");
	});

	test("does not emit a trailing comma inside the object literal", () => {
		const code = generateReleaseCode(makeRelease());
		expect(code.trimEnd().endsWith("}")).toBe(true);
		expect(code.trimEnd().endsWith("},")).toBe(false);
	});

	test("keeps season 0 and an explicit is_complete: false", async () => {
		const { release } = await importGenerated(
			moduleSource(makeRelease({ media_type: "tv", season: 0, is_complete: false })),
		);

		expect(release.season).toBe(0);
		expect(release.is_complete).toBe(false);
	});

	test("round-trips spec subitems", async () => {
		const { release } = await importGenerated(
			moduleSource(
				makeRelease({
					specs: [
						{
							title: "Info",
							content: "top",
							subitems: [{ title: "Audio", content: "jpn" }],
						},
					],
				}),
			),
		);

		expect(release.specs[0].subitems).toEqual([{ title: "Audio", content: "jpn" }]);
	});

	test("writes file names from `name` and tolerates a legacy `path`", async () => {
		const legacy = {
			...makeRelease(),
			torrents: [
				{
					name: "Legacy",
					files: [
						{ name: "from-name.mkv", size: 10 },
						{ path: "from-path.mkv", size: 20 },
					],
					mediainfo: [],
				},
			],
		} as unknown as ReleaseData;

		const { release } = await importGenerated(moduleSource(legacy));

		expect(release.torrents[0].files).toEqual([
			{ name: "from-name.mkv", size: 10 },
			{ name: "from-path.mkv", size: 20 },
		]);
	});

	test("quotes link keys that are not identifiers", async () => {
		const { release } = await importGenerated(
			moduleSource(
				makeRelease({ links: { tmdb: "https://x.test/1", "my-anime-list": "https://x.test/2" } }),
			),
		);

		expect(release.links).toEqual({
			tmdb: "https://x.test/1",
			"my-anime-list": "https://x.test/2",
		});
	});

	test("escapes single quotes in a link value", async () => {
		const { release } = await importGenerated(
			moduleSource(makeRelease({ links: { imdb: "https://x.test/a'b" } })),
		);

		expect(release.links.imdb).toBe("https://x.test/a'b");
	});
});
