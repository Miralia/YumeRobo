import type { CreateDraft, EditDraft } from "./drafts";
import type { TorrentEntry } from "./types";

/**
 * Draft progress summaries printed after every save.
 *
 * `status=done` must mean "the user actually filled this in": drafts written by
 * hand (or by an older CLI) can omit `mediainfo` entirely and can carry empty
 * arrays, and reporting those as done hides what is still missing.
 */

function getTorrentMetrics(torrents?: TorrentEntry[]): {
	count: number;
	mediainfo: number;
} {
	const safeTorrents = Array.isArray(torrents) ? torrents : [];
	return {
		count: safeTorrents.length,
		mediainfo: safeTorrents.reduce(
			(total, torrent) =>
				total + (Array.isArray(torrent?.mediainfo) ? torrent.mediainfo.length : 0),
			0,
		),
	};
}

function getLinksCount(links?: Record<string, string>): number {
	return Object.keys(links ?? {}).length;
}

function formatComparisonStatus(draft: CreateDraft | EditDraft): string {
	if (draft.comparison?.status === "ready") {
		return `comparison status=ready source=${draft.comparison.sourceUrl}`;
	}
	if (draft.comparison?.status === "skipped") return "comparison status=skipped";
	return "comparison status=missing";
}

/** Single-line `key=value` fields must not be broken by embedded whitespace. */
function inline(value: string): string {
	return value.replace(/\s+/g, " ").trim();
}

function formatFields(draft: CreateDraft | EditDraft): string[] {
	const torrentMetrics = getTorrentMetrics(draft.torrents);
	const lines: string[] = [];

	lines.push(
		draft.metadata
			? `metadata status=done title=${inline(draft.metadata.title)}`
			: "metadata status=missing",
	);
	lines.push(
		draft.posterPath
			? `poster status=done path=${inline(draft.posterPath)}`
			: "poster status=missing",
	);
	lines.push(
		torrentMetrics.count > 0
			? `torrents status=done count=${torrentMetrics.count} mediainfo=${torrentMetrics.mediainfo}`
			: "torrents status=missing",
	);
	lines.push(
		draft.specs && draft.specs.length > 0
			? `specs status=done count=${draft.specs.length}`
			: "specs status=missing",
	);
	lines.push(formatComparisonStatus(draft));
	lines.push(
		getLinksCount(draft.links) > 0
			? `links status=done count=${getLinksCount(draft.links)}`
			: "links status=missing",
	);

	return lines;
}

export function formatCreateDraftSummary(draft: CreateDraft): string {
	return [`CREATE_DRAFT slug=${inline(draft.slug)}`, ...formatFields(draft)].join("\n");
}

export function formatEditDraftSummary(draft: EditDraft): string {
	return [
		`EDIT_DRAFT slug=${inline(draft.slug)}`,
		`original title=${inline(draft.originalRelease?.title ?? "")}`,
		`date=${inline(draft.date ?? "")}`,
		...formatFields(draft),
	].join("\n");
}
