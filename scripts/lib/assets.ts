import fs from "node:fs/promises";
import path from "node:path";
import type { ReleaseData } from "./types";

export type ManagedAssetKind = "poster" | "og" | "mediainfo";

export interface ManagedAssetEntry {
	kind: ManagedAssetKind;
	path: string;
	absolutePath: string;
}

export interface ManagedAssetReference extends ManagedAssetEntry {
	ownerSlug?: string;
}

export interface ManagedAssetIssue {
	kind: ManagedAssetKind;
	path: string;
	releaseSlug?: string;
	expectedPath?: string;
	detail?: string;
}

export interface ManagedAssetCleanupKeep {
	asset: ManagedAssetReference;
	reason: string;
}

export interface ManagedAssetCleanupPlan {
	delete: ManagedAssetReference[];
	keep: ManagedAssetCleanupKeep[];
}

export interface ManagedAssetCleanupResult extends ManagedAssetCleanupPlan {
	missing: ManagedAssetReference[];
	errors: Array<{ asset: ManagedAssetReference; error: string }>;
}

export interface ManagedAssetAuditReport {
	missingReferences: ManagedAssetIssue[];
	orphanedFiles: ManagedAssetIssue[];
	malformedReferences: ManagedAssetIssue[];
	derivedMismatches: ManagedAssetIssue[];
}

const STATIC_DIR = "static";
const POSTERS_DIR = "posters";
const OG_DIR = "og";
const MEDIAINFO_DIR = "mediainfo";
const MANAGED_ASSET_KINDS: ManagedAssetKind[] = ["poster", "og", "mediainfo"];

function sortIssues(issues: ManagedAssetIssue[]): ManagedAssetIssue[] {
	return issues.sort((a, b) =>
		`${a.kind}:${a.releaseSlug ?? ""}:${a.path}`.localeCompare(
			`${b.kind}:${b.releaseSlug ?? ""}:${b.path}`,
		),
	);
}

function sortRefs(
	refs: ManagedAssetReference[],
): ManagedAssetReference[] {
	return refs.sort((a, b) => `${a.kind}:${a.path}`.localeCompare(`${b.kind}:${b.path}`));
}

function sortKeeps(keeps: ManagedAssetCleanupKeep[]): ManagedAssetCleanupKeep[] {
	return keeps.sort((a, b) =>
		`${a.asset.kind}:${a.asset.path}`.localeCompare(
			`${b.asset.kind}:${b.asset.path}`,
		),
	);
}

function stripStaticPrefix(value: string): string {
	return value.startsWith(`${STATIC_DIR}/`) ? value.slice(STATIC_DIR.length + 1) : value;
}

function normalizeStaticRelativePath(rawPath: string): string | null {
	const normalized = rawPath.replace(/\\/g, "/").trim();
	if (!normalized) return null;

	const noLeadingSlash = normalized.replace(/^\/+/, "");
	const withoutStatic = stripStaticPrefix(noLeadingSlash);
	const candidate = path.posix.normalize(withoutStatic);

	if (
		!candidate ||
		candidate === "." ||
		candidate.startsWith("../") ||
		candidate.includes("/../")
	) {
		return null;
	}

	return candidate;
}

function createAssetEntry(
	rootDir: string,
	kind: ManagedAssetKind,
	relativePath: string,
	ownerSlug?: string,
): ManagedAssetReference {
	return {
		kind,
		path: relativePath,
		absolutePath: path.join(rootDir, STATIC_DIR, relativePath),
		ownerSlug,
	};
}

export function getPosterRelativePath(slug: string): string {
	return `${POSTERS_DIR}/${slug}.avif`;
}

export function getOgRelativePath(slug: string): string {
	return `${OG_DIR}/${slug}.jpg`;
}

export function getOgRelativePathForPoster(posterPath: string): string {
	const basename = path.posix.basename(posterPath);
	return `${OG_DIR}/${basename.replace(/\.avif$/, ".jpg")}`;
}

export function getMediainfoRelativePath(rawHash: string): string {
	return `${MEDIAINFO_DIR}/${rawHash}`;
}

function getPosterReference(
	release: Pick<ReleaseData, "slug" | "poster">,
	rootDir: string,
): { issue?: ManagedAssetIssue; entry?: ManagedAssetReference } {
	const normalized = normalizeStaticRelativePath(release.poster);
	if (!normalized) {
		return {
			issue: {
				kind: "poster",
				path: release.poster,
				releaseSlug: release.slug,
				detail: "poster path is malformed",
			},
		};
	}

	if (!normalized.startsWith(`${POSTERS_DIR}/`) || !normalized.endsWith(".avif")) {
		return {
			issue: {
				kind: "poster",
				path: normalized,
				releaseSlug: release.slug,
				detail: "poster path must stay inside posters/ and end with .avif",
			},
		};
	}

	return {
		entry: createAssetEntry(rootDir, "poster", normalized, release.slug),
	};
}

function getMediainfoReferences(
	release: Pick<ReleaseData, "slug" | "torrents">,
	rootDir: string,
): { issues: ManagedAssetIssue[]; entries: ManagedAssetReference[] } {
	const issues: ManagedAssetIssue[] = [];
	const seen = new Set<string>();
	const entries: ManagedAssetReference[] = [];

	for (const torrent of release.torrents) {
		for (const mi of torrent.mediainfo) {
			const normalizedHash = normalizeStaticRelativePath(mi.raw_hash);
			if (!normalizedHash || normalizedHash.includes("/")) {
				issues.push({
					kind: "mediainfo",
					path: mi.raw_hash,
					releaseSlug: release.slug,
					detail: "raw_hash must be a file name, not a path",
				});
				continue;
			}

			if (seen.has(normalizedHash)) continue;
			seen.add(normalizedHash);
			entries.push(
				createAssetEntry(
					rootDir,
					"mediainfo",
					getMediainfoRelativePath(normalizedHash),
					release.slug,
				),
			);
		}
	}

	return { issues, entries };
}

export function getReleaseAssetReferences(
	release: Pick<ReleaseData, "slug" | "poster" | "torrents">,
	rootDir: string = process.cwd(),
): { issues: ManagedAssetIssue[]; entries: ManagedAssetReference[] } {
	const issues: ManagedAssetIssue[] = [];
	const entries: ManagedAssetReference[] = [];

	const poster = getPosterReference(release, rootDir);
	if (poster.issue) {
		issues.push(poster.issue);
	} else if (poster.entry) {
		entries.push(poster.entry);
	}

	const posterEntry = entries.find((entry) => entry.kind === "poster");
	if (posterEntry) {
		entries.push(
			createAssetEntry(
				rootDir,
				"og",
				getOgRelativePathForPoster(posterEntry.path),
				release.slug,
			),
		);
	}

	const mediainfo = getMediainfoReferences(release, rootDir);
	issues.push(...mediainfo.issues);
	entries.push(...mediainfo.entries);

	return { issues: sortIssues(issues), entries: sortRefs(entries) };
}

async function listManagedFiles(
	rootDir: string,
	kind: ManagedAssetKind,
): Promise<ManagedAssetEntry[]> {
	const directory =
		kind === "poster"
			? POSTERS_DIR
			: kind === "og"
				? OG_DIR
				: MEDIAINFO_DIR;
	const absoluteDir = path.join(rootDir, STATIC_DIR, directory);

	try {
		const dirents = await fs.readdir(absoluteDir, { withFileTypes: true });
		return dirents
			.filter((entry) => entry.isFile() && !entry.name.startsWith("."))
			.map((entry) => ({
				kind,
				path: `${directory}/${entry.name}`,
				absolutePath: path.join(absoluteDir, entry.name),
			}))
			.sort((a, b) => `${a.kind}:${a.path}`.localeCompare(`${b.kind}:${b.path}`));
	} catch (error) {
		const err = error as NodeJS.ErrnoException;
		if (err.code === "ENOENT") {
			return [];
		}
		throw error;
	}
}

function toReferenceMap(
	releases: Array<Pick<ReleaseData, "slug" | "poster" | "torrents">>,
	rootDir: string,
) {
	const refs = new Map<string, ManagedAssetReference[]>();
	const malformedReferences: ManagedAssetIssue[] = [];
	const derivedMismatches: ManagedAssetIssue[] = [];

	for (const release of releases) {
		const { issues, entries } = getReleaseAssetReferences(release, rootDir);
		malformedReferences.push(...issues);

		for (const entry of entries) {
			const key = `${entry.kind}:${entry.path}`;
			const existing = refs.get(key) ?? [];
			existing.push(entry);
			refs.set(key, existing);
		}
	}

	return {
		referencedAssets: refs,
		malformedReferences: sortIssues(malformedReferences),
		derivedMismatches: sortIssues(derivedMismatches),
	};
}

export async function auditManagedAssets({
	releases,
	rootDir = process.cwd(),
}: {
	releases: Array<Pick<ReleaseData, "slug" | "poster" | "torrents">>;
	rootDir?: string;
}): Promise<ManagedAssetAuditReport> {
	const { referencedAssets, malformedReferences, derivedMismatches } =
		toReferenceMap(releases, rootDir);

	const [posterFiles, ogFiles, mediainfoFiles] = await Promise.all([
		listManagedFiles(rootDir, "poster"),
		listManagedFiles(rootDir, "og"),
		listManagedFiles(rootDir, "mediainfo"),
	]);

	const diskAssets = [...posterFiles, ...ogFiles, ...mediainfoFiles];
	const diskKeys = new Set(diskAssets.map((entry) => `${entry.kind}:${entry.path}`));

	const missingReferences: ManagedAssetIssue[] = [];
	for (const [key, refs] of referencedAssets.entries()) {
		if (diskKeys.has(key)) continue;

		for (const ref of refs) {
			missingReferences.push({
				kind: ref.kind,
				path: ref.path,
				releaseSlug: ref.ownerSlug,
			});
		}
	}

	const referencedKeys = new Set(referencedAssets.keys());
	const orphanedFiles = diskAssets
		.filter((entry) => !referencedKeys.has(`${entry.kind}:${entry.path}`))
		.map((entry) => ({ kind: entry.kind, path: entry.path }));

	return {
		missingReferences: sortIssues(missingReferences),
		orphanedFiles: sortIssues(orphanedFiles),
		malformedReferences,
		derivedMismatches: sortIssues(derivedMismatches),
	};
}

export function hasAuditIssues(report: ManagedAssetAuditReport): boolean {
	return (
		report.missingReferences.length > 0 ||
		report.orphanedFiles.length > 0 ||
		report.malformedReferences.length > 0 ||
		report.derivedMismatches.length > 0
	);
}

export async function validateReleaseAssets({
	release,
	rootDir = process.cwd(),
}: {
	release: Pick<ReleaseData, "slug" | "poster" | "torrents">;
	rootDir?: string;
}): Promise<{
	missingReferences: ManagedAssetIssue[];
	malformedReferences: ManagedAssetIssue[];
	derivedMismatches: ManagedAssetIssue[];
}> {
	const { issues, entries } = getReleaseAssetReferences(release, rootDir);
	const missingReferences: ManagedAssetIssue[] = [];
	const derivedMismatches: ManagedAssetIssue[] = [];

	for (const entry of entries) {
		try {
			await fs.access(entry.absolutePath);
		} catch {
			missingReferences.push({
				kind: entry.kind,
				path: entry.path,
				releaseSlug: release.slug,
			});
		}
	}

	return {
		missingReferences: sortIssues(missingReferences),
		malformedReferences: issues,
		derivedMismatches: sortIssues(derivedMismatches),
	};
}

function refKey(entry: Pick<ManagedAssetReference, "kind" | "path">): string {
	return `${entry.kind}:${entry.path}`;
}

function referenceSet(
	releases: Array<Pick<ReleaseData, "slug" | "poster" | "torrents">>,
	rootDir: string,
): Set<string> {
	const refs = new Set<string>();
	for (const release of releases) {
		for (const entry of getReleaseAssetReferences(release, rootDir).entries) {
			refs.add(refKey(entry));
		}
	}
	return refs;
}

export function planReleaseAssetCleanup({
	release,
	remainingReleases,
	rootDir = process.cwd(),
}: {
	release: Pick<ReleaseData, "slug" | "poster" | "torrents">;
	remainingReleases: Array<Pick<ReleaseData, "slug" | "poster" | "torrents">>;
	rootDir?: string;
}): ManagedAssetCleanupPlan {
	const remainingRefSet = referenceSet(remainingReleases, rootDir);
	const ownedRefs = getReleaseAssetReferences(release, rootDir).entries;

	const toDelete: ManagedAssetReference[] = [];
	const toKeep: ManagedAssetCleanupKeep[] = [];

	for (const ref of ownedRefs) {
		if (remainingRefSet.has(refKey(ref))) {
			toKeep.push({
				asset: ref,
				reason: "still referenced by another release",
			});
		} else {
			toDelete.push(ref);
		}
	}

	return { delete: sortRefs(toDelete), keep: sortKeeps(toKeep) };
}

export function planReleaseAssetDiffCleanup({
	previousRelease,
	nextRelease,
	otherReleases,
	rootDir = process.cwd(),
}: {
	previousRelease: Pick<ReleaseData, "slug" | "poster" | "torrents">;
	nextRelease: Pick<ReleaseData, "slug" | "poster" | "torrents">;
	otherReleases: Array<Pick<ReleaseData, "slug" | "poster" | "torrents">>;
	rootDir?: string;
}): ManagedAssetCleanupPlan {
	const previousRefs = getReleaseAssetReferences(previousRelease, rootDir).entries;
	const nextRefSet = new Set(
		getReleaseAssetReferences(nextRelease, rootDir).entries.map((entry) => refKey(entry)),
	);
	const sharedRefSet = referenceSet(otherReleases, rootDir);

	const removedRefs = previousRefs.filter((entry) => !nextRefSet.has(refKey(entry)));
	const toDelete: ManagedAssetReference[] = [];
	const toKeep: ManagedAssetCleanupKeep[] = [];

	for (const ref of removedRefs) {
		if (sharedRefSet.has(refKey(ref))) {
			toKeep.push({
				asset: ref,
				reason: "still referenced by another release",
			});
		} else {
			toDelete.push(ref);
		}
	}

	return { delete: sortRefs(toDelete), keep: sortKeeps(toKeep) };
}

export async function executeCleanupPlan(
	plan: ManagedAssetCleanupPlan,
): Promise<ManagedAssetCleanupResult> {
	const deleted: ManagedAssetReference[] = [];
	const missing: ManagedAssetReference[] = [];
	const errors: Array<{ asset: ManagedAssetReference; error: string }> = [];

	for (const asset of plan.delete) {
		try {
			await fs.unlink(asset.absolutePath);
			deleted.push(asset);
		} catch (error) {
			const err = error as NodeJS.ErrnoException;
			if (err.code === "ENOENT") {
				missing.push(asset);
			} else {
				errors.push({ asset, error: String(error) });
			}
		}
	}

	return {
		delete: deleted,
		keep: plan.keep,
		missing: sortRefs(missing),
		errors,
	};
}

export async function pruneOrphanedAssets({
	orphanedFiles,
	rootDir = process.cwd(),
}: {
	orphanedFiles: ManagedAssetIssue[];
	rootDir?: string;
}): Promise<ManagedAssetCleanupResult> {
	const plan: ManagedAssetCleanupPlan = {
		delete: orphanedFiles.map((issue) =>
			createAssetEntry(rootDir, issue.kind, issue.path),
		),
		keep: [],
	};
	return executeCleanupPlan(plan);
}

function countIssuesByKind(issues: ManagedAssetIssue[]): Record<ManagedAssetKind, number> {
	const counts: Record<ManagedAssetKind, number> = {
		poster: 0,
		og: 0,
		mediainfo: 0,
	};

	for (const issue of issues) {
		counts[issue.kind] += 1;
	}

	return counts;
}

function countRefsByKind(
	refs: Array<Pick<ManagedAssetReference, "kind">>,
): Record<ManagedAssetKind, number> {
	const counts: Record<ManagedAssetKind, number> = {
		poster: 0,
		og: 0,
		mediainfo: 0,
	};

	for (const ref of refs) {
		counts[ref.kind] += 1;
	}

	return counts;
}

function formatKindCounts(
	label: string,
	counts: Record<ManagedAssetKind, number>,
): string {
	const details = MANAGED_ASSET_KINDS.map((kind) => `${kind}=${counts[kind]}`).join(" ");
	return `${label} ${details}`;
}

export function formatAuditReport(report: ManagedAssetAuditReport): string {
	const lines: string[] = ["ASSET_AUDIT"];
	const sections: Array<[string, ManagedAssetIssue[]]> = [
		["missing_references", report.missingReferences],
		["orphaned_files", report.orphanedFiles],
		["malformed_references", report.malformedReferences],
		["derived_mismatches", report.derivedMismatches],
	];
	const allIssues = sections.flatMap(([, issues]) => issues);
	const total = allIssues.length;
	const status = total > 0 ? "issues" : "ok";
	const byKind = countIssuesByKind(allIssues);

	lines.push(`summary status=${status} total=${total}`);
	lines.push(formatKindCounts("by_kind", byKind));

	for (const [name, issues] of sections) {
		lines.push(`[${name}] count=${issues.length}`);
		for (const issue of issues) {
			const parts = [`kind=${issue.kind}`, `path=${issue.path}`];
			if (issue.releaseSlug) parts.push(`release=${issue.releaseSlug}`);
			if (issue.expectedPath) parts.push(`expected=${issue.expectedPath}`);
			if (issue.detail) parts.push(`detail=${issue.detail}`);
			lines.push(`- ${parts.join(" ")}`);
		}
	}

	return lines.join("\n");
}

export function formatCleanupResult(result: ManagedAssetCleanupResult): string {
	const lines: string[] = ["ASSET_CLEANUP"];
	const sections: Array<[string, Array<string>]> = [
		[
			"deleted",
			result.delete.map((entry) => `kind=${entry.kind} path=${entry.path}`),
		],
		[
			"kept",
			result.keep.map(
				(entry) =>
					`kind=${entry.asset.kind} path=${entry.asset.path} reason=${entry.reason}`,
			),
		],
		[
			"missing",
			result.missing.map((entry) => `kind=${entry.kind} path=${entry.path}`),
		],
		[
			"errors",
			result.errors.map(
				(entry) =>
					`kind=${entry.asset.kind} path=${entry.asset.path} error=${entry.error}`,
			),
		],
	];
	const deletedByKind = countRefsByKind(result.delete);
	const keptByKind = countRefsByKind(result.keep.map((entry) => entry.asset));
	const missingByKind = countRefsByKind(result.missing);
	const errorsByKind = countRefsByKind(result.errors.map((entry) => entry.asset));

	lines.push(
		`summary deleted=${result.delete.length} kept=${result.keep.length} missing=${result.missing.length} errors=${result.errors.length}`,
	);
	lines.push(formatKindCounts("deleted_by_kind", deletedByKind));
	lines.push(formatKindCounts("kept_by_kind", keptByKind));
	lines.push(formatKindCounts("missing_by_kind", missingByKind));
	lines.push(formatKindCounts("errors_by_kind", errorsByKind));

	for (const [name, entries] of sections) {
		lines.push(`[${name}] count=${entries.length}`);
		for (const entry of entries) {
			lines.push(`- ${entry}`);
		}
	}

	return lines.join("\n");
}
