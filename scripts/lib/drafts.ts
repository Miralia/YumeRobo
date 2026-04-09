import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type {
	MediaInfoEntry,
	ReleaseData,
	SpecEntry,
	TorrentEntry,
} from "./types";

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

export interface CreateDraft {
	slug: string;
	metadata?: MetadataDraft;
	posterPath?: string;
	torrents?: TorrentEntry[];
	specs?: SpecEntry[];
	links?: Record<string, string>;
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
	date: string;
	savedAt?: string;
}

const DRAFTS_DIR_NAME = "yumerobo-cli-drafts";
const CREATE_DRAFT_FILE = "create.json";
const EDIT_DRAFT_PREFIX = "edit-";

function getDraftsRoot(rootDir?: string): string {
	return rootDir ?? path.join(os.tmpdir(), DRAFTS_DIR_NAME);
}

function getCreateDraftPath(rootDir?: string): string {
	return path.join(getDraftsRoot(rootDir), CREATE_DRAFT_FILE);
}

function getEditDraftPath(slug: string, rootDir?: string): string {
	return path.join(getDraftsRoot(rootDir), `${EDIT_DRAFT_PREFIX}${slug}.json`);
}

async function ensureDraftDir(rootDir?: string) {
	await fs.mkdir(getDraftsRoot(rootDir), { recursive: true });
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
		throw error;
	}
}

async function writeJsonFile(filePath: string, data: unknown) {
	await ensureDraftDir(path.dirname(filePath));
	await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
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

export async function loadCreateDraft(rootDir?: string): Promise<CreateDraft | null> {
	return readJsonFile<CreateDraft>(getCreateDraftPath(rootDir));
}

export async function saveCreateDraft(
	draft: CreateDraft,
	rootDir?: string,
): Promise<void> {
	const filePath = getCreateDraftPath(rootDir);
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(
		filePath,
		JSON.stringify({ ...draft, savedAt: new Date().toISOString() }, null, 2),
		"utf-8",
	);
}

export async function clearCreateDraft(rootDir?: string): Promise<void> {
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
	const filePath = getEditDraftPath(draft.slug, rootDir);
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(
		filePath,
		JSON.stringify({ ...draft, savedAt: new Date().toISOString() }, null, 2),
		"utf-8",
	);
}

export async function clearEditDraft(
	slug: string,
	rootDir?: string,
): Promise<void> {
	await deleteIfExists(getEditDraftPath(slug, rootDir));
}
