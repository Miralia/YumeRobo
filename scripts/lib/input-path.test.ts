import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import {
	expandHome,
	hasExtension,
	inputPathCandidates,
	resolveInputPath,
	stripSurroundingQuotes,
	unescapeShellPath,
} from "./input-path";

describe("unescapeShellPath", () => {
	test("undoes the escaping a terminal applies to a dropped path", () => {
		expect(unescapeShellPath("/Users/me/My\\ File.torrent")).toBe(
			"/Users/me/My File.torrent",
		);
		expect(unescapeShellPath("/Users/me/Weird\\[Name\\].torrent")).toBe(
			"/Users/me/Weird[Name].torrent",
		);
		expect(unescapeShellPath("/Users/me/a\\\\b.torrent")).toBe("/Users/me/a\\b.torrent");
	});

	test("leaves a Windows-style path alone", () => {
		// `\U`/`\m` are not escape sequences a shell produces, so a real
		// backslash path must survive.
		expect(unescapeShellPath("C:\\Users\\me\\Show.torrent")).toBe(
			"C:\\Users\\me\\Show.torrent",
		);
	});
});

describe("stripSurroundingQuotes", () => {
	test("removes matching single or double quotes only", () => {
		expect(stripSurroundingQuotes("'/a b.torrent'")).toBe("/a b.torrent");
		expect(stripSurroundingQuotes('"/a b.torrent"')).toBe("/a b.torrent");
		expect(stripSurroundingQuotes("'/a b.torrent\"")).toBe("'/a b.torrent\"");
		expect(stripSurroundingQuotes("/a b.torrent")).toBe("/a b.torrent");
	});
});

describe("hasExtension", () => {
	test("accepts a quoted dropped .torrent path", () => {
		// The raw input ends with a quote, so a naive `endsWith` check rejects it.
		expect(hasExtension("'/Users/me/My File.torrent'", ".torrent")).toBe(true);
		expect(hasExtension("/Users/me/My\\ File.TORRENT", ".torrent")).toBe(true);
		expect(hasExtension("/Users/me/My File.mkv", ".torrent")).toBe(false);
	});
});

describe("inputPathCandidates", () => {
	test("lists the literal interpretation first", () => {
		const candidates = inputPathCandidates("/a\\ b.torrent");
		expect(candidates[0]).toBe("/a\\ b.torrent");
		expect(candidates[1]).toBe("/a b.torrent");
	});

	test("expands a home-relative path", () => {
		expect(expandHome("~/x.torrent")).toBe(path.join(os.homedir(), "x.torrent"));
		expect(inputPathCandidates("~/x.torrent")).toContain(
			path.join(os.homedir(), "x.torrent"),
		);
	});
});

describe("resolveInputPath", () => {
	test("resolves a dropped path whose literal form does not exist", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-path-"));
		const target = path.join(root, "My File.torrent");
		await fs.writeFile(target, "x", "utf8");

		try {
			const dropped = target.replace(/ /g, "\\ ");
			expect(await resolveInputPath(dropped)).toBe(target);
			expect(await resolveInputPath(`'${target}'`)).toBe(target);
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});

	test("prefers the literal path when it exists", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "yumerobo-path-"));
		// A file whose name really contains a backslash must win over the
		// unescaped interpretation.
		const literal = path.join(root, "a\\b.torrent");
		await fs.writeFile(literal, "x", "utf8");

		try {
			expect(await resolveInputPath(literal)).toBe(literal);
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});

	test("returns the trimmed input when nothing exists", async () => {
		expect(await resolveInputPath("  /definitely/missing.torrent  ")).toBe(
			"/definitely/missing.torrent",
		);
		expect(await resolveInputPath("   ")).toBe("");
	});
});
