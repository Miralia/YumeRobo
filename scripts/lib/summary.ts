import type { CreateDraft, EditDraft } from "./drafts";
import type { TorrentEntry } from "./types";

function getTorrentMetrics(torrents?: TorrentEntry[]): { count: number; mediainfo: number } {
	const safeTorrents = torrents ?? [];
	return {
		count: safeTorrents.length,
		mediainfo: safeTorrents.reduce(
			(total, torrent) => total + torrent.mediainfo.length,
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

export function formatCreateDraftSummary(draft: CreateDraft): string {
	const torrentMetrics = getTorrentMetrics(draft.torrents);
	const lines = [`CREATE_DRAFT slug=${draft.slug}`];

	lines.push(
		draft.metadata
			? `metadata status=done title=${draft.metadata.title}`
			: "metadata status=missing",
	);
	lines.push(
		draft.posterPath
			? `poster status=done path=${draft.posterPath}`
			: "poster status=missing",
	);
	lines.push(
		draft.torrents
			? `torrents status=done count=${torrentMetrics.count} mediainfo=${torrentMetrics.mediainfo}`
			: "torrents status=missing",
	);
	lines.push(
		draft.specs
			? `specs status=done count=${draft.specs.length}`
			: "specs status=missing",
	);
	lines.push(formatComparisonStatus(draft));
	lines.push(
		draft.links && getLinksCount(draft.links) > 0
			? `links status=done count=${getLinksCount(draft.links)}`
			: "links status=missing",
	);

	return lines.join("\n");
}

export function formatEditDraftSummary(draft: EditDraft): string {
	const torrentMetrics = getTorrentMetrics(draft.torrents);
	const lines = [
		`EDIT_DRAFT slug=${draft.slug}`,
		`original title=${draft.originalRelease.title}`,
	];

	lines.push(
		draft.metadata
			? `metadata status=done title=${draft.metadata.title}`
			: "metadata status=missing",
	);
	lines.push(
		draft.posterPath
			? `poster status=done path=${draft.posterPath}`
			: "poster status=missing",
	);
	lines.push(
		draft.torrents
			? `torrents status=done count=${torrentMetrics.count} mediainfo=${torrentMetrics.mediainfo}`
			: "torrents status=missing",
	);
	lines.push(
		draft.specs
			? `specs status=done count=${draft.specs.length}`
			: "specs status=missing",
	);
	lines.push(formatComparisonStatus(draft));
	lines.push(
		draft.links && getLinksCount(draft.links) > 0
			? `links status=done count=${getLinksCount(draft.links)}`
			: "links status=missing",
	);

	return lines.join("\n");
}
