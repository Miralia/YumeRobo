import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { ReleaseData, SpecEntry, TorrentEntry } from './types';

interface MetadataDraft {
	title: string;
	year: number;
	tmdb_id: number;
	media_type: "movie" | "tv";
	special_type?: "tva" | "ova" | "ona" | "special";
	season?: number;
	badge_label?: string;
	is_complete?: boolean;
}

export type DraftComparison =
	| {
		status: "ready";
		filePath: string;
		sourceUrl: string;
	}
	| {
		status: "skipped";
	};

export interface CreateDraft {
	slug: string;
	metadata?: MetadataDraft;
	posterPath?: string;
	torrents?: TorrentEntry[];
	specs?: SpecEntry[];
	links?: Record<string, string>;
	comparison?: DraftComparison;
	/** Stamped on every save; callers cannot control it. */
	savedAt?: string;
}

export interface EditDraft {
	slug: string;
	originalRelease: ReleaseData;
	metadata?: MetadataDraft;
	posterPath?: string;
	torrents?: TorrentEntry[];
	specs?: SpecEntry[];
	links?: Record<string, string>;
	comparison?: DraftComparison;
	date: string;
	/** Stamped on every save; callers cannot control it. */
	savedAt?: string;
}

const DRAFTS_DIR_NAME = "yumerobo-cli-drafts";
const CREATE_DRAFT_FILE = "create.json";
const EDIT_DRAFT_PREFIX = "edit-";

/**
 * Release slugs are hash-shaped (`generateHash(8)`). Every path built from a
 * slug is validated, because slugs reach these helpers from CLI arguments and
 * from draft files that a user can hand-edit.
 */
const SLUG_RE = /^[a-z0-9]+$/;

function assertValidSlug(slug: unknown): asserts slug is string {
	if (typeof slug !== "string" || !SLUG_RE.test(slug)) {
		throw new TypeError(`Invalid release slug: ${String(slug)}`);
	}
}

function getDraftsRoot(rootDir?: string): string {
	// `??` would turn an explicit empty string into the cwd and hand the whole
	// working tree to the delete helpers below.
	return path.resolve(rootDir || path.join(os.tmpdir(), DRAFTS_DIR_NAME));
}

function getCreateDraftPath(rootDir?: string): string {
	return path.join(getDraftsRoot(rootDir), CREATE_DRAFT_FILE);
}

function getEditDraftPath(slug: string, rootDir?: string): string {
	assertValidSlug(slug);
	return path.join(getDraftsRoot(rootDir), `${EDIT_DRAFT_PREFIX}${slug}.json`);
}

export function getDraftComparisonFilePath(
	kind: "create" | "edit",
	slug: string,
	rootDir?: string,
): string {
	assertValidSlug(slug);
	return path.join(getDraftsRoot(rootDir), "files", `${kind}-${slug}-comparison.json`);
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
	try {
		const raw = await fs.readFile(filePath, "utf-8");
		return JSON.parse(raw) as T;
	} catch (error) {
		const err = error as NodeJS.ErrnoException;
		if (err.code === "ENOENT") {
			return null;
		}
		// A truncated or hand-edited draft must not be mistaken for "no draft".
		throw new Error(`Draft file is unreadable (${filePath}): ${err.message}`);
	}
}

/**
 * Write JSON atomically: a crash mid-write must not leave a truncated draft
 * behind, because a truncated draft is indistinguishable from a valid one
 * until it is parsed.
 */
async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
	const directory = path.dirname(filePath);
	await fs.mkdir(directory, { recursive: true });
	const temporary = `${filePath}.${process.pid}.tmp`;
	await fs.writeFile(temporary, JSON.stringify(data, null, 2), "utf-8");
	await fs.rename(temporary, filePath);
}

async function deleteIfExists(filePath: string) {
	try {
		await fs.unlink(filePath);
	} catch (error) {
		const err = error as NodeJS.ErrnoException;
		if (err.code !== "ENOENT") {
			throw error;
		}
	}
}

function isOwnedDraftFile(filePath: string, rootDir?: string): boolean {
	const root = path.resolve(getDraftsRoot(rootDir));
	const relative = path.relative(root, path.resolve(filePath));
	return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function clearDraftComparison(
	draft: Pick<CreateDraft, "comparison"> | Pick<EditDraft, "comparison"> | null,
	rootDir?: string,
): Promise<void> {
	if (draft?.comparison?.status !== "ready") return;
	if (!isOwnedDraftFile(draft.comparison.filePath, rootDir)) return;
	await deleteIfExists(draft.comparison.filePath);
}

export async function loadCreateDraft(rootDir?: string): Promise<CreateDraft | null> {
	return readJsonFile<CreateDraft>(getCreateDraftPath(rootDir));
}

export async function saveCreateDraft(
	draft: CreateDraft,
	rootDir?: string,
): Promise<void> {
	await writeJsonFile(getCreateDraftPath(rootDir), {
		...draft,
		savedAt: new Date().toISOString(),
	});
}

export async function clearCreateDraft(rootDir?: string): Promise<void> {
	const draft = await loadCreateDraft(rootDir);
	await clearDraftComparison(draft, rootDir);

	// A corrupted draft may carry a slug that fails validation; that must not
	// stop us from deleting the draft itself.
	if (draft && typeof draft.slug === "string" && SLUG_RE.test(draft.slug)) {
		await deleteIfExists(getDraftComparisonFilePath("create", draft.slug, rootDir));
	}
	await deleteIfExists(getCreateDraftPath(rootDir));
}

export async function loadEditDraft(
	slug: string,
	rootDir?: string,
): Promise<EditDraft | null> {
	return readJsonFile<EditDraft>(getEditDraftPath(slug, rootDir));
}

export async function saveEditDraft(
	draft: EditDraft,
	rootDir?: string,
): Promise<void> {
	await writeJsonFile(getEditDraftPath(draft.slug, rootDir), {
		...draft,
		savedAt: new Date().toISOString(),
	});
}

export async function clearEditDraft(
	slug: string,
	rootDir?: string,
): Promise<void> {
	const draft = await loadEditDraft(slug, rootDir);

	// Delete the draft first: if the comparison removal then fails we leak one
	// file in the temp directory, whereas the opposite order leaves a draft
	// claiming `status: "ready"` for a file that no longer exists.
	await deleteIfExists(getEditDraftPath(slug, rootDir));
	await clearDraftComparison(draft, rootDir);
	await deleteIfExists(getDraftComparisonFilePath("edit", slug, rootDir));
}

export async function clearReleaseDrafts(slug: string, rootDir?: string): Promise<void> {
	const createDraft = await loadCreateDraft(rootDir);
	if (createDraft?.slug === slug) await clearCreateDraft(rootDir);
	await clearEditDraft(slug, rootDir);
}
